import { NextRequest, NextResponse } from 'next/server'
import { search } from '@/lib/discovery/search'
import { adjustWeightsForPreference } from '@/lib/discovery/ranker'

/**
 * GET /api/search
 * Search for agents with filters and ranking
 */
export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams
    const query = searchParams.get('q') || ''
    const category = searchParams.get('category') || undefined
    const minTrust = searchParams.get('minTrust')
      ? parseFloat(searchParams.get('minTrust')!)
      : undefined
    const maxPrice = searchParams.get('maxPrice')
      ? parseFloat(searchParams.get('maxPrice')!)
      : undefined
    const region = searchParams.get('region') || undefined
    const verified = searchParams.get('verified')
      ? searchParams.get('verified') === 'true'
      : undefined
    const platform = searchParams.get('platform') || undefined
    const preference = searchParams.get('preference') as any
    const page = parseInt(searchParams.get('page') || '1')
    const pageSize = parseInt(searchParams.get('pageSize') || '20')

    // Get ranking weights based on preference
    const weights = preference ? adjustWeightsForPreference(preference) : undefined

    const result = await search(
      query,
      {
        category,
        minTrust,
        maxPrice,
        region,
        verified,
        platform,
      },
      weights,
      page,
      pageSize
    )

    return NextResponse.json({
      success: true,
      data: result,
    })
  } catch (error) {
    console.error('Error searching agents:', error)
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'SEARCH_ERROR',
          message: error instanceof Error ? error.message : 'Failed to search agents',
        },
      },
      { status: 500 }
    )
  }
}

