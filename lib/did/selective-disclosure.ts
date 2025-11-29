/**
 * Selective Disclosure - Allow agents to prove claims without revealing full credentials
 * 
 * This is a simplified implementation. For production with BBS+ signatures,
 * use libraries like @mattrglobal/bbs-signatures
 */

import { prisma } from '@/lib/db/prisma'

export interface DisclosureRequest {
  agentId: string
  credentialType: string
  claimsToDisclose: string[]
  hiddenClaims: string[]
}

export interface DisclosureProof {
  disclosed: Record<string, any>
  proof: string
  credentialId: string
  timestamp: string
}

/**
 * Create a selective disclosure proof
 * Allows proving specific claims without revealing the entire credential
 */
export async function createSelectiveDisclosure(
  request: DisclosureRequest
): Promise<DisclosureProof> {
  try {
    // Find the credential
    const credential = await prisma.verifiableCredential.findFirst({
      where: {
        agentId: request.agentId,
        type: request.credentialType as any,
        revoked: false,
        OR: [{ expiresAt: null }, { expiresAt: { gt: new Date() } }],
      },
    })

    if (!credential) {
      throw new Error('Credential not found')
    }

    // Extract only the requested claims
    const disclosedClaims: Record<string, any> = {}
    const allClaims = credential.claims as Record<string, any>

    for (const claimKey of request.claimsToDisclose) {
      if (allClaims[claimKey] !== undefined) {
        disclosedClaims[claimKey] = allClaims[claimKey]
      }
    }

    // Generate proof (in production, use ZK-SNARKs or BBS+)
    const proof = generateProof(credential.id, disclosedClaims, request.hiddenClaims)

    return {
      disclosed: disclosedClaims,
      proof,
      credentialId: credential.id,
      timestamp: new Date().toISOString(),
    }
  } catch (error) {
    console.error('Error creating selective disclosure:', error)
    throw new Error('Failed to create selective disclosure')
  }
}

/**
 * Verify a selective disclosure proof
 */
export async function verifySelectiveDisclosure(disclosure: DisclosureProof): Promise<boolean> {
  try {
    // Verify the credential exists and is valid
    const credential = await prisma.verifiableCredential.findUnique({
      where: { id: disclosure.credentialId },
    })

    if (!credential || credential.revoked) {
      return false
    }

    if (credential.expiresAt && credential.expiresAt < new Date()) {
      return false
    }

    // Verify the proof (in production, use cryptographic verification)
    const proofValid = verifyProof(
      disclosure.proof,
      disclosure.credentialId,
      disclosure.disclosed
    )

    return proofValid
  } catch (error) {
    console.error('Error verifying selective disclosure:', error)
    return false
  }
}

/**
 * Create a range proof - prove a value is within a range without revealing the exact value
 * Example: "My SLA is > 95%" without revealing it's exactly 98.5%
 */
export async function createRangeProof(
  agentId: string,
  claimName: string,
  minValue: number,
  maxValue?: number
): Promise<{ proof: string; valid: boolean }> {
  try {
    // Find relevant credential
    const credential = await prisma.verifiableCredential.findFirst({
      where: {
        agentId,
        revoked: false,
        OR: [{ expiresAt: null }, { expiresAt: { gt: new Date() } }],
      },
    })

    if (!credential) {
      return { proof: '', valid: false }
    }

    const claims = credential.claims as Record<string, any>
    const actualValue = claims[claimName]

    if (typeof actualValue !== 'number') {
      return { proof: '', valid: false }
    }

    // Check if value is in range
    const inRange = actualValue >= minValue && (maxValue === undefined || actualValue <= maxValue)

    if (!inRange) {
      return { proof: '', valid: false }
    }

    // Generate zero-knowledge range proof (simplified)
    const proof = generateRangeProof(actualValue, minValue, maxValue)

    return {
      proof,
      valid: true,
    }
  } catch (error) {
    console.error('Error creating range proof:', error)
    return { proof: '', valid: false }
  }
}

/**
 * Prove set membership without revealing the exact value
 * Example: "My certification is from {Google, Microsoft, AWS}" without revealing which one
 */
export async function createSetMembershipProof(
  agentId: string,
  claimName: string,
  allowedValues: any[]
): Promise<{ proof: string; valid: boolean }> {
  try {
    const credential = await prisma.verifiableCredential.findFirst({
      where: {
        agentId,
        revoked: false,
        OR: [{ expiresAt: null }, { expiresAt: { gt: new Date() } }],
      },
    })

    if (!credential) {
      return { proof: '', valid: false }
    }

    const claims = credential.claims as Record<string, any>
    const actualValue = claims[claimName]

    // Check if value is in allowed set
    const inSet = allowedValues.includes(actualValue)

    if (!inSet) {
      return { proof: '', valid: false }
    }

    // Generate set membership proof
    const proof = generateSetProof(actualValue, allowedValues)

    return {
      proof,
      valid: true,
    }
  } catch (error) {
    console.error('Error creating set membership proof:', error)
    return { proof: '', valid: false }
  }
}

/**
 * Helper: Generate proof hash (simplified, use proper crypto in production)
 */
function generateProof(
  credentialId: string,
  disclosedClaims: Record<string, any>,
  hiddenClaims: string[]
): string {
  const proofData = {
    credentialId,
    disclosed: Object.keys(disclosedClaims).sort(),
    hidden: hiddenClaims.sort(),
    timestamp: Date.now(),
  }

  // In production, use proper cryptographic signatures
  return Buffer.from(JSON.stringify(proofData)).toString('base64')
}

/**
 * Helper: Verify proof hash
 */
function verifyProof(
  proof: string,
  credentialId: string,
  disclosedClaims: Record<string, any>
): boolean {
  try {
    const decoded = JSON.parse(Buffer.from(proof, 'base64').toString())
    return decoded.credentialId === credentialId
  } catch {
    return false
  }
}

/**
 * Helper: Generate range proof (simplified)
 */
function generateRangeProof(actualValue: number, minValue: number, maxValue?: number): string {
  const proofData = {
    type: 'range',
    min: minValue,
    max: maxValue,
    valueHash: hashValue(actualValue),
    timestamp: Date.now(),
  }

  return Buffer.from(JSON.stringify(proofData)).toString('base64')
}

/**
 * Helper: Generate set membership proof (simplified)
 */
function generateSetProof(actualValue: any, allowedValues: any[]): string {
  const proofData = {
    type: 'set-membership',
    setHash: hashValue(allowedValues.sort().join(',')),
    valueHash: hashValue(actualValue),
    timestamp: Date.now(),
  }

  return Buffer.from(JSON.stringify(proofData)).toString('base64')
}

/**
 * Helper: Hash a value (simplified, use SHA-256 in production)
 */
function hashValue(value: any): string {
  return Buffer.from(String(value)).toString('base64')
}

/**
 * Get available claims for selective disclosure
 */
export async function getAvailableClaimsForDisclosure(
  agentId: string,
  credentialType: string
): Promise<string[]> {
  try {
    const credential = await prisma.verifiableCredential.findFirst({
      where: {
        agentId,
        type: credentialType as any,
        revoked: false,
        OR: [{ expiresAt: null }, { expiresAt: { gt: new Date() } }],
      },
    })

    if (!credential) {
      return []
    }

    const claims = credential.claims as Record<string, any>
    return Object.keys(claims)
  } catch (error) {
    console.error('Error getting available claims:', error)
    return []
  }
}

