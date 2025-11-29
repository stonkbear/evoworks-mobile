import { NextRequest, NextResponse } from 'next/server'
import { revokeCredential } from '@/lib/did/vc-issuer'

/**
 * POST /api/vc/revoke
 * Revoke a verifiable credential (admin only)
 */
export async function POST(req: NextRequest) {
  try {
    // TODO: Add authentication middleware
    // TODO: Check if user is admin

    const body = await req.json()
    const { credentialId, reason } = body

    if (!credentialId) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'MISSING_CREDENTIAL_ID',
            message: 'credentialId is required',
          },
        },
        { status: 400 }
      )
    }

    const success = await revokeCredential(credentialId, reason || 'Revoked by admin')

    if (!success) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'REVOKE_FAILED',
            message: 'Failed to revoke credential',
          },
        },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      data: {
        credentialId,
        revoked: true,
        revokedAt: new Date().toISOString(),
      },
    })
  } catch (error) {
    console.error('Error revoking credential:', error)
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'REVOKE_ERROR',
          message: error instanceof Error ? error.message : 'Failed to revoke credential',
        },
      },
      { status: 500 }
    )
  }
}

