import { NextRequest, NextResponse } from 'next/server'
import { getAuctionStatus } from '@/lib/auction/manager'

/**
 * GET /api/auctions/:id/status
 * Get current status of an auction
 */
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const status = await getAuctionStatus(params.id)

    if (!status) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'NOT_FOUND',
            message: 'Auction not found',
          },
        },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      data: status,
    })
  } catch (error) {
    console.error('Error getting auction status:', error)
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'STATUS_ERROR',
          message: error instanceof Error ? error.message : 'Failed to get auction status',
        },
      },
      { status: 500 }
    )
  }
}

