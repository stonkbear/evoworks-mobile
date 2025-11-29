/**
 * Policy Evaluator - Evaluate policies at different checkpoints
 * Pre-bid, task assignment, and runtime enforcement
 */

import { prisma } from '@/lib/db/prisma'
import { evaluatePolicy, getPolicyPackForOrg, PolicyInput } from './manager'

/**
 * Check if agent can bid on a task (pre-bid filtering)
 */
export async function canAgentBid(agentId: string, taskId: string): Promise<{
  allowed: boolean
  reasons: string[]
}> {
  try {
    // Get agent and task data
    const [agent, task] = await Promise.all([
      prisma.agent.findUnique({
        where: { id: agentId },
        include: {
          credentials: {
            where: {
              revoked: false,
              OR: [{ expiresAt: null }, { expiresAt: { gt: new Date() } }],
            },
          },
          reputationScores: {
            where: { period: 'ALL_TIME' },
            take: 1,
          },
        },
      }),
      prisma.task.findUnique({
        where: { id: taskId },
      }),
    ])

    if (!agent || !task) {
      return { allowed: false, reasons: ['Agent or task not found'] }
    }

    // Get applicable policy pack
    const policyPackId = await getPolicyPackForOrg(task.orgId || undefined)

    if (!policyPackId) {
      // No policy pack found, allow by default
      return { allowed: true, reasons: ['No policy pack configured'] }
    }

    // Evaluate policy
    const result = await evaluatePolicy(policyPackId, {
      agent,
      task,
    })

    return {
      allowed: result.allow && !result.deny,
      reasons: result.reasonCodes,
    }
  } catch (error) {
    console.error('Error checking if agent can bid:', error)
    // Fail open in case of error (allow by default)
    return { allowed: true, reasons: ['Policy evaluation error'] }
  }
}

/**
 * Check if task can be assigned to agent
 */
export async function canAssignTask(agentId: string, taskId: string): Promise<{
  allowed: boolean
  reasons: string[]
}> {
  // Same checks as canAgentBid, but at assignment time
  return canAgentBid(agentId, taskId)
}

/**
 * Check if agent can invoke a tool at runtime
 */
export async function canInvokeTool(
  agentId: string,
  toolName: string,
  context: Record<string, any>
): Promise<{
  allowed: boolean
  reasons: string[]
}> {
  try {
    const agent = await prisma.agent.findUnique({
      where: { id: agentId },
      include: {
        credentials: {
          where: {
            revoked: false,
            OR: [{ expiresAt: null }, { expiresAt: { gt: new Date() } }],
          },
        },
      },
    })

    if (!agent) {
      return { allowed: false, reasons: ['Agent not found'] }
    }

    // Get policy pack
    const policyPackId = await getPolicyPackForOrg(agent.orgId || undefined)

    if (!policyPackId) {
      return { allowed: true, reasons: ['No policy pack configured'] }
    }

    // Evaluate tool invocation policy
    const result = await evaluatePolicy(policyPackId, {
      agent,
      tool: toolName,
      ...context,
    })

    return {
      allowed: result.allow && !result.deny,
      reasons: result.reasonCodes,
    }
  } catch (error) {
    console.error('Error checking if agent can invoke tool:', error)
    return { allowed: true, reasons: ['Policy evaluation error'] }
  }
}

/**
 * Batch evaluate policies for multiple agents
 */
export async function batchEvaluateAgents(
  agentIds: string[],
  taskId: string
): Promise<Map<string, { allowed: boolean; reasons: string[] }>> {
  const results = new Map()

  await Promise.all(
    agentIds.map(async (agentId) => {
      const result = await canAgentBid(agentId, taskId)
      results.set(agentId, result)
    })
  )

  return results
}

/**
 * Get policy violations for an agent
 */
export async function getAgentViolations(agentId: string): Promise<any[]> {
  try {
    return await prisma.policyDecision.findMany({
      where: {
        agentId,
        decision: 'DENY',
      },
      orderBy: { decidedAt: 'desc' },
      take: 50,
      include: {
        policyPack: {
          select: {
            name: true,
          },
        },
        task: {
          select: {
            title: true,
          },
        },
      },
    })
  } catch (error) {
    console.error('Error getting agent violations:', error)
    return []
  }
}

/**
 * Get policy compliance rate for an agent
 */
export async function getComplianceRate(agentId: string, days: number = 90): Promise<number> {
  try {
    const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000)

    const [totalDecisions, deniedDecisions] = await Promise.all([
      prisma.policyDecision.count({
        where: {
          agentId,
          decidedAt: { gte: since },
        },
      }),
      prisma.policyDecision.count({
        where: {
          agentId,
          decidedAt: { gte: since },
          decision: 'DENY',
        },
      }),
    ])

    if (totalDecisions === 0) return 100 // No decisions = 100% compliant

    return ((totalDecisions - deniedDecisions) / totalDecisions) * 100
  } catch (error) {
    console.error('Error calculating compliance rate:', error)
    return 0
  }
}

