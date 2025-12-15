'use client'

import { useEffect, useState } from 'react'

/**
 * Retro 8-bit Payment Flow Animation
 * Shows coins flowing from buyer to seller
 */
export function PaymentFlow() {
  const [coins, setCoins] = useState<Array<{ x: number; id: number }>>([])
  const [totalPaid, setTotalPaid] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      // Spawn new coin
      setCoins((prev) => [
        ...prev,
        { x: 0, id: Date.now() }
      ])
    }, 800)

    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    const interval = setInterval(() => {
      setCoins((prev) =>
        prev
          .map((coin) => ({ ...coin, x: coin.x + 5 }))
          .filter((coin) => {
            if (coin.x > 180) {
              setTotalPaid((t) => t + 50)
              return false
            }
            return true
          })
      )
    }, 50)

    return () => clearInterval(interval)
  }, [])

  return (
    <div className="relative w-full h-32 bg-[#0a0a0a] rounded-lg p-4 border border-pink-500/20 overflow-hidden">
      {/* Title */}
      <div className="text-pink-400 text-xs font-mono mb-2 pixel-text">
        PAYMENT FLOW: ${totalPaid}
      </div>

      {/* Buyer (left) */}
      <div className="absolute left-8 top-12">
        <div className="text-center">
          <div className="text-3xl mb-1">👤</div>
          <div className="text-pink-400 text-[10px] font-mono pixel-text">BUYER</div>
        </div>
      </div>

      {/* Agent/Seller (right) */}
      <div className="absolute right-8 top-12">
        <div className="text-center">
          <div className="text-3xl mb-1">🦇</div>
          <div className="text-pink-400 text-[10px] font-mono pixel-text">AGENT</div>
        </div>
      </div>

      {/* Coins */}
      <div className="absolute left-20 top-16 w-44 h-8">
        {coins.map((coin) => (
          <div
            key={coin.id}
            className="absolute"
            style={{
              left: coin.x,
              transition: 'none'
            }}
          >
            {/* Pixel coin */}
            <div className="w-6 h-6 relative animate-spin-slow">
              <div className="absolute inset-0 border-2 border-pink-400 rounded-full pixel-block">
                <div className="absolute inset-1 bg-pink-400 rounded-full" />
                <div className="absolute inset-2 bg-[#0a0a0a] rounded-full" />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-pink-400 text-xs font-bold">
                  $
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Progress line */}
      <div className="absolute left-20 top-20 w-44 h-0.5 bg-pink-500/20" />

      <style jsx>{`
        .pixel-block {
          image-rendering: pixelated;
          image-rendering: -moz-crisp-edges;
          image-rendering: crisp-edges;
        }
        .pixel-text {
          letter-spacing: 2px;
        }
        @keyframes spin-slow {
          from { transform: rotateY(0deg); }
          to { transform: rotateY(360deg); }
        }
        .animate-spin-slow {
          animation: spin-slow 2s linear infinite;
        }
      `}</style>
    </div>
  )
}

