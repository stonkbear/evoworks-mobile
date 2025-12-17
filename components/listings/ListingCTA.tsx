'use client'

/**
 * Listing CTA Component
 * Handles payment flow for per-call listings via x402
 */

import { useState } from 'react'
import { X402PaymentModal } from '@/components/payments/X402PaymentModal'

interface ListingCTAProps {
  listing: {
    slug: string
    name: string
    type: string
    pricing: {
      model: 'free' | 'per-call' | 'subscription' | 'one-time'
      perCallCents?: number
      monthlyPrice?: number
      yearlyPrice?: number
      oneTimePrice?: number
    }
    author: {
      name: string
      walletAddress?: string
    }
  }
  typeConfig: {
    color: string
    cta: string
  }
}

export function ListingCTA({ listing, typeConfig }: ListingCTAProps) {
  const [showPaymentModal, setShowPaymentModal] = useState(false)
  const [executionGranted, setExecutionGranted] = useState(false)

  const handleCTAClick = () => {
    if (listing.pricing.model === 'per-call') {
      // Per-call pricing requires x402 payment
      setShowPaymentModal(true)
    } else if (listing.pricing.model === 'free') {
      // Free listings can execute immediately
      handleExecute()
    } else {
      // Subscription/one-time - show subscribe flow
      // For now, just show modal
      setShowPaymentModal(true)
    }
  }

  const handlePaymentSuccess = (txHash: string) => {
    console.log('Payment successful:', txHash)
    setShowPaymentModal(false)
    setExecutionGranted(true)
    // Could auto-trigger execution here
    handleExecute()
  }

  const handleExecute = () => {
    // In production, this would trigger the Ghost Flow execution
    console.log('Executing listing:', listing.slug)
    alert(`🚀 Executing ${listing.name}!\n\nIn production, this would trigger the Ghost Flow execution.`)
  }

  // Get price for modal
  const priceAmount = listing.pricing.model === 'per-call' 
    ? listing.pricing.perCallCents || 0
    : listing.pricing.model === 'subscription'
    ? (listing.pricing.monthlyPrice || 0) * 100
    : listing.pricing.model === 'one-time'
    ? (listing.pricing.oneTimePrice || 0) * 100
    : 0

  return (
    <>
      {/* CTA Buttons */}
      <div className="space-y-3 mb-6">
        <button 
          onClick={handleCTAClick}
          className="w-full px-6 py-4 font-semibold text-lg rounded-xl transition-all shadow-lg hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2"
          style={{ 
            backgroundColor: typeConfig.color,
            color: '#0a0a0a',
          }}
        >
          {listing.pricing.model === 'per-call' && (
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2z" />
            </svg>
          )}
          {typeConfig.cta}
          {listing.pricing.model === 'per-call' && (
            <span className="ml-1 opacity-75">
              (${(listing.pricing.perCallCents! / 100).toFixed(2)})
            </span>
          )}
        </button>
        
        <button className="w-full px-6 py-3 bg-[#1f1f1f] hover:bg-[#252525] text-white font-medium rounded-xl transition-all">
          Add to Workspace
        </button>
        
        <button className="w-full px-6 py-3 bg-transparent hover:bg-[#1f1f1f] text-[#737373] hover:text-white font-medium rounded-xl border border-[#1f1f1f] transition-all">
          Try Demo
        </button>
      </div>

      {/* Payment Modal */}
      {listing.pricing.model === 'per-call' && (
        <X402PaymentModal
          isOpen={showPaymentModal}
          onClose={() => setShowPaymentModal(false)}
          onSuccess={handlePaymentSuccess}
          listing={{
            slug: listing.slug,
            name: listing.name,
            priceAmount: priceAmount,
            type: listing.type,
            publisher: {
              name: listing.author.name,
              address: listing.author.walletAddress,
            },
          }}
        />
      )}

      {/* Execution granted state */}
      {executionGranted && (
        <div className="mb-4 p-3 bg-green-500/10 border border-green-500/20 rounded-lg">
          <div className="flex items-center gap-2 text-green-400 text-sm">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            <span>Payment confirmed - ready to execute!</span>
          </div>
        </div>
      )}
    </>
  )
}

export default ListingCTA

