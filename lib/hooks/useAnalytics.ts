'use client'

/**
 * Analytics Hook
 * Track events and fetch analytics data
 */

import { useState, useEffect, useCallback, useRef } from 'react'

// Types
export interface DailyDataPoint {
  date: string
  views: number
  installs: number
  revenue: number
}

export interface ListingAnalytics {
  listing: {
    id: string
    name: string
    slug: string
  }
  currentStats: {
    viewCount: number
    installCount: number
    totalRevenue: number
    avgRating: number | null
    reviewCount: number
  }
  analytics: {
    totals: {
      views: number
      uniqueViews: number
      installs: number
      executions: number
      revenue: number
    }
    dailyData: DailyDataPoint[]
    trends: {
      viewsTrend: number
      installsTrend: number
      revenueTrend: number
    }
  }
}

export interface PublisherAnalytics {
  publisher: {
    id: string
    displayName: string
    slug: string
  }
  currentStats: {
    totalListings: number
    totalInstalls: number
    totalRevenue: number
    avgRating: number | null
  }
  analytics: {
    totals: {
      views: number
      installs: number
      executions: number
      revenue: number
    }
    dailyData: DailyDataPoint[]
    topListings: Array<{
      listingId: string
      name: string
      views: number
      installs: number
      revenue: number
    }>
  }
  listings: Array<{
    id: string
    name: string
    slug: string
    type: string
    status: string
    viewCount: number
    installCount: number
    totalRevenue: number
    avgRating: number | null
  }>
}

// Generate session ID for anonymous tracking
function getSessionId(): string {
  if (typeof window === 'undefined') return ''
  
  let sessionId = sessionStorage.getItem('evoworks_session')
  if (!sessionId) {
    sessionId = `sess_${Date.now()}_${Math.random().toString(36).slice(2)}`
    sessionStorage.setItem('evoworks_session', sessionId)
  }
  return sessionId
}

/**
 * Track an analytics event
 */
export async function trackEvent(
  eventType: string,
  data?: {
    listingId?: string
    publisherId?: string
    metadata?: Record<string, any>
  }
): Promise<boolean> {
  try {
    const response = await fetch('/api/analytics/track', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        eventType,
        sessionId: getSessionId(),
        ...data,
      }),
    })
    return response.ok
  } catch (error) {
    console.error('Failed to track event:', error)
    return false
  }
}

/**
 * Hook for tracking listing views
 */
export function useListingView(listingId: string | null) {
  const trackedRef = useRef(false)

  useEffect(() => {
    if (listingId && !trackedRef.current) {
      trackedRef.current = true
      trackEvent('LISTING_VIEW', { listingId })
    }
  }, [listingId])
}

/**
 * Hook for fetching listing analytics
 */
export function useListingAnalytics(listingId: string | null, days: number = 30) {
  const [data, setData] = useState<ListingAnalytics | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchAnalytics = useCallback(async () => {
    if (!listingId) return

    setLoading(true)
    setError(null)

    try {
      const response = await fetch(`/api/analytics/listing/${listingId}?days=${days}`)
      
      if (!response.ok) {
        throw new Error('Failed to fetch analytics')
      }

      const result = await response.json()
      setData(result)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch analytics')
    } finally {
      setLoading(false)
    }
  }, [listingId, days])

  useEffect(() => {
    fetchAnalytics()
  }, [fetchAnalytics])

  return { data, loading, error, refetch: fetchAnalytics }
}

/**
 * Hook for fetching publisher analytics
 */
export function usePublisherAnalytics(days: number = 30) {
  const [data, setData] = useState<PublisherAnalytics | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchAnalytics = useCallback(async () => {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch(`/api/analytics/publisher?days=${days}`)
      
      if (!response.ok) {
        throw new Error('Failed to fetch analytics')
      }

      const result = await response.json()
      setData(result)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch analytics')
    } finally {
      setLoading(false)
    }
  }, [days])

  useEffect(() => {
    fetchAnalytics()
  }, [fetchAnalytics])

  return { data, loading, error, refetch: fetchAnalytics }
}

/**
 * Hook for fetching platform analytics (admin)
 */
export function usePlatformAnalytics(days: number = 30) {
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchAnalytics = useCallback(async () => {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch(`/api/analytics/platform?days=${days}`)
      
      if (!response.ok) {
        throw new Error('Failed to fetch analytics')
      }

      const result = await response.json()
      setData(result)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch analytics')
    } finally {
      setLoading(false)
    }
  }, [days])

  useEffect(() => {
    fetchAnalytics()
  }, [fetchAnalytics])

  return { data, loading, error, refetch: fetchAnalytics }
}

export default {
  trackEvent,
  useListingView,
  useListingAnalytics,
  usePublisherAnalytics,
  usePlatformAnalytics,
}

