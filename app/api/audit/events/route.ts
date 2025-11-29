/**
 * GET /api/audit/events - Search audit events
 */

import { NextRequest, NextResponse } from 'next/server'
import { searchAuditEvents, getAuditStats } from '@/lib/observability/audit'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    
    const eventType = searchParams.get('eventType') || undefined
    const startDate = searchParams.get('startDate')
      ? new Date(searchParams.get('startDate')!)
      : undefined
    const endDate = searchParams.get('endDate')
      ? new Date(searchParams.get('endDate')!)
      : undefined
    const limit = parseInt(searchParams.get('limit') || '100')
    const stats = searchParams.get('stats') === 'true'

    if (stats) {
      const period = (searchParams.get('period') as any) || '7d'
      const statistics = await getAuditStats(period)
      
      return NextResponse.json({
        success: true,
        stats: statistics,
      })
    }

    const events = await searchAuditEvents(
      eventType,
      startDate,
      endDate,
      limit
    )

    return NextResponse.json({
      success: true,
      events,
      count: events.length,
    })
  } catch (error) {
    console.error('Error searching audit events:', error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to search events',
      },
      { status: 500 }
    )
  }
}

