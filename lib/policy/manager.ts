/**
 * Policy Pack Manager - Manage and evaluate OPA/Rego policies
 * Enables declarative policy-as-code enforcement
 */

import { prisma } from '@/lib/db/prisma'

export interface PolicyResult {
  allow: boolean
  deny: boolean
  reasonCodes: string[]
  context: Record<string, any>
}

export interface PolicyInput {
  agent?: any
  task?: any
  tool?: string
  user?: any
  organization?: any
}

/**
 * Create a new policy pack
 */
export async function createPolicyPack(
  name: string,
  rules: Record<string, string>,
  orgId?: string,
  createdByUserId?: string
): Promise<string> {
  try {
    const policyPack = await prisma.policyPack.create({
      data: {
        name,
        version: '1.0.0',
        rules,
        orgId,
        createdByUserId: createdByUserId || 'system',
      },
    })

    console.log(`[Policy] Created policy pack: ${name} (${policyPack.id})`)

    return policyPack.id
  } catch (error) {
    console.error('Error creating policy pack:', error)
    throw error
  }
}

/**
 * Update an existing policy pack
 */
export async function updatePolicyPack(
  policyPackId: string,
  updates: {
    name?: string
    rules?: Record<string, any>
  }
): Promise<void> {
  try {
    // Increment version
    const existing = await prisma.policyPack.findUnique({
      where: { id: policyPackId },
    })

    if (!existing) {
      throw new Error('Policy pack not found')
    }

    const [major, minor, patch] = existing.version.split('.').map(Number)
    const newVersion = `${major}.${minor}.${patch + 1}`

    await prisma.policyPack.update({
      where: { id: policyPackId },
      data: {
        ...updates,
        version: newVersion,
      },
    })

    console.log(`[Policy] Updated policy pack ${policyPackId} to version ${newVersion}`)
  } catch (error) {
    console.error('Error updating policy pack:', error)
    throw error
  }
}

/**
 * Evaluate a policy pack against input
 */
export async function evaluatePolicy(
  policyPackId: string,
  input: PolicyInput
): Promise<PolicyResult> {
  try {
    const policyPack = await prisma.policyPack.findUnique({
      where: { id: policyPackId },
    })

    if (!policyPack) {
      throw new Error('Policy pack not found')
    }

    const rules = policyPack.rules as Record<string, string>

    // In production, use actual OPA WASM runtime
    // For now, implement simplified rule evaluation
    const result = await evaluateRules(rules, input)

    // Log the decision
    await logPolicyDecision(policyPackId, input, result)

    return result
  } catch (error) {
    console.error('Error evaluating policy:', error)
    throw error
  }
}

/**
 * Evaluate policy rules (simplified implementation)
 * In production, use OPA WASM: loadPolicy() -> evaluate()
 */
async function evaluateRules(
  rules: Record<string, string>,
  input: PolicyInput
): Promise<PolicyResult> {
  const reasonCodes: string[] = []
  let allow = true
  let deny = false

  // Check data residency rule
  if (rules.dataResidency && input.task && input.agent) {
    const taskRegion = input.task.requirements?.region
    const agentRegions = input.agent.capabilities?.regions || []

    if (taskRegion && !agentRegions.includes(taskRegion)) {
      allow = false
      deny = true
      reasonCodes.push('data_residency_violation')
    }
  }

  // Check tool permissions
  if (rules.toolPermissions && input.task && input.agent) {
    const dataClass = input.task.requirements?.dataClass
    const requiredCreds = getRequiredCredentialsForDataClass(dataClass)

    if (requiredCreds.length > 0) {
      const agentCredTypes = input.agent.credentials?.map((c: any) => c.type) || []
      const hasAll = requiredCreds.every((req) => agentCredTypes.includes(req))

      if (!hasAll) {
        allow = false
        deny = true
        reasonCodes.push('missing_required_credentials')
      }
    }
  }

  // Check spend limits
  if (rules.spendLimits && input.task && input.agent) {
    const taskBudget = input.task.maxBudget || 0
    const agentSpendLimit = input.agent.spendLimit?.perTask || Infinity

    if (taskBudget > agentSpendLimit) {
      allow = false
      deny = true
      reasonCodes.push('spend_limit_exceeded')
    }
  }

  // Check reputation threshold
  if (rules.reputationThreshold && input.task && input.agent) {
    const minRep = input.task.requirements?.minTrustScore || 0
    const agentRep = input.agent.reputationScores?.[0]?.overallScore || 0

    if (agentRep < minRep) {
      allow = false
      deny = true
      reasonCodes.push('insufficient_reputation')
    }
  }

  return {
    allow,
    deny,
    reasonCodes: reasonCodes.length > 0 ? reasonCodes : ['all_checks_passed'],
    context: input as Record<string, any>,
  }
}

