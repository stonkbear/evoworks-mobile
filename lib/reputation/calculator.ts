/**
 * Reputation Calculator - Multi-dimensional trust scoring
 * Calculates reputation scores across performance, compliance, stake, and verification
 */

import { prisma } from '@/lib/db/prisma'
import { ScorePeriod } from '@prisma/client'
import { calculateCredentialTrustScore } from '@/lib/did/vc-verifier'

export interface ReputationBreakdown {
  overall: number
  performance: number
  compliance: number
  stake: number
  verification: number
  dimensions: {
    reliability: number
    speed: number
    costEfficiency: number
    communication: number
  }
}

/**
 * Calculate comprehensive reputation score for an agent
 */
export async function calculateReputationScore(
  agentId: string,
  period: ScorePeriod = ScorePeriod.ALL_TIME
): Promise<ReputationBreakdown> {
  const [performanceScore, complianceScore, stakeScore, verificationScore] = await Promise.all([
    calculatePerformanceScore(agentId, period),
    calculateComplianceScore(agentId, period),
    calculateStakeScore(agentId),
    calculateVerificationScore(agentId),
  ])

  // Calculate additional dimensions
  const dimensions = await calculateCustomDimensions(agentId, period)

  // Weighted overall score: 30% performance + 25% compliance + 25% stake + 20% verification
  const overallScore =
    performanceScore * 0.3 +
    complianceScore * 0.25 +
    stakeScore * 0.25 +
    verificationScore * 0.2

  return {
    overall: Math.round(overallScore * 100) / 100,
    performance: Math.round(performanceScore * 100) / 100,
    compliance: Math.round(complianceScore * 100) / 100,
    stake: Math.round(stakeScore * 100) / 100,
    verification: Math.round(verificationScore * 100) / 100,
    dimensions,
  }
}

/**
 * Calculate performance score (0-100)
 * Based on SLA adherence, completion rate, avg rating
 */
async function calculatePerformanceScore(
  agentId: string,
  period: ScorePeriod
): Promise<number> {
  const dateFilter = getPeriodDateFilter(period)

  // Get completed task assignments
  const assignments = await prisma.taskAssignment.findMany({
    where: {
      agentId,
      status: 'COMPLETED',
      completedAt: dateFilter,
    },
    include: {
      review: true,
    },
  })

  if (assignments.length === 0) return 50 // Default score with no history

  // 1. SLA Adherence (40 points)
  const onTimeCount = assignments.filter((a) => {
    if (!a.slaDueAt || !a.completedAt) return true
    return a.completedAt <= a.slaDueAt
  }).length

  const slaScore = (onTimeCount / assignments.length) * 40

  // 2. Completion Rate (30 points)
  const totalTasks = await prisma.taskAssignment.count({
    where: {
      agentId,
      startedAt: dateFilter,
    },
  })

  const completionRate = totalTasks > 0 ? assignments.length / totalTasks : 1
  const completionScore = completionRate * 30

  // 3. Average Rating (30 points)
  const reviewsWithRating = assignments.filter((a) => a.review).map((a) => a.review!.rating)
  const avgRating =
    reviewsWithRating.length > 0
      ? reviewsWithRating.reduce((sum, r) => sum + r, 0) / reviewsWithRating.length
      : 3.5

  const ratingScore = (avgRating / 5) * 30

  return slaScore + completionScore + ratingScore
}

/**
 * Calculate compliance score (0-100)
 * Based on policy violations, data leaks, dispute rate
 */
async function calculateComplianceScore(
  agentId: string,
  period: ScorePeriod
): Promise<number> {
  const dateFilter = getPeriodDateFilter(period)

  // Start with perfect score
  let score = 100

  // 1. Policy Violations (-10 points each, max -40)
  const policyDenials = await prisma.policyDecision.count({
    where: {
      agentId,
      decision: 'DENY',
      decidedAt: dateFilter,
    },
  })

  score -= Math.min(policyDenials * 10, 40)

  // 2. Disputes (-15 points each, max -30)
  const disputes = await prisma.dispute.count({
    where: {
      taskAssignment: {
        agentId,
      },
      raisedAt: dateFilter,
    },
  })

  score -= Math.min(disputes * 15, 30)

  // 3. Failed Executions (-5 points each, max -30)
  const failures = await prisma.execution.count({
    where: {
      taskAssignment: {
        agentId,
      },
      status: 'FAILED',
      startedAt: dateFilter,
    },
  })

  score -= Math.min(failures * 5, 30)

  return Math.max(score, 0)
}

/**
 * Calculate stake score (0-100)
 * Based on amount staked, lockup duration, slash history
 */
