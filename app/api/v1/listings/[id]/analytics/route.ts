/**
 * V1 Listing Analytics API
 * Get analytics for a specific listing
 */

import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import jwt from 'jsonwebtoken'

async function verifyOAuthToken(request: NextRequest) {
  const authHeader = request.headers.get('authorization')
  if (!authHeader?.startsWith('Bearer ')) {
    return null
  }

  const token = authHeader.slice(7)
  
  try {
    const decoded = jwt.verify(token, process.env.NEXTAUTH_SECRET || 'secret') as {
      sub: string
      client_id: string
      scope: string
    }
    return decoded
  } catch {
    return null
  }
}

/**
 * GET /api/v1/listings/:id/analytics
 * Get analytics for a listing
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await verifyOAuthToken(request)
    if (!auth) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    if (!auth.scope.includes('read:analytics')) {
      return NextResponse.json({ error: 'Insufficient scope' }, { status: 403 })
    }

    const { id } = await params
    const { searchParams } = new URL(request.url)
    const period = searchParams.get('period') || '30d'

    // Calculate date range
    const now = new Date()
    let startDate: Date
    switch (period) {
      case '7d':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
        break
      case '30d':
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
        break
      case '90d':
        startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000)
        break
      default:
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
    }

    // Find the listing
    const listing = await prisma.marketplaceListing.findFirst({
      where: {
        OR: [
          { id },
          { slug: id },
          { ghostFlowId: id },
        ],
      },
      include: {
        publisher: true,
      },
    })

    if (!listing) {
      return NextResponse.json({ error: 'Listing not found' }, { status: 404 })
    }

    // Verify ownership
    if (listing.publisher.userId !== auth.sub) {
      return NextResponse.json({ error: 'Not authorized to view analytics' }, { status: 403 })
    }

    // Get transactions for revenue data
    const transactions = await prisma.x402Transaction.findMany({
      where: {
        listingId: listing.id,
        status: 'COMPLETED',
        completedAt: { gte: startDate },
      },
      select: {
        amount: true,
        completedAt: true,
      },
    })

    // Get daily stats if available
    const dailyStats = await prisma.dailyStats.findMany({
      where: {
        entityId: listing.id,
        type: 'LISTING',
        date: { gte: startDate },
      },
      orderBy: { date: 'asc' },
    })

    // Calculate totals
    const totalRevenue = transactions.reduce((sum, t) => sum + t.amount, 0)
    const totalTransactions = transactions.length

    // Group by day for chart data
    const dailyData: Record<string, { views: number; installs: number; revenue: number }> = {}
    
    for (const stat of dailyStats) {
      const dateKey = stat.date.toISOString().split('T')[0]
      dailyData[dateKey] = {
        views: stat.views,
        installs: stat.installs,
        revenue: stat.revenue,
      }
    }

    // Add transaction data
    for (const tx of transactions) {
      if (tx.completedAt) {
        const dateKey = tx.completedAt.toISOString().split('T')[0]
        if (!dailyData[dateKey]) {
          dailyData[dateKey] = { views: 0, installs: 0, revenue: 0 }
        }
        dailyData[dateKey].revenue += tx.amount
      }
    }

    return NextResponse.json({
      listingId: listing.id,
      ghostFlowId: listing.ghostFlowId,
      period: {
        start: startDate.toISOString(),
        end: now.toISOString(),
      },
      totals: {
        views: listing.viewCount,
        installs: listing.installCount,
        revenue: listing.totalRevenue,
        rating: listing.avgRating,
        reviews: listing.reviewCount,
      },
      periodTotals: {
        revenue: totalRevenue,
        transactions: totalTransactions,
      },
      dailyData: Object.entries(dailyData)
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([date, data]) => ({
          date,
          ...data,
        })),
    })
  } catch (error) {
    console.error('Get analytics error:', error)
    return NextResponse.json({ error: 'Failed to fetch analytics' }, { status: 500 })
  }
}

