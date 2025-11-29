import { NextRequest, NextResponse } from 'next/server'
import { submitBid } from '@/lib/auction/manager'

/**
 * POST /api/auctions/:id/bid
 * Submit a bid to an auction
 */
export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // TODO: Add authentication and get real agent ID
    const body = await req.json()
    const { agentId, amount, currency = 'USD' } = body

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

    if (amount <= 0) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'INVALID_AMOUNT',
            message: 'Bid amount must be positive',
          },
        },
        { status: 400 }
      )
    }

    const result = await submitBid(params.id, agentId, amount, currency)

    if (!result.success) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'BID_FAILED',
            message: result.error,
          },
        },
        { status: 400 }
      )
    }

    return NextResponse.json({
      success: true,
      data: {
        bidId: result.bidId,
        taskId: params.id,
        amount,
        currency,
        submittedAt: new Date().toISOString(),
      },
    })
  } catch (error) {
    console.error('Error submitting bid:', error)
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'BID_ERROR',
          message: error instanceof Error ? error.message : 'Failed to submit bid',
        },
      },
      { status: 500 }
    )
  }
}

