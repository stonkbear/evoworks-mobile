import { NextRequest, NextResponse } from 'next/server'
import { releaseEscrow } from '@/lib/billing/escrow'

/**
 * POST /api/escrow/release
 * Release escrow to agent (task completed)
 */
export async function POST(req: NextRequest) {
  try {
    // TODO: Add authentication
    // TODO: Verify requester is buyer or admin

    const body = await req.json()
    const { escrowId, agentId } = body

    if (!escrowId || !agentId) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'INVALID_INPUT',
            message: 'escrowId and agentId are required',
          },
        },
        { status: 400 }
      )
    }

    const result = await releaseEscrow(escrowId, agentId)

    if (!result.success) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'RELEASE_FAILED',
            message: result.error,
          },
        },
        { status: 400 }
      )
    }

    return NextResponse.json({
      success: true,
      data: {
        escrowId,
        released: true,
        releasedAt: new Date().toISOString(),
      },
    })
  } catch (error) {
    console.error('Error releasing escrow:', error)
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'RELEASE_ERROR',
          message: error instanceof Error ? error.message : 'Failed to release escrow',
        },
      },
      { status: 500 }
    )
  }
}

