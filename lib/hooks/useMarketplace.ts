/**
 * Marketplace Data Hook
 * Fetches listings from the API with filtering, sorting, and pagination
 */

'use client'

import { useState, useEffect, useCallback } from 'react'

// Types matching our Prisma schema
export type ListingType = 'AGENT' | 'WORKFLOW' | 'SWARM' | 'KNOWLEDGE_PACK' | 'TEMPLATE' | 'INTEGRATION'
export type PricingModel = 'FREE' | 'PER_CALL' | 'SUBSCRIPTION' | 'ONE_TIME'
export type VerificationLevel = 'NONE' | 'BASIC' | 'VERIFIED' | 'PARTNER'

export interface Publisher {
  id: string
  displayName: string
  slug: string
  avatarUrl?: string
  verified: boolean
}

export interface Listing {
  id: string
  slug: string
  name: string
  shortDescription: string
  type: ListingType
  category: string
  tags: string[]
  pricingModel: PricingModel
  priceAmount?: number
  subscriptionMonthly?: number
  coverImageUrl?: string
  supportedModels: string[]
  availableTools: string[]
  verificationLevel: VerificationLevel
  stats: {
    views: number
    installs: number
    rating?: number
    reviews: number
  }
  publisher: Publisher
  publishedAt?: string
}

export interface MarketplaceFilters {
  type?: ListingType | null
  category?: string | null
  search?: string
  pricing?: PricingModel | null
  verified?: boolean
  sort?: 'popular' | 'rating' | 'newest' | 'price-low' | 'price-high'
  page?: number
  limit?: number
}

export interface UseMarketplaceResult {
  listings: Listing[]
  total: number
  totalPages: number
  page: number
  loading: boolean
  error: string | null
  filters: MarketplaceFilters
  setFilters: (filters: Partial<MarketplaceFilters>) => void
  refetch: () => void
}

// Use mock data if API is not available
const USE_MOCK_DATA = process.env.NEXT_PUBLIC_USE_MOCK_DATA === 'true'

export function useMarketplace(initialFilters?: MarketplaceFilters): UseMarketplaceResult {
  const [listings, setListings] = useState<Listing[]>([])
  const [total, setTotal] = useState(0)
  const [totalPages, setTotalPages] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [filters, setFiltersState] = useState<MarketplaceFilters>({
    sort: 'popular',
    page: 1,
    limit: 20,
    ...initialFilters,
  })

  const setFilters = useCallback((newFilters: Partial<MarketplaceFilters>) => {
    setFiltersState((prev) => ({
      ...prev,
      ...newFilters,
      // Reset page when filters change (except when changing page)
      page: 'page' in newFilters ? newFilters.page : 1,
    }))
  }, [])

  const fetchListings = useCallback(async () => {
    if (USE_MOCK_DATA) {
      // Mock data mode - don't fetch from API
      setLoading(false)
      return
    }

    setLoading(true)
    setError(null)

    try {
      const params = new URLSearchParams()
      
      if (filters.type) params.set('type', filters.type)
      if (filters.category && filters.category !== 'all') params.set('category', filters.category)
      if (filters.search) params.set('search', filters.search)
      if (filters.pricing) params.set('pricing', filters.pricing)
      if (filters.verified) params.set('verified', 'true')
      if (filters.sort) params.set('sort', filters.sort)
      if (filters.page) params.set('page', filters.page.toString())
      if (filters.limit) params.set('limit', filters.limit.toString())

      const response = await fetch(`/api/marketplace/listings?${params}`)
      
      if (!response.ok) {
        throw new Error('Failed to fetch listings')
      }

      const result = await response.json()
      
      setListings(result.data || [])
      setTotal(result.pagination?.total || 0)
      setTotalPages(result.pagination?.totalPages || 0)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
      setListings([])
    } finally {
      setLoading(false)
    }
  }, [filters])

  useEffect(() => {
    fetchListings()
  }, [fetchListings])

  return {
    listings,
    total,
    totalPages,
    page: filters.page || 1,
    loading,
    error,
    filters,
    setFilters,
    refetch: fetchListings,
  }
}

// Hook for single listing
export interface UseListingResult {
  listing: Listing | null
  loading: boolean
  error: string | null
  refetch: () => void
}

export function useListing(slug: string): UseListingResult {
  const [listing, setListing] = useState<Listing | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchListing = useCallback(async () => {
    if (!slug || USE_MOCK_DATA) {
      setLoading(false)
      return
    }

    setLoading(true)
    setError(null)

    try {
      const response = await fetch(`/api/marketplace/listings/${slug}`)
      
      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('Listing not found')
        }
        throw new Error('Failed to fetch listing')
      }

      const result = await response.json()
      setListing(result.data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
      setListing(null)
    } finally {
      setLoading(false)
    }
  }, [slug])

  useEffect(() => {
    fetchListing()
  }, [fetchListing])

  return {
    listing,
    loading,
    error,
    refetch: fetchListing,
  }
}

export default useMarketplace

