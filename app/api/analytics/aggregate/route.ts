/**
 * Analytics Aggregation API
 * POST - Trigger daily stats aggregation (called by cron)
 */

import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { aggregateDailyStats } from '@/lib/analytics/aggregator'

export async function POST(request: NextRequest) {
  try {
    // Check authorization (admin or cron secret)
    const session = await auth()
    const cronSecret = request.headers.get('x-cron-secret')
    const expectedSecret = process.env.CRON_SECRET

    const isAdmin = session?.user?.role === 'ADMIN'
    const isValidCron = cronSecret && expectedSecret && cronSecret === expectedSecret

    if (!isAdmin && !isValidCron) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get date from body or use today
    const body = await request.json().catch(() => ({}))
    const dateStr = body.date
    const date = dateStr ? new Date(dateStr) : new Date()

    // Validate date
    if (isNaN(date.getTime())) {
      return NextResponse.json({ error: 'Invalid date' }, { status: 400 })
    }

    // Run aggregation
    const result = await aggregateDailyStats(date)

    return NextResponse.json({
      success: true,
      date: date.toISOString().split('T')[0],
      ...result,
    })
  } catch (error) {
    console.error('Failed to aggregate stats:', error)
    return NextResponse.json(
      { error: 'Failed to aggregate stats' },
      { status: 500 }
    )
  }
}

// GET - Check aggregation status
export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    
    if (!session?.user?.id || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 })
    }

    // Get recent aggregation info
    const { default: prisma } = await import('@/lib/prisma')
    
    const lastPlatformStats = await prisma.platformDailyStats.findFirst({
      orderBy: { date: 'desc' },
    })

    const statsCount = await prisma.dailyStats.count()
    const eventsCount = await prisma.analyticsEvent.count()

    return NextResponse.json({
      lastAggregation: lastPlatformStats?.date || null,
      totalDailyStats: statsCount,
      totalEvents: eventsCount,
    })
  } catch (error) {
    console.error('Failed to get aggregation status:', error)
    return NextResponse.json(
      { error: 'Failed to get status' },
      { status: 500 }
    )
  }
}

