/**
 * Dispute Handling - Manage disputes between buyers and agents
 * Supports evidence submission and admin resolution
 */

import { prisma } from '@/lib/db/prisma'
import { DisputeStatus } from '@prisma/client'
import { freezeEscrow, releaseEscrow, refundEscrow, slashEscrow } from './escrow'

export interface DisputeResult {
  success: boolean
  disputeId?: string
  error?: string
}

export interface DisputeEvidence {
  type: 'screenshot' | 'document' | 'message' | 'other'
  url: string
  description: string
}

/**
 * Raise a dispute
 */
export async function raiseDispute(
  taskAssignmentId: string,
  reason: string,
  evidence: DisputeEvidence[],
  raisedBy: 'buyer' | 'agent'
): Promise<DisputeResult> {
  try {
    const assignment = await prisma.taskAssignment.findUnique({
      where: { id: taskAssignmentId },
      include: {
        escrow: true,
        task: true,
      },
    })

    if (!assignment) {
      return { success: false, error: 'Task assignment not found' }
    }

    if (assignment.status === 'DISPUTED') {
      return { success: false, error: 'Dispute already exists for this assignment' }
    }

    // Create dispute
    const dispute = await prisma.dispute.create({
      data: {
        taskAssignmentId,
        reason,
        evidence: {
          [raisedBy]: evidence,
        },
        status: DisputeStatus.OPEN,
      },
    })

    // Update task assignment status
    await prisma.taskAssignment.update({
      where: { id: taskAssignmentId },
      data: { status: 'DISPUTED' },
    })

    // Freeze escrow if exists
    if (assignment.escrow) {
      await freezeEscrow(assignment.escrow.id, `Dispute raised: ${reason}`)
    }

    console.log(
      `[Dispute] Raised dispute ${dispute.id} by ${raisedBy} for assignment ${taskAssignmentId}`
    )

    return { success: true, disputeId: dispute.id }
  } catch (error) {
    console.error('Error raising dispute:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to raise dispute',
    }
  }
}

/**
 * Submit evidence to a dispute
 */
export async function submitEvidence(
  disputeId: string,
  party: 'buyer' | 'agent',
  evidence: DisputeEvidence[]
): Promise<DisputeResult> {
  try {
    const dispute = await prisma.dispute.findUnique({
      where: { id: disputeId },
    })

    if (!dispute) {
      return { success: false, error: 'Dispute not found' }
    }

    if (dispute.status !== DisputeStatus.OPEN && dispute.status !== DisputeStatus.INVESTIGATING) {
      return { success: false, error: 'Dispute is not open for evidence submission' }
    }

    // Update evidence
    const currentEvidence = (dispute.evidence as any) || {}
    const updatedEvidence = {
      ...currentEvidence,
      [party]: [...(currentEvidence[party] || []), ...evidence],
    }

    await prisma.dispute.update({
      where: { id: disputeId },
      data: {
        evidence: updatedEvidence,
        status: DisputeStatus.INVESTIGATING,
      },
    })

    console.log(`[Dispute] ${party} submitted evidence to dispute ${disputeId}`)

    return { success: true, disputeId }
  } catch (error) {
    console.error('Error submitting evidence:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to submit evidence',
    }
  }
}

/**
 * Resolve a dispute (admin action)
 */
export async function resolveDispute(
  disputeId: string,
  decision: 'buyer' | 'agent' | 'split',
  resolution: string,
  refundAmount?: number,
  payoutAmount?: number
): Promise<DisputeResult> {
  try {
    const dispute = await prisma.dispute.findUnique({
      where: { id: disputeId },
      include: {
        taskAssignment: {
          include: {
            escrow: true,
            task: true,
            agent: true,
          },
        },
      },
    })

    if (!dispute) {
      return { success: false, error: 'Dispute not found' }
    }

    if (dispute.status === DisputeStatus.RESOLVED) {
      return { success: false, error: 'Dispute already resolved' }
    }

    const escrow = dispute.taskAssignment.escrow

    if (!escrow) {
      return { success: false, error: 'No escrow found for this dispute' }
    }

    // Handle resolution based on decision
    switch (decision) {
      case 'buyer':
        // Full refund to buyer
        await refundEscrow(escrow.id, dispute.taskAssignment.task.buyerUserId)
        break

      case 'agent':
        // Full payment to agent
        await releaseEscrow(escrow.id, dispute.taskAssignment.agentId)
        break

      case 'split':
        // Partial refund and payment
        if (refundAmount === undefined || payoutAmount === undefined) {
          return { success: false, error: 'Refund and payout amounts required for split decision' }
        }

        if (refundAmount + payoutAmount !== escrow.amount) {
          return {
            success: false,
            error: 'Refund + payout amounts must equal escrow amount',
          }
        }

        // Implement split logic (e.g., slash and partial release)
        if (refundAmount > 0) {
          await slashEscrow(escrow.id, escrow.amount - payoutAmount, 'Partial penalty per dispute resolution')
        }
        if (payoutAmount > 0) {
          await releaseEscrow(escrow.id, dispute.taskAssignment.agentId)
        }
        break
    }

    // Update dispute status
    await prisma.dispute.update({
      where: { id: disputeId },
      data: {
        status: DisputeStatus.RESOLVED,
        resolution,
        refundAmount: refundAmount || null,
        payoutAmount: payoutAmount || null,
        resolvedAt: new Date(),
      },
    })

    // Update task assignment
    await prisma.taskAssignment.update({
      where: { id: dispute.taskAssignmentId },
      data: { status: 'COMPLETED' }, // Or 'FAILED' depending on decision
    })

    console.log(`[Dispute] Resolved dispute ${disputeId} in favor of ${decision}`)

    return { success: true, disputeId }
  } catch (error) {
    console.error('Error resolving dispute:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to resolve dispute',
    }
  }
}

