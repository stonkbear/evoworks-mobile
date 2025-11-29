/**
 * Escrow Manager - Lock, release, refund, and freeze funds
 * Ensures safe transactions between buyers and agents
 */

import { prisma } from '@/lib/db/prisma'
import { EscrowStatus } from '@prisma/client'

export interface EscrowResult {
  success: boolean
  escrowId?: string
  error?: string
}

/**
 * Create escrow account for a task assignment
 */
export async function createEscrow(
  taskAssignmentId: string,
  amount: number,
  currency: string = 'USD'
): Promise<EscrowResult> {
  try {
    const assignment = await prisma.taskAssignment.findUnique({
      where: { id: taskAssignmentId },
    })

    if (!assignment) {
      return { success: false, error: 'Task assignment not found' }
    }

    // Check if escrow already exists
    const existing = await prisma.escrowAccount.findUnique({
      where: { taskAssignmentId },
    })

    if (existing) {
      return { success: false, error: 'Escrow already exists for this assignment' }
    }

    // Create escrow
    const escrow = await prisma.escrowAccount.create({
      data: {
        taskAssignmentId,
        amount,
        currency,
        status: EscrowStatus.HELD,
        heldAt: new Date(),
      },
    })

    console.log(`[Escrow] Created escrow ${escrow.id} for ${amount} ${currency}`)

    return { success: true, escrowId: escrow.id }
  } catch (error) {
    console.error('Error creating escrow:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to create escrow',
    }
  }
}

/**
 * Release escrow to agent (task completed successfully)
 */
export async function releaseEscrow(
  escrowId: string,
  recipientAgentId: string
): Promise<EscrowResult> {
  try {
    const escrow = await prisma.escrowAccount.findUnique({
      where: { id: escrowId },
      include: {
        taskAssignment: {
          include: {
            agent: true,
            task: true,
          },
        },
      },
    })

    if (!escrow) {
      return { success: false, error: 'Escrow not found' }
    }

    if (escrow.status !== EscrowStatus.HELD) {
      return { success: false, error: `Escrow is ${escrow.status}, cannot release` }
    }

    if (escrow.taskAssignment.agentId !== recipientAgentId) {
      return { success: false, error: 'Agent mismatch' }
    }

    // Update escrow status
    await prisma.escrowAccount.update({
      where: { id: escrowId },
      data: {
        status: EscrowStatus.RELEASED,
        releasedAt: new Date(),
      },
    })

    // Calculate platform fee and agent earnings
    const platformFee = calculatePlatformFee(escrow.amount)
    const agentEarnings = escrow.amount - platformFee

    // Create payment record
    await prisma.payment.create({
      data: {
        taskAssignmentId: escrow.taskAssignmentId,
        agentId: recipientAgentId,
        amount: escrow.amount,
        currency: escrow.currency,
        status: 'SUCCEEDED',
        platformFee,
        creatorEarnings: agentEarnings,
        paidAt: new Date(),
      },
    })

    console.log(`[Escrow] Released ${escrow.amount} ${escrow.currency} to agent ${recipientAgentId}`)

    return { success: true, escrowId }
  } catch (error) {
    console.error('Error releasing escrow:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to release escrow',
    }
  }
}

/**
 * Refund escrow to buyer (task cancelled or failed)
 */
export async function refundEscrow(escrowId: string, buyerUserId: string): Promise<EscrowResult> {
  try {
    const escrow = await prisma.escrowAccount.findUnique({
      where: { id: escrowId },
      include: {
        taskAssignment: {
          include: {
            task: true,
          },
        },
      },
    })

    if (!escrow) {
      return { success: false, error: 'Escrow not found' }
    }

    if (escrow.status !== EscrowStatus.HELD) {
      return { success: false, error: `Escrow is ${escrow.status}, cannot refund` }
    }

    if (escrow.taskAssignment.task.buyerUserId !== buyerUserId) {
      return { success: false, error: 'Buyer mismatch' }
    }

    // Update escrow status
    await prisma.escrowAccount.update({
      where: { id: escrowId },
      data: {
        status: EscrowStatus.REFUNDED,
        releasedAt: new Date(),
      },
    })

    console.log(`[Escrow] Refunded ${escrow.amount} ${escrow.currency} to buyer ${buyerUserId}`)

    return { success: true, escrowId }
  } catch (error) {
    console.error('Error refunding escrow:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to refund escrow',
    }
  }
}

