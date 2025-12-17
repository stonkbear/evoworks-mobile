'use client'

/**
 * Admin Publishers Management
 * View and manage platform publishers
 */

import { useState, useMemo } from 'react'
import Link from 'next/link'

interface Publisher {
  id: string
  displayName: string
  slug: string
  email: string
  verified: boolean
  totalListings: number
  totalInstalls: number
  totalRevenue: number
  avgRating: number | null
  payoutMethod: 'USDC' | 'ETH' | 'STRIPE' | 'PAYPAL'
  pendingPayout: number
  createdAt: string
}

const mockPublishers: Publisher[] = [
  { id: 'pub-1', displayName: 'TechCorp AI', slug: 'techcorp-ai', email: 'john@techcorp.ai', verified: true, totalListings: 8, totalInstalls: 2340, totalRevenue: 12500, avgRating: 4.8, payoutMethod: 'USDC', pendingPayout: 1250, createdAt: '2023-06-01T10:00:00Z' },
  { id: 'pub-2', displayName: 'ContentLab', slug: 'contentlab', email: 'team@contentlab.io', verified: true, totalListings: 5, totalInstalls: 1890, totalRevenue: 28500, avgRating: 4.7, payoutMethod: 'STRIPE', pendingPayout: 2850, createdAt: '2023-07-15T14:00:00Z' },
  { id: 'pub-3', displayName: 'DevTools Inc', slug: 'devtools-inc', email: 'billing@devtools.io', verified: true, totalListings: 12, totalInstalls: 4560, totalRevenue: 18900, avgRating: 4.9, payoutMethod: 'USDC', pendingPayout: 890, createdAt: '2023-05-20T09:00:00Z' },
  { id: 'pub-4', displayName: 'SwarmLab', slug: 'swarmlab', email: 'finance@swarmlab.ai', verified: false, totalListings: 3, totalInstalls: 670, totalRevenue: 3400, avgRating: 4.6, payoutMethod: 'ETH', pendingPayout: 450, createdAt: '2023-09-10T11:00:00Z' },
  { id: 'pub-5', displayName: 'LegalAI', slug: 'legalai', email: 'accounts@legalai.co', verified: true, totalListings: 4, totalInstalls: 890, totalRevenue: 45000, avgRating: 4.9, payoutMethod: 'PAYPAL', pendingPayout: 3200, createdAt: '2023-08-05T16:00:00Z' },
  { id: 'pub-6', displayName: 'TemplateHQ', slug: 'templatehq', email: 'support@templatehq.com', verified: false, totalListings: 15, totalInstalls: 3200, totalRevenue: 8900, avgRating: 4.4, payoutMethod: 'STRIPE', pendingPayout: 780, createdAt: '2023-10-15T08:00:00Z' },
  { id: 'pub-7', displayName: 'MedAI Lab', slug: 'medai-lab', email: 'team@medailab.health', verified: true, totalListings: 2, totalInstalls: 340, totalRevenue: 89000, avgRating: 4.9, payoutMethod: 'USDC', pendingPayout: 8900, createdAt: '2023-11-20T10:00:00Z' },
]

