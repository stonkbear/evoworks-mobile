'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

const TYPE_COLORS: Record<string, string> = {
  AGENT: 'from-violet-500 to-purple-500',
  WORKFLOW: 'from-cyan-500 to-blue-500',
  SWARM: 'from-amber-500 to-orange-500',
  KNOWLEDGE_PACK: 'from-emerald-500 to-teal-500',
  TEMPLATE: 'from-pink-500 to-rose-500',
  INTEGRATION: 'from-indigo-500 to-blue-500',
}

const TYPE_ICONS: Record<string, string> = {
  AGENT: '🤖',
  WORKFLOW: '⚡',
  SWARM: '🐝',
  KNOWLEDGE_PACK: '📚',
  TEMPLATE: '📋',
  INTEGRATION: '🔌',
}

interface Listing {
  id: string
  slug: string
  name: string
  shortDescription: string
  type: string
  pricingModel: string
  priceAmount: number | null
  avgRating: number | null
  installCount: number
  publisher: {
    displayName: string
    verified: boolean
  }
}

interface SimilarListingsProps {
  listingId?: string
  listingSlug?: string
  title?: string
  limit?: number
}

export function SimilarListings({
  listingId,
  listingSlug,
  title = 'Similar Listings',
  limit = 4,
}: SimilarListingsProps) {
  const [listings, setListings] = useState<Listing[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchSimilar = async () => {
      setIsLoading(true)
      try {
        const params = new URLSearchParams({ type: 'similar', limit: limit.toString() })
        if (listingId) params.set('listingId', listingId)
        if (listingSlug) params.set('listingSlug', listingSlug)

        const response = await fetch(`/api/recommendations?${params}`)
        const data = await response.json()
        setListings(data.similar || data.listings || [])
      } catch (error) {
        console.error('Failed to fetch similar listings:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchSimilar()
  }, [listingId, listingSlug, limit])

  if (isLoading) {
    return (
      <div className="space-y-4">
        <h3 className="text-xl font-semibold text-white">{title}</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: limit }).map((_, i) => (
            <div key={i} className="bg-[#111] border border-[#1a1a1a] rounded-xl p-4 animate-pulse">
              <div className="w-12 h-12 bg-[#222] rounded-lg mb-3" />
              <div className="h-4 bg-[#222] rounded w-3/4 mb-2" />
              <div className="h-3 bg-[#222] rounded w-1/2" />
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (listings.length === 0) {
    return null
  }

  return (
    <div className="space-y-4">
      <h3 className="text-xl font-semibold text-white">{title}</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {listings.map((listing) => (
          <Link
            key={listing.id}
            href={`/listing/${listing.slug}`}
            className="group bg-[#111] border border-[#1a1a1a] hover:border-[#333] rounded-xl p-4 transition-all hover:shadow-lg"
          >
            {/* Icon */}
            <div
              className={`w-12 h-12 rounded-lg bg-gradient-to-br ${TYPE_COLORS[listing.type]} flex items-center justify-center text-2xl mb-3`}
            >
              {TYPE_ICONS[listing.type]}
            </div>

            {/* Title */}
            <h4 className="text-white font-medium group-hover:text-violet-400 transition-colors line-clamp-1 mb-1">
              {listing.name}
            </h4>

            {/* Publisher */}
            <p className="text-[#666] text-sm flex items-center gap-1 mb-2">
              {listing.publisher.displayName}
              {listing.publisher.verified && (
                <svg className="w-3 h-3 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              )}
            </p>

            {/* Stats */}
            <div className="flex items-center gap-3 text-xs text-[#555]">
              {listing.avgRating && (
                <span className="flex items-center gap-1">
                  <svg className="w-3 h-3 text-amber-400" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                  {listing.avgRating.toFixed(1)}
                </span>
              )}
              <span>{listing.installCount.toLocaleString()} installs</span>
            </div>

            {/* Price */}
            <div className="mt-3 pt-3 border-t border-[#1a1a1a]">
              {listing.pricingModel === 'FREE' ? (
                <span className="text-emerald-400 font-medium">Free</span>
              ) : listing.pricingModel === 'PER_CALL' ? (
                <span className="text-white font-medium">${listing.priceAmount?.toFixed(2)}/call</span>
              ) : (
                <span className="text-white font-medium">From ${listing.priceAmount?.toFixed(2)}</span>
              )}
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}

