'use client'

/**
 * Admin Transactions Management
 * Monitor and manage platform transactions
 */

import { useState, useMemo } from 'react'
import Link from 'next/link'

type TransactionStatus = 'COMPLETED' | 'PENDING' | 'FAILED' | 'REFUNDED'
type TransactionType = 'x402' | 'subscription' | 'one-time'

interface Transaction {
  id: string
  listingId: string
  listingName: string
  buyerEmail: string
  publisherName: string
  amount: number
  platformFee: number
  netAmount: number
  currency: string
  type: TransactionType
  status: TransactionStatus
  txHash: string | null
  createdAt: string
}

// Mock transactions
const mockTransactions: Transaction[] = [
  { id: 'tx-1', listingId: 'lst-1', listingName: 'Data Research Agent', buyerEmail: 'john@acme.com', publisherName: 'TechCorp AI', amount: 0.10, platformFee: 0.015, netAmount: 0.085, currency: 'USD', type: 'x402', status: 'COMPLETED', txHash: '0x1234...abcd', createdAt: '2024-01-15T10:45:00Z' },
  { id: 'tx-2', listingId: 'lst-2', listingName: 'Content Pipeline Workflow', buyerEmail: 'jane@startup.io', publisherName: 'ContentLab', amount: 29.99, platformFee: 4.50, netAmount: 25.49, currency: 'USD', type: 'subscription', status: 'COMPLETED', txHash: null, createdAt: '2024-01-15T10:30:00Z' },
  { id: 'tx-3', listingId: 'lst-3', listingName: 'Code Review Committee', buyerEmail: 'bob@dev.co', publisherName: 'DevTools Inc', amount: 0.15, platformFee: 0.0225, netAmount: 0.1275, currency: 'USD', type: 'x402', status: 'COMPLETED', txHash: '0x5678...efgh', createdAt: '2024-01-15T10:15:00Z' },
  { id: 'tx-4', listingId: 'lst-4', listingName: 'Legal Knowledge Pack', buyerEmail: 'alice@legal.co', publisherName: 'LegalAI', amount: 99.00, platformFee: 14.85, netAmount: 84.15, currency: 'USD', type: 'subscription', status: 'PENDING', txHash: null, createdAt: '2024-01-15T10:00:00Z' },
  { id: 'tx-5', listingId: 'lst-1', listingName: 'Data Research Agent', buyerEmail: 'charlie@enterprise.com', publisherName: 'TechCorp AI', amount: 0.10, platformFee: 0.015, netAmount: 0.085, currency: 'USD', type: 'x402', status: 'FAILED', txHash: null, createdAt: '2024-01-15T09:45:00Z' },
  { id: 'tx-6', listingId: 'lst-5', listingName: 'SaaS Customer Success Bot', buyerEmail: 'diana@corp.net', publisherName: 'TemplateHQ', amount: 199.00, platformFee: 29.85, netAmount: 169.15, currency: 'USD', type: 'one-time', status: 'COMPLETED', txHash: null, createdAt: '2024-01-15T09:30:00Z' },
  { id: 'tx-7', listingId: 'lst-2', listingName: 'Content Pipeline Workflow', buyerEmail: 'eve@agency.io', publisherName: 'ContentLab', amount: 29.99, platformFee: 4.50, netAmount: 25.49, currency: 'USD', type: 'subscription', status: 'REFUNDED', txHash: null, createdAt: '2024-01-14T18:00:00Z' },
]

const statusColors: Record<TransactionStatus, string> = {
  COMPLETED: 'bg-green-500/20 text-green-400',
  PENDING: 'bg-yellow-500/20 text-yellow-400',
  FAILED: 'bg-red-500/20 text-red-400',
  REFUNDED: 'bg-purple-500/20 text-purple-400',
}

const typeLabels: Record<TransactionType, string> = {
  x402: 'x402 Micropayment',
  subscription: 'Subscription',
  'one-time': 'One-Time',
}

