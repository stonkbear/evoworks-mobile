/**
 * Auction Manager - Core auction orchestration
 * Supports sealed-bid, Vickrey, and direct award auctions
 */

import { prisma } from '@/lib/db/prisma'
import { AuctionType, TaskStatus, BidStatus } from '@prisma/client'
import { encryptBid, decryptBid } from './encryption'
import { determineVickreyWinner } from './vickrey'
import { filterEligibleAgents } from './filtering'

export interface AuctionResult {
  success: boolean
  winnerId?: string
  winningBid?: number
  error?: string
}

/**
 * Create an auction for a task
 */
export async function createAuction(
  taskId: string,
  type: AuctionType,
  durationMinutes: number = 60
): Promise<{ success: boolean; auctionEndsAt?: Date; error?: string }> {
  try {
    const task = await prisma.task.findUnique({
      where: { id: taskId },
    })

    if (!task) {
      return { success: false, error: 'Task not found' }
    }

    if (task.status !== TaskStatus.DRAFT) {
      return { success: false, error: 'Task is not in draft status' }
    }

    const auctionEndsAt = new Date(Date.now() + durationMinutes * 60 * 1000)

    await prisma.task.update({
      where: { id: taskId },
      data: {
        auctionType: type,
        auctionEndsAt,
        status: TaskStatus.OPEN,
      },
    })

    console.log(`[Auction] Created ${type} auction for task ${taskId}, ends at ${auctionEndsAt}`)

    return { success: true, auctionEndsAt }
  } catch (error) {
    console.error('Error creating auction:', error)
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
  }
}

/**
 * Submit a bid to an auction
 */
export async function submitBid(
  taskId: string,
  agentId: string,
  amount: number,
  currency: string = 'USD'
): Promise<{ success: boolean; bidId?: string; error?: string }> {
  try {
    // Get task details
    const task = await prisma.task.findUnique({
      where: { id: taskId },
      include: {
        bids: {
          where: { agentId },
        },
      },
    })

    if (!task) {
      return { success: false, error: 'Task not found' }
    }

    if (task.status !== TaskStatus.OPEN) {
      return { success: false, error: 'Auction is not open' }
    }

    if (task.auctionEndsAt && task.auctionEndsAt < new Date()) {
      return { success: false, error: 'Auction has ended' }
    }

    // Check if agent already bid
    if (task.bids.length > 0) {
      return { success: false, error: 'Agent has already submitted a bid' }
    }

    // Check if agent is eligible
    const eligible = await filterEligibleAgents(taskId)
    if (!eligible.includes(agentId)) {
      return { success: false, error: 'Agent is not eligible for this task' }
    }

    // Check budget constraint
    if (amount > task.maxBudget) {
      return { success: false, error: `Bid exceeds maximum budget of ${task.maxBudget}` }
    }

    // For sealed-bid auctions, encrypt the bid
    let encryptedBid = null
    if (task.auctionType === AuctionType.SEALED_BID || task.auctionType === AuctionType.VICKREY) {
      encryptedBid = encryptBid({ amount, currency }, taskId)
    }

    // Create bid
    const bid = await prisma.bid.create({
      data: {
        taskId,
        agentId,
        amount,
        currency,
        encryptedBid: encryptedBid as any,
        status: BidStatus.PENDING,
      },
    })

    console.log(
      `[Auction] Agent ${agentId} submitted bid of ${amount} ${currency} for task ${taskId}`
    )

    return { success: true, bidId: bid.id }
  } catch (error) {
    console.error('Error submitting bid:', error)
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
  }
}

/**
 * Close an auction and determine winner
 */
export async function closeAuction(taskId: string): Promise<AuctionResult> {
  try {
    const task = await prisma.task.findUnique({
      where: { id: taskId },
      include: {
        bids: {
          where: { status: BidStatus.PENDING },
        },
      },
    })

    if (!task) {
      return { success: false, error: 'Task not found' }
    }

    if (task.status !== TaskStatus.OPEN) {
      return { success: false, error: 'Auction is not open' }
    }

    if (task.bids.length === 0) {
      // No bids received
      await prisma.task.update({
        where: { id: taskId },
        data: { status: TaskStatus.CLOSED },
      })
      console.log(`[Auction] Task ${taskId} closed with no bids`)
      return { success: true }
    }

    // Reveal sealed bids
    if (task.auctionType === AuctionType.SEALED_BID || task.auctionType === AuctionType.VICKREY) {
      await revealBids(taskId)
    }

    // Determine winner based on auction type
    let winnerId: string
    let winningPrice: number

    switch (task.auctionType) {
      case AuctionType.VICKREY:
        const vickreyResult = await determineVickreyWinner(taskId)
        if (!vickreyResult.success || !vickreyResult.winnerId) {
          return { success: false, error: 'Failed to determine Vickrey winner' }
        }
        winnerId = vickreyResult.winnerId
        winningPrice = vickreyResult.winningPrice!
        break

      case AuctionType.SEALED_BID:
      case AuctionType.DIRECT:
        // Lowest bid wins (reverse auction for buyers)
        const lowestBid = await prisma.bid.findFirst({
          where: { taskId, status: BidStatus.REVEALED },
          orderBy: { amount: 'asc' },
        })
        if (!lowestBid) {
          return { success: false, error: 'No valid bids found' }
        }
        winnerId = lowestBid.agentId
        winningPrice = lowestBid.amount
        break

      default:
        return { success: false, error: 'Unknown auction type' }
    }

    // Award task to winner
    await awardTask(taskId, winnerId, winningPrice)

    console.log(
      `[Auction] Task ${taskId} awarded to agent ${winnerId} at price ${winningPrice}`
    )

    return {
      success: true,
      winnerId,
      winningBid: winningPrice,
    }
  } catch (error) {
    console.error('Error closing auction:', error)
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
  }
}

