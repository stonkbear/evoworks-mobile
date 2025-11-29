/**
 * POST /api/cron/merkle-anchor - Cron job to batch anchor events
 * Run every hour via Vercel Cron
 */

import { NextRequest, NextResponse } from 'next/server'
import { batchAnchorEvents } from '@/lib/observability/merkle'

export async function POST(request: NextRequest) {
  try {
    // Verify cron secret (Vercel adds this header)
    const authHeader = request.headers.get('authorization')
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    console.log('[Cron] Starting Merkle anchor batch...')

    const result = await batchAnchorEvents()

    if (!result.success) {
      return NextResponse.json(
        {
          success: false,
          error: result.error,
        },
        { status: 500 }
      )
    }

    console.log(`[Cron] Merkle anchor complete: ${result.eventCount} events`)

    return NextResponse.json({
      success: true,
      anchorId: result.anchorId,
      eventCount: result.eventCount,
    })
  } catch (error) {
    console.error('Error in Merkle anchor cron:', error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Cron job failed',
      },
      { status: 500 }
    )
  }
}

