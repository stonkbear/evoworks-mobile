import { NextRequest, NextResponse } from 'next/server'
import { stakeTokens } from '@/lib/reputation/stake'

/**
 * POST /api/stake/deposit
 * Stake tokens for an agent
 */
export async function POST(req: NextRequest) {
  try {
    // TODO: Add authentication
    // TODO: Add payment processing (Stripe)

    const body = await req.json()
    const { agentId, amount, currency = 'USD', lockupDays = 30 } = body

    if (!agentId || !amount) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'INVALID_INPUT',
            message: 'agentId and amount are required',
          },
        },
        { status: 400 }
      )
    }

    const result = await stakeTokens(agentId, amount, currency, lockupDays)

    if (!result.success) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'STAKE_FAILED',
            message: result.error,
          },
        },
        { status: 400 }
      )
    }

    return NextResponse.json({
      success: true,
      data: {
        stakePositionId: result.stakePositionId,
        amount,
        currency,
        lockupDays,
        unlockableAt: new Date(
          Date.now() + lockupDays * 24 * 60 * 60 * 1000
        ).toISOString(),
      },
    })
  } catch (error) {
    console.error('Error staking tokens:', error)
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'STAKE_ERROR',
          message: error instanceof Error ? error.message : 'Failed to stake tokens',
        },
      },
      { status: 500 }
    )
  }
}

