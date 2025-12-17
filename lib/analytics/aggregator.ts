/**
 * Analytics Aggregator
 * Aggregate events into daily stats for faster queries
 */

import prisma from '@/lib/prisma'

/**
 * Aggregate daily stats for a specific date
 * Should be run by a cron job at end of each day
 */
export async function aggregateDailyStats(date: Date = new Date()): Promise<{
  listingsProcessed: number
  publishersProcessed: number
  platformUpdated: boolean
}> {
  // Get start and end of day
  const startOfDay = new Date(date)
  startOfDay.setHours(0, 0, 0, 0)
  
  const endOfDay = new Date(date)
  endOfDay.setHours(23, 59, 59, 999)

  const dateOnly = new Date(startOfDay.toISOString().split('T')[0])

  let listingsProcessed = 0
  let publishersProcessed = 0

  // Get all listings with events for this day
  const listingEvents = await prisma.analyticsEvent.groupBy({
    by: ['listingId'],
    where: {
      timestamp: { gte: startOfDay, lte: endOfDay },
      listingId: { not: null },
    },
  })

  // Aggregate per listing
  for (const { listingId } of listingEvents) {
    if (!listingId) continue

    const [views, installs, uninstalls, executions, revenue] = await Promise.all([
      prisma.analyticsEvent.count({
        where: {
          listingId,
          eventType: 'LISTING_VIEW',
          timestamp: { gte: startOfDay, lte: endOfDay },
        },
      }),
      prisma.analyticsEvent.count({
        where: {
          listingId,
          eventType: 'LISTING_INSTALL',
          timestamp: { gte: startOfDay, lte: endOfDay },
        },
      }),
      prisma.analyticsEvent.count({
        where: {
          listingId,
          eventType: 'LISTING_UNINSTALL',
          timestamp: { gte: startOfDay, lte: endOfDay },
        },
      }),
      prisma.analyticsEvent.count({
        where: {
          listingId,
          eventType: 'EXECUTION_COMPLETED',
          timestamp: { gte: startOfDay, lte: endOfDay },
        },
      }),
      prisma.analyticsEvent.aggregate({
        where: {
          listingId,
          eventType: 'TRANSACTION_COMPLETED',
          timestamp: { gte: startOfDay, lte: endOfDay },
        },
        _sum: { revenueAmount: true },
      }),
    ])

    // Unique views (by session or user)
    const uniqueViews = await prisma.analyticsEvent.groupBy({
      by: ['sessionId', 'userId'],
      where: {
        listingId,
        eventType: 'LISTING_VIEW',
        timestamp: { gte: startOfDay, lte: endOfDay },
      },
    })

    await prisma.dailyStats.upsert({
      where: { date_listingId: { date: dateOnly, listingId } },
      create: {
        date: dateOnly,
        listingId,
        views,
        uniqueViews: uniqueViews.length,
        installs,
        uninstalls,
        executions,
        revenue: revenue._sum.revenueAmount || 0,
      },
      update: {
        views,
        uniqueViews: uniqueViews.length,
        installs,
        uninstalls,
        executions,
        revenue: revenue._sum.revenueAmount || 0,
      },
    })

    listingsProcessed++
  }

  // Get all publishers with events for this day
  const publisherEvents = await prisma.analyticsEvent.groupBy({
    by: ['publisherId'],
    where: {
      timestamp: { gte: startOfDay, lte: endOfDay },
      publisherId: { not: null },
    },
  })

  // Aggregate per publisher
  for (const { publisherId } of publisherEvents) {
    if (!publisherId) continue

    const [views, installs, executions, revenue] = await Promise.all([
      prisma.analyticsEvent.count({
        where: {
          publisherId,
          eventType: 'LISTING_VIEW',
          timestamp: { gte: startOfDay, lte: endOfDay },
        },
      }),
      prisma.analyticsEvent.count({
        where: {
          publisherId,
          eventType: 'LISTING_INSTALL',
          timestamp: { gte: startOfDay, lte: endOfDay },
        },
      }),
      prisma.analyticsEvent.count({
        where: {
          publisherId,
          eventType: 'EXECUTION_COMPLETED',
          timestamp: { gte: startOfDay, lte: endOfDay },
        },
      }),
      prisma.analyticsEvent.aggregate({
        where: {
          publisherId,
          eventType: 'TRANSACTION_COMPLETED',
          timestamp: { gte: startOfDay, lte: endOfDay },
        },
        _sum: { revenueAmount: true },
      }),
    ])

    await prisma.dailyStats.upsert({
      where: { date_publisherId: { date: dateOnly, publisherId } },
      create: {
        date: dateOnly,
        publisherId,
        views,
        installs,
        executions,
        revenue: revenue._sum.revenueAmount || 0,
      },
      update: {
        views,
        installs,
        executions,
        revenue: revenue._sum.revenueAmount || 0,
      },
    })

    publishersProcessed++
  }

  // Platform-wide stats
  const [
    totalUsers,
    newUsers,
    activeUsers,
    totalListings,
    newListings,
    activeListings,
    totalTransactions,
    totalRevenue,
    totalViews,
    totalInstalls,
    totalExecutions,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.user.count({
      where: { createdAt: { gte: startOfDay, lte: endOfDay } },
    }),
    prisma.analyticsEvent.groupBy({
      by: ['userId'],
      where: {
        timestamp: { gte: startOfDay, lte: endOfDay },
        userId: { not: null },
      },
    }).then(r => r.length),
    prisma.marketplaceListing.count({ where: { status: 'ACTIVE' } }),
    prisma.marketplaceListing.count({
      where: { publishedAt: { gte: startOfDay, lte: endOfDay } },
    }),
    prisma.marketplaceListing.count({
      where: {
        status: 'ACTIVE',
        analyticsEvents: {
          some: { timestamp: { gte: startOfDay, lte: endOfDay } },
        },
      },
    }),
    prisma.analyticsEvent.count({
      where: {
        eventType: 'TRANSACTION_COMPLETED',
        timestamp: { gte: startOfDay, lte: endOfDay },
      },
    }),
    prisma.analyticsEvent.aggregate({
      where: {
        eventType: 'TRANSACTION_COMPLETED',
        timestamp: { gte: startOfDay, lte: endOfDay },
      },
      _sum: { revenueAmount: true },
    }),
    prisma.analyticsEvent.count({
      where: {
        eventType: 'LISTING_VIEW',
        timestamp: { gte: startOfDay, lte: endOfDay },
      },
    }),
    prisma.analyticsEvent.count({
      where: {
        eventType: 'LISTING_INSTALL',
        timestamp: { gte: startOfDay, lte: endOfDay },
      },
    }),
    prisma.analyticsEvent.count({
      where: {
        eventType: 'EXECUTION_COMPLETED',
        timestamp: { gte: startOfDay, lte: endOfDay },
      },
    }),
  ])

  await prisma.platformDailyStats.upsert({
    where: { date: dateOnly },
    create: {
      date: dateOnly,
      totalUsers,
      newUsers,
      activeUsers,
      totalListings,
      newListings,
      activeListings,
      totalTransactions,
      totalRevenue: totalRevenue._sum.revenueAmount || 0,
      avgTransactionValue: totalTransactions > 0
        ? (totalRevenue._sum.revenueAmount || 0) / totalTransactions
        : 0,
      totalViews,
      totalInstalls,
      totalExecutions,
    },
    update: {
      totalUsers,
      newUsers,
      activeUsers,
      totalListings,
      newListings,
      activeListings,
      totalTransactions,
      totalRevenue: totalRevenue._sum.revenueAmount || 0,
      avgTransactionValue: totalTransactions > 0
        ? (totalRevenue._sum.revenueAmount || 0) / totalTransactions
        : 0,
      totalViews,
      totalInstalls,
      totalExecutions,
    },
  })

  return {
    listingsProcessed,
    publishersProcessed,
    platformUpdated: true,
  }
}