async function calculateStakeScore(agentId: string): Promise<number> {
  const stakes = await prisma.stakePosition.findMany({
    where: {
      agentId,
      status: 'ACTIVE',
    },
  })

  if (stakes.length === 0) return 20 // Low score without stake

  // 1. Total staked amount (0-50 points)
  // Logarithmic scale: $1K = 25pts, $10K = 40pts, $100K = 50pts
  const totalStaked = stakes.reduce((sum, s) => sum + s.amount, 0)
  const stakeAmountScore = Math.min(Math.log10(totalStaked + 1) * 15, 50)

  // 2. Lockup duration (0-30 points)
  const avgLockupDays =
    stakes.reduce((sum, s) => {
      const days = (s.unlockableAt.getTime() - s.lockedAt.getTime()) / (1000 * 60 * 60 * 24)
      return sum + days
    }, 0) / stakes.length

  const lockupScore = Math.min((avgLockupDays / 365) * 30, 30)

  // 3. Slash history (0-20 points, deduct for slashes)
  let slashScore = 20
  stakes.forEach((stake) => {
    const slashHistory = stake.slashHistory as any[]
    if (slashHistory && slashHistory.length > 0) {
      slashScore -= slashHistory.length * 5
    }
  })
  slashScore = Math.max(slashScore, 0)

  return stakeAmountScore + lockupScore + slashScore
}

/**
 * Calculate verification score (0-100)
 * Based on VCs, attestations, KYC status
 */
async function calculateVerificationScore(agentId: string): Promise<number> {
  // 1. Verifiable Credentials (0-60 points)
  const vcScore = await calculateCredentialTrustScore(agentId)

  // 2. Attestations (0-40 points)
  const attestations = await prisma.attestation.findMany({
    where: { agentId },
    include: {
      attestor: {
        include: {
          ownedAgents: {
            include: {
              reputationScores: {
                where: { period: 'ALL_TIME' },
                take: 1,
              },
            },
          },
        },
      },
    },
  })

  if (attestations.length === 0) {
    return vcScore * 0.6 // Only VC score, scaled to 60%
  }

  // Weight attestations by attestor's reputation
  let weightedAttestationScore = 0
  let totalWeight = 0

  attestations.forEach((att) => {
    // Get attestor's reputation (if they have one)
    const attestorReputation =
      att.attestor.ownedAgents[0]?.reputationScores[0]?.overallScore || 50

    const weight = attestorReputation / 100
    weightedAttestationScore += (att.score / 5) * 100 * weight
    totalWeight += weight
  })

  const attestationScore = totalWeight > 0 ? weightedAttestationScore / totalWeight : 50

  // Combine: 60% VC + 40% attestations
  return vcScore * 0.6 + attestationScore * 0.4
}

/**
 * Calculate custom dimensions
 */
async function calculateCustomDimensions(
  agentId: string,
  period: ScorePeriod
): Promise<{
  reliability: number
  speed: number
  costEfficiency: number
  communication: number
}> {
  const dateFilter = getPeriodDateFilter(period)

  const assignments = await prisma.taskAssignment.findMany({
    where: {
      agentId,
      status: 'COMPLETED',
      completedAt: dateFilter,
    },
    include: {
      execution: true,
      task: true,
    },
  })

  if (assignments.length === 0) {
    return {
      reliability: 50,
      speed: 50,
      costEfficiency: 50,
      communication: 50,
    }
  }

  // Reliability: % completed on time
  const onTime = assignments.filter(
    (a) => a.slaDueAt && a.completedAt && a.completedAt <= a.slaDueAt
  ).length
  const reliability = (onTime / assignments.length) * 100

  // Speed: Average completion time vs SLA
  const speedScores = assignments
    .filter((a) => a.slaDueAt && a.completedAt && a.startedAt)
    .map((a) => {
      const actualTime = a.completedAt!.getTime() - a.startedAt.getTime()
      const slaTime = a.slaDueAt!.getTime() - a.startedAt.getTime()
      return Math.min((slaTime / actualTime) * 100, 100)
    })

  const speed = speedScores.length > 0 ? speedScores.reduce((sum, s) => sum + s, 0) / speedScores.length : 50

  // Cost Efficiency: Actual cost vs budget
  const costScores = assignments.map((a) => {
    if (a.task.maxBudget === 0) return 50
    return Math.min((a.task.maxBudget / a.agreedPrice) * 100, 100)
  })

  const costEfficiency =
    costScores.length > 0 ? costScores.reduce((sum, s) => sum + s, 0) / costScores.length : 50

  // Communication: Based on attestations (placeholder)
  const communication = 75 // TODO: Calculate from attestations

  return {
    reliability: Math.round(reliability),
    speed: Math.round(speed),
    costEfficiency: Math.round(costEfficiency),
    communication: Math.round(communication),
  }
}

/**
 * Get date filter for period
 */
function getPeriodDateFilter(period: ScorePeriod): { gte: Date } | undefined {
  const now = new Date()

  switch (period) {
    case ScorePeriod.DAYS_30:
      return { gte: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000) }
    case ScorePeriod.DAYS_90:
      return { gte: new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000) }
    case ScorePeriod.DAYS_180:
      return { gte: new Date(now.getTime() - 180 * 24 * 60 * 60 * 1000) }
    case ScorePeriod.ALL_TIME:
      return undefined
    default:
      return undefined
  }
}

/**
 * Get leaderboard of top agents
 */
export async function getTopAgents(limit: number = 10, period: ScorePeriod = ScorePeriod.ALL_TIME): Promise<any[]> {
  const scores = await prisma.reputationScore.findMany({
    where: { period },
    orderBy: { overallScore: 'desc' },
    take: limit,
    include: {
      agent: {
        select: {
          id: true,
          name: true,
          did: true,
          platform: true,
          listing: {
            select: {
              installCount: true,
              avgRating: true,
            },
          },
        },
      },
    },
  })

  return scores
}

