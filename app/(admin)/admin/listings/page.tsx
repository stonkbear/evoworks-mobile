'use client'

/**
 * Admin Listings Management
 * Review, approve, and manage marketplace listings
 */

import { useState, useMemo } from 'react'
import Link from 'next/link'

type ListingType = 'AGENT' | 'WORKFLOW' | 'SWARM' | 'KNOWLEDGE_PACK' | 'TEMPLATE' | 'INTEGRATION'
type ListingStatus = 'ACTIVE' | 'PENDING' | 'REJECTED' | 'PAUSED' | 'ARCHIVED'

interface Listing {
  id: string
  slug: string
  name: string
  type: ListingType
  status: ListingStatus
  publisherName: string
  publisherId: string
  verificationLevel: 'NONE' | 'BASIC' | 'VERIFIED' | 'ENTERPRISE'
  viewCount: number
  installCount: number
  totalRevenue: number
  avgRating: number | null
  createdAt: string
  publishedAt: string | null
  rejectionReason: string | null
}

// Mock listings data
const mockListings: Listing[] = [
  { id: '1', slug: 'data-research-agent', name: 'Data Research Agent', type: 'AGENT', status: 'ACTIVE', publisherName: 'TechCorp AI', publisherId: 'pub-1', verificationLevel: 'VERIFIED', viewCount: 12450, installCount: 890, totalRevenue: 4450.50, avgRating: 4.8, createdAt: '2023-06-01T10:00:00Z', publishedAt: '2023-06-05T10:00:00Z', rejectionReason: null },
  { id: '2', slug: 'content-pipeline', name: 'Content Pipeline Workflow', type: 'WORKFLOW', status: 'ACTIVE', publisherName: 'ContentLab', publisherId: 'pub-2', verificationLevel: 'VERIFIED', viewCount: 8700, installCount: 450, totalRevenue: 13500, avgRating: 4.7, createdAt: '2023-07-15T14:00:00Z', publishedAt: '2023-07-20T09:00:00Z', rejectionReason: null },
  { id: '3', slug: 'customer-support-swarm', name: 'Customer Support Swarm', type: 'SWARM', status: 'PENDING', publisherName: 'SwarmLab', publisherId: 'pub-3', verificationLevel: 'NONE', viewCount: 0, installCount: 0, totalRevenue: 0, avgRating: null, createdAt: '2024-01-15T08:00:00Z', publishedAt: null, rejectionReason: null },
  { id: '4', slug: 'legal-analysis-agent', name: 'Legal Analysis Agent', type: 'AGENT', status: 'PENDING', publisherName: 'LegalAI', publisherId: 'pub-4', verificationLevel: 'BASIC', viewCount: 0, installCount: 0, totalRevenue: 0, avgRating: null, createdAt: '2024-01-14T16:30:00Z', publishedAt: null, rejectionReason: null },
  { id: '5', slug: 'sales-pipeline', name: 'Sales Pipeline Workflow', type: 'WORKFLOW', status: 'PENDING', publisherName: 'SalesFlow', publisherId: 'pub-5', verificationLevel: 'NONE', viewCount: 0, installCount: 0, totalRevenue: 0, avgRating: null, createdAt: '2024-01-14T12:00:00Z', publishedAt: null, rejectionReason: null },
  { id: '6', slug: 'code-review-swarm', name: 'Code Review Committee', type: 'SWARM', status: 'ACTIVE', publisherName: 'DevTools Inc', publisherId: 'pub-6', verificationLevel: 'VERIFIED', viewCount: 5200, installCount: 120, totalRevenue: 2400, avgRating: 4.9, createdAt: '2023-09-01T11:00:00Z', publishedAt: '2023-09-10T10:00:00Z', rejectionReason: null },
  { id: '7', slug: 'spammy-agent', name: 'Amazing Money Agent', type: 'AGENT', status: 'REJECTED', publisherName: 'Unknown', publisherId: 'pub-7', verificationLevel: 'NONE', viewCount: 0, installCount: 0, totalRevenue: 0, avgRating: null, createdAt: '2024-01-10T09:00:00Z', publishedAt: null, rejectionReason: 'Spam/scam content' },
  { id: '8', slug: 'medical-knowledge', name: 'Medical Research Database', type: 'KNOWLEDGE_PACK', status: 'ACTIVE', publisherName: 'MedAI Lab', publisherId: 'pub-8', verificationLevel: 'ENTERPRISE', viewCount: 3100, installCount: 85, totalRevenue: 8415, avgRating: 4.9, createdAt: '2023-10-20T15:00:00Z', publishedAt: '2023-10-25T10:00:00Z', rejectionReason: null },
]

