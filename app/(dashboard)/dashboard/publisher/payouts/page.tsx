'use client'

/**
 * Publisher Payouts Page
 * View earnings, request payouts, manage settings
 */

import { useState } from 'react'
import Link from 'next/link'
import { usePayouts, PayoutMethod, PayoutStatus, Payout } from '@/lib/hooks/usePayouts'

const methodConfig: Record<PayoutMethod, { icon: string; label: string; color: string }> = {
  USDC: { icon: '💵', label: 'USDC on Base', color: '#2775ca' },
  ETH: { icon: '⟠', label: 'Ethereum', color: '#627eea' },
  STRIPE: { icon: '💳', label: 'Bank Transfer', color: '#635bff' },
  PAYPAL: { icon: '🅿️', label: 'PayPal', color: '#00457c' },
}

const statusConfig: Record<PayoutStatus, { label: string; color: string; bgColor: string }> = {
  PENDING: { label: 'Pending', color: '#f59e0b', bgColor: 'rgba(245, 158, 11, 0.1)' },
  PROCESSING: { label: 'Processing', color: '#3b82f6', bgColor: 'rgba(59, 130, 246, 0.1)' },
  COMPLETED: { label: 'Completed', color: '#10b981', bgColor: 'rgba(16, 185, 129, 0.1)' },
  FAILED: { label: 'Failed', color: '#ef4444', bgColor: 'rgba(239, 68, 68, 0.1)' },
}

