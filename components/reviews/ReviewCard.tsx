'use client'

interface ReviewCardProps {
  rating: number
  title?: string | null
  content?: string | null
  userId: string
  verifiedPurchase: boolean
  createdAt: string
}

export function ReviewCard({
  rating,
  title,
  content,
  userId,
  verifiedPurchase,
  createdAt,
}: ReviewCardProps) {
  const stars = Array.from({ length: 5 }, (_, i) => i < rating)
  const timeAgo = getTimeAgo(new Date(createdAt))

  return (
    <div className="bg-[#111] border border-[#1a1a1a] rounded-xl p-5">
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center text-white font-bold">
            {userId.charAt(0).toUpperCase()}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-white font-medium">User {userId.slice(0, 8)}</span>
              {verifiedPurchase && (
                <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-400 text-xs rounded-full flex items-center gap-1">
                  <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  Verified
                </span>
              )}
            </div>
            <div className="text-[#666] text-sm">{timeAgo}</div>
          </div>
        </div>
        
        {/* Stars */}
        <div className="flex gap-0.5">
          {stars.map((filled, i) => (
            <svg
              key={i}
              className={`w-4 h-4 ${filled ? 'text-amber-400' : 'text-[#333]'}`}
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
          ))}
        </div>
      </div>

      {/* Content */}
      {title && (
        <h4 className="text-white font-medium mb-2">{title}</h4>
      )}
      {content && (
        <p className="text-[#888] leading-relaxed">{content}</p>
      )}
    </div>
  )
}

function getTimeAgo(date: Date): string {
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000)
  
  if (seconds < 60) return 'Just now'
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`
  if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`
  if (seconds < 2592000) return `${Math.floor(seconds / 604800)}w ago`
  
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

