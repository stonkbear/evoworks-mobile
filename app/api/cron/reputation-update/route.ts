import { NextResponse } from 'next/server'
import { updateAllReputationScores } from '@/lib/reputation/updater'

/**
 * GET /api/cron/reputation-update
 * Cron job to update all reputation scores daily
 * Should be called by Vercel Cron or external scheduler
 */
export async function GET() {
  try {
    // Verify cron secret to prevent unauthorized access
    // const authHeader = req.headers.get('authorization')
    // if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    //   return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    // }

    console.log('[Cron] Starting reputation update job...')

    await updateAllReputationScores()

    console.log('[Cron] Reputation update job completed')

    return NextResponse.json({
      success: true,
      message: 'Reputation scores updated successfully',
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error('[Cron] Error updating reputation scores:', error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}