/**
 * Get analytics summary for a listing
 */
export async function getListingAnalytics(
  listingId: string,
  days: number = 30
): Promise<{
  totals: {
    views: number
    uniqueViews: number
    installs: number
    executions: number
    revenue: number
  }
  dailyData: Array<{
    date: string
    views: number
    installs: number
    revenue: number
  }>
  trends: {
    viewsTrend: number
    installsTrend: number
    revenueTrend: number
  }
}> {
  const endDate = new Date()
  const startDate = new Date()
  startDate.setDate(startDate.getDate() - days)

  const dailyStats = await prisma.dailyStats.findMany({
    where: {
      listingId,
      date: { gte: startDate, lte: endDate },
    },
    orderBy: { date: 'asc' },
  })

  // Calculate totals
  const totals = dailyStats.reduce(
    (acc, stat) => ({
      views: acc.views + stat.views,
      uniqueViews: acc.uniqueViews + stat.uniqueViews,
      installs: acc.installs + stat.installs,
      executions: acc.executions + stat.executions,
      revenue: acc.revenue + stat.revenue,
    }),
    { views: 0, uniqueViews: 0, installs: 0, executions: 0, revenue: 0 }
  )

  // Format daily data
  const dailyData = dailyStats.map(stat => ({
    date: stat.date.toISOString().split('T')[0],
    views: stat.views,
    installs: stat.installs,
    revenue: stat.revenue,
  }))

  // Calculate trends (compare last 7 days vs previous 7 days)
  const midPoint = Math.floor(dailyStats.length / 2)
  const recentStats = dailyStats.slice(midPoint)
  const previousStats = dailyStats.slice(0, midPoint)

  const recentViews = recentStats.reduce((sum, s) => sum + s.views, 0)
  const previousViews = previousStats.reduce((sum, s) => sum + s.views, 0)
  const viewsTrend = previousViews > 0 
    ? ((recentViews - previousViews) / previousViews) * 100 
    : 0

  const recentInstalls = recentStats.reduce((sum, s) => sum + s.installs, 0)
  const previousInstalls = previousStats.reduce((sum, s) => sum + s.installs, 0)
  const installsTrend = previousInstalls > 0 
    ? ((recentInstalls - previousInstalls) / previousInstalls) * 100 
    : 0

  const recentRevenue = recentStats.reduce((sum, s) => sum + s.revenue, 0)
  const previousRevenue = previousStats.reduce((sum, s) => sum + s.revenue, 0)
  const revenueTrend = previousRevenue > 0 
    ? ((recentRevenue - previousRevenue) / previousRevenue) * 100 
    : 0

  return {
    totals,
    dailyData,
    trends: { viewsTrend, installsTrend, revenueTrend },
  }
}

