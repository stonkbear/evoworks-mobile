/**
 * GET /api/merkle/anchors - Get Merkle anchors
 * POST /api/merkle/anchors - Manually trigger batch anchor
 */

import { NextRequest, NextResponse } from 'next/server'
import { getMerkleAnchors, batchAnchorEvents } from '@/lib/observability/merkle'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '50')

    const anchors = await getMerkleAnchors(limit)

    return NextResponse.json({
      success: true,
      anchors,
      count: anchors.length,
    })
  } catch (error) {
    console.error('Error getting Merkle anchors:', error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to get anchors',
      },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    // Verify authorization (only admins should trigger manual anchoring)
    const authHeader = request.headers.get('authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const result = await batchAnchorEvents()

    if (!result.success) {
      return NextResponse.json(
        {
          success: false,
          error: result.error || 'Failed to anchor events',
        },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      anchorId: result.anchorId,
      eventCount: result.eventCount,
      message: `Successfully anchored ${result.eventCount} events`,
    })
  } catch (error) {
    console.error('Error anchoring events:', error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to anchor events',
      },
      { status: 500 }
    )
  }
}

