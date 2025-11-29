/**
 * VC Issuer - Issue Verifiable Credentials
 * Supports various credential types for reputation and compliance
 */

import { prisma } from '@/lib/db/prisma'
import { CredentialType } from '@prisma/client'

/**
 * Issue a verifiable credential
 */
export async function issueCredential(
  agentDid: string,
  type: CredentialType,
  claims: Record<string, any>,
  expiresInDays: number = 90,
  issuerDid?: string
): Promise<{
  credential: any
  jwt: string
}> {
  try {
    // Use system issuer DID if not provided
    const issuer = issuerDid || process.env.SYSTEM_ISSUER_DID || 'did:key:echo-marketplace-issuer'

    const now = new Date()
    const expirationDate = new Date(now)
    expirationDate.setDate(expirationDate.getDate() + expiresInDays)

    // Create credential payload
    const credential = {
      '@context': ['https://www.w3.org/2018/credentials/v1'],
      type: ['VerifiableCredential', type],
      issuer: issuer,
      issuanceDate: now.toISOString(),
      expirationDate: expirationDate.toISOString(),
      credentialSubject: {
        id: agentDid,
        ...claims,
      },
    }

    // In production, sign with Veramo
    // For now, create a mock JWT signature
    const jwt = generateMockJWT(credential, issuer)

    // Store in database
    await prisma.verifiableCredential.create({
      data: {
        agentId: agentDid, // Will need to resolve to internal ID
        issuerDid: issuer,
        type,
        claims,
        issuedAt: now,
        expiresAt: expirationDate,
        signature: jwt,
      },
    })

    return { credential, jwt }
  } catch (error) {
    console.error('Error issuing credential:', error)
    throw new Error('Failed to issue verifiable credential')
  }
}

/**
 * Issue SLA credential (On-Time Delivery)
 */
export async function issueOnTimeSLACredential(
  agentDid: string,
  period: '30d' | '90d',
  slaPercentage: number
): Promise<any> {
  if (slaPercentage < 95) {
    throw new Error('SLA must be >= 95% to issue credential')
  }

  const type = period === '30d' ? CredentialType.SLA_30D : CredentialType.SLA_90D

  return issueCredential(
    agentDid,
    type,
    {
      slaPercentage,
      period,
      issuedAt: new Date().toISOString(),
    },
    period === '30d' ? 30 : 90
  )
}

/**
 * Issue KYC Verified credential
 */
export async function issueKYCCredential(
  agentDid: string,
  kycProvider: string,
  kycId: string
): Promise<any> {
  return issueCredential(
    agentDid,
    CredentialType.KYC_VERIFIED,
    {
      kycProvider,
      kycId,
      verifiedAt: new Date().toISOString(),
    },
    365 // 1 year
  )
}

/**
 * Issue No PII Violations credential
 */
export async function issueNoPIIViolationsCredential(agentDid: string): Promise<any> {
  return issueCredential(
    agentDid,
    CredentialType.NO_PII_VIOLATIONS_90D,
    {
      period: '90d',
      violationCount: 0,
      lastChecked: new Date().toISOString(),
    },
    90
  )
}

/**
 * Issue HIPAA Compliance credential
 */
export async function issueHIPAACredential(
  agentDid: string,
  certificationBody: string,
  certificationId: string
): Promise<any> {
  return issueCredential(
    agentDid,
    CredentialType.HIPAA_COMPLIANT,
    {
      certificationBody,
      certificationId,
      certifiedAt: new Date().toISOString(),
    },
    365
  )
}

/**
 * Issue Organization Binding credential
 */
export async function issueOrgBindingCredential(
  agentDid: string,
  orgDid: string,
  orgName: string,
  role: string
): Promise<any> {
  return issueCredential(
    agentDid,
    CredentialType.ORG_BINDING,
    {
      organizationDid: orgDid,
      organizationName: orgName,
      role,
      boundAt: new Date().toISOString(),
    },
    365
  )
}

/**
 * Revoke a credential
 */
export async function revokeCredential(
  credentialId: string,
  reason: string = 'Revoked by issuer'
): Promise<boolean> {
  try {
    await prisma.verifiableCredential.update({
      where: { id: credentialId },
      data: {
        revoked: true,
        revokedAt: new Date(),
      },
    })

    // In production, publish to revocation registry

    return true
  } catch (error) {
    console.error('Error revoking credential:', error)
    return false
  }
}

/**
 * Get all credentials for an agent
 */
export async function getAgentCredentials(agentId: string): Promise<any[]> {
  try {
    return await prisma.verifiableCredential.findMany({
      where: {
        agentId,
        revoked: false,
        OR: [{ expiresAt: null }, { expiresAt: { gt: new Date() } }],
      },
      orderBy: { issuedAt: 'desc' },
    })
  } catch (error) {
    console.error('Error fetching credentials:', error)
    return []
  }
}

/**
 * Generate mock JWT (in production, use proper signing)
 */
function generateMockJWT(credential: any, issuer: string): string {
  const header = Buffer.from(JSON.stringify({ alg: 'ES256K', typ: 'JWT' })).toString('base64')
  const payload = Buffer.from(JSON.stringify({ ...credential, iss: issuer })).toString('base64')
  const signature = Buffer.from('mock-signature').toString('base64')

  return `${header}.${payload}.${signature}`
}

/**
 * Batch issue credentials
 */
export async function batchIssueCredentials(
  requests: Array<{
    agentDid: string
    type: CredentialType
    claims: Record<string, any>
    expiresInDays?: number
  }>
): Promise<any[]> {
  const results = []

  for (const request of requests) {
    try {
      const result = await issueCredential(
        request.agentDid,
        request.type,
        request.claims,
        request.expiresInDays
      )
      results.push({ success: true, ...result })
    } catch (error) {
      results.push({ success: false, error: error instanceof Error ? error.message : 'Unknown error' })
    }
  }

  return results
}

