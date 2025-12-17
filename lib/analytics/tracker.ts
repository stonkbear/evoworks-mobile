/**
 * Analytics Event Tracker
 * Track user interactions and system events
 */

import prisma from '@/lib/prisma'
import type { AnalyticsEventType } from '@prisma/client'

interface TrackEventParams {
  eventType: AnalyticsEventType
  listingId?: string
  publisherId?: string
  userId?: string
  metadata?: Record<string, any>
  referrer?: string
  userAgent?: string
  country?: string
  sessionId?: string
  revenueAmount?: number
  revenueCurrency?: string
}

/**
 * Track a single analytics event
 */
export async function trackEvent(params: TrackEventParams): Promise<string | null> {
  try {
    const event = await prisma.analyticsEvent.create({
      data: {
        eventType: params.eventType,
        listingId: params.listingId,
        publisherId: params.publisherId,
        userId: params.userId,
        metadata: params.metadata,
        referrer: params.referrer,
        userAgent: params.userAgent,
        country: params.country,
        sessionId: params.sessionId,
        revenueAmount: params.revenueAmount,
        revenueCurrency: params.revenueCurrency,
      },
    })
    return event.id
  } catch (error) {
    console.error('Failed to track event:', error)
    return null
  }
}

/**
 * Track listing view
 */
export async function trackListingView(
  listingId: string,
  userId?: string,
  context?: { referrer?: string; userAgent?: string; sessionId?: string }
): Promise<void> {
  // Track event
  await trackEvent({
    eventType: 'LISTING_VIEW',
    listingId,
    userId,
    ...context,
  })

  // Also get publisherId and track for them
  const listing = await prisma.marketplaceListing.findUnique({
    where: { id: listingId },
    select: { publisherId: true },
  })

  if (listing) {
    await trackEvent({
      eventType: 'LISTING_VIEW',
      publisherId: listing.publisherId,
      listingId,
      userId,
      ...context,
    })
  }

  // Increment view count
  await prisma.marketplaceListing.update({
    where: { id: listingId },
    data: { viewCount: { increment: 1 } },
  })
}

/**
 * Track listing install
 */
export async function trackListingInstall(
  listingId: string,
  userId: string,
  context?: { referrer?: string; userAgent?: string }
): Promise<void> {
  const listing = await prisma.marketplaceListing.findUnique({
    where: { id: listingId },
    select: { publisherId: true },
  })

  await trackEvent({
    eventType: 'LISTING_INSTALL',
    listingId,
    publisherId: listing?.publisherId,
    userId,
    ...context,
  })

  // Update stats
  await prisma.marketplaceListing.update({
    where: { id: listingId },
    data: { installCount: { increment: 1 } },
  })

  if (listing?.publisherId) {
    await prisma.publisher.update({
      where: { id: listing.publisherId },
      data: { totalInstalls: { increment: 1 } },
    })
  }
}

/**
 * Track transaction
 */
export async function trackTransaction(
  listingId: string,
  userId: string,
  amount: number,
  currency: string,
  status: 'started' | 'completed' | 'failed'
): Promise<void> {
  const eventType = status === 'started' 
    ? 'TRANSACTION_STARTED' 
    : status === 'completed' 
      ? 'TRANSACTION_COMPLETED' 
      : 'TRANSACTION_FAILED'

  const listing = await prisma.marketplaceListing.findUnique({
    where: { id: listingId },
    select: { publisherId: true },
  })

  await trackEvent({
    eventType,
    listingId,
    publisherId: listing?.publisherId,
    userId,
    revenueAmount: status === 'completed' ? amount : undefined,
    revenueCurrency: status === 'completed' ? currency : undefined,
    metadata: { amount, currency, status },
  })

  // Update revenue stats on completion
  if (status === 'completed' && listing?.publisherId) {
    await prisma.marketplaceListing.update({
      where: { id: listingId },
      data: { totalRevenue: { increment: amount } },
    })

    await prisma.publisher.update({
      where: { id: listing.publisherId },
      data: { totalRevenue: { increment: amount } },
    })
  }
}

/**
 * Track execution
 */
export async function trackExecution(
  listingId: string,
  userId: string,
  status: 'started' | 'completed' | 'failed',
  metadata?: { duration?: number; tokensUsed?: number; error?: string }
): Promise<void> {
  const eventType = status === 'started'
    ? 'EXECUTION_STARTED'
    : status === 'completed'
      ? 'EXECUTION_COMPLETED'
      : 'EXECUTION_FAILED'

  const listing = await prisma.marketplaceListing.findUnique({
    where: { id: listingId },
    select: { publisherId: true },
  })

  await trackEvent({
    eventType,
    listingId,
    publisherId: listing?.publisherId,
    userId,
    metadata,
  })
}

/**
 * Track user authentication events
 */
export async function trackAuth(
  userId: string,
  type: 'signup' | 'login'
): Promise<void> {
  await trackEvent({
    eventType: type === 'signup' ? 'USER_SIGNUP' : 'USER_LOGIN',
    userId,
  })
}

/**
 * Batch track multiple events (for bulk operations)
 */
export async function trackEventsBatch(events: TrackEventParams[]): Promise<number> {
  try {
    const result = await prisma.analyticsEvent.createMany({
      data: events.map(e => ({
        eventType: e.eventType,
        listingId: e.listingId,
        publisherId: e.publisherId,
        userId: e.userId,
        metadata: e.metadata,
        referrer: e.referrer,
        userAgent: e.userAgent,
        country: e.country,
        sessionId: e.sessionId,
        revenueAmount: e.revenueAmount,
        revenueCurrency: e.revenueCurrency,
      })),
    })
    return result.count
  } catch (error) {
    console.error('Failed to track events batch:', error)
    return 0
  }
}

