import { NextRequest, NextResponse } from 'next/server'
import { createAuction } from '@/lib/auction/manager'
import { AuctionType } from '@prisma/client'

/**
 * POST /api/auctions/create
 * Create an auction for a task
 */
export async function POST(req: NextRequest) {
  try {
    // TODO: Add authentication

    const body = await req.json()
    const { taskId, auctionType, durationMinutes = 60 } = body

    if (!taskId || !auctionType) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'INVALID_INPUT',
            message: 'taskId and auctionType are required',
          },
        },
        { status: 400 }
      )
    }

    // Validate auction type
    if (!Object.values(AuctionType).includes(auctionType)) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'INVALID_AUCTION_TYPE',
            message: `Auction type must be one of: ${Object.values(AuctionType).join(', ')}`,
          },
        },
        { status: 400 }
      )
    }

    const result = await createAuction(taskId, auctionType, durationMinutes)

    if (!result.success) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'CREATE_FAILED',
            message: result.error,
          },
        },
        { status: 400 }
      )
    }

    return NextResponse.json({
      success: true,
      data: {
        taskId,
        auctionType,
        auctionEndsAt: result.auctionEndsAt,
        durationMinutes,
      },
    })
  } catch (error) {
    console.error('Error creating auction:', error)
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'CREATE_ERROR',
          message: error instanceof Error ? error.message : 'Failed to create auction',
        },
      },
      { status: 500 }
    )
  }
}

