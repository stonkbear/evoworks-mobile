/**
 * Settlement Engine - Automated batch payouts to agents
 * Calculate earnings, generate invoices, and execute payouts
 */

import { prisma } from '@/lib/db/prisma'
import { createPayout } from './stripe'

/**
 * Calculate payout for an agent for a given period
 */
export async function calculatePayout(
  agentId: string,
  startDate: Date,
  endDate: Date
): Promise<{
  totalEarnings: number
  platformFees: number
  netPayout: number
  taskCount: number
}> {
  try {
    // Get all completed payments in period
    const payments = await prisma.payment.findMany({
      where: {
        agentId,
        status: 'SUCCEEDED',
        paidAt: {
          gte: startDate,
          lte: endDate,
        },
      },
    })

    const totalEarnings = payments.reduce((sum, p) => sum + p.amount, 0)
    const platformFees = payments.reduce((sum, p) => sum + p.platformFee, 0)
    const netPayout = payments.reduce((sum, p) => sum + p.creatorEarnings, 0)

    return {
      totalEarnings,
      platformFees,
      netPayout,
      taskCount: payments.length,
    }
  } catch (error) {
    console.error('Error calculating payout:', error)
    throw error
  }
}

/**
 * Execute payout for an agent
 */
export async function executePayout(agentId: string): Promise<boolean> {
  try {
    // Calculate current unpaid earnings
    const lastPayout = await prisma.payout.findFirst({
      where: { agentId, status: 'SUCCEEDED' },
      orderBy: { paidAt: 'desc' },
    })

    const startDate = lastPayout?.paidAt || new Date(0)
    const endDate = new Date()

    const calculation = await calculatePayout(agentId, startDate, endDate)

    if (calculation.netPayout === 0) {
      console.log(`[Settlement] No earnings to payout for agent ${agentId}`)
      return false
    }

    // Minimum payout threshold: $10
    if (calculation.netPayout < 10) {
      console.log(
        `[Settlement] Payout ${calculation.netPayout} below threshold for agent ${agentId}`
      )
      return false
    }

    // Create payout
    const result = await createPayout(agentId, calculation.netPayout)

    if (!result.success) {
      console.error(`[Settlement] Failed to create payout for agent ${agentId}: ${result.error}`)
      return false
    }

    console.log(`[Settlement] Executed payout of $${calculation.netPayout} to agent ${agentId}`)

    return true
  } catch (error) {
    console.error('Error executing payout:', error)
    return false
  }
}

/**
 * Batch execute payouts for all agents
 * Run weekly or monthly
 */
export async function batchExecutePayouts(): Promise<{
  processed: number
  succeeded: number
  failed: number
}> {
  console.log('[Settlement] Starting batch payout execution...')

  const agents = await prisma.agent.findMany({
    where: { status: 'ACTIVE' },
    select: { id: true },
  })

  let processed = 0
  let succeeded = 0
  let failed = 0

  for (const agent of agents) {
    try {
      processed++
      const result = await executePayout(agent.id)
      if (result) {
        succeeded++
      }
    } catch (error) {
      console.error(`Failed to payout agent ${agent.id}:`, error)
      failed++
    }
  }

  console.log(
    `[Settlement] Batch payout complete: ${processed} processed, ${succeeded} succeeded, ${failed} failed`
  )

  return { processed, succeeded, failed }
}

/**
 * Generate invoice for a payment
 */
export async function generateInvoice(paymentId: string): Promise<{
  success: boolean
  invoiceUrl?: string
  error?: string
}> {
  try {
    const payment = await prisma.payment.findUnique({
      where: { id: paymentId },
      include: {
        taskAssignment: {
          include: {
            task: {
              include: {
                buyer: true,
              },
            },
            agent: {
              include: {
                owner: true,
              },
            },
          },
        },
      },
    })

    if (!payment) {
      return { success: false, error: 'Payment not found' }
    }

    // In production, generate PDF invoice using a library like pdfkit or puppeteer
    // For now, return mock URL
    const mockInvoiceUrl = `https://echo-marketplace.io/invoices/${payment.id}.pdf`

    console.log(`[Settlement] Generated invoice for payment ${paymentId}`)

    return {
      success: true,
      invoiceUrl: mockInvoiceUrl,
    }
  } catch (error) {
    console.error('Error generating invoice:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to generate invoice',
    }
  }
}

/**
 * Get payout history for an agent
 */
export async function getPayoutHistory(agentId: string, limit: number = 50): Promise<any[]> {
  try {
    return await prisma.payout.findMany({
      where: { agentId },
      orderBy: { createdAt: 'desc' },
      take: limit,
    })
  } catch (error) {
    console.error('Error getting payout history:', error)
    return []
  }
}

/**
 * Get payment history for a buyer
 */
export async function getPaymentHistory(buyerId: string, limit: number = 50): Promise<any[]> {
  try {
    return await prisma.payment.findMany({
      where: {
        taskAssignment: {
          task: {
            buyerUserId: buyerId,
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
      orderBy: { createdAt: 'desc' },
      take: limit,
    })
  } catch (error) {
    console.error('Error getting payment history:', error)
    return []
  }
}

/**
 * Calculate platform revenue
 */
export async function calculatePlatformRevenue(
  startDate: Date,
  endDate: Date
): Promise<{
  totalRevenue: number
  totalFees: number
  paymentCount: number
}> {
  try {
    const payments = await prisma.payment.findMany({
      where: {
        status: 'SUCCEEDED',
        paidAt: {
          gte: startDate,
          lte: endDate,
        },
      },
    })

    const totalRevenue = payments.reduce((sum, p) => sum + p.amount, 0)
    const totalFees = payments.reduce((sum, p) => sum + p.platformFee, 0)

    return {
      totalRevenue,
      totalFees,
      paymentCount: payments.length,
    }
  } catch (error) {
    console.error('Error calculating platform revenue:', error)
    throw error
  }
}

