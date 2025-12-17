'use client'

import { useState, useEffect } from 'react'
import { useGhostFlow } from '@/lib/hooks/useGhostFlow'

const TYPE_ICONS: Record<string, string> = {
  automation: '⚡',
  agent: '🤖',
  swarm: '🐝',
  'knowledge-pack': '📚',
}

const TYPE_COLORS: Record<string, string> = {
  automation: 'from-cyan-500 to-blue-500',
  agent: 'from-violet-500 to-purple-500',
  swarm: 'from-amber-500 to-orange-500',
  'knowledge-pack': 'from-emerald-500 to-teal-500',
}

interface GhostFlowAssetPickerProps {
  onImport?: (imported: string[]) => void
  className?: string
}

export function GhostFlowAssetPicker({ onImport, className }: GhostFlowAssetPickerProps) {
  const {
    isLoading,
    isSyncing,
    error,
    syncStatus,
    fetchAssets,
    importAssets,
  } = useGhostFlow()

  const [selectedAssets, setSelectedAssets] = useState<Set<string>>(new Set())
  const [activeTab, setActiveTab] = useState<string>('automation')

  useEffect(() => {
    fetchAssets()
  }, [fetchAssets])

  const toggleAsset = (id: string) => {
    setSelectedAssets((prev) => {
      const next = new Set(prev)
      if (next.has(id)) {
        next.delete(id)
      } else {
        next.add(id)
      }
      return next
    })
  }

  const selectAll = () => {
    const tabAssets = syncStatus?.assets.filter(a => a.type === activeTab) || []
    const unsyncedIds = tabAssets.filter(a => !a.synced).map(a => a.id)
    setSelectedAssets(new Set(unsyncedIds))
  }

  const deselectAll = () => {
    setSelectedAssets(new Set())
  }

  const handleImport = async () => {
    if (selectedAssets.size === 0) return

    try {
      const result = await importAssets(Array.from(selectedAssets), activeTab)
      setSelectedAssets(new Set())
      onImport?.(result.imported)
    } catch {
      // Error handled by hook
    }
  }

  if (!syncStatus?.connected) {
    return (
      <div className={`bg-[#111] border border-[#222] rounded-xl p-6 text-center ${className || ''}`}>
        <div className="text-[#666] mb-2">Ghost Flow not connected</div>
        <p className="text-[#444] text-sm">Connect your account to import assets</p>
      </div>
    )
  }

  const tabCounts = {
    automation: syncStatus.assets.filter(a => a.type === 'automation').length,
    agent: syncStatus.assets.filter(a => a.type === 'agent').length,
    swarm: syncStatus.assets.filter(a => a.type === 'swarm').length,
    'knowledge-pack': syncStatus.assets.filter(a => a.type === 'knowledge-pack').length,
  }

  const currentAssets = syncStatus.assets.filter(a => a.type === activeTab)
  const selectedInTab = currentAssets.filter(a => selectedAssets.has(a.id)).length

  return (
    <div className={`bg-[#111] border border-[#222] rounded-xl overflow-hidden ${className || ''}`}>
      {/* Header */}
      <div className="p-4 border-b border-[#222] flex items-center justify-between">
        <div>
          <h3 className="text-white font-semibold">Import from Ghost Flow</h3>
          <p className="text-[#666] text-sm">
            {syncStatus.assets.length} assets available • {syncStatus.existingListings.length} already synced
          </p>
        </div>
        <button
          onClick={() => fetchAssets()}
          disabled={isLoading}
          className="p-2 rounded-lg hover:bg-[#1a1a1a] text-[#888] hover:text-white transition-colors disabled:opacity-50"
          title="Refresh"
        >
          <svg className={`w-5 h-5 ${isLoading ? 'animate-spin' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
        </button>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-[#222]">
        {Object.entries(tabCounts).map(([type, count]) => (
          <button
            key={type}
            onClick={() => setActiveTab(type)}
            className={`flex-1 px-4 py-3 text-sm font-medium transition-colors relative ${
              activeTab === type
                ? 'text-white bg-[#1a1a1a]'
                : 'text-[#666] hover:text-white hover:bg-[#0d0d0d]'
            }`}
          >
            <span className="mr-1">{TYPE_ICONS[type]}</span>
            {type.charAt(0).toUpperCase() + type.slice(1).replace('-', ' ')}s
            {count > 0 && (
              <span className="ml-1.5 px-1.5 py-0.5 text-xs bg-[#222] rounded-full">{count}</span>
            )}
            {activeTab === type && (
              <div className={`absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r ${TYPE_COLORS[type]}`} />
            )}
          </button>
        ))}
      </div>

      {/* Selection Controls */}
      <div className="p-3 border-b border-[#222] flex items-center justify-between bg-[#0a0a0a]">
        <div className="text-sm text-[#666]">
          {selectedInTab > 0 ? `${selectedInTab} selected` : 'No selection'}
        </div>
        <div className="flex gap-2">
          <button
            onClick={selectAll}
            className="text-sm text-[#888] hover:text-white transition-colors"
          >
            Select All
          </button>
          <span className="text-[#333]">•</span>
          <button
            onClick={deselectAll}
            className="text-sm text-[#888] hover:text-white transition-colors"
          >
            Clear
          </button>
        </div>
      </div>

      {/* Asset List */}
      <div className="max-h-80 overflow-y-auto">
        {isLoading ? (
          <div className="p-8 text-center text-[#666]">
            <svg className="animate-spin w-6 h-6 mx-auto mb-2" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
            Loading assets...
          </div>
        ) : currentAssets.length === 0 ? (
          <div className="p-8 text-center text-[#666]">
            No {activeTab}s found in your Ghost Flow workspace
          </div>
        ) : (
          currentAssets.map((asset) => (
            <label
              key={asset.id}
              className={`flex items-center gap-4 p-4 border-b border-[#1a1a1a] cursor-pointer hover:bg-[#0d0d0d] transition-colors ${
                asset.synced ? 'opacity-50' : ''
              }`}
            >
              <input
                type="checkbox"
                checked={selectedAssets.has(asset.id)}
                onChange={() => toggleAsset(asset.id)}
                disabled={asset.synced}
                className="w-4 h-4 rounded border-[#333] bg-[#0a0a0a] text-violet-500 focus:ring-violet-500 focus:ring-offset-0 disabled:opacity-50"
              />
              <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${TYPE_COLORS[asset.type]} flex items-center justify-center text-lg`}>
                {TYPE_ICONS[asset.type]}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-white font-medium truncate">{asset.name}</div>
                <div className="text-[#666] text-sm truncate">
                  {asset.description || 
                   (asset.nodeCount ? `${asset.nodeCount} nodes` : '') ||
                   (asset.agentCount ? `${asset.agentCount} agents` : '') ||
                   (asset.model ? `Model: ${asset.model}` : '')}
                </div>
              </div>
              {asset.synced && (
                <span className="px-2 py-1 text-xs bg-emerald-500/20 text-emerald-400 rounded-full">
                  Synced
                </span>
              )}
            </label>
          ))
        )}
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-[#222] bg-[#0a0a0a]">
        {error && (
          <p className="text-red-400 text-sm mb-3">{error}</p>
        )}
        <button
          onClick={handleImport}
          disabled={selectedAssets.size === 0 || isSyncing}
          className="w-full px-4 py-3 bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-500 hover:to-fuchsia-500 text-white font-medium rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {isSyncing ? (
            <>
              <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              Importing...
            </>
          ) : (
            <>
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
              </svg>
              Import {selectedAssets.size > 0 ? `${selectedAssets.size} ` : ''}Selected
            </>
          )}
        </button>
      </div>
    </div>
  )
}