export default function AdminPublishersPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [verifiedFilter, setVerifiedFilter] = useState<'all' | 'verified' | 'unverified'>('all')
  const [sortBy, setSortBy] = useState<'revenue' | 'installs' | 'listings' | 'newest'>('revenue')

  const filteredPublishers = useMemo(() => {
    let filtered = mockPublishers.filter(pub => {
      const matchesSearch = !searchQuery || 
        pub.displayName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        pub.email.toLowerCase().includes(searchQuery.toLowerCase())
      const matchesVerified = verifiedFilter === 'all' || 
        (verifiedFilter === 'verified' && pub.verified) ||
        (verifiedFilter === 'unverified' && !pub.verified)
      return matchesSearch && matchesVerified
    })

    // Sort
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'revenue': return b.totalRevenue - a.totalRevenue
        case 'installs': return b.totalInstalls - a.totalInstalls
        case 'listings': return b.totalListings - a.totalListings
        case 'newest': return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        default: return 0
      }
    })

    return filtered
  }, [searchQuery, verifiedFilter, sortBy])

  const totals = useMemo(() => ({
    publishers: mockPublishers.length,
    verified: mockPublishers.filter(p => p.verified).length,
    revenue: mockPublishers.reduce((sum, p) => sum + p.totalRevenue, 0),
    pending: mockPublishers.reduce((sum, p) => sum + p.pendingPayout, 0),
  }), [])

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white">Publishers</h1>
        <p className="text-[#737373] mt-1">Manage marketplace publishers</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-[#141414] border border-[#1f1f1f] rounded-lg p-4">
          <div className="text-sm text-[#737373]">Total Publishers</div>
          <div className="text-2xl font-bold text-white">{totals.publishers}</div>
        </div>
        <div className="bg-[#141414] border border-green-500/20 rounded-lg p-4">
          <div className="text-sm text-green-400">Verified</div>
          <div className="text-2xl font-bold text-white">{totals.verified}</div>
        </div>
        <div className="bg-[#141414] border border-[#1f1f1f] rounded-lg p-4">
          <div className="text-sm text-[#737373]">Total Revenue</div>
          <div className="text-2xl font-bold text-[#10b981]">${totals.revenue.toLocaleString()}</div>
        </div>
        <div className="bg-[#141414] border border-yellow-500/20 rounded-lg p-4">
          <div className="text-sm text-yellow-400">Pending Payouts</div>
          <div className="text-2xl font-bold text-white">${totals.pending.toLocaleString()}</div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-[#141414] border border-[#1f1f1f] rounded-xl p-4 mb-6">
        <div className="flex flex-wrap gap-4">
          <div className="flex-1 min-w-[200px]">
            <input
              type="text"
              placeholder="Search by name or email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-4 py-2 bg-[#0a0a0a] border border-[#1f1f1f] rounded-lg text-white placeholder-[#525252] focus:border-[#ff6b35] focus:outline-none"
            />
          </div>
          <select
            value={verifiedFilter}
            onChange={(e) => setVerifiedFilter(e.target.value as typeof verifiedFilter)}
            className="px-4 py-2 bg-[#0a0a0a] border border-[#1f1f1f] rounded-lg text-white focus:border-[#ff6b35] focus:outline-none"
          >
            <option value="all">All Publishers</option>
            <option value="verified">Verified Only</option>
            <option value="unverified">Unverified Only</option>
          </select>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
            className="px-4 py-2 bg-[#0a0a0a] border border-[#1f1f1f] rounded-lg text-white focus:border-[#ff6b35] focus:outline-none"
          >
            <option value="revenue">Sort by Revenue</option>
            <option value="installs">Sort by Installs</option>
            <option value="listings">Sort by Listings</option>
            <option value="newest">Sort by Newest</option>
          </select>
        </div>
      </div>

      {/* Publishers Table */}
      <div className="bg-[#141414] border border-[#1f1f1f] rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-left text-sm text-[#737373] border-b border-[#1f1f1f]">
                <th className="px-6 py-4 font-medium">Publisher</th>
                <th className="px-6 py-4 font-medium">Status</th>
                <th className="px-6 py-4 font-medium text-right">Listings</th>
                <th className="px-6 py-4 font-medium text-right">Installs</th>
                <th className="px-6 py-4 font-medium text-right">Revenue</th>
                <th className="px-6 py-4 font-medium text-right">Pending</th>
                <th className="px-6 py-4 font-medium">Rating</th>
                <th className="px-6 py-4 font-medium">Payout</th>
                <th className="px-6 py-4 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1f1f1f]">
              {filteredPublishers.map((pub) => (
                <tr key={pub.id} className="hover:bg-[#1f1f1f]/50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-[#1f1f1f] flex items-center justify-center text-white font-medium">
                        {pub.displayName.charAt(0)}
                      </div>
                      <div>
                        <div className="font-medium text-white flex items-center gap-2">
                          {pub.displayName}
                          {pub.verified && <span className="text-green-400">✓</span>}
                        </div>
                        <div className="text-sm text-[#525252]">{pub.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                      pub.verified 
                        ? 'bg-green-500/20 text-green-400' 
                        : 'bg-yellow-500/20 text-yellow-400'
                    }`}>
                      {pub.verified ? 'Verified' : 'Pending'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right text-[#a3a3a3]">
                    {pub.totalListings}
                  </td>
                  <td className="px-6 py-4 text-right text-[#a3a3a3]">
                    {pub.totalInstalls.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 text-right font-medium text-[#10b981]">
                    ${pub.totalRevenue.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 text-right text-yellow-400">
                    ${pub.pendingPayout.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 text-[#a3a3a3]">
                    {pub.avgRating ? `${pub.avgRating.toFixed(1)} ★` : '-'}
                  </td>
                  <td className="px-6 py-4 text-[#737373] text-sm">
                    {pub.payoutMethod}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex gap-2">
                      <Link
                        href={`/admin/publishers/${pub.id}`}
                        className="text-[#ff6b35] hover:underline text-sm"
                      >
                        View
                      </Link>
                      {!pub.verified && (
                        <button className="text-green-400 hover:underline text-sm">
                          Verify
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredPublishers.length === 0 && (
          <div className="px-6 py-12 text-center text-[#525252]">
            <div className="text-4xl mb-3">🏢</div>
            <p>No publishers found</p>
          </div>
        )}
      </div>
    </div>
  )
}

