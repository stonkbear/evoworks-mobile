'use client'

import { useState, useEffect } from 'react'
import { ReviewCard } from './ReviewCard'
import { ReviewForm } from './ReviewForm'

interface Review {
  id: string
  rating: number
  title: string | null
  content: string | null
  userId: string
  verifiedPurchase: boolean
  createdAt: string
}

interface ReviewsSectionProps {
  listingId: string
  listingSlug: string
  listingName: string
}

export function ReviewsSection({ listingId, listingSlug, listingName }: ReviewsSectionProps) {
  const [reviews, setReviews] = useState<Review[]>([])
  const [avgRating, setAvgRating] = useState<number | null>(null)
  const [total, setTotal] = useState(0)
  const [distribution, setDistribution] = useState([0, 0, 0, 0, 0])
  const [isLoading, setIsLoading] = useState(true)
  const [sort, setSort] = useState('recent')
  const [showForm, setShowForm] = useState(false)

  const fetchReviews = async () => {
    setIsLoading(true)
    try {
      const response = await fetch(`/api/reviews?listingId=${listingId}&sort=${sort}`)
      const data = await response.json()
      
      setReviews(data.reviews || [])
      setAvgRating(data.avgRating)
      setTotal(data.total || 0)
      setDistribution(data.distribution || [0, 0, 0, 0, 0])
    } catch (error) {
      console.error('Failed to fetch reviews:', error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchReviews()
  }, [listingId, sort])

  const maxDistribution = Math.max(...distribution, 1)

  return (
    <div className="space-y-6">
      {/* Header with Stats */}
      <div className="bg-[#111] border border-[#1a1a1a] rounded-xl p-6">
        <div className="flex flex-col md:flex-row gap-8">
          {/* Overall Rating */}
          <div className="text-center md:text-left">
            <div className="text-5xl font-bold text-white mb-2">
              {avgRating?.toFixed(1) || '—'}
            </div>
            <div className="flex justify-center md:justify-start gap-0.5 mb-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <svg
                  key={star}
                  className={`w-5 h-5 ${
                    star <= Math.round(avgRating || 0) ? 'text-amber-400' : 'text-[#333]'
                  }`}
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              ))}
            </div>
            <div className="text-[#666] text-sm">{total} reviews</div>
          </div>

          {/* Rating Distribution */}
          <div className="flex-1 space-y-2">
            {[5, 4, 3, 2, 1].map((star) => {
              const count = distribution[star - 1]
              const percentage = (count / maxDistribution) * 100
              
              return (
                <div key={star} className="flex items-center gap-3">
                  <span className="text-[#888] text-sm w-8">{star} ★</span>
                  <div className="flex-1 h-2 bg-[#1a1a1a] rounded-full overflow-hidden">
                    <div
                      className="h-full bg-amber-400 rounded-full transition-all duration-500"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                  <span className="text-[#666] text-sm w-8 text-right">{count}</span>
                </div>
              )
            })}
          </div>

          {/* Write Review Button */}
          <div className="flex flex-col justify-center">
            <button
              onClick={() => setShowForm(!showForm)}
              className="px-6 py-3 bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-500 hover:to-fuchsia-500 text-white font-medium rounded-lg transition-all"
            >
              Write a Review
            </button>
          </div>
        </div>
      </div>

      {/* Review Form */}
      {showForm && (
        <ReviewForm
          listingId={listingId}
          listingName={listingName}
          onSuccess={() => {
            setShowForm(false)
            fetchReviews()
          }}
        />
      )}

      {/* Sort & Filter */}
      <div className="flex items-center justify-between">
        <h3 className="text-white font-semibold">Reviews</h3>
        <select
          value={sort}
          onChange={(e) => setSort(e.target.value)}
          className="px-3 py-2 bg-[#111] border border-[#222] rounded-lg text-white text-sm focus:outline-none focus:border-violet-500"
        >
          <option value="recent">Most Recent</option>
          <option value="rating_high">Highest Rated</option>
          <option value="rating_low">Lowest Rated</option>
        </select>
      </div>

      {/* Reviews List */}
      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-[#111] border border-[#1a1a1a] rounded-xl p-5 animate-pulse">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-[#222] rounded-full" />
                <div className="flex-1">
                  <div className="h-4 bg-[#222] rounded w-24 mb-2" />
                  <div className="h-3 bg-[#222] rounded w-16" />
                </div>
              </div>
              <div className="h-4 bg-[#222] rounded w-3/4 mb-2" />
              <div className="h-4 bg-[#222] rounded w-1/2" />
            </div>
          ))}
        </div>
      ) : reviews.length === 0 ? (
        <div className="bg-[#111] border border-[#1a1a1a] rounded-xl p-12 text-center">
          <div className="text-4xl mb-4">💬</div>
          <h4 className="text-white font-medium mb-2">No reviews yet</h4>
          <p className="text-[#666]">Be the first to review this listing!</p>
        </div>
      ) : (
        <div className="space-y-4">
          {reviews.map((review) => (
            <ReviewCard key={review.id} {...review} />
          ))}
        </div>
      )}
    </div>
  )
}

