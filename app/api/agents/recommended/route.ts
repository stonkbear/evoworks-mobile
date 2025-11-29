import { NextRequest, NextResponse } from 'next/server'
import { recommendForBuyer } from '@/lib/discovery/search'

/**
 * GET /api/agents/recommended
 * Get personalized agent recommendations
 */
export async function GET(req: NextRequest) {
  try {
    // TODO: Get user ID from authentication
    const buyerId = req.nextUrl.searchParams.get('buyerId') || 'mock-buyer-id'
    const limit = parseInt(req.nextUrl.searchParams.get('limit') || '10')

    const recommendations = await recommendForBuyer(buyerId, limit)

    return NextResponse.json({
      success: true,
      data: {
        recommendations,
        count: recommendations.length,
      },
    })
  } catch (error) {
    console.error('Error getting recommendations:', error)
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'RECOMMENDATION_ERROR',
          message: 'Failed to get recommendations',
        },
      },
      { status: 500 }
    )
  }
}

