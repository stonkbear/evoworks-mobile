/**
 * Ghost Flow Integration Hook
 * React hook for managing Ghost Flow connection and sync
 */

'use client'

import { useState, useCallback } from 'react'
import type { GhostFlowListingType } from '@/lib/ghostflow/types'

interface GhostFlowAsset {
  id: string
  type: GhostFlowListingType
  name: string
  description?: string
  nodeCount?: number
  agentCount?: number
  model?: string
  synced: boolean
  lastModified?: string
}

interface SyncStatus {
  connected: boolean
  orgId?: string
  assets: GhostFlowAsset[]
  existingListings: Array<{
    ghostFlowId: string | null
    ghostFlowType: string | null
    name: string
    status: string
  }>
}

export function useGhostFlow() {
  const [isLoading, setIsLoading] = useState(false)
  const [isSyncing, setIsSyncing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [syncStatus, setSyncStatus] = useState<SyncStatus | null>(null)

  /**
   * Start OAuth flow to connect Ghost Flow account
   */
  const connectGhostFlow = useCallback(async (returnUrl?: string) => {
    setIsLoading(true)
    setError(null)

    try {
      const params = new URLSearchParams({ action: 'start' })
      if (returnUrl) params.set('returnUrl', returnUrl)

      const response = await fetch(`/api/ghostflow/oauth?${params}`)
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to start OAuth')
      }

      // Redirect to Ghost Flow OAuth
      window.location.href = data.url
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Connection failed'
      setError(message)
      throw err
    } finally {
      setIsLoading(false)
    }
  }, [])

  /**
   * Check Ghost Flow connection status
   */
  const checkConnection = useCallback(async () => {
    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/ghostflow/oauth')
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to check connection')
      }

      return {
        connected: data.connected,
        orgId: data.ghostFlowOrgId,
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Check failed'
      setError(message)
      return { connected: false }
    } finally {
      setIsLoading(false)
    }
  }, [])

  /**
   * Disconnect Ghost Flow account
   */
  const disconnectGhostFlow = useCallback(async () => {
    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/ghostflow/oauth', {
        method: 'DELETE',
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Disconnect failed')
      }

      setSyncStatus(null)
      return true
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Disconnect failed'
      setError(message)
      return false
    } finally {
      setIsLoading(false)
    }
  }, [])

  /**
   * Fetch syncable assets from Ghost Flow
   */
  const fetchAssets = useCallback(async () => {
    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/ghostflow/sync')
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch assets')
      }

      setSyncStatus(data)
      return data as SyncStatus
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Fetch failed'
      setError(message)
      throw err
    } finally {
      setIsLoading(false)
    }
  }, [])

  /**
   * Import selected assets from Ghost Flow
   */
  const importAssets = useCallback(async (assetIds: string[], assetType: string) => {
    setIsSyncing(true)
    setError(null)

    try {
      const response = await fetch('/api/ghostflow/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ assetIds, assetType }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Import failed')
      }

      // Refresh assets list
      await fetchAssets()

      return {
        imported: data.imported as string[],
        errors: data.errors as Array<{ id: string; error: string }>,
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Import failed'
      setError(message)
      throw err
    } finally {
      setIsSyncing(false)
    }
  }, [fetchAssets])

  return {
    isLoading,
    isSyncing,
    error,
    syncStatus,
    connectGhostFlow,
    checkConnection,
    disconnectGhostFlow,
    fetchAssets,
    importAssets,
  }
}

