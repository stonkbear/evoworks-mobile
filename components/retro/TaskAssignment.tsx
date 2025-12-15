'use client'

import { useEffect, useState } from 'react'

/**
 * Retro 8-bit Task Assignment Animation
 * Shows task being assigned to agent
 */
export function TaskAssignment() {
  const [stage, setStage] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setStage((s) => (s + 1) % 60)
    }, 100)
    return () => clearInterval(interval)
  }, [])

  const taskPosition = Math.min(stage * 3, 100)
  const isComplete = stage > 33

  return (
    <div className="relative w-full h-32 bg-[#0a0a0a] rounded-lg p-4 overflow-hidden border border-pink-500/20">
      {/* Title */}
      <div className="text-pink-400 text-xs font-mono mb-2 pixel-text">
        {isComplete ? '✓ TASK ASSIGNED' : 'ASSIGNING TASK...'}
      </div>

      {/* Task Document (left) */}
      <div className="absolute left-8 top-12">
        <div className="w-12 h-16 border-2 border-pink-400 pixel-block">
          <div className="m-1 space-y-1">
            <div className="h-1 bg-pink-400 w-8" />
            <div className="h-1 bg-pink-400 w-6" />
            <div className="h-1 bg-pink-400 w-7" />
            <div className="h-1 bg-pink-500/50 w-5" />
            <div className="h-1 bg-pink-500/50 w-6" />
          </div>
        </div>
      </div>

      {/* Agent (right) */}
      <div className="absolute right-8 top-12">
        <div className="w-12 h-12 relative">
          {/* Simple agent face */}
          <div className="w-full h-full border-2 border-pink-400 rounded pixel-block flex items-center justify-center">
            <div className="text-pink-400 text-2xl">{isComplete ? '😊' : '🦇'}</div>
          </div>
        </div>
      </div>

      {/* Arrow/Connection */}
      <div className="absolute left-24 top-16">
        <div 
          className="h-1 bg-pink-400 transition-all duration-100"
          style={{ width: `${taskPosition}px` }}
        />
        {taskPosition > 80 && (
          <div className="absolute right-0 -top-1">
            <div className="w-0 h-0 border-t-2 border-t-transparent border-l-4 border-l-pink-400 border-b-2 border-b-transparent" />
          </div>
        )}
      </div>

      <style jsx>{`
        .pixel-block {
          image-rendering: pixelated;
          image-rendering: -moz-crisp-edges;
          image-rendering: crisp-edges;
        }
        .pixel-text {
          image-rendering: pixelated;
          letter-spacing: 2px;
        }
      `}</style>
    </div>
  )
}

