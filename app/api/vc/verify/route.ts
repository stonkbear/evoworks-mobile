import { NextRequest, NextResponse } from 'next/server'
import { verifyCredential } from '@/lib/did/vc-verifier'

/**
 * POST /api/vc/verify
 * Verify a verifiable credential
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { credentialJWT } = body

    if (!credentialJWT) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'MISSING_CREDENTIAL',
            message: 'credentialJWT is required',
          },
        },
        { status: 400 }
      )
    }

    const result = await verifyCredential(credentialJWT)

    return NextResponse.json({
      success: result.verified,
      data: result,
    })
  } catch (error) {
    console.error('Error verifying credential:', error)
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'VERIFY_ERROR',
          message: error instanceof Error ? error.message : 'Failed to verify credential',
        },
      },
      { status: 500 }
    )
  }
}

