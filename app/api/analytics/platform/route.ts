/**
 * Platform Analytics API (Admin Only)
 * GET - Get platform-wide analytics
 */

import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { getPlatformAnalytics } from '@/lib/analytics/aggregator'
import prisma from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    
    // Admin only
    if (!session?.user?.id || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 })
    }

    // Get query params
    const { searchParams } = new URL(request.url)
    const days = parseInt(searchParams.get('days') || '30')

    // Get analytics
    const analytics = await getPlatformAnalytics(days)

    // Get real-time counts
    const [
      totalUsers,
      totalPublishers,
      totalListings,
      activeListings,
      pendingListings,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.publisher.count(),
      prisma.marketplaceListing.count(),
      prisma.marketplaceListing.count({ where: { status: 'ACTIVE' } }),
      prisma.marketplaceListing.count({ where: { status: 'PENDING' } }),
    ])

    // Get top performers
    const topPublishers = await prisma.publisher.findMany({
      select: {
        id: true,
        displayName: true,
        slug: true,
        totalRevenue: true,
        totalInstalls: true,
        totalListings: true,
      },
      orderBy: { totalRevenue: 'desc' },
      take: 10,
    })

    const topListings = await prisma.marketplaceListing.findMany({
      select: {
        id: true,
        name: true,
        slug: true,
        type: true,
        totalRevenue: true,
        installCount: true,
        viewCount: true,
        publisher: {
          select: { displayName: true },
        },
      },
      orderBy: { totalRevenue: 'desc' },
      take: 10,
    })

    // Revenue breakdown by listing type
    const revenueByType = await prisma.marketplaceListing.groupBy({
      by: ['type'],
      _sum: { totalRevenue: true },
      _count: true,
    })

    return NextResponse.json({
      realtime: {
        totalUsers,
        totalPublishers,
        totalListings,
        activeListings,
        pendingListings,
      },
      analytics,
      topPublishers,
      topListings,
      revenueByType: revenueByType.map(r => ({
        type: r.type,
        revenue: r._sum.totalRevenue || 0,
        count: r._count,
      })),
    })
  } catch (error) {
    console.error('Failed to get platform analytics:', error)
    return NextResponse.json(
      { error: 'Failed to get analytics' },
      { status: 500 }
    )
  }
}

