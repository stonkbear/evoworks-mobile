import { NextRequest, NextResponse } from 'next/server'
import { issueCredential } from '@/lib/did/vc-issuer'
import { CredentialType } from '@prisma/client'

/**
 * POST /api/vc/issue
 * Issue a verifiable credential (admin only)
 */
export async function POST(req: NextRequest) {
  try {
    // TODO: Add authentication middleware
    // TODO: Check if user is admin

    const body = await req.json()
    const { agentDid, type, claims, expiresInDays = 90 } = body

    if (!agentDid || !type || !claims) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'INVALID_INPUT',
            message: 'agentDid, type, and claims are required',
          },
        },
        { status: 400 }
      )
    }

    // Validate credential type
    if (!Object.values(CredentialType).includes(type)) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'INVALID_TYPE',
            message: `Invalid credential type. Must be one of: ${Object.values(CredentialType).join(', ')}`,
          },
        },
        { status: 400 }
      )
    }

    const result = await issueCredential(agentDid, type as CredentialType, claims, expiresInDays)

    return NextResponse.json({
      success: true,
      data: result,
    })
  } catch (error) {
    console.error('Error issuing credential:', error)
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'ISSUE_ERROR',
          message: error instanceof Error ? error.message : 'Failed to issue credential',
        },
      },
      { status: 500 }
    )
  }
}