/**
 * Get dispute details
 */
export async function getDispute(disputeId: string): Promise<any> {
  try {
    return await prisma.dispute.findUnique({
      where: { id: disputeId },
      include: {
        taskAssignment: {
          include: {
            task: {
              select: {
                title: true,
                buyer: {
                  select: {
                    name: true,
                    email: true,
                  },
                },
              },
            },
            agent: {
              select: {
                name: true,
                owner: {
                  select: {
                    name: true,
                    email: true,
                  },
                },
              },
            },
          },
        },
      },
    })
  } catch (error) {
    console.error('Error getting dispute:', error)
    return null
  }
}

/**
 * Get all open disputes (admin)
 */
export async function getOpenDisputes(): Promise<any[]> {
  try {
    return await prisma.dispute.findMany({
      where: {
        status: {
          in: [DisputeStatus.OPEN, DisputeStatus.INVESTIGATING],
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
      orderBy: { raisedAt: 'asc' },
    })
  } catch (error) {
    console.error('Error getting open disputes:', error)
    return []
  }
}

/**
 * Get user disputes
 */
export async function getUserDisputes(userId: string, role: 'buyer' | 'agent'): Promise<any[]> {
  try {
    if (role === 'buyer') {
      return await prisma.dispute.findMany({
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
        orderBy: { raisedAt: 'desc' },
      })
    } else {
      return await prisma.dispute.findMany({
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
        orderBy: { raisedAt: 'desc' },
      })
    }
  } catch (error) {
    console.error('Error getting user disputes:', error)
    return []
  }
}

/**
 * Calculate dispute statistics
 */
export async function getDisputeStats(period: '30d' | '90d' | 'all' = 'all'): Promise<any> {
  try {
    const since =
      period === 'all'
        ? new Date(0)
        : new Date(Date.now() - (period === '30d' ? 30 : 90) * 24 * 60 * 60 * 1000)

    const [total, resolved, open, buyerWins, agentWins, splits] = await Promise.all([
      prisma.dispute.count({
        where: { raisedAt: { gte: since } },
      }),
      prisma.dispute.count({
        where: {
          raisedAt: { gte: since },
          status: DisputeStatus.RESOLVED,
        },
      }),
      prisma.dispute.count({
        where: {
          raisedAt: { gte: since },
          status: { in: [DisputeStatus.OPEN, DisputeStatus.INVESTIGATING] },
        },
      }),
      prisma.dispute.count({
        where: {
          raisedAt: { gte: since },
          status: DisputeStatus.RESOLVED,
          refundAmount: { gt: 0 },
          payoutAmount: 0,
        },
      }),
      prisma.dispute.count({
        where: {
          raisedAt: { gte: since },
          status: DisputeStatus.RESOLVED,
          payoutAmount: { gt: 0 },
          refundAmount: 0,
        },
      }),
      prisma.dispute.count({
        where: {
          raisedAt: { gte: since },
          status: DisputeStatus.RESOLVED,
          refundAmount: { gt: 0 },
          payoutAmount: { gt: 0 },
        },
      }),
    ])

    const disputeRate = total > 0 ? (total / (await getTaskCount(since))) * 100 : 0

    return {
      total,
      resolved,
      open,
      pending: total - resolved,
      outcomes: {
        buyerWins,
        agentWins,
        splits,
      },
      disputeRate: Math.round(disputeRate * 100) / 100,
      resolutionRate: total > 0 ? Math.round((resolved / total) * 100) : 0,
    }
  } catch (error) {
    console.error('Error calculating dispute stats:', error)
    return {}
  }
}

async function getTaskCount(since: Date): Promise<number> {
  return await prisma.task.count({
    where: {
      assignment: {
        startedAt: { gte: since },
      },
    },
  })
}

