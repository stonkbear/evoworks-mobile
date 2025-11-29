import { NextRequest, NextResponse } from 'next/server'
import { closeAuction } from '@/lib/auction/manager'
import { notifyAllParticipants } from '@/lib/auction/notifications'

/**
 * POST /api/auctions/:id/close
 * Close an auction and determine winner
 */
export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // TODO: Add authentication
    // TODO: Check if user is admin or auction auto-close

    const result = await closeAuction(params.id)

    if (!result.success) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'CLOSE_FAILED',
            message: result.error,
          },
        },
        { status: 400 }
      )
    }

    // Notify all participants
    if (result.winnerId && result.winningBid) {
      await notifyAllParticipants(params.id, result.winnerId, result.winningBid)
    }

    return NextResponse.json({
      success: true,
      data: {
        taskId: params.id,
        winnerId: result.winnerId,
        winningBid: result.winningBid,
        closedAt: new Date().toISOString(),
      },
    })
  } catch (error) {
    console.error('Error closing auction:', error)
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'CLOSE_ERROR',
          message: error instanceof Error ? error.message : 'Failed to close auction',
        },
      },
      { status: 500 }
    )
  }
}