export default function PayoutsPage() {
  const { payouts, stats, settings, loading, error, requestPayout, cancelPayout, updateSettings } = usePayouts()
  const [showRequestModal, setShowRequestModal] = useState(false)
  const [showSettingsModal, setShowSettingsModal] = useState(false)
  const [requestMethod, setRequestMethod] = useState<PayoutMethod>('USDC')
  const [requestAddress, setRequestAddress] = useState('')
  const [isRequesting, setIsRequesting] = useState(false)

  const handleRequestPayout = async () => {
    setIsRequesting(true)
    const success = await requestPayout(requestMethod, requestAddress || undefined)
    setIsRequesting(false)
    if (success) {
      setShowRequestModal(false)
      setRequestAddress('')
    }
  }

  const handleCancelPayout = async (id: string) => {
    if (confirm('Are you sure you want to cancel this payout request?')) {
      await cancelPayout(id)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-[#ff6b35] border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      {/* Header */}
      <div className="border-b border-[#1f1f1f]">
        <div className="max-w-6xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/dashboard/publisher" className="text-[#737373] hover:text-white transition-colors">
                ← Back
              </Link>
              <h1 className="text-2xl font-bold">Payouts & Earnings</h1>
            </div>
            <button
              onClick={() => setShowSettingsModal(true)}
              className="px-4 py-2 bg-[#1f1f1f] hover:bg-[#2a2a2a] text-white rounded-lg transition-colors flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              Settings
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-8">
        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400">
            {error}
          </div>
        )}

        {/* Stats Cards */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-[#141414] border border-[#1f1f1f] rounded-xl p-6">
              <div className="text-[#737373] text-sm mb-1">Available Balance</div>
              <div className="text-3xl font-bold text-[#10b981]">
                ${stats.availableBalance.toFixed(2)}
              </div>
              <div className="text-xs text-[#525252] mt-1">
                Min. payout: ${stats.minimumPayout}
              </div>
            </div>

            <div className="bg-[#141414] border border-[#1f1f1f] rounded-xl p-6">
              <div className="text-[#737373] text-sm mb-1">Total Earnings</div>
              <div className="text-3xl font-bold text-white">
                ${stats.totalEarnings.toFixed(2)}
              </div>
              <div className="text-xs text-[#525252] mt-1">
                {stats.transactionCount} transactions
              </div>
            </div>

            <div className="bg-[#141414] border border-[#1f1f1f] rounded-xl p-6">
              <div className="text-[#737373] text-sm mb-1">This Month</div>
              <div className="text-3xl font-bold text-white">
                ${stats.thisMonthEarnings.toFixed(2)}
              </div>
              <div className="text-xs text-[#525252] mt-1">
                Platform fee: {(stats.platformFeeRate * 100).toFixed(0)}%
              </div>
            </div>

            <div className="bg-[#141414] border border-[#1f1f1f] rounded-xl p-6">
              <div className="text-[#737373] text-sm mb-1">Total Paid Out</div>
              <div className="text-3xl font-bold text-white">
                ${stats.totalPaidOut.toFixed(2)}
              </div>
              {stats.pendingPayouts > 0 && (
                <div className="text-xs text-[#f59e0b] mt-1">
                  ${stats.pendingPayouts.toFixed(2)} pending
                </div>
              )}
            </div>
          </div>
        )}

        {/* Request Payout Button */}
        <div className="mb-8">
          <button
            onClick={() => setShowRequestModal(true)}
            disabled={!stats || stats.availableBalance < stats.minimumPayout}
            className="px-6 py-3 bg-[#ff6b35] hover:bg-[#ff8555] disabled:bg-[#ff6b35]/50 disabled:cursor-not-allowed text-[#0a0a0a] font-semibold rounded-lg transition-all shadow-lg hover:shadow-[#ff6b35]/25"
          >
            Request Payout
          </button>
          {stats && stats.availableBalance < stats.minimumPayout && (
            <span className="ml-4 text-sm text-[#737373]">
              Need ${(stats.minimumPayout - stats.availableBalance).toFixed(2)} more to request payout
            </span>
          )}
        </div>

        {/* Payouts History */}
        <div className="bg-[#141414] border border-[#1f1f1f] rounded-xl overflow-hidden">
          <div className="px-6 py-4 border-b border-[#1f1f1f]">
            <h2 className="text-lg font-semibold">Payout History</h2>
          </div>

          {payouts.length === 0 ? (
            <div className="px-6 py-12 text-center text-[#737373]">
              <div className="text-4xl mb-3">💸</div>
              <p>No payouts yet</p>
              <p className="text-sm mt-1">Request your first payout when you reach ${stats?.minimumPayout || 25}</p>
            </div>
          ) : (
            <div className="divide-y divide-[#1f1f1f]">
              {payouts.map((payout) => (
                <PayoutRow 
                  key={payout.id} 
                  payout={payout} 
                  onCancel={() => handleCancelPayout(payout.id)}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Request Payout Modal */}
      {showRequestModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/80" onClick={() => setShowRequestModal(false)} />
          <div className="relative w-full max-w-md bg-[#141414] border border-[#1f1f1f] rounded-2xl p-6">
            <h2 className="text-xl font-bold mb-4">Request Payout</h2>

            <div className="space-y-4">
              {/* Amount Preview */}
              <div className="p-4 bg-[#0a0a0a] rounded-lg">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-[#737373]">Available Balance</span>
                  <span className="text-white font-bold">${stats?.availableBalance.toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-[#737373]">Platform Fee ({((stats?.platformFeeRate || 0.15) * 100).toFixed(0)}%)</span>
                  <span className="text-red-400">-${((stats?.availableBalance || 0) * (stats?.platformFeeRate || 0.15)).toFixed(2)}</span>
                </div>
                <div className="border-t border-[#1f1f1f] pt-2 mt-2">
                  <div className="flex justify-between items-center">
                    <span className="text-white font-medium">You'll Receive</span>
                    <span className="text-[#10b981] font-bold text-lg">
                      ${((stats?.availableBalance || 0) * (1 - (stats?.platformFeeRate || 0.15))).toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Method Selection */}
              <div>
                <label className="block text-sm font-medium text-[#a3a3a3] mb-2">
                  Payout Method
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {(Object.keys(methodConfig) as PayoutMethod[]).map((method) => (
                    <button
                      key={method}
                      type="button"
                      onClick={() => setRequestMethod(method)}
                      className={`px-4 py-3 rounded-lg border-2 transition-all ${
                        requestMethod === method
                          ? 'border-[#ff6b35] bg-[#ff6b35]/10'
                          : 'border-[#1f1f1f] hover:border-[#2a2a2a]'
                      }`}
                    >
                      <span className="text-xl mr-2">{methodConfig[method].icon}</span>
                      <span className="text-sm">{methodConfig[method].label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Address Input */}
              {(requestMethod === 'USDC' || requestMethod === 'ETH') && (
                <div>
                  <label className="block text-sm font-medium text-[#a3a3a3] mb-2">
                    Wallet Address
                  </label>
                  <input
                    type="text"
                    value={requestAddress}
                    onChange={(e) => setRequestAddress(e.target.value)}
                    placeholder="0x..."
                    className="w-full px-4 py-3 bg-[#0a0a0a] border border-[#1f1f1f] rounded-lg text-white placeholder-[#525252] focus:border-[#ff6b35] focus:outline-none"
                  />
                  <p className="text-xs text-[#525252] mt-1">
                    {requestMethod === 'USDC' ? 'USDC will be sent on Base network' : 'ETH will be sent on Ethereum mainnet'}
                  </p>
                </div>
              )}

              {requestMethod === 'PAYPAL' && (
                <div>
                  <label className="block text-sm font-medium text-[#a3a3a3] mb-2">
                    PayPal Email
                  </label>
                  <input
                    type="email"
                    value={requestAddress}
                    onChange={(e) => setRequestAddress(e.target.value)}
                    placeholder="email@example.com"
                    className="w-full px-4 py-3 bg-[#0a0a0a] border border-[#1f1f1f] rounded-lg text-white placeholder-[#525252] focus:border-[#ff6b35] focus:outline-none"
                  />
                </div>
              )}

              {requestMethod === 'STRIPE' && (
                <div className="p-4 bg-[#635bff]/10 border border-[#635bff]/20 rounded-lg">
                  <p className="text-sm text-[#a3a3a3]">
                    Bank transfers are processed via Stripe. Make sure your Stripe Connect account is set up in Settings.
                  </p>
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => setShowRequestModal(false)}
                  className="flex-1 px-4 py-3 bg-[#1f1f1f] hover:bg-[#2a2a2a] text-white rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleRequestPayout}
                  disabled={isRequesting || ((requestMethod === 'USDC' || requestMethod === 'ETH' || requestMethod === 'PAYPAL') && !requestAddress)}
                  className="flex-1 px-4 py-3 bg-[#ff6b35] hover:bg-[#ff8555] disabled:bg-[#ff6b35]/50 disabled:cursor-not-allowed text-[#0a0a0a] font-semibold rounded-lg transition-colors"
                >
                  {isRequesting ? 'Requesting...' : 'Request Payout'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Settings Modal */}
      {showSettingsModal && (
        <PayoutSettingsModal
          settings={settings}
          onClose={() => setShowSettingsModal(false)}
          onSave={updateSettings}
        />
      )}
    </div>
  )
}

// Payout Row Component
function PayoutRow({ payout, onCancel }: { payout: Payout; onCancel: () => void }) {
  const method = methodConfig[payout.method]
  const status = statusConfig[payout.status]

  return (
    <div className="px-6 py-4 flex items-center justify-between">
      <div className="flex items-center gap-4">
        <div 
          className="w-10 h-10 rounded-lg flex items-center justify-center text-xl"
          style={{ backgroundColor: method.color + '20' }}
        >
          {method.icon}
        </div>
        <div>
          <div className="font-medium text-white">
            ${payout.netAmount.toFixed(2)} {method.label}
          </div>
          <div className="text-sm text-[#525252]">
            {new Date(payout.createdAt).toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
              year: 'numeric',
            })}
            {payout.txHash && (
              <a 
                href={`https://basescan.org/tx/${payout.txHash}`}
                target="_blank"
                rel="noopener noreferrer"
                className="ml-2 text-[#ff6b35] hover:underline"
              >
                View tx
              </a>
            )}
          </div>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <span 
          className="px-3 py-1 rounded-full text-sm font-medium"
          style={{ backgroundColor: status.bgColor, color: status.color }}
        >
          {status.label}
        </span>
        {payout.status === 'PENDING' && (
          <button
            onClick={onCancel}
            className="text-[#737373] hover:text-red-400 transition-colors"
            title="Cancel payout"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>
    </div>
  )
}

// Settings Modal Component
function PayoutSettingsModal({ 
  settings, 
  onClose, 
  onSave 
}: { 
  settings: any
  onClose: () => void
  onSave: (settings: any) => Promise<boolean>
}) {
  const [formData, setFormData] = useState({
    preferredMethod: settings?.preferredMethod || 'USDC',
    usdcAddress: settings?.usdcAddress || '',
    ethAddress: settings?.ethAddress || '',
    paypalEmail: settings?.paypalEmail || '',
    autoPayoutEnabled: settings?.autoPayoutEnabled || false,
    autoPayoutThreshold: settings?.autoPayoutThreshold || 100,
  })
  const [isSaving, setIsSaving] = useState(false)

  const handleSave = async () => {
    setIsSaving(true)
    const success = await onSave(formData)
    setIsSaving(false)
    if (success) {
      onClose()
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/80" onClick={onClose} />
      <div className="relative w-full max-w-md bg-[#141414] border border-[#1f1f1f] rounded-2xl p-6 max-h-[90vh] overflow-y-auto">
        <h2 className="text-xl font-bold mb-4">Payout Settings</h2>

        <div className="space-y-4">
          {/* Preferred Method */}
          <div>
            <label className="block text-sm font-medium text-[#a3a3a3] mb-2">
              Preferred Payout Method
            </label>
            <select
              value={formData.preferredMethod}
              onChange={(e) => setFormData({ ...formData, preferredMethod: e.target.value as PayoutMethod })}
              className="w-full px-4 py-3 bg-[#0a0a0a] border border-[#1f1f1f] rounded-lg text-white focus:border-[#ff6b35] focus:outline-none"
            >
              {(Object.keys(methodConfig) as PayoutMethod[]).map((method) => (
                <option key={method} value={method}>
                  {methodConfig[method].label}
                </option>
              ))}
            </select>
          </div>

          {/* USDC Address */}
          <div>
            <label className="block text-sm font-medium text-[#a3a3a3] mb-2">
              USDC Wallet Address (Base)
            </label>
            <input
              type="text"
              value={formData.usdcAddress}
              onChange={(e) => setFormData({ ...formData, usdcAddress: e.target.value })}
              placeholder="0x..."
              className="w-full px-4 py-3 bg-[#0a0a0a] border border-[#1f1f1f] rounded-lg text-white placeholder-[#525252] focus:border-[#ff6b35] focus:outline-none"
            />
          </div>

          {/* ETH Address */}
          <div>
            <label className="block text-sm font-medium text-[#a3a3a3] mb-2">
              ETH Wallet Address
            </label>
            <input
              type="text"
              value={formData.ethAddress}
              onChange={(e) => setFormData({ ...formData, ethAddress: e.target.value })}
              placeholder="0x..."
              className="w-full px-4 py-3 bg-[#0a0a0a] border border-[#1f1f1f] rounded-lg text-white placeholder-[#525252] focus:border-[#ff6b35] focus:outline-none"
            />
          </div>

          {/* PayPal Email */}
          <div>
            <label className="block text-sm font-medium text-[#a3a3a3] mb-2">
              PayPal Email
            </label>
            <input
              type="email"
              value={formData.paypalEmail}
              onChange={(e) => setFormData({ ...formData, paypalEmail: e.target.value })}
              placeholder="email@example.com"
              className="w-full px-4 py-3 bg-[#0a0a0a] border border-[#1f1f1f] rounded-lg text-white placeholder-[#525252] focus:border-[#ff6b35] focus:outline-none"
            />
          </div>

          {/* Auto Payout */}
          <div className="p-4 bg-[#0a0a0a] rounded-lg">
            <label className="flex items-center justify-between cursor-pointer">
              <div>
                <div className="font-medium text-white">Auto Payout</div>
                <div className="text-sm text-[#525252]">Automatically request payouts</div>
              </div>
              <div className="relative">
                <input
                  type="checkbox"
                  checked={formData.autoPayoutEnabled}
                  onChange={(e) => setFormData({ ...formData, autoPayoutEnabled: e.target.checked })}
                  className="sr-only"
                />
                <div className={`w-11 h-6 rounded-full transition-colors ${formData.autoPayoutEnabled ? 'bg-[#ff6b35]' : 'bg-[#1f1f1f]'}`}>
                  <div className={`w-4 h-4 rounded-full bg-white absolute top-1 transition-transform ${formData.autoPayoutEnabled ? 'translate-x-6' : 'translate-x-1'}`} />
                </div>
              </div>
            </label>
            
            {formData.autoPayoutEnabled && (
              <div className="mt-4">
                <label className="block text-sm text-[#737373] mb-1">
                  Threshold (USD)
                </label>
                <input
                  type="number"
                  value={formData.autoPayoutThreshold}
                  onChange={(e) => setFormData({ ...formData, autoPayoutThreshold: parseInt(e.target.value) || 100 })}
                  min={25}
                  className="w-full px-3 py-2 bg-[#141414] border border-[#1f1f1f] rounded-lg text-white focus:border-[#ff6b35] focus:outline-none"
                />
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-3 bg-[#1f1f1f] hover:bg-[#2a2a2a] text-white rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="flex-1 px-4 py-3 bg-[#ff6b35] hover:bg-[#ff8555] disabled:bg-[#ff6b35]/50 text-[#0a0a0a] font-semibold rounded-lg transition-colors"
            >
              {isSaving ? 'Saving...' : 'Save Settings'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

