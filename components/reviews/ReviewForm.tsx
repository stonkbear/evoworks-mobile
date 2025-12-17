'use client'

import { useState } from 'react'
import { useSession } from 'next-auth/react'

interface ReviewFormProps {
  listingId: string
  listingName: string
  onSuccess?: () => void
}

export function ReviewForm({ listingId, listingName, onSuccess }: ReviewFormProps) {
  const { data: session, status } = useSession()
  const [rating, setRating] = useState(0)
  const [hoverRating, setHoverRating] = useState(0)
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (rating === 0) {
      setError('Please select a rating')
      return
    }

    setIsSubmitting(true)
    setError(null)

    try {
      const response = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          listingId,
          rating,
          title: title.trim() || null,
          content: content.trim() || null,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to submit review')
      }

      setSuccess(true)
      onSuccess?.()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to submit review')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (status === 'loading') {
    return (
      <div className="bg-[#111] border border-[#1a1a1a] rounded-xl p-6 animate-pulse">
        <div className="h-6 bg-[#222] rounded w-1/3 mb-4" />
        <div className="h-20 bg-[#222] rounded" />
      </div>
    )
  }

  if (status === 'unauthenticated') {
    return (
      <div className="bg-[#111] border border-[#1a1a1a] rounded-xl p-6 text-center">
        <p className="text-[#888] mb-4">Sign in to leave a review</p>
        <a
          href="/signin"
          className="inline-block px-6 py-3 bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white font-medium rounded-lg"
        >
          Sign In
        </a>
      </div>
    )
  }

  if (success) {
    return (
      <div className="bg-[#0d1f17] border border-emerald-500/30 rounded-xl p-6 text-center">
        <div className="w-12 h-12 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-6 h-6 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h4 className="text-white font-medium mb-2">Thank you for your review!</h4>
        <p className="text-emerald-400/70 text-sm">Your feedback helps other users make informed decisions.</p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="bg-[#111] border border-[#1a1a1a] rounded-xl p-6">
      <h3 className="text-white font-semibold mb-4">Write a Review</h3>

      {/* Star Rating */}
      <div className="mb-6">
        <label className="block text-[#888] text-sm mb-2">Your Rating</label>
        <div className="flex gap-1">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              onClick={() => setRating(star)}
              onMouseEnter={() => setHoverRating(star)}
              onMouseLeave={() => setHoverRating(0)}
              className="p-1 transition-transform hover:scale-110"
            >
              <svg
                className={`w-8 h-8 transition-colors ${
                  star <= (hoverRating || rating)
                    ? 'text-amber-400'
                    : 'text-[#333] hover:text-[#444]'
                }`}
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
            </button>
          ))}
        </div>
      </div>

      {/* Title */}
      <div className="mb-4">
        <label className="block text-[#888] text-sm mb-2">Title (optional)</label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder={`What's most important to know?`}
          className="w-full px-4 py-3 bg-[#0a0a0a] border border-[#222] rounded-lg text-white placeholder-[#444] focus:outline-none focus:border-violet-500"
          maxLength={100}
        />
      </div>

      {/* Content */}
      <div className="mb-6">
        <label className="block text-[#888] text-sm mb-2">Your Review (optional)</label>
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder={`What did you like or dislike about ${listingName}?`}
          rows={4}
          className="w-full px-4 py-3 bg-[#0a0a0a] border border-[#222] rounded-lg text-white placeholder-[#444] focus:outline-none focus:border-violet-500 resize-none"
          maxLength={2000}
        />
        <div className="text-right text-[#444] text-xs mt-1">{content.length}/2000</div>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm">
          {error}
        </div>
      )}

      <button
        type="submit"
        disabled={isSubmitting || rating === 0}
        className="w-full px-6 py-3 bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-500 hover:to-fuchsia-500 text-white font-medium rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isSubmitting ? 'Submitting...' : 'Submit Review'}
      </button>
    </form>
  )
}

