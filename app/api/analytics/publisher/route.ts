/**
 * Publisher Analytics API
 * GET - Get analytics for the authenticated publisher
 */

import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import prisma from '@/lib/prisma'
import { getPublisherAnalytics } from '@/lib/analytics/aggregator'

export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get publisher for user
    const publisher = await prisma.publisher.findUnique({
      where: { userId: session.user.id },
    })

    if (!publisher) {
      return NextResponse.json({ error: 'Publisher not found' }, { status: 404 })
    }

    // Get query params
    const { searchParams } = new URL(request.url)
    const days = parseInt(searchParams.get('days') || '30')

    // Get analytics
    const analytics = await getPublisherAnalytics(publisher.id, days)

    // Get current stats
    const currentStats = {
      totalListings: publisher.totalListings,
      totalInstalls: publisher.totalInstalls,
      totalRevenue: publisher.totalRevenue,
      avgRating: publisher.avgRating,
    }

    // Get listing breakdown
    const listings = await prisma.marketplaceListing.findMany({
      where: { publisherId: publisher.id },
      select: {
        id: true,
        name: true,
        slug: true,
        type: true,
        status: true,
        viewCount: true,
        installCount: true,
        totalRevenue: true,
        avgRating: true,
      },
      orderBy: { totalRevenue: 'desc' },
    })

    return NextResponse.json({
      publisher: {
        id: publisher.id,
        displayName: publisher.displayName,
        slug: publisher.slug,
      },
      currentStats,
      analytics,
      listings,
    })
  } catch (error) {
    console.error('Failed to get publisher analytics:', error)
    return NextResponse.json(
      { error: 'Failed to get analytics' },
      { status: 500 }
    )
  }
}

