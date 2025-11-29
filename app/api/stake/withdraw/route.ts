import { NextRequest, NextResponse } from 'next/server'
import { unstakeTokens } from '@/lib/reputation/stake'

/**
 * POST /api/stake/withdraw
 * Withdraw unlocked stake
 */
export async function POST(req: NextRequest) {
  try {
    // TODO: Add authentication

    const body = await req.json()
    const { stakePositionId } = body

    if (!stakePositionId) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'INVALID_INPUT',
            message: 'stakePositionId is required',
          },
        },
        { status: 400 }
      )
    }

    const result = await unstakeTokens(stakePositionId)

    if (!result.success) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'UNSTAKE_FAILED',
            message: result.error,
          },
        },
        { status: 400 }
      )
    }

    return NextResponse.json({
      success: true,
      data: {
        stakePositionId,
        withdrawn: true,
        withdrawnAt: new Date().toISOString(),
      },
    })
  } catch (error) {
    console.error('Error unstaking tokens:', error)
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'UNSTAKE_ERROR',
          message: error instanceof Error ? error.message : 'Failed to unstake tokens',
        },
      },
      { status: 500 }
    )
  }
}

