/**
 * Vickrey Auction Logic - Second-price sealed-bid auction
 * Winner pays the second-highest bid (incentivizes truthful bidding)
 */

import { prisma } from '@/lib/db/prisma'
import { BidStatus } from '@prisma/client'

export interface VickreyResult {
  success: boolean
  winnerId?: string
  winningPrice?: number
  error?: string
}

/**
 * Determine winner of Vickrey auction
 * Winner = lowest bidder (reverse auction)
 * Price = second-lowest bid
 */
export async function determineVickreyWinner(taskId: string): Promise<VickreyResult> {
  try {
    // Get all revealed bids, sorted by amount (ascending for reverse auction)
    const bids = await prisma.bid.findMany({
      where: {
        taskId,
        status: BidStatus.REVEALED,
      },
      orderBy: {
        amount: 'asc', // Lowest first (reverse auction)
      },
    })

    if (bids.length === 0) {
      return { success: false, error: 'No bids found' }
    }

    if (bids.length === 1) {
      // Only one bid: winner pays their own bid
      return {
        success: true,
        winnerId: bids[0].agentId,
        winningPrice: bids[0].amount,
      }
    }

    // Winner = lowest bidder (best for buyer)
    const winner = bids[0]

    // Price = second-lowest bid (Vickrey pricing)
    const secondLowest = bids[1]

    // Handle tie-breaking
    const tiedBids = bids.filter((b) => b.amount === winner.amount)
    let finalWinner = winner

    if (tiedBids.length > 1) {
      // Tie-breaker: highest reputation wins
      finalWinner = await breakTie(tiedBids)
    }

    console.log(
      `[Vickrey] Winner: ${finalWinner.agentId}, pays ${secondLowest.amount} (bid ${winner.amount})`
    )

    return {
      success: true,
      winnerId: finalWinner.agentId,
      winningPrice: secondLowest.amount,
    }
  } catch (error) {
    console.error('Error determining Vickrey winner:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    }
  }
}

/**
 * Break ties in Vickrey auction
 * Use reputation score as tie-breaker
 */
async function breakTie(tiedBids: any[]): Promise<any> {
  // Get reputation scores for tied bidders
  const agentIds = tiedBids.map((b) => b.agentId)

  const reputations = await prisma.reputationScore.findMany({
    where: {
      agentId: { in: agentIds },
      period: 'ALL_TIME',
    },
    orderBy: {
      overallScore: 'desc',
    },
  })

  if (reputations.length === 0) {
    // No reputation data: random selection
    return tiedBids[Math.floor(Math.random() * tiedBids.length)]
  }

  // Winner = highest reputation among tied bidders
  const topReputation = reputations[0]
  return tiedBids.find((b) => b.agentId === topReputation.agentId) || tiedBids[0]
}

/**
 * Calculate optimal Vickrey bid (theoretical)
 * In truthful Vickrey, optimal bid = true value
 */
export function calculateOptimalBid(trueValue: number): number {
  // In a true Vickrey auction, bidding your true value is the dominant strategy
  return trueValue
}

/**
 * Validate Vickrey auction rules
 */
export async function validateVickreyAuction(taskId: string): Promise<{
  valid: boolean
  errors: string[]
}> {
  const errors: string[] = []

  const task = await prisma.task.findUnique({
    where: { id: taskId },
    include: {
      bids: true,
    },
  })

  if (!task) {
    errors.push('Task not found')
    return { valid: false, errors }
  }

  if (task.auctionType !== 'VICKREY') {
    errors.push('Task is not a Vickrey auction')
  }

  // Check all bids were sealed until deadline
  const prematureReveals = task.bids.filter(
    (b) => b.revealedAt && task.auctionEndsAt && b.revealedAt < task.auctionEndsAt
  )

  if (prematureReveals.length > 0) {
    errors.push('Some bids were revealed before auction ended')
  }

  // Check for bid manipulation
  const duplicateBids = task.bids.filter(
    (b, index, self) => self.findIndex((b2) => b2.amount === b.amount) !== index
  )

  if (duplicateBids.length > task.bids.length * 0.5) {
    errors.push('Suspicious: many duplicate bids detected')
  }

  return {
    valid: errors.length === 0,
    errors,
  }
}

/**
 * Analyze Vickrey auction results
 */
export async function analyzeVickreyAuction(taskId: string): Promise<{
  winnerSavings: number
  efficiencyGain: number
  bidSpread: number
}> {
  const bids = await prisma.bid.findMany({
    where: { taskId },
    orderBy: { amount: 'asc' },
  })

  if (bids.length < 2) {
    return {
      winnerSavings: 0,
      efficiencyGain: 0,
      bidSpread: 0,
    }
  }

  const lowestBid = bids[0].amount
  const secondLowest = bids[1].amount
  const highestBid = bids[bids.length - 1].amount

  // How much winner saved by paying second-price
  const winnerSavings = secondLowest - lowestBid

  // Efficiency: how much better than average
  const avgBid = bids.reduce((sum, b) => sum + b.amount, 0) / bids.length
  const efficiencyGain = ((avgBid - secondLowest) / avgBid) * 100

  // Bid spread
  const bidSpread = highestBid - lowestBid

  return {
    winnerSavings,
    efficiencyGain,
    bidSpread,
  }
}

