/**
 * Publisher Dashboard Hook
 * Fetches publisher profile, listings, and earnings data
 */

'use client'

import { useState, useEffect, useCallback } from 'react'

export type ListingType = 'AGENT' | 'WORKFLOW' | 'SWARM' | 'KNOWLEDGE_PACK' | 'TEMPLATE' | 'INTEGRATION'
export type ListingStatus = 'DRAFT' | 'PENDING' | 'ACTIVE' | 'PAUSED' | 'REJECTED' | 'ARCHIVED'
export type PricingModel = 'FREE' | 'PER_CALL' | 'SUBSCRIPTION' | 'ONE_TIME'
export type PayoutStatus = 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED'

export interface PublisherListing {
  id: string
  slug: string
  name: string
  type: ListingType
  status: ListingStatus
  pricingModel: PricingModel
  priceAmount?: number
  subscriptionMonthly?: number
  viewCount: number
  installCount: number
  totalRevenue: number
  avgRating?: number
  reviewCount: number
  publishedAt?: string
  createdAt: string
  updatedAt: string
}

export interface PublisherPayout {
  id: string
  grossAmount: number
  platformFee: number
  netAmount: number
  currency: string
  periodStart: string
  periodEnd: string
  status: PayoutStatus
  processedAt?: string
  createdAt: string
}

export interface Publisher {
  id: string
  userId: string
  ghostFlowOrgId?: string
  displayName: string
  slug: string
  bio?: string
  avatarUrl?: string
  websiteUrl?: string
  twitterHandle?: string
  githubHandle?: string
  verified: boolean
  verifiedAt?: string
  payoutMethod: string
  payoutAddress?: string
  totalListings: number
  totalInstalls: number
  totalRevenue: number
  avgRating?: number
  listings: PublisherListing[]
  payouts: PublisherPayout[]
  earnings: {
    total: number
    thisMonth: number
    lastMonth: number
  }
}

export interface UsePublisherResult {
  publisher: Publisher | null
  loading: boolean
  error: string | null
  needsSetup: boolean
  refetch: () => void
  createProfile: (data: CreatePublisherData) => Promise<boolean>
  updateProfile: (data: Partial<CreatePublisherData>) => Promise<boolean>
}

export interface CreatePublisherData {
  displayName: string
  slug: string
  bio?: string
  avatarUrl?: string
  websiteUrl?: string
  twitterHandle?: string
  githubHandle?: string
  ghostFlowOrgId?: string
  payoutMethod?: string
  payoutAddress?: string
}

// Use mock data if API is not available
const USE_MOCK_DATA = process.env.NEXT_PUBLIC_USE_MOCK_DATA === 'true'

export function usePublisher(): UsePublisherResult {
  const [publisher, setPublisher] = useState<Publisher | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [needsSetup, setNeedsSetup] = useState(false)

  const fetchPublisher = useCallback(async () => {
    if (USE_MOCK_DATA) {
      setLoading(false)
      return
    }

    setLoading(true)
    setError(null)
    setNeedsSetup(false)

    try {
      const response = await fetch('/api/publisher')
      
      if (!response.ok) {
        const data = await response.json()
        if (data.needsSetup) {
          setNeedsSetup(true)
          setPublisher(null)
          return
        }
        throw new Error(data.error || 'Failed to fetch publisher')
      }

      const result = await response.json()
      setPublisher(result.data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
      setPublisher(null)
    } finally {
      setLoading(false)
    }
  }, [])

  const createProfile = useCallback(async (data: CreatePublisherData): Promise<boolean> => {
    try {
      const response = await fetch('/api/publisher', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        const result = await response.json()
        throw new Error(result.error || 'Failed to create profile')
      }

      await fetchPublisher()
      return true
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create profile')
      return false
    }
  }, [fetchPublisher])

  const updateProfile = useCallback(async (data: Partial<CreatePublisherData>): Promise<boolean> => {
    try {
      const response = await fetch('/api/publisher', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        const result = await response.json()
        throw new Error(result.error || 'Failed to update profile')
      }

      await fetchPublisher()
      return true
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update profile')
      return false
    }
  }, [fetchPublisher])

  useEffect(() => {
    fetchPublisher()
  }, [fetchPublisher])

  return {
    publisher,
    loading,
    error,
    needsSetup,
    refetch: fetchPublisher,
    createProfile,
    updateProfile,
  }
}

// Hook for transactions
export interface Transaction {
  id: string
  listingId: string
  listing: {
    id: string
    slug: string
    name: string
    type: ListingType
  }
  amountCents: number
  currency: string
  status: string
  createdAt: string
}

export interface UseTransactionsResult {
  transactions: Transaction[]
  total: number
  loading: boolean
  error: string | null
  refetch: () => void
}

export function useTransactions(role: 'buyer' | 'publisher' = 'buyer'): UseTransactionsResult {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchTransactions = useCallback(async () => {
    if (USE_MOCK_DATA) {
      setLoading(false)
      return
    }

    setLoading(true)
    setError(null)

    try {
      const response = await fetch(`/api/x402?role=${role}`)
      
      if (!response.ok) {
        throw new Error('Failed to fetch transactions')
      }

      const result = await response.json()
      setTransactions(result.data || [])
      setTotal(result.pagination?.total || 0)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
      setTransactions([])
    } finally {
      setLoading(false)
    }
  }, [role])

  useEffect(() => {
    fetchTransactions()
  }, [fetchTransactions])

  return {
    transactions,
    total,
    loading,
    error,
    refetch: fetchTransactions,
  }
}

export default usePublisher