/**
 * Get required credentials for a data class
 */
function getRequiredCredentialsForDataClass(dataClass?: string): string[] {
  const requirements: Record<string, string[]> = {
    PHI: ['HIPAA_COMPLIANT'],
    PII: ['NO_PII_VIOLATIONS_90D'],
    PCI: ['PCI_DSS_COMPLIANT'],
    GDPR: ['GDPR_COMPLIANT'],
  }

  return requirements[dataClass || ''] || []
}

/**
 * Log policy decision to database
 */
async function logPolicyDecision(
  policyPackId: string,
  input: PolicyInput,
  result: PolicyResult
): Promise<void> {
  try {
    await prisma.policyDecision.create({
      data: {
        policyPackId,
        agentId: input.agent?.id,
        taskId: input.task?.id,
        decision: result.deny ? 'DENY' : 'ALLOW',
        reasonCodes: result.reasonCodes,
        context: result.context,
      },
    })
  } catch (error) {
    console.error('Error logging policy decision:', error)
    // Don't throw - logging failure shouldn't block policy evaluation
  }
}

/**
 * Get policy pack for organization (or system default)
 */
export async function getPolicyPackForOrg(orgId?: string): Promise<string | null> {
  try {
    // Try to get org-specific policy pack
    if (orgId) {
      const orgPolicy = await prisma.policyPack.findFirst({
        where: { orgId },
        orderBy: { createdAt: 'desc' },
      })

      if (orgPolicy) {
        return orgPolicy.id
      }
    }

    // Fall back to system default policy pack
    const systemPolicy = await prisma.policyPack.findFirst({
      where: { orgId: null },
      orderBy: { createdAt: 'desc' },
    })

    return systemPolicy?.id || null
  } catch (error) {
    console.error('Error getting policy pack:', error)
    return null
  }
}

/**
 * List all policy packs for an organization
 */
export async function listPolicyPacks(orgId?: string): Promise<any[]> {
  try {
    return await prisma.policyPack.findMany({
      where: { orgId: orgId || null },
      orderBy: { createdAt: 'desc' },
      include: {
        createdBy: {
          select: {
            name: true,
            email: true,
          },
        },
      },
    })
  } catch (error) {
    console.error('Error listing policy packs:', error)
    return []
  }
}

/**
 * Delete a policy pack
 */
export async function deletePolicyPack(policyPackId: string): Promise<boolean> {
  try {
    await prisma.policyPack.delete({
      where: { id: policyPackId },
    })

    console.log(`[Policy] Deleted policy pack ${policyPackId}`)
    return true
  } catch (error) {
    console.error('Error deleting policy pack:', error)
    return false
  }
}

/**
 * Get policy decision history
 */
export async function getPolicyDecisions(
  filters: {
    policyPackId?: string
    agentId?: string
    taskId?: string
    decision?: 'ALLOW' | 'DENY'
    limit?: number
  } = {}
): Promise<any[]> {
  try {
    const where: any = {}

    if (filters.policyPackId) where.policyPackId = filters.policyPackId
    if (filters.agentId) where.agentId = filters.agentId
    if (filters.taskId) where.taskId = filters.taskId
    if (filters.decision) where.decision = filters.decision

    return await prisma.policyDecision.findMany({
      where,
      take: filters.limit || 100,
      orderBy: { decidedAt: 'desc' },
      include: {
        policyPack: {
          select: {
            name: true,
            version: true,
          },
        },
        agent: {
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
    console.error('Error getting policy decisions:', error)
    return []
  }
}

