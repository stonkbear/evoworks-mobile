/**
 * Pre-Bid Filtering - Determine which agents are eligible to bid
 * Checks policy compliance, reputation, capabilities, and stake
 */

import { prisma } from '@/lib/db/prisma'
import { hasSufficientStake } from '@/lib/reputation/stake'

export interface EligibilityCheck {
  agentId: string
  eligible: boolean
  reasons: string[]
}

/**
 * Filter agents eligible to bid on a task
 */
export async function filterEligibleAgents(taskId: string): Promise<string[]> {
  try {
    const task = await prisma.task.findUnique({
      where: { id: taskId },
    })

    if (!task) {
      return []
    }

    const requirements = task.requirements as any

    // Get all active agents
    const agents = await prisma.agent.findMany({
      where: { status: 'ACTIVE' },
      include: {
        reputationScores: {
          where: { period: 'ALL_TIME' },
          take: 1,
        },
        credentials: {
          where: {
            revoked: false,
            OR: [{ expiresAt: null }, { expiresAt: { gt: new Date() } }],
          },
        },
      },
    })

    const eligibleAgents: string[] = []

    for (const agent of agents) {
      const check = await checkAgentEligibility(agent, task, requirements)
      if (check.eligible) {
        eligibleAgents.push(agent.id)
      }
    }

    console.log(
      `[Filtering] Found ${eligibleAgents.length}/${agents.length} eligible agents for task ${taskId}`
    )

    return eligibleAgents
  } catch (error) {
    console.error('Error filtering eligible agents:', error)
    return []
  }
}

/**
 * Check if specific agent can bid on task
 */
export async function canAgentBid(agentId: string, taskId: string): Promise<boolean> {
  const eligible = await filterEligibleAgents(taskId)
  return eligible.includes(agentId)
}

/**
 * Check agent eligibility with detailed reasons
 */
async function checkAgentEligibility(
  agent: any,
  task: any,
  requirements: any
): Promise<EligibilityCheck> {
  const reasons: string[] = []
  let eligible = true

  // 1. Check reputation threshold
  if (requirements.minTrustScore) {
    const reputation = agent.reputationScores[0]?.overallScore || 0
    if (reputation < requirements.minTrustScore) {
      eligible = false
      reasons.push(`Reputation ${reputation} below required ${requirements.minTrustScore}`)
    }
  }

  // 2. Check capability match
  if (requirements.skills && requirements.skills.length > 0) {
    const agentCapabilities = agent.capabilities as any
    const hasAllSkills = requirements.skills.every((skill: string) =>
      agentCapabilities.skills?.includes(skill)
    )
    if (!hasAllSkills) {
      eligible = false
      reasons.push('Missing required skills')
    }
  }

  // 3. Check data class permissions
  if (requirements.dataClass) {
    const hasPermission = await checkDataClassPermission(agent, requirements.dataClass)
    if (!hasPermission) {
      eligible = false
      reasons.push(`Not authorized for ${requirements.dataClass} data`)
    }
  }

  // 4. Check region restrictions
  if (requirements.region) {
    const agentCapabilities = agent.capabilities as any
    const regions = agentCapabilities.regions || []
    if (!regions.includes(requirements.region)) {
      eligible = false
      reasons.push(`Not available in region ${requirements.region}`)
    }
  }

  // 5. Check stake requirement
  if (requirements.minStake || task.maxBudget > 1000) {
    const hasStake = await hasSufficientStake(agent.id, task.maxBudget)
    if (!hasStake) {
      eligible = false
      reasons.push('Insufficient stake')
    }
  }

  // 6. Check compliance credentials
  if (requirements.requiredCredentials) {
    const hasCredentials = requirements.requiredCredentials.every((credType: string) =>
      agent.credentials.some((c: any) => c.type === credType)
    )
    if (!hasCredentials) {
      eligible = false
      reasons.push('Missing required compliance credentials')
    }
  }

  // 7. Check blacklist
  if (task.orgId) {
    const isBlacklisted = await isAgentBlacklisted(agent.id, task.orgId)
    if (isBlacklisted) {
      eligible = false
      reasons.push('Blacklisted by organization')
    }
  }

  return {
    agentId: agent.id,
    eligible,
    reasons: eligible ? ['All checks passed'] : reasons,
  }
}

/**
 * Check if agent has permission for data class
 */
async function checkDataClassPermission(agent: any, dataClass: string): Promise<boolean> {
  const requiredCredentials: Record<string, string[]> = {
    PHI: ['HIPAA_COMPLIANT'],
    PII: ['NO_PII_VIOLATIONS_90D'],
    PCI: ['PCI_DSS_COMPLIANT'],
  }

  const required = requiredCredentials[dataClass] || []
  if (required.length === 0) return true // No special requirements

  return required.some((credType) =>
    agent.credentials.some((c: any) => c.type === credType)
  )
}

/**
 * Check if agent is blacklisted by organization
 */
async function isAgentBlacklisted(agentId: string, orgId: string): Promise<boolean> {
  // In production, check organization's blacklist
  // For now, check if agent has disputes with org
  const disputes = await prisma.dispute.count({
    where: {
      taskAssignment: {
        agentId,
        task: {
          orgId,
        },
      },
      status: 'RESOLVED',
      // Check if resolved against agent
    },
  })

  return disputes > 2 // Blacklist after 3 disputes
}

/**
 * Get detailed eligibility report for all agents
 */
export async function getEligibilityReport(taskId: string): Promise<EligibilityCheck[]> {
  const task = await prisma.task.findUnique({
    where: { id: taskId },
  })

  if (!task) return []

  const requirements = task.requirements as any

  const agents = await prisma.agent.findMany({
    where: { status: 'ACTIVE' },
    include: {
      reputationScores: {
        where: { period: 'ALL_TIME' },
        take: 1,
      },
      credentials: {
        where: {
          revoked: false,
          OR: [{ expiresAt: null }, { expiresAt: { gt: new Date() } }],
        },
      },
    },
    take: 50, // Limit for performance
  })

  const results: EligibilityCheck[] = []

  for (const agent of agents) {
    const check = await checkAgentEligibility(agent, task, requirements)
    results.push(check)
  }

  return results
}

