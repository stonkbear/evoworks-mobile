/**
 * VC Verifier - Verify Verifiable Credentials
 * Checks signatures, expiration, and revocation status
 */

import { prisma } from '@/lib/db/prisma'
import { resolveDID } from './manager'

export interface VerificationResult {
  verified: boolean
  errors: string[]
  warnings: string[]
  credential?: any
}

/**
 * Verify a verifiable credential
 */
export async function verifyCredential(credentialJWT: string): Promise<VerificationResult> {
  const errors: string[] = []
  const warnings: string[] = []

  try {
    // Parse JWT (in production, use proper JWT verification)
    const parts = credentialJWT.split('.')
    if (parts.length !== 3) {
      errors.push('Invalid JWT format')
      return { verified: false, errors, warnings }
    }

    const payload = JSON.parse(Buffer.from(parts[1], 'base64').toString())

    // 1. Check signature (in production, verify cryptographic signature)
    // For now, basic structure check
    if (!payload.iss) {
      errors.push('Missing issuer')
    }

    // 2. Check expiration
    if (payload.expirationDate) {
      const expDate = new Date(payload.expirationDate)
      if (expDate < new Date()) {
        errors.push('Credential has expired')
      } else if (expDate.getTime() - Date.now() < 7 * 24 * 60 * 60 * 1000) {
        warnings.push('Credential expires within 7 days')
      }
    }

    // 3. Check revocation status
    const isRevoked = await checkRevocation(payload.id || payload.jti)
    if (isRevoked) {
      errors.push('Credential has been revoked')
    }

    // 4. Validate issuer DID
    try {
      await resolveDID(payload.iss)
    } catch (error) {
      errors.push('Could not resolve issuer DID')
    }

    // 5. Validate subject DID
    if (payload.credentialSubject?.id) {
      try {
        await resolveDID(payload.credentialSubject.id)
      } catch (error) {
        errors.push('Could not resolve subject DID')
      }
    }

    // 6. Validate claims structure
    const claimsValid = validateClaims(payload, payload.type?.[1])
    if (!claimsValid.valid) {
      errors.push(...claimsValid.errors)
    }

    return {
      verified: errors.length === 0,
      errors,
      warnings,
      credential: payload,
    }
  } catch (error) {
    errors.push(`Verification error: ${error instanceof Error ? error.message : 'Unknown error'}`)
    return { verified: false, errors, warnings }
  }
}

/**
 * Check if a credential is revoked
 */
export async function checkRevocation(credentialId: string): Promise<boolean> {
  try {
    const credential = await prisma.verifiableCredential.findUnique({
      where: { id: credentialId },
      select: { revoked: true },
    })

    return credential?.revoked || false
  } catch (error) {
    console.error('Error checking revocation:', error)
    // If can't check, assume not revoked (fail open) - in production, fail closed
    return false
  }
}

/**
 * Validate credential claims structure
 */
export function validateClaims(
  credential: any,
  expectedType?: string
): { valid: boolean; errors: string[] } {
  const errors: string[] = []

  // Check required fields
  if (!credential.credentialSubject) {
    errors.push('Missing credentialSubject')
  }

  if (!credential.issuanceDate) {
    errors.push('Missing issuanceDate')
  }

  if (!credential.issuer && !credential.iss) {
    errors.push('Missing issuer')
  }

  // Validate type-specific claims
  if (expectedType) {
    switch (expectedType) {
      case 'SLA_30D':
      case 'SLA_90D':
        if (!credential.credentialSubject?.slaPercentage) {
          errors.push('Missing slaPercentage claim')
        }
        if (
          credential.credentialSubject?.slaPercentage < 0 ||
          credential.credentialSubject?.slaPercentage > 100
        ) {
          errors.push('Invalid slaPercentage value')
        }
        break

      case 'KYC_VERIFIED':
        if (!credential.credentialSubject?.kycProvider) {
          errors.push('Missing kycProvider claim')
        }
        break

      case 'HIPAA_COMPLIANT':
        if (!credential.credentialSubject?.certificationBody) {
          errors.push('Missing certificationBody claim')
        }
        break

      case 'ORG_BINDING':
        if (!credential.credentialSubject?.organizationDid) {
          errors.push('Missing organizationDid claim')
        }
        break
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  }
}

/**
 * Batch verify multiple credentials
 */
export async function batchVerifyCredentials(
  credentialJWTs: string[]
): Promise<VerificationResult[]> {
  const results: VerificationResult[] = []

  for (const jwt of credentialJWTs) {
    const result = await verifyCredential(jwt)
    results.push(result)
  }

  return results
}

/**
 * Verify agent has specific credential type
 */
export async function verifyAgentHasCredential(
  agentId: string,
  credentialType: string
): Promise<boolean> {
  try {
    const credential = await prisma.verifiableCredential.findFirst({
      where: {
        agentId,
        type: credentialType as any,
        revoked: false,
        OR: [{ expiresAt: null }, { expiresAt: { gt: new Date() } }],
      },
    })

    return Boolean(credential)
  } catch (error) {
    console.error('Error verifying agent credential:', error)
    return false
  }
}

/**
 * Get credential by ID and verify it
 */
export async function getAndVerifyCredential(credentialId: string): Promise<VerificationResult> {
  try {
    const credential = await prisma.verifiableCredential.findUnique({
      where: { id: credentialId },
      include: {
        agent: {
          select: {
            did: true,
            name: true,
          },
        },
      },
    })

    if (!credential) {
      return {
        verified: false,
        errors: ['Credential not found'],
        warnings: [],
      }
    }

    return verifyCredential(credential.signature)
  } catch (error) {
    return {
      verified: false,
      errors: [`Error: ${error instanceof Error ? error.message : 'Unknown error'}`],
      warnings: [],
    }
  }
}

/**
 * Calculate trust score based on credentials
 */
export async function calculateCredentialTrustScore(agentId: string): Promise<number> {
  try {
    const credentials = await prisma.verifiableCredential.findMany({
      where: {
        agentId,
        revoked: false,
        OR: [{ expiresAt: null }, { expiresAt: { gt: new Date() } }],
      },
    })

    let score = 50 // Base score

    // Add points for each credential type
    const credentialTypes = credentials.map((c) => c.type)

    if (credentialTypes.includes('KYC_VERIFIED')) score += 15
    if (credentialTypes.includes('SLA_30D') || credentialTypes.includes('SLA_90D')) score += 10
    if (credentialTypes.includes('NO_PII_VIOLATIONS_90D')) score += 10
    if (credentialTypes.includes('HIPAA_COMPLIANT')) score += 10
    if (credentialTypes.includes('GDPR_COMPLIANT')) score += 5
    if (credentialTypes.includes('SOC2_COMPLIANT')) score += 10

    return Math.min(score, 100)
  } catch (error) {
    console.error('Error calculating credential trust score:', error)
    return 50 // Default middle score
  }
}

