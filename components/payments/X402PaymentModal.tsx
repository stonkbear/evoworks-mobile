'use client'

/**
 * x402 Payment Modal
 * Beautiful payment flow for micropayments
 */

import { useEffect } from 'react'
import { useX402Payment, PaymentStatus } from '@/lib/hooks/useX402Payment'
import { useConnectModal } from '@rainbow-me/rainbowkit'

interface X402PaymentModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess?: (txHash: string) => void
  listing: {
    slug: string
    name: string
    priceAmount: number // in cents
    type: string
    publisher: {
      name: string
      address?: string
    }
  }
}

const statusConfig: Record<PaymentStatus, { 
  icon: string
  title: string 
  description: string
  color: string
}> = {
  idle: { 
    icon: '💳', 
    title: 'Confirm Payment', 
    description: 'Review and confirm your payment',
    color: 'text-white'
  },
  initiating: { 
    icon: '⚙️', 
    title: 'Preparing...', 
    description: 'Setting up your transaction',
    color: 'text-blue-400'
  },
  awaiting_signature: { 
    icon: '✍️', 
    title: 'Confirm in Wallet', 
    description: 'Please approve the transaction in your wallet',
    color: 'text-yellow-400'
  },
  pending: { 
    icon: '⏳', 
    title: 'Processing...', 
    description: 'Transaction submitted, waiting for confirmation',
    color: 'text-blue-400'
  },
  confirming: { 
    icon: '🔄', 
    title: 'Confirming...', 
    description: 'Transaction is being confirmed on Base',
    color: 'text-blue-400'
  },
  success: { 
    icon: '✅', 
    title: 'Payment Complete!', 
    description: 'Your payment was successful',
    color: 'text-green-400'
  },
  error: { 
    icon: '❌', 
    title: 'Payment Failed', 
    description: 'Something went wrong',
    color: 'text-red-400'
  },
}

