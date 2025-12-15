'use client'

import { useEffect, useState } from 'react'

/**
 * Retro 8-bit Pixel Agent Animation
 * Shows cute agent character doing work
 */
export function PixelAgent() {
  const [frame, setFrame] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setFrame((f) => (f + 1) % 4)
    }, 300)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="relative w-24 h-24">
      {/* Agent Body - 8-bit style */}
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        {/* Head */}
        <div className="flex flex-col items-center">
          <div className="w-12 h-2 bg-pink-400 pixel-block" />
          <div className="flex">
            <div className="w-2 h-2 bg-pink-400 pixel-block" />
            <div className="w-8 h-2 bg-pink-300 pixel-block" />
            <div className="w-2 h-2 bg-pink-400 pixel-block" />
          </div>
          {/* Eyes */}
          <div className="flex gap-2">
            <div className="w-2 h-2 bg-pink-400 pixel-block" />
            <div className={`w-2 h-2 pixel-block ${frame % 2 === 0 ? 'bg-black' : 'bg-pink-300'}`} />
            <div className="w-2 h-2 bg-pink-300 pixel-block" />
            <div className={`w-2 h-2 pixel-block ${frame % 2 === 0 ? 'bg-black' : 'bg-pink-300'}`} />
            <div className="w-2 h-2 bg-pink-400 pixel-block" />
          </div>
          <div className="flex">
            <div className="w-2 h-2 bg-pink-400 pixel-block" />
            <div className="w-8 h-2 bg-pink-300 pixel-block" />
            <div className="w-2 h-2 bg-pink-400 pixel-block" />
          </div>
          <div className="w-12 h-2 bg-pink-400 pixel-block" />
        </div>
        
        {/* Body */}
        <div className="mt-1 flex flex-col items-center">
          <div className="w-10 h-2 bg-pink-500 pixel-block" />
          <div className="flex">
            {/* Arms - animated */}
            <div className={`w-3 h-2 bg-pink-400 pixel-block transition-transform ${frame < 2 ? 'translate-y-0' : 'translate-y-1'}`} />
            <div className="w-4 h-2 bg-pink-500 pixel-block" />
            <div className={`w-3 h-2 bg-pink-400 pixel-block transition-transform ${frame < 2 ? 'translate-y-1' : 'translate-y-0'}`} />
          </div>
          <div className="w-8 h-2 bg-pink-500 pixel-block" />
        </div>

        {/* Legs - walking animation */}
        <div className="mt-1 flex gap-1">
          <div className={`w-2 h-3 bg-pink-600 pixel-block transition-transform ${frame % 2 === 0 ? 'translate-y-0' : 'translate-y-1'}`} />
          <div className={`w-2 h-3 bg-pink-600 pixel-block transition-transform ${frame % 2 === 0 ? 'translate-y-1' : 'translate-y-0'}`} />
        </div>
      </div>

      <style jsx>{`
        .pixel-block {
          image-rendering: pixelated;
          image-rendering: -moz-crisp-edges;
          image-rendering: crisp-edges;
        }
      `}</style>
    </div>
  )
}