/**
 * Get analytics summary for a publisher
 */
export async function getPublisherAnalytics(
  publisherId: string,
  days: number = 30
): Promise<{
  totals: {
    views: number
    installs: number
    executions: number
    revenue: number
  }
  dailyData: Array<{
    date: string
    views: number
    installs: number
    revenue: number
  }>
  topListings: Array<{
    listingId: string
    name: string
    views: number
    installs: number
    revenue: number
  }>
}> {
  const endDate = new Date()
  const startDate = new Date()
  startDate.setDate(startDate.getDate() - days)

  const dailyStats = await prisma.dailyStats.findMany({
    where: {
      publisherId,
      date: { gte: startDate, lte: endDate },
    },
    orderBy: { date: 'asc' },
  })

  const totals = dailyStats.reduce(
    (acc, stat) => ({
      views: acc.views + stat.views,
      installs: acc.installs + stat.installs,
      executions: acc.executions + stat.executions,
      revenue: acc.revenue + stat.revenue,
    }),
    { views: 0, installs: 0, executions: 0, revenue: 0 }
  )

  const dailyData = dailyStats.map(stat => ({
    date: stat.date.toISOString().split('T')[0],
    views: stat.views,
    installs: stat.installs,
    revenue: stat.revenue,
  }))

  // Get top performing listings
  const topListings = await prisma.dailyStats.groupBy({
    by: ['listingId'],
    where: {
      listing: { publisherId },
      date: { gte: startDate, lte: endDate },
      listingId: { not: null },
    },
    _sum: {
      views: true,
      installs: true,
      revenue: true,
    },
    orderBy: { _sum: { revenue: 'desc' } },
    take: 5,
  })

  // Get listing names
  const listingIds = topListings.map(l => l.listingId).filter(Boolean) as string[]
  const listings = await prisma.marketplaceListing.findMany({
    where: { id: { in: listingIds } },
    select: { id: true, name: true },
  })
  const listingMap = new Map(listings.map(l => [l.id, l.name]))

  return {
    totals,
    dailyData,
    topListings: topListings.map(l => ({
      listingId: l.listingId!,
      name: listingMap.get(l.listingId!) || 'Unknown',
      views: l._sum.views || 0,
      installs: l._sum.installs || 0,
      revenue: l._sum.revenue || 0,
    })),
  }
}

/**
 * Get platform-wide analytics (admin only)
 */
export async function getPlatformAnalytics(days: number = 30) {
  const endDate = new Date()
  const startDate = new Date()
  startDate.setDate(startDate.getDate() - days)

  const dailyStats = await prisma.platformDailyStats.findMany({
    where: {
      date: { gte: startDate, lte: endDate },
    },
    orderBy: { date: 'asc' },
  })

  const latest = dailyStats[dailyStats.length - 1]
  const previous = dailyStats[dailyStats.length - 8] // Week ago

  return {
    current: latest ? {
      totalUsers: latest.totalUsers,
      activeUsers: latest.activeUsers,
      totalListings: latest.totalListings,
      totalRevenue: latest.totalRevenue,
    } : null,
    trends: previous && latest ? {
      userGrowth: ((latest.totalUsers - previous.totalUsers) / previous.totalUsers) * 100,
      activeUserGrowth: ((latest.activeUsers - previous.activeUsers) / (previous.activeUsers || 1)) * 100,
      listingGrowth: ((latest.totalListings - previous.totalListings) / (previous.totalListings || 1)) * 100,
      revenueGrowth: ((latest.totalRevenue - previous.totalRevenue) / (previous.totalRevenue || 1)) * 100,
    } : null,
    dailyData: dailyStats.map(s => ({
      date: s.date.toISOString().split('T')[0],
      users: s.totalUsers,
      activeUsers: s.activeUsers,
      revenue: s.totalRevenue,
      views: s.totalViews,
      installs: s.totalInstalls,
    })),
    totals: dailyStats.reduce(
      (acc, s) => ({
        newUsers: acc.newUsers + s.newUsers,
        revenue: acc.revenue + s.totalRevenue,
        transactions: acc.transactions + s.totalTransactions,
        views: acc.views + s.totalViews,
        installs: acc.installs + s.totalInstalls,
      }),
      { newUsers: 0, revenue: 0, transactions: 0, views: 0, installs: 0 }
    ),
  }
}

