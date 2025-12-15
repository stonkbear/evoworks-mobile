'use client'

import { useEffect, useState } from 'react'

/**
 * Retro 8-bit Work Progress Animation
 * Shows agent working with progress bar
 */
export function WorkProgress() {
  const [progress, setProgress] = useState(0)
  const [sparkles, setSparkles] = useState<Array<{ x: number; y: number; id: number }>>([])

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((p) => {
        const newProgress = (p + 2) % 101
        
        // Add sparkle when progress increases
        if (newProgress % 10 === 0) {
          setSparkles((prev) => [
            ...prev.slice(-5),
            { x: Math.random() * 200, y: Math.random() * 80, id: Date.now() }
          ])
        }
        
        return newProgress
      })
    }, 100)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="relative w-full h-32 bg-[#0a0a0a] rounded-lg p-4 border border-pink-500/20 overflow-hidden">
      {/* Title */}
      <div className="text-pink-400 text-xs font-mono mb-3 pixel-text">
        AGENT WORKING... {progress}%
      </div>

      {/* Agent working */}
      <div className="flex items-center gap-4">
        {/* Agent */}
        <div className="relative">
          <div className="text-4xl animate-bounce">🦇</div>
          <div className="absolute -bottom-1 left-1/2 -translate-x-1/2">
            <div className="flex gap-px">
              <div className="w-1 h-1 bg-pink-400 pixel-block animate-pulse" />
              <div className="w-1 h-1 bg-pink-400 pixel-block animate-pulse" style={{ animationDelay: '0.2s' }} />
              <div className="w-1 h-1 bg-pink-400 pixel-block animate-pulse" style={{ animationDelay: '0.4s' }} />
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="flex-1">
          {/* Outer border */}
          <div className="border-2 border-pink-400 p-1 pixel-block">
            {/* Progress fill */}
            <div className="h-6 bg-gradient-to-r from-pink-500 to-pink-400 relative" style={{ width: `${progress}%` }}>
              {/* Pixel pattern overlay */}
              <div className="absolute inset-0 opacity-50">
                {[...Array(10)].map((_, i) => (
                  <div key={i} className="inline-block w-2 h-2 bg-pink-300 mr-px mt-px" />
                ))}
              </div>
            </div>
          </div>
          
          {/* Stats */}
          <div className="text-pink-400/60 text-[10px] font-mono mt-1 pixel-text">
            PROCESSING: {Math.floor(progress * 12.47)} TASKS
          </div>
        </div>
      </div>

      {/* Sparkles */}
      {sparkles.map((sparkle) => (
        <div
          key={sparkle.id}
          className="absolute w-2 h-2 bg-pink-400 pixel-block animate-ping"
          style={{
            left: sparkle.x,
            top: sparkle.y,
          }}
        />
      ))}

      <style jsx>{`
        .pixel-block {
          image-rendering: pixelated;
          image-rendering: -moz-crisp-edges;
          image-rendering: crisp-edges;
        }
        .pixel-text {
          letter-spacing: 2px;
        }
      `}</style>
    </div>
  )
}

