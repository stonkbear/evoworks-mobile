/**
 * Payout Processing API
 * POST - Trigger payout processing (admin/cron)
 */

import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { processPendingPayouts, checkAutoPayouts } from '@/lib/billing/payouts'

// This endpoint can be called by:
// 1. Admin manually
// 2. Cron job with secret key
// 3. Webhook from payment processor

export async function POST(request: NextRequest) {
  try {
    // Check authorization
    const session = await auth()
    const cronSecret = request.headers.get('x-cron-secret')
    const expectedSecret = process.env.CRON_SECRET

    const isAdmin = session?.user?.role === 'ADMIN'
    const isValidCron = cronSecret && expectedSecret && cronSecret === expectedSecret

    if (!isAdmin && !isValidCron) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json().catch(() => ({}))
    const { action = 'process' } = body

    let result

    switch (action) {
      case 'process':
        // Process pending payouts
        result = await processPendingPayouts()
        break

      case 'auto':
        // Check and trigger auto-payouts
        result = await checkAutoPayouts()
        break

      case 'all':
        // Do both
        const autoResult = await checkAutoPayouts()
        const processResult = await processPendingPayouts()
        result = {
          autoPayout: autoResult,
          processing: processResult,
        }
        break

      default:
        return NextResponse.json(
          { error: 'Invalid action. Use: process, auto, or all' },
          { status: 400 }
        )
    }

    return NextResponse.json({
      success: true,
      action,
      result,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error('Payout processing error:', error)
    return NextResponse.json(
      { error: 'Failed to process payouts' },
      { status: 500 }
    )
  }
}

// GET - Get payout processing status/stats (admin only)
export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    
    if (session?.user?.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 })
    }

    // Import dynamically to avoid issues
    const { getPayoutStats } = await import('@/lib/billing/payouts')
    const stats = await getPayoutStats()

    return NextResponse.json(stats)
  } catch (error) {
    console.error('Error fetching payout stats:', error)
    return NextResponse.json(
      { error: 'Failed to fetch stats' },
      { status: 500 }
    )
  }
}