export function X402PaymentModal({ 
  isOpen, 
  onClose, 
  onSuccess, 
  listing 
}: X402PaymentModalProps) {
  const { 
    status, 
    txHash, 
    error, 
    initiatePayment, 
    reset, 
    isConnected, 
    address 
  } = useX402Payment()
  
  const { openConnectModal } = useConnectModal()

  // Handle success callback
  useEffect(() => {
    if (status === 'success' && txHash && onSuccess) {
      const timer = setTimeout(() => {
        onSuccess(txHash)
      }, 2000)
      return () => clearTimeout(timer)
    }
  }, [status, txHash, onSuccess])

  // Reset on close
  const handleClose = () => {
    reset()
    onClose()
  }

  const handlePayment = async () => {
    if (!isConnected) {
      openConnectModal?.()
      return
    }

    await initiatePayment({
      listingSlug: listing.slug,
      listingName: listing.name,
      amountCents: listing.priceAmount,
      publisherAddress: listing.publisher.address,
    })
  }

  if (!isOpen) return null

  const currentStatus = statusConfig[status]
  const priceUSD = (listing.priceAmount / 100).toFixed(2)
  const isProcessing = ['initiating', 'awaiting_signature', 'pending', 'confirming'].includes(status)

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
        onClick={!isProcessing ? handleClose : undefined}
      />

      {/* Modal */}
      <div className="relative w-full max-w-md bg-[#1a1a1a] border border-[#2a2a2a] rounded-2xl shadow-2xl overflow-hidden">
        {/* Close button */}
        {!isProcessing && (
          <button
            onClick={handleClose}
            className="absolute top-4 right-4 text-[#737373] hover:text-white transition-colors"
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}

        {/* Header */}
        <div className="p-6 border-b border-[#2a2a2a]">
          <div className="flex items-center gap-3">
            <div className="text-3xl">{currentStatus.icon}</div>
            <div>
              <h2 className={`text-xl font-bold ${currentStatus.color}`}>
                {currentStatus.title}
              </h2>
              <p className="text-sm text-[#a3a3a3]">{currentStatus.description}</p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {status === 'idle' && (
            <>
              {/* Payment Details */}
              <div className="space-y-4 mb-6">
                <div className="flex justify-between items-start">
                  <span className="text-[#a3a3a3]">Item</span>
                  <div className="text-right">
                    <p className="text-white font-medium">{listing.name}</p>
                    <p className="text-xs text-[#737373] capitalize">{listing.type}</p>
                  </div>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-[#a3a3a3]">Publisher</span>
                  <span className="text-white">{listing.publisher.name}</span>
                </div>

                <div className="h-px bg-[#2a2a2a]" />

                <div className="flex justify-between items-center">
                  <span className="text-[#a3a3a3]">Amount</span>
                  <div className="text-right">
                    <span className="text-2xl font-bold text-[#ff6b35]">${priceUSD}</span>
                    <p className="text-xs text-[#737373]">USDC on Base</p>
                  </div>
                </div>
              </div>

              {/* Wallet Status */}
              <div className="mb-6 p-3 bg-[#0a0a0a] rounded-lg">
                {isConnected ? (
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-green-400" />
                    <span className="text-sm text-[#a3a3a3]">
                      Connected: {address?.slice(0, 6)}...{address?.slice(-4)}
                    </span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-yellow-400" />
                    <span className="text-sm text-yellow-400">Wallet not connected</span>
                  </div>
                )}
              </div>

              {/* Pay Button */}
              <button
                onClick={handlePayment}
                className="w-full px-6 py-4 bg-[#ff6b35] hover:bg-[#ff8555] text-[#0a0a0a] font-bold rounded-lg transition-all shadow-lg hover:shadow-[#ff6b35]/50 hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2z" />
                </svg>
                {isConnected ? `Pay $${priceUSD} USDC` : 'Connect Wallet to Pay'}
              </button>

              {/* x402 Badge */}
              <p className="mt-4 text-center text-xs text-[#737373]">
                Powered by <span className="text-[#ff6b35]">x402</span> micropayments on Base
              </p>
            </>
          )}

          {isProcessing && (
            <div className="py-8 text-center">
              {/* Spinner */}
              <div className="mb-6 flex justify-center">
                <div className="w-16 h-16 border-4 border-[#2a2a2a] border-t-[#ff6b35] rounded-full animate-spin" />
              </div>
              
              {status === 'awaiting_signature' && (
                <p className="text-[#a3a3a3]">
                  Check your wallet for the transaction approval request
                </p>
              )}
              
              {(status === 'pending' || status === 'confirming') && txHash && (
                <div className="mt-4">
                  <a
                    href={`https://basescan.org/tx/${txHash}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-[#ff6b35] hover:underline"
                  >
                    View on BaseScan →
                  </a>
                </div>
              )}
            </div>
          )}

          {status === 'success' && (
            <div className="py-8 text-center">
              <div className="text-6xl mb-4">🎉</div>
              <p className="text-white font-medium mb-2">
                Payment of ${priceUSD} USDC confirmed!
              </p>
              <p className="text-sm text-[#a3a3a3] mb-4">
                You can now execute {listing.name}
              </p>
              {txHash && (
                <a
                  href={`https://basescan.org/tx/${txHash}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-[#ff6b35] hover:underline"
                >
                  View transaction →
                </a>
              )}
            </div>
          )}

          {status === 'error' && (
            <div className="py-8 text-center">
              <div className="text-6xl mb-4">😔</div>
              <p className="text-red-400 font-medium mb-2">Payment Failed</p>
              <p className="text-sm text-[#a3a3a3] mb-4">
                {error || 'Something went wrong. Please try again.'}
              </p>
              <button
                onClick={reset}
                className="px-6 py-2 bg-[#2a2a2a] hover:bg-[#404040] text-white rounded-lg transition-colors"
              >
                Try Again
              </button>
            </div>
          )}
        </div>

        {/* Footer */}
        {status === 'idle' && (
          <div className="px-6 pb-6">
            <div className="p-3 bg-[#ff6b35]/5 border border-[#ff6b35]/20 rounded-lg">
              <p className="text-xs text-[#a3a3a3]">
                <span className="text-[#ff6b35]">⚡ Per-call pricing:</span> You only pay for what you use. 
                Each execution is charged separately.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default X402PaymentModal

