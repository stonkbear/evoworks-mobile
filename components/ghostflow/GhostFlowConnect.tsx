'use client'

import { useState, useEffect } from 'react'
import { useGhostFlow } from '@/lib/hooks/useGhostFlow'

interface GhostFlowConnectProps {
  onConnect?: () => void
  onDisconnect?: () => void
  className?: string
}

export function GhostFlowConnect({ onConnect, onDisconnect, className }: GhostFlowConnectProps) {
  const {
    isLoading,
    error,
    connectGhostFlow,
    checkConnection,
    disconnectGhostFlow,
  } = useGhostFlow()

  const [connected, setConnected] = useState(false)
  const [orgId, setOrgId] = useState<string | null>(null)

  useEffect(() => {
    checkConnection().then((status) => {
      setConnected(status.connected)
      setOrgId(status.orgId || null)
    })
  }, [checkConnection])

  const handleConnect = async () => {
    try {
      await connectGhostFlow(window.location.pathname)
      onConnect?.()
    } catch {
      // Error handled by hook
    }
  }

  const handleDisconnect = async () => {
    const success = await disconnectGhostFlow()
    if (success) {
      setConnected(false)
      setOrgId(null)
      onDisconnect?.()
    }
  }

  if (connected) {
    return (
      <div className={`bg-[#0d1f17] border border-emerald-500/30 rounded-xl p-5 ${className || ''}`}>
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-lg bg-emerald-500/20 flex items-center justify-center">
            <svg className="w-5 h-5 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <div>
            <h3 className="text-white font-medium">Ghost Flow Connected</h3>
            <p className="text-emerald-400/70 text-sm">Organization: {orgId}</p>
          </div>
        </div>

        <div className="flex gap-2">
          <button
            onClick={handleDisconnect}
            disabled={isLoading}
            className="px-4 py-2 text-sm font-medium text-red-400 bg-red-500/10 hover:bg-red-500/20 rounded-lg transition-colors disabled:opacity-50"
          >
            {isLoading ? 'Disconnecting...' : 'Disconnect'}
          </button>
        </div>

        {error && (
          <p className="mt-3 text-red-400 text-sm">{error}</p>
        )}
      </div>
    )
  }

  return (
    <div className={`bg-[#111] border border-[#222] rounded-xl p-5 ${className || ''}`}>
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-lg bg-violet-500/20 flex items-center justify-center">
          <svg className="w-5 h-5 text-violet-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
          </svg>
        </div>
        <div>
          <h3 className="text-white font-medium">Connect Ghost Flow</h3>
          <p className="text-[#888] text-sm">Import your agents, workflows & swarms</p>
        </div>
      </div>

      <p className="text-[#666] text-sm mb-4">
        Connect your Ghost Flow account to publish your AI creations directly to the Evoworks marketplace. 
        Your automations, agents, and swarms will be available for listing.
      </p>

      <button
        onClick={handleConnect}
        disabled={isLoading}
        className="w-full px-4 py-3 bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-500 hover:to-fuchsia-500 text-white font-medium rounded-lg transition-all disabled:opacity-50 flex items-center justify-center gap-2"
      >
        {isLoading ? (
          <>
            <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
            Connecting...
          </>
        ) : (
          <>
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
            </svg>
            Connect Ghost Flow
          </>
        )}
      </button>

      {error && (
        <p className="mt-3 text-red-400 text-sm">{error}</p>
      )}
    </div>
  )
}