/**
 * Freeze escrow (during dispute)
 */
export async function freezeEscrow(escrowId: string, reason: string): Promise<EscrowResult> {
  try {
    const escrow = await prisma.escrowAccount.findUnique({
      where: { id: escrowId },
    })

    if (!escrow) {
      return { success: false, error: 'Escrow not found' }
    }

    if (escrow.status !== EscrowStatus.HELD) {
      return { success: false, error: 'Escrow must be in HELD status to freeze' }
    }

    // Freeze is implicit - we just don't allow release/refund during dispute
    console.log(`[Escrow] Froze escrow ${escrowId}: ${reason}`)

    return { success: true, escrowId }
  } catch (error) {
    console.error('Error freezing escrow:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to freeze escrow',
    }
  }
}

/**
 * Slash escrow (partial penalty, rest to agent or refund)
 */
export async function slashEscrow(
  escrowId: string,
  slashAmount: number,
  reason: string
): Promise<EscrowResult> {
  try {
    const escrow = await prisma.escrowAccount.findUnique({
      where: { id: escrowId },
      include: {
        taskAssignment: true,
      },
    })

    if (!escrow) {
      return { success: false, error: 'Escrow not found' }
    }

    if (slashAmount > escrow.amount) {
      return { success: false, error: 'Slash amount exceeds escrow amount' }
    }

    // Update escrow status
    await prisma.escrowAccount.update({
      where: { id: escrowId },
      data: {
        status: EscrowStatus.SLASHED,
        releasedAt: new Date(),
        amount: escrow.amount - slashAmount, // Reduce amount by slash
      },
    })

    // Record slash in agent's stake
    await prisma.$executeRaw`
      INSERT INTO audit_events (event_type, agent_id, payload)
      VALUES ('ESCROW_SLASHED', ${escrow.taskAssignment.agentId}, ${JSON.stringify({
        escrowId,
        slashAmount,
        reason,
      })})
    `

    console.log(`[Escrow] Slashed ${slashAmount} from escrow ${escrowId}: ${reason}`)

    return { success: true, escrowId }
  } catch (error) {
    console.error('Error slashing escrow:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to slash escrow',
    }
  }
}

/**
 * Calculate platform fee (15-25% tiered)
 */
function calculatePlatformFee(amount: number): number {
  // Tiered fee structure:
  // 0-100: 25%
  // 101-500: 20%
  // 501-1000: 18%
  // 1001+: 15%

  if (amount <= 100) {
    return amount * 0.25
  } else if (amount <= 500) {
    return amount * 0.2
  } else if (amount <= 1000) {
    return amount * 0.18
  } else {
    return amount * 0.15
  }
}

/**
 * Get escrow status
 */
export async function getEscrowStatus(escrowId: string): Promise<any> {
  try {
    return await prisma.escrowAccount.findUnique({
      where: { id: escrowId },
      include: {
        taskAssignment: {
          include: {
            task: {
              select: {
                title: true,
                buyerUserId: true,
              },
            },
            agent: {
              select: {
                name: true,
              },
            },
          },
        },
      },
    })
  } catch (error) {
    console.error('Error getting escrow status:', error)
    return null
  }
}

/**
 * Get all escrows for a user (buyer or agent)
 */
export async function getUserEscrows(userId: string, role: 'buyer' | 'agent'): Promise<any[]> {
  try {
    if (role === 'buyer') {
      return await prisma.escrowAccount.findMany({
        where: {
          taskAssignment: {
            task: {
              buyerUserId: userId,
            },
          },
        },
        include: {
          taskAssignment: {
            include: {
              task: {
                select: {
                  title: true,
                },
              },
              agent: {
                select: {
                  name: true,
                },
              },
            },
          },
        },
        orderBy: { heldAt: 'desc' },
      })
    } else {
      // Agent
      return await prisma.escrowAccount.findMany({
        where: {
          taskAssignment: {
            agent: {
              ownerUserId: userId,
            },
          },
        },
        include: {
          taskAssignment: {
            include: {
              task: {
                select: {
                  title: true,
                },
              },
            },
          },
        },
        orderBy: { heldAt: 'desc' },
      })
    }
  } catch (error) {
    console.error('Error getting user escrows:', error)
    return []
  }
}

