'use client'

/**
 * Admin Payouts Management
 * Process and manage publisher payouts
 */

import { useState, useMemo } from 'react'

type PayoutStatus = 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED'
type PayoutMethod = 'USDC' | 'ETH' | 'STRIPE' | 'PAYPAL'

interface Payout {
  id: string
  publisherId: string
  publisherName: string
  publisherEmail: string
  grossAmount: number
  platformFee: number
  netAmount: number
  method: PayoutMethod
  destinationAddress: string | null
  status: PayoutStatus
  txHash: string | null
  requestedAt: string
  processedAt: string | null
}

// Mock payouts
const mockPayouts: Payout[] = [
  { id: 'po-1', publisherId: 'pub-1', publisherName: 'TechCorp AI', publisherEmail: 'john@techcorp.ai', grossAmount: 1500.00, platformFee: 225.00, netAmount: 1275.00, method: 'USDC', destinationAddress: '0x1234...abcd', status: 'PENDING', txHash: null, requestedAt: '2024-01-15T08:00:00Z', processedAt: null },
  { id: 'po-2', publisherId: 'pub-2', publisherName: 'ContentLab', publisherEmail: 'team@contentlab.io', grossAmount: 2500.00, platformFee: 375.00, netAmount: 2125.00, method: 'STRIPE', destinationAddress: null, status: 'PROCESSING', txHash: null, requestedAt: '2024-01-14T16:00:00Z', processedAt: null },
  { id: 'po-3', publisherId: 'pub-3', publisherName: 'DevTools Inc', publisherEmail: 'billing@devtools.io', grossAmount: 890.00, platformFee: 133.50, netAmount: 756.50, method: 'USDC', destinationAddress: '0x5678...efgh', status: 'COMPLETED', txHash: '0xabc...123', requestedAt: '2024-01-13T10:00:00Z', processedAt: '2024-01-13T12:30:00Z' },
  { id: 'po-4', publisherId: 'pub-4', publisherName: 'SwarmLab', publisherEmail: 'finance@swarmlab.ai', grossAmount: 450.00, platformFee: 67.50, netAmount: 382.50, method: 'ETH', destinationAddress: '0x9abc...def0', status: 'FAILED', txHash: null, requestedAt: '2024-01-12T14:00:00Z', processedAt: null },
  { id: 'po-5', publisherId: 'pub-5', publisherName: 'LegalAI', publisherEmail: 'accounts@legalai.co', grossAmount: 3200.00, platformFee: 480.00, netAmount: 2720.00, method: 'PAYPAL', destinationAddress: 'accounts@legalai.co', status: 'PENDING', txHash: null, requestedAt: '2024-01-15T06:00:00Z', processedAt: null },
]

const statusColors: Record<PayoutStatus, string> = {
  PENDING: 'bg-yellow-500/20 text-yellow-400',
  PROCESSING: 'bg-blue-500/20 text-blue-400',
  COMPLETED: 'bg-green-500/20 text-green-400',
  FAILED: 'bg-red-500/20 text-red-400',
}

const methodIcons: Record<PayoutMethod, string> = {
  USDC: '💵',
  ETH: '⟠',
  STRIPE: '💳',
  PAYPAL: '🅿️',
}