export default function AdminTransactionsPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<TransactionStatus | 'all'>('all')
  const [typeFilter, setTypeFilter] = useState<TransactionType | 'all'>('all')

  const filteredTransactions = useMemo(() => {
    return mockTransactions.filter(tx => {
      const matchesSearch = !searchQuery || 
        tx.listingName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        tx.buyerEmail.toLowerCase().includes(searchQuery.toLowerCase()) ||
        tx.id.toLowerCase().includes(searchQuery.toLowerCase())
      const matchesStatus = statusFilter === 'all' || tx.status === statusFilter
      const matchesType = typeFilter === 'all' || tx.type === typeFilter
      return matchesSearch && matchesStatus && matchesType
    })
  }, [searchQuery, statusFilter, typeFilter])

  const totals = useMemo(() => ({
    volume: mockTransactions.filter(tx => tx.status === 'COMPLETED').reduce((sum, tx) => sum + tx.amount, 0),
    fees: mockTransactions.filter(tx => tx.status === 'COMPLETED').reduce((sum, tx) => sum + tx.platformFee, 0),
    count: mockTransactions.filter(tx => tx.status === 'COMPLETED').length,
  }), [])

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white">Transactions</h1>
        <p className="text-[#737373] mt-1">Monitor platform transactions and revenue</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-[#141414] border border-[#1f1f1f] rounded-lg p-4">
          <div className="text-sm text-[#737373]">Total Volume (Today)</div>
          <div className="text-2xl font-bold text-white">${totals.volume.toFixed(2)}</div>
        </div>
        <div className="bg-[#141414] border border-[#1f1f1f] rounded-lg p-4">
          <div className="text-sm text-[#737373]">Platform Fees</div>
          <div className="text-2xl font-bold text-[#10b981]">${totals.fees.toFixed(2)}</div>
        </div>
        <div className="bg-[#141414] border border-[#1f1f1f] rounded-lg p-4">
          <div className="text-sm text-[#737373]">Completed</div>
          <div className="text-2xl font-bold text-white">{totals.count}</div>
        </div>
        <div className="bg-[#141414] border border-[#1f1f1f] rounded-lg p-4">
          <div className="text-sm text-[#737373]">Pending</div>
          <div className="text-2xl font-bold text-yellow-400">
            {mockTransactions.filter(tx => tx.status === 'PENDING').length}
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-[#141414] border border-[#1f1f1f] rounded-xl p-4 mb-6">
        <div className="flex flex-wrap gap-4">
          <div className="flex-1 min-w-[200px]">
            <input
              type="text"
              placeholder="Search by listing, buyer, or ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-4 py-2 bg-[#0a0a0a] border border-[#1f1f1f] rounded-lg text-white placeholder-[#525252] focus:border-[#ff6b35] focus:outline-none"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as TransactionStatus | 'all')}
            className="px-4 py-2 bg-[#0a0a0a] border border-[#1f1f1f] rounded-lg text-white focus:border-[#ff6b35] focus:outline-none"
          >
            <option value="all">All Status</option>
            <option value="COMPLETED">Completed</option>
            <option value="PENDING">Pending</option>
            <option value="FAILED">Failed</option>
            <option value="REFUNDED">Refunded</option>
          </select>
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value as TransactionType | 'all')}
            className="px-4 py-2 bg-[#0a0a0a] border border-[#1f1f1f] rounded-lg text-white focus:border-[#ff6b35] focus:outline-none"
          >
            <option value="all">All Types</option>
            <option value="x402">x402 Micropayment</option>
            <option value="subscription">Subscription</option>
            <option value="one-time">One-Time</option>
          </select>
        </div>
      </div>

      {/* Transactions Table */}
      <div className="bg-[#141414] border border-[#1f1f1f] rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-left text-sm text-[#737373] border-b border-[#1f1f1f]">
                <th className="px-6 py-4 font-medium">ID</th>
                <th className="px-6 py-4 font-medium">Listing</th>
                <th className="px-6 py-4 font-medium">Buyer</th>
                <th className="px-6 py-4 font-medium">Type</th>
                <th className="px-6 py-4 font-medium text-right">Amount</th>
                <th className="px-6 py-4 font-medium text-right">Fee</th>
                <th className="px-6 py-4 font-medium">Status</th>
                <th className="px-6 py-4 font-medium">Date</th>
                <th className="px-6 py-4 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1f1f1f]">
              {filteredTransactions.map((tx) => (
                <tr key={tx.id} className="hover:bg-[#1f1f1f]/50 transition-colors">
                  <td className="px-6 py-4">
                    <span className="font-mono text-sm text-[#737373]">{tx.id}</span>
                    {tx.txHash && (
                      <a 
                        href={`https://basescan.org/tx/${tx.txHash}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block text-xs text-[#ff6b35] hover:underline"
                      >
                        {tx.txHash}
                      </a>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <div className="font-medium text-white">{tx.listingName}</div>
                    <div className="text-sm text-[#525252]">by {tx.publisherName}</div>
                  </td>
                  <td className="px-6 py-4 text-[#a3a3a3]">{tx.buyerEmail}</td>
                  <td className="px-6 py-4">
                    <span className={`text-sm ${tx.type === 'x402' ? 'text-[#ff6b35]' : 'text-[#737373]'}`}>
                      {typeLabels[tx.type]}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right font-medium text-white">
                    ${tx.amount.toFixed(2)}
                  </td>
                  <td className="px-6 py-4 text-right text-[#10b981]">
                    ${tx.platformFee.toFixed(2)}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded text-xs font-medium ${statusColors[tx.status]}`}>
                      {tx.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-[#737373] text-sm">
                    {new Date(tx.createdAt).toLocaleString()}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex gap-2">
                      <button className="text-[#ff6b35] hover:underline text-sm">View</button>
                      {tx.status === 'COMPLETED' && (
                        <button className="text-purple-400 hover:underline text-sm">Refund</button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredTransactions.length === 0 && (
          <div className="px-6 py-12 text-center text-[#525252]">
            <div className="text-4xl mb-3">💳</div>
            <p>No transactions found</p>
          </div>
        )}
      </div>
    </div>
  )
}

