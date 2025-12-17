/**
 * Analytics Tracking API
 * POST - Track an analytics event
 */

import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { trackEvent, trackListingView, trackListingInstall } from '@/lib/analytics/tracker'
import { AnalyticsEventType } from '@prisma/client'

// Event types that don't require authentication
const PUBLIC_EVENTS: AnalyticsEventType[] = [
  'LISTING_VIEW',
  'LISTING_SEARCH',
  'LISTING_CLICK',
]

export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    const body = await request.json()

    const {
      eventType,
      listingId,
      publisherId,
      metadata,
      sessionId,
    } = body

    // Validate event type
    if (!eventType || !Object.values(AnalyticsEventType).includes(eventType)) {
      return NextResponse.json(
        { error: 'Invalid event type' },
        { status: 400 }
      )
    }

    // Check if auth is required
    if (!PUBLIC_EVENTS.includes(eventType) && !session?.user?.id) {
      return NextResponse.json(
        { error: 'Authentication required for this event type' },
        { status: 401 }
      )
    }

    // Get context from request
    const userAgent = request.headers.get('user-agent') || undefined
    const referrer = request.headers.get('referer') || undefined
    
    // Get country from Vercel headers or other geo-ip service
    const country = request.headers.get('x-vercel-ip-country') || undefined

    // Track based on event type
    let eventId: string | null = null

    switch (eventType) {
      case 'LISTING_VIEW':
        if (listingId) {
          await trackListingView(listingId, session?.user?.id, {
            referrer,
            userAgent,
            sessionId,
          })
          eventId = 'tracked'
        }
        break

      case 'LISTING_INSTALL':
        if (listingId && session?.user?.id) {
          await trackListingInstall(listingId, session.user.id, {
            referrer,
            userAgent,
          })
          eventId = 'tracked'
        }
        break

      default:
        eventId = await trackEvent({
          eventType,
          listingId,
          publisherId,
          userId: session?.user?.id,
          metadata,
          referrer,
          userAgent,
          country,
          sessionId,
        })
    }

    return NextResponse.json({
      success: true,
      eventId,
    })
  } catch (error) {
    console.error('Failed to track event:', error)
    return NextResponse.json(
      { error: 'Failed to track event' },
      { status: 500 }
    )
  }
}

