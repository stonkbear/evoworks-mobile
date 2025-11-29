/**
 * Data Residency Controls for Enterprise Compliance
 * Enforce data storage and processing location requirements
 */

import { prisma } from '@/lib/db/prisma'

export type DataRegion = 'US' | 'EU' | 'UK' | 'CA' | 'AU' | 'JP' | 'SG' | 'IN' | 'BR'

export interface DataResidencyConfig {
  organizationId: string
  allowedRegions: DataRegion[]
  primaryRegion: DataRegion
  requireLocalProcessing: boolean
  allowCrossRegionReplication: boolean
  dataClassification?: 'public' | 'internal' | 'confidential' | 'restricted'
}

/**
 * Configure data residency for organization
 */
export async function configureDataResidency(
  config: DataResidencyConfig
): Promise<{ success: boolean; error?: string }> {
  try {
    await prisma.organization.update({
      where: { id: config.organizationId },
      data: {
        dataRegion: config.primaryRegion,
        metadata: {
          dataResidency: {
            allowedRegions: config.allowedRegions,
            primaryRegion: config.primaryRegion,
            requireLocalProcessing: config.requireLocalProcessing,
            allowCrossRegionReplication: config.allowCrossRegionReplication,
            dataClassification: config.dataClassification,
          },
        },
      },
    })

    console.log(
      `[DataResidency] Configured for organization ${config.organizationId}: ${config.primaryRegion}`
    )

    return { success: true }
  } catch (error) {
    console.error('Error configuring data residency:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to configure data residency',
    }
  }
}

/**
 * Get data residency config for organization
 */
export async function getDataResidencyConfig(
  organizationId: string
): Promise<DataResidencyConfig | null> {
  try {
    const org = await prisma.organization.findUnique({
      where: { id: organizationId },
      select: {
        dataRegion: true,
        metadata: true,
      },
    })

    if (!org) return null

    const metadata = (org.metadata as any) || {}
    const config = metadata.dataResidency

    if (!config) return null

    return {
      organizationId,
      ...config,
    }
  } catch (error) {
    console.error('Error getting data residency config:', error)
    return null
  }
}

/**
 * Validate if agent can process data for organization
 */
export async function validateAgentResidency(
  agentId: string,
  organizationId: string
): Promise<{
  allowed: boolean
  reason?: string
}> {
  try {
    const [agent, config] = await Promise.all([
      prisma.agent.findUnique({
        where: { id: agentId },
        select: { region: true },
      }),
      getDataResidencyConfig(organizationId),
    ])

    if (!agent) {
      return { allowed: false, reason: 'Agent not found' }
    }

    if (!config) {
      // No restrictions
      return { allowed: true }
    }

    // Check if agent's region is allowed
    const agentRegion = (agent.region as DataRegion) || 'US'

    if (!config.allowedRegions.includes(agentRegion)) {
      return {
        allowed: false,
        reason: `Agent located in ${agentRegion}, but only ${config.allowedRegions.join(', ')} allowed`,
      }
    }

    return { allowed: true }
  } catch (error) {
    console.error('Error validating agent residency:', error)
    return { allowed: false, reason: 'Validation error' }
  }
}

/**
 * Filter agents by residency requirements
 */
export async function filterAgentsByResidency(
  agentIds: string[],
  organizationId: string
): Promise<string[]> {
  try {
    const config = await getDataResidencyConfig(organizationId)

    if (!config) {
      // No restrictions
      return agentIds
    }

    const agents = await prisma.agent.findMany({
      where: {
        id: { in: agentIds },
      },
      select: {
        id: true,
        region: true,
      },
    })

    // Filter agents in allowed regions
    const allowedAgents = agents
      .filter((agent) => {
        const region = (agent.region as DataRegion) || 'US'
        return config.allowedRegions.includes(region)
      })
      .map((agent) => agent.id)

    console.log(
      `[DataResidency] Filtered ${agents.length} agents to ${allowedAgents.length} based on residency`
    )

    return allowedAgents
  } catch (error) {
    console.error('Error filtering agents by residency:', error)
    return []
  }
}

/**
 * Get storage region for data
 */
export function getStorageRegion(dataRegion: DataRegion): string {
  // Map regions to storage locations (S3 buckets, database replicas, etc.)
  const regionMap: Record<DataRegion, string> = {
    US: 'us-east-1',
    EU: 'eu-west-1',
    UK: 'eu-west-2',
    CA: 'ca-central-1',
    AU: 'ap-southeast-2',
    JP: 'ap-northeast-1',
    SG: 'ap-southeast-1',
    IN: 'ap-south-1',
    BR: 'sa-east-1',
  }

  return regionMap[dataRegion] || 'us-east-1'
}

/**
 * Validate data transfer between regions
 */
export async function validateDataTransfer(
  fromRegion: DataRegion,
  toRegion: DataRegion,
  organizationId: string
): Promise<{
  allowed: boolean
  reason?: string
}> {
  try {
    const config = await getDataResidencyConfig(organizationId)

    if (!config) {
      return { allowed: true }
    }

    // Check if both regions are allowed
    if (!config.allowedRegions.includes(fromRegion)) {
      return { allowed: false, reason: `Source region ${fromRegion} not allowed` }
    }

    if (!config.allowedRegions.includes(toRegion)) {
      return { allowed: false, reason: `Destination region ${toRegion} not allowed` }
    }

    // Check if cross-region transfer is allowed
    if (fromRegion !== toRegion && !config.allowCrossRegionReplication) {
      return { allowed: false, reason: 'Cross-region data transfer not allowed' }
    }

    return { allowed: true }
  } catch (error) {
    console.error('Error validating data transfer:', error)
    return { allowed: false, reason: 'Validation error' }
  }
}

/**
 * Get compliance certifications for region
 */
export function getRegionCertifications(region: DataRegion): string[] {
  const certifications: Record<DataRegion, string[]> = {
    US: ['SOC2', 'HIPAA', 'FedRAMP', 'CCPA'],
    EU: ['GDPR', 'ISO27001', 'SOC2'],
    UK: ['GDPR', 'ISO27001', 'SOC2', 'Cyber Essentials'],
    CA: ['PIPEDA', 'SOC2', 'ISO27001'],
    AU: ['IRAP', 'ISO27001', 'SOC2'],
    JP: ['APPI', 'ISO27001', 'SOC2'],
    SG: ['PDPA', 'ISO27001', 'SOC2', 'MTCS'],
    IN: ['DPDP', 'ISO27001', 'SOC2'],
    BR: ['LGPD', 'ISO27001', 'SOC2'],
  }

  return certifications[region] || []
}

/**
 * Check if region meets compliance requirements
 */
export function meetsComplianceRequirements(
  region: DataRegion,
  requirements: string[]
): boolean {
  const certifications = getRegionCertifications(region)
  return requirements.every((req) => certifications.includes(req))
}

/**
 * Log data access for audit
 */
export async function logDataAccess(
  userId: string,
  resourceType: string,
  resourceId: string,
  action: 'read' | 'write' | 'delete',
  region: DataRegion
): Promise<void> {
  try {
    // In production, integrate with audit logging system
    console.log(`[DataResidency] User ${userId} ${action} ${resourceType}/${resourceId} in ${region}`)

    // This would typically call the audit logging system
    // await logEvent('DATA_ACCESS', {
    //   userId,
    //   resourceType,
    //   resourceId,
    //   action,
    //   region,
    // })
  } catch (error) {
    console.error('Error logging data access:', error)
  }
}

