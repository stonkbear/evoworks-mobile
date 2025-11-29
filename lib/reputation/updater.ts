/**
 * Reputation Updater - Triggered by events to update reputation scores
 */

import { prisma } from '@/lib/db/prisma'
import { ScorePeriod } from '@prisma/client'
import { calculateReputationScore } from './calculator'

/**
 * Recalculate reputation scores for all periods
 */
export async function recalculateReputationScore(agentId: string): Promise<void> {
  try {
    const periods = [ScorePeriod.DAYS_30, ScorePeriod.DAYS_90, ScorePeriod.DAYS_180, ScorePeriod.ALL_TIME]

    for (const period of periods) {
      const scores = await calculateReputationScore(agentId, period)

      await prisma.reputationScore.upsert({
        where: {
          agentId_period: {
            agentId,
            period,
          },
        },
        create: {
          agentId,
          period,
          overallScore: scores.overall,
          performanceScore: scores.performance,
          complianceScore: scores.compliance,
          stakeScore: scores.stake,
          verificationScore: scores.verification,
          dimensions: scores.dimensions,
          calculatedAt: new Date(),
        },
        update: {
          overallScore: scores.overall,
          performanceScore: scores.performance,
          complianceScore: scores.compliance,
          stakeScore: scores.stake,
          verificationScore: scores.verification,
          dimensions: scores.dimensions,
          calculatedAt: new Date(),
        },
      })
    }

    console.log(`[Reputation] Updated scores for agent ${agentId}`)
  } catch (error) {
    console.error(`Error recalculating reputation for ${agentId}:`, error)
    throw error
  }
}

/**
 * Update reputation after task completion
 */
export async function updateOnTaskCompletion(taskAssignmentId: string): Promise<void> {
  try {
    const assignment = await prisma.taskAssignment.findUnique({
      where: { id: taskAssignmentId },
      select: { agentId: true },
    })

    if (!assignment) {
      throw new Error('Task assignment not found')
    }

    await recalculateReputationScore(assignment.agentId)
  } catch (error) {
    console.error('Error updating reputation on task completion:', error)
    throw error
  }
}

/**
 * Update reputation after policy violation
 */
export async function updateOnPolicyViolation(
  agentId: string,
  violationType: string
): Promise<void> {
  try {
    // Log the violation
    console.log(`[Reputation] Policy violation for agent ${agentId}: ${violationType}`)

    // Recalculate reputation (will include the new violation)
    await recalculateReputationScore(agentId)

    // If severe violation, consider stake slashing
    const severViolations = ['data_leak', 'fraud', 'security_breach']
    if (severViolations.includes(violationType)) {
      await considerStakeSlashing(agentId, violationType)
    }
  } catch (error) {
    console.error('Error updating reputation on policy violation:', error)
    throw error
  }
}

/**
 * Update reputation after stake change
 */
export async function updateOnStakeChange(agentId: string): Promise<void> {
  try {
    console.log(`[Reputation] Stake changed for agent ${agentId}`)
    await recalculateReputationScore(agentId)
  } catch (error) {
    console.error('Error updating reputation on stake change:', error)
    throw error
  }
}

/**
 * Update reputation after VC issuance/revocation
 */
export async function updateOnCredentialChange(agentId: string): Promise<void> {
  try {
    console.log(`[Reputation] Credential changed for agent ${agentId}`)
    await recalculateReputationScore(agentId)
  } catch (error) {
    console.error('Error updating reputation on credential change:', error)
    throw error
  }
}

/**
 * Update reputation after attestation
 */
export async function updateOnAttestation(agentId: string): Promise<void> {
  try {
    console.log(`[Reputation] New attestation for agent ${agentId}`)
    await recalculateReputationScore(agentId)
  } catch (error) {
    console.error('Error updating reputation on attestation:', error)
    throw error
  }
}

/**
 * Consider slashing stake for severe violations
 */
async function considerStakeSlashing(agentId: string, violationType: string): Promise<void> {
  const slashPercentages: Record<string, number> = {
    data_leak: 50,
    fraud: 100,
    security_breach: 75,
    sla_breach: 10,
  }

  const slashPercentage = slashPercentages[violationType] || 0

  if (slashPercentage > 0) {
    console.warn(
      `[Reputation] Severe violation detected. Recommending ${slashPercentage}% stake slash for agent ${agentId}`
    )
    // In production, trigger stake slashing workflow
    // For now, just log
  }
}

/**
 * Bulk update reputation scores for multiple agents
 */
export async function bulkUpdateReputationScores(agentIds: string[]): Promise<void> {
  console.log(`[Reputation] Bulk updating ${agentIds.length} agents...`)

  for (const agentId of agentIds) {
    try {
      await recalculateReputationScore(agentId)
    } catch (error) {
      console.error(`Failed to update agent ${agentId}:`, error)
      // Continue with other agents
    }
  }

  console.log('[Reputation] Bulk update complete')
}

/**
 * Update all agent reputation scores (for daily cron)
 */
export async function updateAllReputationScores(): Promise<void> {
  console.log('[Reputation] Starting daily reputation update...')

  const agents = await prisma.agent.findMany({
    where: { status: 'ACTIVE' },
    select: { id: true },
  })

  await bulkUpdateReputationScores(agents.map((a) => a.id))

  console.log(`[Reputation] Daily update complete. Updated ${agents.length} agents.`)
}