const typeConfig: Record<ListingType, { icon: string; label: string; color: string }> = {
  AGENT: { icon: '🤖', label: 'Agent', color: '#3b82f6' },
  WORKFLOW: { icon: '⚡', label: 'Workflow', color: '#10b981' },
  SWARM: { icon: '🐝', label: 'Swarm', color: '#8b5cf6' },
  KNOWLEDGE_PACK: { icon: '📚', label: 'Knowledge', color: '#f59e0b' },
  TEMPLATE: { icon: '📋', label: 'Template', color: '#ef4444' },
  INTEGRATION: { icon: '🔌', label: 'Integration', color: '#06b6d4' },
}

const statusColors: Record<ListingStatus, string> = {
  ACTIVE: 'bg-green-500/20 text-green-400',
  PENDING: 'bg-yellow-500/20 text-yellow-400',
  REJECTED: 'bg-red-500/20 text-red-400',
  PAUSED: 'bg-blue-500/20 text-blue-400',
  ARCHIVED: 'bg-gray-500/20 text-gray-400',
}

const verificationColors: Record<string, string> = {
  NONE: 'text-[#525252]',
  BASIC: 'text-blue-400',
  VERIFIED: 'text-green-400',
  ENTERPRISE: 'text-purple-400',
}

export default function AdminListingsPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [typeFilter, setTypeFilter] = useState<ListingType | 'all'>('all')
  const [statusFilter, setStatusFilter] = useState<ListingStatus | 'all'>('all')
  const [showRejectModal, setShowRejectModal] = useState<string | null>(null)
  const [rejectReason, setRejectReason] = useState('')

  const filteredListings = useMemo(() => {
    return mockListings.filter(listing => {
      const matchesSearch = !searchQuery || 
        listing.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        listing.publisherName.toLowerCase().includes(searchQuery.toLowerCase())
      const matchesType = typeFilter === 'all' || listing.type === typeFilter
      const matchesStatus = statusFilter === 'all' || listing.status === statusFilter
      return matchesSearch && matchesType && matchesStatus
    })
  }, [searchQuery, typeFilter, statusFilter])

  const pendingCount = mockListings.filter(l => l.status === 'PENDING').length

  const handleApprove = (id: string) => {
    alert(`Approved listing ${id}`)
  }

  const handleReject = (id: string) => {
    alert(`Rejected listing ${id} with reason: ${rejectReason}`)
    setShowRejectModal(null)
    setRejectReason('')
  }

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white">Listings</h1>
          <p className="text-[#737373] mt-1">
            Review and manage marketplace listings
            {pendingCount > 0 && (
              <span className="ml-2 text-[#f59e0b]">({pendingCount} pending review)</span>
            )}
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
        <div className="bg-[#141414] border border-[#1f1f1f] rounded-lg p-4">
          <div className="text-sm text-[#737373]">Total</div>
          <div className="text-xl font-bold text-white">{mockListings.length}</div>
        </div>
        <div className="bg-[#141414] border border-green-500/20 rounded-lg p-4">
          <div className="text-sm text-green-400">Active</div>
          <div className="text-xl font-bold text-white">{mockListings.filter(l => l.status === 'ACTIVE').length}</div>
        </div>
        <div className="bg-[#141414] border border-yellow-500/20 rounded-lg p-4">
          <div className="text-sm text-yellow-400">Pending</div>
          <div className="text-xl font-bold text-white">{pendingCount}</div>
        </div>
        <div className="bg-[#141414] border border-red-500/20 rounded-lg p-4">
          <div className="text-sm text-red-400">Rejected</div>
          <div className="text-xl font-bold text-white">{mockListings.filter(l => l.status === 'REJECTED').length}</div>
        </div>
        <div className="bg-[#141414] border border-[#1f1f1f] rounded-lg p-4">
          <div className="text-sm text-[#737373]">Total Revenue</div>
          <div className="text-xl font-bold text-[#10b981]">${mockListings.reduce((sum, l) => sum + l.totalRevenue, 0).toLocaleString()}</div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-[#141414] border border-[#1f1f1f] rounded-xl p-4 mb-6">
        <div className="flex flex-wrap gap-4">
          {/* Search */}
          <div className="flex-1 min-w-[200px]">
            <input
              type="text"
              placeholder="Search by name or publisher..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-4 py-2 bg-[#0a0a0a] border border-[#1f1f1f] rounded-lg text-white placeholder-[#525252] focus:border-[#ff6b35] focus:outline-none"
            />
          </div>

          {/* Type Filter */}
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value as ListingType | 'all')}
            className="px-4 py-2 bg-[#0a0a0a] border border-[#1f1f1f] rounded-lg text-white focus:border-[#ff6b35] focus:outline-none"
          >
            <option value="all">All Types</option>
            {Object.entries(typeConfig).map(([type, config]) => (
              <option key={type} value={type}>{config.icon} {config.label}</option>
            ))}
          </select>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as ListingStatus | 'all')}
            className="px-4 py-2 bg-[#0a0a0a] border border-[#1f1f1f] rounded-lg text-white focus:border-[#ff6b35] focus:outline-none"
          >
            <option value="all">All Status</option>
            <option value="ACTIVE">Active</option>
            <option value="PENDING">Pending</option>
            <option value="REJECTED">Rejected</option>
            <option value="PAUSED">Paused</option>
            <option value="ARCHIVED">Archived</option>
          </select>
        </div>
      </div>

      {/* Listings Table */}
      <div className="bg-[#141414] border border-[#1f1f1f] rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-left text-sm text-[#737373] border-b border-[#1f1f1f]">
                <th className="px-6 py-4 font-medium">Listing</th>
                <th className="px-6 py-4 font-medium">Type</th>
                <th className="px-6 py-4 font-medium">Publisher</th>
                <th className="px-6 py-4 font-medium">Status</th>
                <th className="px-6 py-4 font-medium">Verification</th>
                <th className="px-6 py-4 font-medium text-right">Stats</th>
                <th className="px-6 py-4 font-medium">Created</th>
                <th className="px-6 py-4 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1f1f1f]">
              {filteredListings.map((listing) => (
                <tr key={listing.id} className="hover:bg-[#1f1f1f]/50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="font-medium text-white">{listing.name}</div>
                    <div className="text-sm text-[#525252]">/{listing.slug}</div>
                  </td>
                  <td className="px-6 py-4">
                    <span 
                      className="px-2 py-1 rounded text-xs font-medium inline-flex items-center gap-1"
                      style={{ 
                        backgroundColor: `${typeConfig[listing.type].color}20`,
                        color: typeConfig[listing.type].color 
                      }}
                    >
                      {typeConfig[listing.type].icon} {typeConfig[listing.type].label}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <Link 
                      href={`/admin/publishers/${listing.publisherId}`}
                      className="text-[#ff6b35] hover:underline"
                    >
                      {listing.publisherName}
                    </Link>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded text-xs font-medium ${statusColors[listing.status]}`}>
                      {listing.status}
                    </span>
                    {listing.rejectionReason && (
                      <div className="text-xs text-red-400 mt-1">{listing.rejectionReason}</div>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`text-sm font-medium ${verificationColors[listing.verificationLevel]}`}>
                      {listing.verificationLevel === 'VERIFIED' && '✓ '}
                      {listing.verificationLevel === 'ENTERPRISE' && '★ '}
                      {listing.verificationLevel}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="text-sm text-[#a3a3a3]">
                      {listing.viewCount.toLocaleString()} views
                    </div>
                    <div className="text-sm text-[#10b981]">
                      ${listing.totalRevenue.toLocaleString()}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-[#737373] text-sm">
                    {new Date(listing.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex gap-2">
                      {listing.status === 'PENDING' ? (
                        <>
                          <button
                            onClick={() => handleApprove(listing.id)}
                            className="px-3 py-1 bg-green-500/20 text-green-400 text-sm rounded-lg hover:bg-green-500/30 transition-colors"
                          >
                            Approve
                          </button>
                          <button
                            onClick={() => setShowRejectModal(listing.id)}
                            className="px-3 py-1 bg-red-500/20 text-red-400 text-sm rounded-lg hover:bg-red-500/30 transition-colors"
                          >
                            Reject
                          </button>
                        </>
                      ) : (
                        <>
                          <Link
                            href={`/listing/${listing.slug}`}
                            className="text-[#ff6b35] hover:underline text-sm"
                          >
                            View
                          </Link>
                          <button className="text-[#737373] hover:text-white text-sm">
                            Edit
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Empty State */}
        {filteredListings.length === 0 && (
          <div className="px-6 py-12 text-center text-[#525252]">
            <div className="text-4xl mb-3">📦</div>
            <p>No listings found</p>
          </div>
        )}
      </div>

      {/* Reject Modal */}
      {showRejectModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/80" onClick={() => setShowRejectModal(null)} />
          <div className="relative w-full max-w-md bg-[#141414] border border-[#1f1f1f] rounded-2xl p-6">
            <h2 className="text-xl font-bold text-white mb-4">Reject Listing</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-[#a3a3a3] mb-2">
                  Rejection Reason
                </label>
                <select
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  className="w-full px-4 py-3 bg-[#0a0a0a] border border-[#1f1f1f] rounded-lg text-white focus:border-[#ff6b35] focus:outline-none"
                >
                  <option value="">Select a reason...</option>
                  <option value="Spam/scam content">Spam/scam content</option>
                  <option value="Violates terms of service">Violates terms of service</option>
                  <option value="Incomplete or low quality">Incomplete or low quality</option>
                  <option value="Duplicate listing">Duplicate listing</option>
                  <option value="Inappropriate content">Inappropriate content</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => setShowRejectModal(null)}
                  className="flex-1 px-4 py-3 bg-[#1f1f1f] hover:bg-[#2a2a2a] text-white rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleReject(showRejectModal)}
                  disabled={!rejectReason}
                  className="flex-1 px-4 py-3 bg-red-500 hover:bg-red-600 disabled:bg-red-500/50 disabled:cursor-not-allowed text-white font-semibold rounded-lg transition-colors"
                >
                  Reject Listing
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

