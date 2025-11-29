import { NextRequest, NextResponse } from 'next/server'
import { trending } from '@/lib/discovery/search'

/**
 * GET /api/agents/trending
 * Get trending agents
 */
export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams
    const period = (searchParams.get('period') as '24h' | '7d' | '30d') || '7d'
    const limit = parseInt(searchParams.get('limit') || '10')

    const agents = await trending(period, limit)

    return NextResponse.json({
      success: true,
      data: {
        agents,
        period,
        count: agents.length,
      },
    })
  } catch (error) {
    console.error('Error getting trending agents:', error)
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'TRENDING_ERROR',
          message: 'Failed to get trending agents',
        },
      },
      { status: 500 }
    )
  }
}