export default function AdminPayoutsPage() {
  const [statusFilter, setStatusFilter] = useState<PayoutStatus | 'all'>('all')
  const [selectedPayouts, setSelectedPayouts] = useState<Set<string>>(new Set())

  const filteredPayouts = useMemo(() => {
    return mockPayouts.filter(payout => 
      statusFilter === 'all' || payout.status === statusFilter
    )
  }, [statusFilter])

  const pendingTotal = mockPayouts
    .filter(p => p.status === 'PENDING')
    .reduce((sum, p) => sum + p.netAmount, 0)

  const toggleSelect = (id: string) => {
    const newSelected = new Set(selectedPayouts)
    if (newSelected.has(id)) {
      newSelected.delete(id)
    } else {
      newSelected.add(id)
    }
    setSelectedPayouts(newSelected)
  }

  const handleProcess = (id: string) => {
    alert(`Processing payout ${id}`)
  }

  const handleBulkProcess = () => {
    alert(`Processing ${selectedPayouts.size} payouts`)
    setSelectedPayouts(new Set())
  }

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white">Payouts</h1>
          <p className="text-[#737373] mt-1">Process and manage publisher payouts</p>
        </div>
        {selectedPayouts.size > 0 && (
          <button
            onClick={handleBulkProcess}
            className="px-4 py-2 bg-[#ff6b35] hover:bg-[#ff8555] text-[#0a0a0a] font-semibold rounded-lg transition-colors"
          >
            Process {selectedPayouts.size} Payouts
          </button>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-[#141414] border border-yellow-500/20 rounded-lg p-4">
          <div className="text-sm text-yellow-400">Pending</div>
          <div className="text-2xl font-bold text-white">
            {mockPayouts.filter(p => p.status === 'PENDING').length}
          </div>
          <div className="text-sm text-[#737373]">${pendingTotal.toLocaleString()} value</div>
        </div>
        <div className="bg-[#141414] border border-blue-500/20 rounded-lg p-4">
          <div className="text-sm text-blue-400">Processing</div>
          <div className="text-2xl font-bold text-white">
            {mockPayouts.filter(p => p.status === 'PROCESSING').length}
          </div>
        </div>
        <div className="bg-[#141414] border border-green-500/20 rounded-lg p-4">
          <div className="text-sm text-green-400">Completed (This Month)</div>
          <div className="text-2xl font-bold text-white">
            {mockPayouts.filter(p => p.status === 'COMPLETED').length}
          </div>
        </div>
        <div className="bg-[#141414] border border-red-500/20 rounded-lg p-4">
          <div className="text-sm text-red-400">Failed</div>
          <div className="text-2xl font-bold text-white">
            {mockPayouts.filter(p => p.status === 'FAILED').length}
          </div>
        </div>
      </div>

      {/* Filter */}
      <div className="flex gap-2 mb-6">
        {(['all', 'PENDING', 'PROCESSING', 'COMPLETED', 'FAILED'] as const).map((status) => (
          <button
            key={status}
            onClick={() => setStatusFilter(status)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              statusFilter === status
                ? 'bg-[#ff6b35] text-[#0a0a0a]'
                : 'bg-[#1f1f1f] text-[#737373] hover:text-white'
            }`}
          >
            {status === 'all' ? 'All' : status}
          </button>
        ))}
      </div>

      {/* Payouts Table */}
      <div className="bg-[#141414] border border-[#1f1f1f] rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-left text-sm text-[#737373] border-b border-[#1f1f1f]">
                <th className="px-6 py-4">
                  <input
                    type="checkbox"
                    checked={selectedPayouts.size === filteredPayouts.filter(p => p.status === 'PENDING').length && filteredPayouts.filter(p => p.status === 'PENDING').length > 0}
                    onChange={() => {
                      const pending = filteredPayouts.filter(p => p.status === 'PENDING')
                      if (selectedPayouts.size === pending.length) {
                        setSelectedPayouts(new Set())
                      } else {
                        setSelectedPayouts(new Set(pending.map(p => p.id)))
                      }
                    }}
                    className="rounded border-[#1f1f1f] bg-[#0a0a0a] text-[#ff6b35] focus:ring-[#ff6b35]"
                  />
                </th>
                <th className="px-6 py-4 font-medium">Publisher</th>
                <th className="px-6 py-4 font-medium">Method</th>
                <th className="px-6 py-4 font-medium text-right">Gross</th>
                <th className="px-6 py-4 font-medium text-right">Fee (15%)</th>
                <th className="px-6 py-4 font-medium text-right">Net</th>
                <th className="px-6 py-4 font-medium">Status</th>
                <th className="px-6 py-4 font-medium">Requested</th>
                <th className="px-6 py-4 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1f1f1f]">
              {filteredPayouts.map((payout) => (
                <tr key={payout.id} className="hover:bg-[#1f1f1f]/50 transition-colors">
                  <td className="px-6 py-4">
                    {payout.status === 'PENDING' && (
                      <input
                        type="checkbox"
                        checked={selectedPayouts.has(payout.id)}
                        onChange={() => toggleSelect(payout.id)}
                        className="rounded border-[#1f1f1f] bg-[#0a0a0a] text-[#ff6b35] focus:ring-[#ff6b35]"
                      />
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <div className="font-medium text-white">{payout.publisherName}</div>
                    <div className="text-sm text-[#525252]">{payout.publisherEmail}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <span className="text-xl">{methodIcons[payout.method]}</span>
                      <div>
                        <div className="text-sm text-white">{payout.method}</div>
                        {payout.destinationAddress && (
                          <div className="text-xs text-[#525252] font-mono">{payout.destinationAddress}</div>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right text-[#a3a3a3]">
                    ${payout.grossAmount.toFixed(2)}
                  </td>
                  <td className="px-6 py-4 text-right text-red-400">
                    -${payout.platformFee.toFixed(2)}
                  </td>
                  <td className="px-6 py-4 text-right font-medium text-[#10b981]">
                    ${payout.netAmount.toFixed(2)}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded text-xs font-medium ${statusColors[payout.status]}`}>
                      {payout.status}
                    </span>
                    {payout.txHash && (
                      <a 
                        href={`https://basescan.org/tx/${payout.txHash}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block text-xs text-[#ff6b35] hover:underline mt-1"
                      >
                        View tx
                      </a>
                    )}
                  </td>
                  <td className="px-6 py-4 text-[#737373] text-sm">
                    {new Date(payout.requestedAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex gap-2">
                      {payout.status === 'PENDING' && (
                        <button
                          onClick={() => handleProcess(payout.id)}
                          className="px-3 py-1 bg-green-500/20 text-green-400 text-sm rounded-lg hover:bg-green-500/30 transition-colors"
                        >
                          Process
                        </button>
                      )}
                      {payout.status === 'FAILED' && (
                        <button className="px-3 py-1 bg-yellow-500/20 text-yellow-400 text-sm rounded-lg hover:bg-yellow-500/30 transition-colors">
                          Retry
                        </button>
                      )}
                      <button className="text-[#737373] hover:text-white text-sm">
                        Details
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredPayouts.length === 0 && (
          <div className="px-6 py-12 text-center text-[#525252]">
            <div className="text-4xl mb-3">💸</div>
            <p>No payouts found</p>
          </div>
        )}
      </div>
    </div>
  )
}

