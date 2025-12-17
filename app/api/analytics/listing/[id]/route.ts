/**
 * Listing Analytics API
 * GET - Get analytics for a specific listing
 */

import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import prisma from '@/lib/prisma'
import { getListingAnalytics } from '@/lib/analytics/aggregator'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get the listing and verify ownership
    const listing = await prisma.marketplaceListing.findUnique({
      where: { id: params.id },
      include: {
        publisher: {
          select: { userId: true },
        },
      },
    })

    if (!listing) {
      return NextResponse.json({ error: 'Listing not found' }, { status: 404 })
    }

    // Check authorization (owner or admin)
    const isOwner = listing.publisher.userId === session.user.id
    const isAdmin = session.user.role === 'ADMIN'

    if (!isOwner && !isAdmin) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Get query params
    const { searchParams } = new URL(request.url)
    const days = parseInt(searchParams.get('days') || '30')

    // Get analytics
    const analytics = await getListingAnalytics(params.id, days)

    // Get real-time stats from the listing
    const currentStats = {
      viewCount: listing.viewCount,
      installCount: listing.installCount,
      totalRevenue: listing.totalRevenue,
      avgRating: listing.avgRating,
      reviewCount: listing.reviewCount,
    }

    return NextResponse.json({
      listing: {
        id: listing.id,
        name: listing.name,
        slug: listing.slug,
      },
      currentStats,
      analytics,
    })
  } catch (error) {
    console.error('Failed to get listing analytics:', error)
    return NextResponse.json(
      { error: 'Failed to get analytics' },
      { status: 500 }
    )
  }
}

