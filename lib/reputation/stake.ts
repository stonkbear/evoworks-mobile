/**
 * Stake Manager - Handle staking, slashing, and unstaking
 */

import { prisma } from '@/lib/db/prisma'
import { StakeStatus } from '@prisma/client'
import { updateOnStakeChange } from './updater'

export interface StakeResult {
  success: boolean
  stakePositionId?: string
  error?: string
}

export interface SlashEvent {
  timestamp: Date
  amount: number
  reason: string
  taskId?: string
}

/**
 * Stake tokens for an agent
 */
export async function stakeTokens(
  agentId: string,
  amount: number,
  currency: string = 'USD',
  lockupDays: number = 30
): Promise<StakeResult> {
  try {
    if (amount <= 0) {
      return { success: false, error: 'Amount must be positive' }
    }

    if (lockupDays < 7) {
      return { success: false, error: 'Minimum lockup period is 7 days' }
    }

    const lockedAt = new Date()
    const unlockableAt = new Date(lockedAt.getTime() + lockupDays * 24 * 60 * 60 * 1000)

    const stakePosition = await prisma.stakePosition.create({
      data: {
        agentId,
        amount,
        currency,
        lockedAt,
        unlockableAt,
        status: StakeStatus.ACTIVE,
        slashHistory: [],
      },
    })

    // Update reputation score
    await updateOnStakeChange(agentId)

    console.log(`[Stake] Agent ${agentId} staked ${amount} ${currency} for ${lockupDays} days`)

    return {
      success: true,
      stakePositionId: stakePosition.id,
    }
  } catch (error) {
    console.error('Error staking tokens:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to stake tokens',
    }
  }
}

/**
 * Unstake tokens (only if lockup period has passed)
 */
export async function unstakeTokens(stakePositionId: string): Promise<StakeResult> {
  try {
    const stake = await prisma.stakePosition.findUnique({
      where: { id: stakePositionId },
    })

    if (!stake) {
      return { success: false, error: 'Stake position not found' }
    }

    if (stake.status !== StakeStatus.ACTIVE) {
      return { success: false, error: 'Stake is not active' }
    }

    const now = new Date()
    if (now < stake.unlockableAt) {
      const daysRemaining = Math.ceil(
        (stake.unlockableAt.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
      )
      return {
        success: false,
        error: `Stake is still locked. ${daysRemaining} days remaining.`,
      }
    }

    await prisma.stakePosition.update({
      where: { id: stakePositionId },
      data: {
        status: StakeStatus.WITHDRAWN,
      },
    })

    // Update reputation score
    await updateOnStakeChange(stake.agentId)

    console.log(`[Stake] Agent ${stake.agentId} unstaked ${stake.amount} ${stake.currency}`)

    return { success: true }
  } catch (error) {
    console.error('Error unstaking tokens:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to unstake tokens',
    }
  }
}

/**
 * Slash stake as penalty for violations
 */
export async function slashStake(
  agentId: string,
  slashAmount: number,
  reason: string,
  taskId?: string
): Promise<StakeResult> {
  try {
    // Find active stakes
    const stakes = await prisma.stakePosition.findMany({
      where: {
        agentId,
        status: StakeStatus.ACTIVE,
      },
      orderBy: {
        lockedAt: 'asc', // Slash oldest first
      },
    })

    if (stakes.length === 0) {
      return { success: false, error: 'No active stakes to slash' }
    }

    let remainingSlash = slashAmount
    const slashEvent: SlashEvent = {
      timestamp: new Date(),
      amount: slashAmount,
      reason,
      taskId,
    }

    for (const stake of stakes) {
      if (remainingSlash <= 0) break

      const slashFromThis = Math.min(remainingSlash, stake.amount)
      const newAmount = stake.amount - slashFromThis

      const currentHistory = (stake.slashHistory as any[]) || []
      const newHistory = [...currentHistory, { ...slashEvent, amountSlashed: slashFromThis }]

      if (newAmount <= 0) {
        // Stake fully slashed
        await prisma.stakePosition.update({
          where: { id: stake.id },
          data: {
            amount: 0,
            status: StakeStatus.SLASHED,
            slashHistory: newHistory,
          },
        })
      } else {
        // Partial slash
        await prisma.stakePosition.update({
          where: { id: stake.id },
          data: {
            amount: newAmount,
            slashHistory: newHistory,
          },
        })
      }

      remainingSlash -= slashFromThis
    }

    // Update reputation score
    await updateOnStakeChange(agentId)

    console.log(
      `[Stake] Slashed ${slashAmount} from agent ${agentId}. Reason: ${reason}`
    )

    return { success: true }
  } catch (error) {
    console.error('Error slashing stake:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to slash stake',
    }
  }
}

/**
 * Calculate required stake for a task based on value and agent history
 */
export async function calculateStakeRequirement(
  taskValue: number,
  agentId: string
): Promise<number> {
  // Base requirement: 10% of task value
  let requirement = taskValue * 0.1

  // Get agent's reputation
  const reputation = await prisma.reputationScore.findFirst({
    where: {
      agentId,
      period: 'ALL_TIME',
    },
  })

  if (!reputation) {
    // New agent: require 20%
    return taskValue * 0.2
  }

  // Adjust based on reputation
  // High reputation (>80): 5%
  // Good reputation (60-80): 10%
  // Medium reputation (40-60): 15%
  // Low reputation (<40): 25%
  if (reputation.overallScore >= 80) {
    requirement = taskValue * 0.05
  } else if (reputation.overallScore >= 60) {
    requirement = taskValue * 0.1
  } else if (reputation.overallScore >= 40) {
    requirement = taskValue * 0.15
  } else {
    requirement = taskValue * 0.25
  }

  return Math.round(requirement * 100) / 100
}

/**
 * Get total staked amount for an agent
 */
export async function getTotalStaked(agentId: string): Promise<number> {
  const stakes = await prisma.stakePosition.findMany({
    where: {
      agentId,
      status: StakeStatus.ACTIVE,
    },
  })

  return stakes.reduce((sum, stake) => sum + stake.amount, 0)
}

/**
 * Check if agent has sufficient stake for a task
 */
export async function hasSufficientStake(agentId: string, taskValue: number): Promise<boolean> {
  const required = await calculateStakeRequirement(taskValue, agentId)
  const staked = await getTotalStaked(agentId)

  return staked >= required
}

/**
 * Get stake positions for an agent
 */
export async function getStakePositions(agentId: string): Promise<any[]> {
  return prisma.stakePosition.findMany({
    where: { agentId },
    orderBy: { lockedAt: 'desc' },
  })
}

/**
 * Get slash history for an agent
 */
export async function getSlashHistory(agentId: string): Promise<SlashEvent[]> {
  const stakes = await prisma.stakePosition.findMany({
    where: { agentId },
  })

  const allSlashes: SlashEvent[] = []

  stakes.forEach((stake) => {
    const history = stake.slashHistory as any[]
    if (history && history.length > 0) {
      allSlashes.push(...history)
    }
  })

  return allSlashes.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
}

