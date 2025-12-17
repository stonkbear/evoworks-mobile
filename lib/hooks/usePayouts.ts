'use client'

/**
 * Payouts Hook
 * Manage publisher payouts and earnings
 */

import { useState, useEffect, useCallback } from 'react'

// Types
export type PayoutMethod = 'USDC' | 'ETH' | 'STRIPE' | 'PAYPAL'
export type PayoutStatus = 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED'

export interface Payout {
  id: string
  grossAmount: number
  platformFee: number
  netAmount: number
  currency: string
  method: PayoutMethod
  destinationAddress?: string
  status: PayoutStatus
  txHash?: string
  stripePayoutId?: string
  periodStart: string
  periodEnd: string
  processedAt?: string
  createdAt: string
}

export interface PayoutStats {
  totalEarnings: number
  totalPaidOut: number
  pendingPayouts: number
  availableBalance: number
  transactionCount: number
  thisMonthEarnings: number
  platformFeeRate: number
  minimumPayout: number
}

export interface PayoutSettings {
  preferredMethod: PayoutMethod
  usdcAddress?: string
  ethAddress?: string
  stripeConnectId?: string
  paypalEmail?: string
  autoPayoutEnabled: boolean
  autoPayoutThreshold: number
}

export interface UsePayoutsResult {
  payouts: Payout[]
  stats: PayoutStats | null
  settings: PayoutSettings | null
  loading: boolean
  error: string | null
  requestPayout: (method: PayoutMethod, destinationAddress?: string) => Promise<boolean>
  cancelPayout: (id: string) => Promise<boolean>
  updateSettings: (settings: Partial<PayoutSettings>) => Promise<boolean>
  refetch: () => void
}

export function usePayouts(): UsePayoutsResult {
  const [payouts, setPayouts] = useState<Payout[]>([])
  const [stats, setStats] = useState<PayoutStats | null>(null)
  const [settings, setSettings] = useState<PayoutSettings | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Fetch payouts and stats
  const fetchPayouts = useCallback(async () => {
    setLoading(true)
    setError(null)

    try {
      const [payoutsRes, settingsRes] = await Promise.all([
        fetch('/api/payouts'),
        fetch('/api/payouts/settings'),
      ])

      if (!payoutsRes.ok) {
        throw new Error('Failed to fetch payouts')
      }

      const payoutsData = await payoutsRes.json()
      setPayouts(payoutsData.payouts || [])
      setStats(payoutsData.stats || null)

      if (settingsRes.ok) {
        const settingsData = await settingsRes.json()
        setSettings(settingsData)
      }
    } catch (err) {
      console.error('Error fetching payouts:', err)
      setError(err instanceof Error ? err.message : 'Failed to fetch payouts')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchPayouts()
  }, [fetchPayouts])

  // Request a new payout
  const requestPayout = useCallback(async (
    method: PayoutMethod,
    destinationAddress?: string
  ): Promise<boolean> => {
    try {
      const res = await fetch('/api/payouts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ method, destinationAddress }),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error || 'Failed to request payout')
        return false
      }

      // Refresh payouts list
      await fetchPayouts()
      return true
    } catch (err) {
      console.error('Error requesting payout:', err)
      setError(err instanceof Error ? err.message : 'Failed to request payout')
      return false
    }
  }, [fetchPayouts])

  // Cancel a pending payout
  const cancelPayout = useCallback(async (id: string): Promise<boolean> => {
    try {
      const res = await fetch(`/api/payouts/${id}`, {
        method: 'DELETE',
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error || 'Failed to cancel payout')
        return false
      }

      // Refresh payouts list
      await fetchPayouts()
      return true
    } catch (err) {
      console.error('Error cancelling payout:', err)
      setError(err instanceof Error ? err.message : 'Failed to cancel payout')
      return false
    }
  }, [fetchPayouts])

  // Update payout settings
  const updateSettings = useCallback(async (
    newSettings: Partial<PayoutSettings>
  ): Promise<boolean> => {
    try {
      const res = await fetch('/api/payouts/settings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newSettings),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error || 'Failed to update settings')
        return false
      }

      setSettings(data.settings)
      return true
    } catch (err) {
      console.error('Error updating settings:', err)
      setError(err instanceof Error ? err.message : 'Failed to update settings')
      return false
    }
  }, [])

  return {
    payouts,
    stats,
    settings,
    loading,
    error,
    requestPayout,
    cancelPayout,
    updateSettings,
    refetch: fetchPayouts,
  }
}

export default usePayouts