/**
 * Reveal all sealed bids for an auction
 */
async function revealBids(taskId: string): Promise<void> {
  const bids = await prisma.bid.findMany({
    where: { taskId, status: BidStatus.PENDING },
  })

  for (const bid of bids) {
    if (bid.encryptedBid) {
      // Decrypt bid (in production, use proper decryption)
      const decrypted = decryptBid(bid.encryptedBid as any, taskId)
      // Bid amount already stored in plaintext for now
    }

    await prisma.bid.update({
      where: { id: bid.id },
      data: {
        status: BidStatus.REVEALED,
        revealedAt: new Date(),
      },
    })
  }

  console.log(`[Auction] Revealed ${bids.length} bids for task ${taskId}`)
}

/**
 * Award task to winning agent
 */
export async function awardTask(
  taskId: string,
  agentId: string,
  agreedPrice: number
): Promise<void> {
  try {
    // Update winning bid
    const winningBid = await prisma.bid.findFirst({
      where: { taskId, agentId },
    })

    if (winningBid) {
      await prisma.bid.update({
        where: { id: winningBid.id },
        data: { status: BidStatus.WON },
      })
    }

    // Update losing bids
    await prisma.bid.updateMany({
      where: {
        taskId,
        agentId: { not: agentId },
      },
      data: { status: BidStatus.LOST },
    })

    // Create task assignment
    await prisma.taskAssignment.create({
      data: {
        taskId,
        agentId,
        bidId: winningBid?.id,
        agreedPrice,
        status: 'ASSIGNED',
        slaDueAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days default
      },
    })

    // Update task status
    await prisma.task.update({
      where: { id: taskId },
      data: { status: TaskStatus.ASSIGNED },
    })

    console.log(`[Auction] Task ${taskId} awarded to agent ${agentId}`)
  } catch (error) {
    console.error('Error awarding task:', error)
    throw error
  }
}

/**
 * Get auction status
 */
export async function getAuctionStatus(taskId: string): Promise<any> {
  const task = await prisma.task.findUnique({
    where: { id: taskId },
    include: {
      bids: {
        select: {
          id: true,
          agentId: true,
          amount: true,
          status: true,
          createdAt: true,
          agent: {
            select: {
              name: true,
              reputationScores: {
                where: { period: 'ALL_TIME' },
                take: 1,
              },
            },
          },
        },
      },
      assignment: {
        select: {
          agentId: true,
          agreedPrice: true,
          status: true,
        },
      },
    },
  })

  if (!task) {
    return null
  }

  // Calculate time remaining
  const timeRemaining = task.auctionEndsAt
    ? Math.max(0, task.auctionEndsAt.getTime() - Date.now())
    : 0

  // For sealed auctions, hide bid amounts until revealed
  const hideBids =
    (task.auctionType === AuctionType.SEALED_BID || task.auctionType === AuctionType.VICKREY) &&
    task.status === TaskStatus.OPEN

  return {
    taskId: task.id,
    title: task.title,
    auctionType: task.auctionType,
    status: task.status,
    maxBudget: task.maxBudget,
    currency: task.currency,
    auctionEndsAt: task.auctionEndsAt,
    timeRemainingMs: timeRemaining,
    bidCount: task.bids.length,
    bids: hideBids
      ? task.bids.map((b) => ({
          id: b.id,
          agentId: b.agentId,
          status: b.status,
          createdAt: b.createdAt,
          // Hide amount
        }))
      : task.bids,
    assignment: task.assignment,
  }
}

/**
 * Cancel an auction (before closing)
 */
export async function cancelAuction(taskId: string): Promise<boolean> {
  try {
    const task = await prisma.task.findUnique({
      where: { id: taskId },
    })

    if (!task) return false

    if (task.status !== TaskStatus.OPEN) {
      throw new Error('Can only cancel open auctions')
    }

    // Update all bids to withdrawn
    await prisma.bid.updateMany({
      where: { taskId },
      data: { status: BidStatus.WITHDRAWN },
    })

    // Update task status
    await prisma.task.update({
      where: { id: taskId },
      data: { status: TaskStatus.CANCELLED },
    })

    console.log(`[Auction] Cancelled auction for task ${taskId}`)
    return true
  } catch (error) {
    console.error('Error cancelling auction:', error)
    return false
  }
}

