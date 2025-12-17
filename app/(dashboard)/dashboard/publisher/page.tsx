'use client'

/**
 * Publisher Dashboard
 * Manage listings, track analytics, view earnings
 */

import { useState } from 'react'
import Link from 'next/link'

// Types
type ListingType = 'agent' | 'workflow' | 'swarm' | 'knowledge-pack' | 'template' | 'integration'
type ListingStatus = 'active' | 'pending' | 'paused' | 'rejected'

interface PublishedListing {
  id: string
  name: string
  slug: string
  type: ListingType
  status: ListingStatus
  pricing: {
    model: 'free' | 'per-call' | 'subscription' | 'one-time'
    amount?: number
  }
  stats: {
    views: number
    installs: number
    revenue: number
    rating: number
    reviews: number
  }
  createdAt: string
  lastUpdated: string
}

// Type config
const typeConfig: Record<ListingType, { icon: string; label: string; color: string }> = {
  'agent': { icon: '🤖', label: 'Agent', color: '#ff6b35' },
  'workflow': { icon: '⚡', label: 'Workflow', color: '#8b5cf6' },
  'swarm': { icon: '🐝', label: 'Swarm', color: '#f59e0b' },
  'knowledge-pack': { icon: '📚', label: 'Knowledge Pack', color: '#10b981' },
  'template': { icon: '📋', label: 'Template', color: '#6366f1' },
  'integration': { icon: '🔌', label: 'Integration', color: '#ec4899' },
}

// Status config
const statusConfig: Record<ListingStatus, { label: string; color: string; bgColor: string }> = {
  'active': { label: 'Active', color: '#10b981', bgColor: 'rgba(16, 185, 129, 0.1)' },
  'pending': { label: 'Pending Review', color: '#f59e0b', bgColor: 'rgba(245, 158, 11, 0.1)' },
  'paused': { label: 'Paused', color: '#737373', bgColor: 'rgba(115, 115, 115, 0.1)' },
  'rejected': { label: 'Rejected', color: '#ef4444', bgColor: 'rgba(239, 68, 68, 0.1)' },
}

// Mock data
const mockListings: PublishedListing[] = [
  {
    id: '1',
    name: 'Data Research Agent',
    slug: 'data-research-agent',
    type: 'agent',
    status: 'active',
    pricing: { model: 'per-call', amount: 5 },
    stats: { views: 12450, installs: 2847, revenue: 14235, rating: 4.9, reviews: 127 },
    createdAt: '2024-08-15',
    lastUpdated: '2024-12-10',
  },
  {
    id: '2',
    name: 'Content Pipeline',
    slug: 'content-pipeline',
    type: 'workflow',
    status: 'active',
    pricing: { model: 'subscription', amount: 29 },
    stats: { views: 8920, installs: 1456, revenue: 42228, rating: 4.7, reviews: 89 },
    createdAt: '2024-09-01',
    lastUpdated: '2024-12-15',
  },
  {
    id: '3',
    name: 'Market Research Swarm',
    slug: 'market-research-swarm',
    type: 'swarm',
    status: 'active',
    pricing: { model: 'per-call', amount: 25 },
    stats: { views: 5670, installs: 567, revenue: 7087, rating: 4.9, reviews: 45 },
    createdAt: '2024-10-01',
    lastUpdated: '2024-12-12',
  },
  {
    id: '4',
    name: 'Sales Email Optimizer',
    slug: 'sales-email-optimizer',
    type: 'agent',
    status: 'pending',
    pricing: { model: 'per-call', amount: 3 },
    stats: { views: 0, installs: 0, revenue: 0, rating: 0, reviews: 0 },
    createdAt: '2024-12-16',
    lastUpdated: '2024-12-16',
  },
  {
    id: '5',
    name: 'Slack Notification Bridge',
    slug: 'slack-notification-bridge',
    type: 'integration',
    status: 'paused',
    pricing: { model: 'free' },
    stats: { views: 3420, installs: 892, revenue: 0, rating: 4.2, reviews: 34 },
    createdAt: '2024-07-20',
    lastUpdated: '2024-11-05',
  },
]

// Mock earnings data
const earningsData = {
  total: 63550,
  thisMonth: 8420,
  lastMonth: 7890,
  pending: 1250,
  nextPayout: '2024-12-31',
  payoutMethod: 'USDC to 0x1234...5678',
}

// Mock activity
const recentActivity = [
  { id: '1', type: 'install', listing: 'Data Research Agent', time: '2 hours ago', amount: 5 },
  { id: '2', type: 'review', listing: 'Content Pipeline', time: '5 hours ago', rating: 5 },
  { id: '3', type: 'install', listing: 'Market Research Swarm', time: '8 hours ago', amount: 25 },
  { id: '4', type: 'subscription', listing: 'Content Pipeline', time: '1 day ago', amount: 29 },
  { id: '5', type: 'install', listing: 'Data Research Agent', time: '1 day ago', amount: 5 },
]

export default function PublisherDashboard() {
  const [activeTab, setActiveTab] = useState<'overview' | 'listings' | 'earnings' | 'analytics'>('overview')
  const [listingFilter, setListingFilter] = useState<ListingStatus | 'all'>('all')

  // Calculate totals
  const totalStats = {
    listings: mockListings.length,
    activeListings: mockListings.filter(l => l.status === 'active').length,
    totalViews: mockListings.reduce((sum, l) => sum + l.stats.views, 0),
    totalInstalls: mockListings.reduce((sum, l) => sum + l.stats.installs, 0),
    totalRevenue: mockListings.reduce((sum, l) => sum + l.stats.revenue, 0),
    avgRating: (mockListings.filter(l => l.stats.rating > 0).reduce((sum, l) => sum + l.stats.rating, 0) / mockListings.filter(l => l.stats.rating > 0).length).toFixed(1),
  }

  // Filter listings
  const filteredListings = listingFilter === 'all' 
    ? mockListings 
    : mockListings.filter(l => l.status === listingFilter)

  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-[#0a0a0a]/90 backdrop-blur-xl border-b border-[#1a1a1a]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link href="/" className="flex items-center gap-2 group">
              <span className="text-2xl group-hover:scale-110 transition-transform">🦇</span>
              <span className="text-xl font-bold text-white">Evoworks</span>
            </Link>

            <nav className="hidden md:flex items-center gap-6">
              <Link href="/marketplace" className="text-[#737373] hover:text-white transition-colors">
                Marketplace
              </Link>
              <Link href="/dashboard" className="text-[#737373] hover:text-white transition-colors">
                Buyer Dashboard
              </Link>
              <Link href="/dashboard/publisher" className="text-[#ff6b35] font-medium">
                Publisher
              </Link>
              <Link href="/publish" className="text-[#737373] hover:text-white transition-colors">
                Publish
              </Link>
            </nav>

            <div className="flex items-center gap-3">
              <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-[#10b981]/10 border border-[#10b981]/30 rounded-lg">
                <div className="w-2 h-2 bg-[#10b981] rounded-full animate-pulse" />
                <span className="text-sm text-[#10b981] font-medium">Connected</span>
              </div>
              <div className="flex items-center gap-2 px-3 py-2 bg-[#1a1a1a] rounded-lg">
                <div className="w-8 h-8 bg-gradient-to-br from-[#ff6b35] to-[#8b5cf6] rounded-lg flex items-center justify-center text-white font-bold text-sm">
                  GF
                </div>
                <span className="text-white text-sm">Ghost Flow</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white mb-1">Publisher Dashboard</h1>
            <p className="text-[#737373]">Manage your listings and track performance</p>
          </div>
          <Link
            href="/publish"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#ff6b35] hover:bg-[#ff8555] text-[#0a0a0a] font-semibold rounded-xl transition-all"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            New Listing
          </Link>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 p-1 bg-[#1a1a1a] rounded-xl mb-8 w-fit">
          {(['overview', 'listings', 'earnings', 'analytics'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-5 py-2 rounded-lg font-medium transition-all capitalize ${
                activeTab === tab
                  ? 'bg-[#ff6b35] text-[#0a0a0a]'
                  : 'text-[#737373] hover:text-white'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="space-y-8">
            {/* Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              <div className="bg-[#1a1a1a] border border-[#252525] rounded-xl p-5">
                <div className="text-[#737373] text-sm mb-1">Total Listings</div>
                <div className="text-2xl font-bold text-white">{totalStats.listings}</div>
                <div className="text-xs text-[#10b981]">{totalStats.activeListings} active</div>
              </div>
              <div className="bg-[#1a1a1a] border border-[#252525] rounded-xl p-5">
                <div className="text-[#737373] text-sm mb-1">Total Views</div>
                <div className="text-2xl font-bold text-white">{(totalStats.totalViews / 1000).toFixed(1)}K</div>
                <div className="text-xs text-[#10b981]">↑ 12% this week</div>
              </div>
              <div className="bg-[#1a1a1a] border border-[#252525] rounded-xl p-5">
                <div className="text-[#737373] text-sm mb-1">Total Installs</div>
                <div className="text-2xl font-bold text-white">{(totalStats.totalInstalls / 1000).toFixed(1)}K</div>
                <div className="text-xs text-[#10b981]">↑ 8% this week</div>
              </div>
              <div className="bg-[#1a1a1a] border border-[#252525] rounded-xl p-5">
                <div className="text-[#737373] text-sm mb-1">Conversion Rate</div>
                <div className="text-2xl font-bold text-white">{((totalStats.totalInstalls / totalStats.totalViews) * 100).toFixed(1)}%</div>
                <div className="text-xs text-[#737373]">Views → Installs</div>
              </div>
              <div className="bg-[#1a1a1a] border border-[#252525] rounded-xl p-5">
                <div className="text-[#737373] text-sm mb-1">Avg Rating</div>
                <div className="text-2xl font-bold text-white flex items-center gap-1">
                  {totalStats.avgRating}
                  <svg className="w-5 h-5 text-[#f59e0b]" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                </div>
                <div className="text-xs text-[#737373]">From {mockListings.reduce((sum, l) => sum + l.stats.reviews, 0)} reviews</div>
              </div>
              <div className="bg-gradient-to-br from-[#ff6b35]/20 to-[#8b5cf6]/20 border border-[#ff6b35]/30 rounded-xl p-5">
                <div className="text-[#ff6b35] text-sm mb-1">Total Revenue</div>
                <div className="text-2xl font-bold text-white">${totalStats.totalRevenue.toLocaleString()}</div>
                <div className="text-xs text-[#10b981]">↑ 15% this month</div>
              </div>
            </div>

            {/* Two Column Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Top Performers */}
              <div className="bg-[#1a1a1a] border border-[#252525] rounded-xl p-6">
                <h3 className="text-lg font-bold text-white mb-4">Top Performers</h3>
                <div className="space-y-3">
                  {mockListings
                    .filter(l => l.status === 'active')
                    .sort((a, b) => b.stats.revenue - a.stats.revenue)
                    .slice(0, 3)
                    .map((listing, index) => {
                      const type = typeConfig[listing.type]
                      return (
                        <div key={listing.id} className="flex items-center gap-4 p-3 bg-[#0a0a0a] rounded-lg">
                          <div className="text-2xl font-bold text-[#525252] w-6">#{index + 1}</div>
                          <div className="flex items-center gap-2 flex-1">
                            <span className="text-xl">{type.icon}</span>
                            <div>
                              <div className="text-white font-medium">{listing.name}</div>
                              <div className="text-xs text-[#525252]">{listing.stats.installs.toLocaleString()} installs</div>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-[#10b981] font-bold">${listing.stats.revenue.toLocaleString()}</div>
                            <div className="text-xs text-[#525252]">revenue</div>
                          </div>
                        </div>
                      )
                    })}
                </div>
              </div>

              {/* Recent Activity */}
              <div className="bg-[#1a1a1a] border border-[#252525] rounded-xl p-6">
                <h3 className="text-lg font-bold text-white mb-4">Recent Activity</h3>
                <div className="space-y-3">
                  {recentActivity.map((activity) => (
                    <div key={activity.id} className="flex items-center gap-3 p-3 bg-[#0a0a0a] rounded-lg">
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                        activity.type === 'install' ? 'bg-[#10b981]/10' :
                        activity.type === 'subscription' ? 'bg-[#8b5cf6]/10' :
                        'bg-[#f59e0b]/10'
                      }`}>
                        {activity.type === 'install' && (
                          <svg className="w-5 h-5 text-[#10b981]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                          </svg>
                        )}
                        {activity.type === 'subscription' && (
                          <svg className="w-5 h-5 text-[#8b5cf6]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        )}
                        {activity.type === 'review' && (
                          <svg className="w-5 h-5 text-[#f59e0b]" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                          </svg>
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="text-white text-sm">
                          {activity.type === 'install' && `New install on ${activity.listing}`}
                          {activity.type === 'subscription' && `New subscription for ${activity.listing}`}
                          {activity.type === 'review' && `${activity.rating}★ review on ${activity.listing}`}
                        </div>
                        <div className="text-xs text-[#525252]">{activity.time}</div>
                      </div>
                      {activity.amount && (
                        <div className="text-[#10b981] font-medium">+${activity.amount}</div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Earnings Summary */}
            <div className="bg-gradient-to-r from-[#1a1a1a] via-[#1f1a1a] to-[#1a1a1a] border border-[#252525] rounded-xl p-6">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <h3 className="text-lg font-bold text-white mb-1">Earnings Summary</h3>
                  <p className="text-[#737373] text-sm">Your revenue from all listings</p>
                </div>
                <div className="flex flex-wrap gap-6">
                  <div>
                    <div className="text-[#737373] text-xs mb-1">This Month</div>
                    <div className="text-2xl font-bold text-[#10b981]">${earningsData.thisMonth.toLocaleString()}</div>
                  </div>
                  <div>
                    <div className="text-[#737373] text-xs mb-1">Pending</div>
                    <div className="text-2xl font-bold text-[#f59e0b]">${earningsData.pending.toLocaleString()}</div>
                  </div>
                  <div>
                    <div className="text-[#737373] text-xs mb-1">Next Payout</div>
                    <div className="text-lg font-bold text-white">{earningsData.nextPayout}</div>
                  </div>
                  <button className="px-5 py-2 bg-[#ff6b35] hover:bg-[#ff8555] text-[#0a0a0a] font-semibold rounded-lg transition-all self-center">
                    Withdraw
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Listings Tab */}
        {activeTab === 'listings' && (
          <div className="space-y-6">
            {/* Filter Bar */}
            <div className="flex flex-wrap items-center gap-3">
              <span className="text-[#737373] text-sm">Filter by status:</span>
              {(['all', 'active', 'pending', 'paused', 'rejected'] as const).map((status) => (
                <button
                  key={status}
                  onClick={() => setListingFilter(status)}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all capitalize ${
                    listingFilter === status
                      ? 'bg-[#ff6b35] text-[#0a0a0a]'
                      : 'bg-[#1a1a1a] text-[#737373] hover:text-white border border-[#252525]'
                  }`}
                >
                  {status === 'all' ? `All (${mockListings.length})` : `${status} (${mockListings.filter(l => l.status === status).length})`}
                </button>
              ))}
            </div>

            {/* Listings Table */}
            <div className="bg-[#1a1a1a] border border-[#252525] rounded-xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-[#252525]">
                      <th className="text-left text-[#737373] text-xs font-medium uppercase tracking-wider px-6 py-4">Listing</th>
                      <th className="text-left text-[#737373] text-xs font-medium uppercase tracking-wider px-6 py-4">Status</th>
                      <th className="text-left text-[#737373] text-xs font-medium uppercase tracking-wider px-6 py-4">Pricing</th>
                      <th className="text-right text-[#737373] text-xs font-medium uppercase tracking-wider px-6 py-4">Views</th>
                      <th className="text-right text-[#737373] text-xs font-medium uppercase tracking-wider px-6 py-4">Installs</th>
                      <th className="text-right text-[#737373] text-xs font-medium uppercase tracking-wider px-6 py-4">Revenue</th>
                      <th className="text-right text-[#737373] text-xs font-medium uppercase tracking-wider px-6 py-4">Rating</th>
                      <th className="text-right text-[#737373] text-xs font-medium uppercase tracking-wider px-6 py-4">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredListings.map((listing) => {
                      const type = typeConfig[listing.type]
                      const status = statusConfig[listing.status]
                      return (
                        <tr key={listing.id} className="border-b border-[#252525] hover:bg-[#0a0a0a]/50 transition-colors">
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <div 
                                className="w-10 h-10 rounded-lg flex items-center justify-center text-xl"
                                style={{ backgroundColor: `${type.color}15` }}
                              >
                                {type.icon}
                              </div>
                              <div>
                                <div className="text-white font-medium">{listing.name}</div>
                                <div className="text-xs text-[#525252]">{type.label} • Updated {listing.lastUpdated}</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <span 
                              className="px-2.5 py-1 rounded-full text-xs font-medium"
                              style={{ backgroundColor: status.bgColor, color: status.color }}
                            >
                              {status.label}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <div className="text-white text-sm">
                              {listing.pricing.model === 'free' && 'Free'}
                              {listing.pricing.model === 'per-call' && `$${((listing.pricing.amount || 0) / 100).toFixed(2)}/call`}
                              {listing.pricing.model === 'subscription' && `$${listing.pricing.amount}/mo`}
                              {listing.pricing.model === 'one-time' && `$${listing.pricing.amount}`}
                            </div>
                            {listing.pricing.model === 'per-call' && (
                              <div className="text-[10px] text-[#ff6b35] font-medium">x402</div>
                            )}
                          </td>
                          <td className="px-6 py-4 text-right">
                            <div className="text-white">{listing.stats.views.toLocaleString()}</div>
                          </td>
                          <td className="px-6 py-4 text-right">
                            <div className="text-white">{listing.stats.installs.toLocaleString()}</div>
                          </td>
                          <td className="px-6 py-4 text-right">
                            <div className="text-[#10b981] font-medium">${listing.stats.revenue.toLocaleString()}</div>
                          </td>
                          <td className="px-6 py-4 text-right">
                            {listing.stats.rating > 0 ? (
                              <div className="flex items-center justify-end gap-1">
                                <span className="text-white">{listing.stats.rating}</span>
                                <svg className="w-4 h-4 text-[#f59e0b]" fill="currentColor" viewBox="0 0 20 20">
                                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                </svg>
                                <span className="text-[#525252] text-xs">({listing.stats.reviews})</span>
                              </div>
                            ) : (
                              <span className="text-[#525252]">—</span>
                            )}
                          </td>
                          <td className="px-6 py-4 text-right">
                            <div className="flex items-center justify-end gap-2">
                              <Link
                                href={`/listing/${listing.slug}`}
                                className="p-2 text-[#737373] hover:text-white hover:bg-[#252525] rounded-lg transition-all"
                                title="View"
                              >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                </svg>
                              </Link>
                              <button
                                className="p-2 text-[#737373] hover:text-white hover:bg-[#252525] rounded-lg transition-all"
                                title="Edit"
                              >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                </svg>
                              </button>
                              <button
                                className="p-2 text-[#737373] hover:text-[#ef4444] hover:bg-[#ef4444]/10 rounded-lg transition-all"
                                title={listing.status === 'active' ? 'Pause' : 'Activate'}
                              >
                                {listing.status === 'active' ? (
                                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 9v6m4-6v6m7-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                  </svg>
                                ) : (
                                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                  </svg>
                                )}
                              </button>
                            </div>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Earnings Tab */}
        {activeTab === 'earnings' && (
          <div className="space-y-6">
            {/* Earnings Overview */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-[#1a1a1a] border border-[#252525] rounded-xl p-6">
                <div className="text-[#737373] text-sm mb-2">Total Earnings (All Time)</div>
                <div className="text-3xl font-bold text-white">${earningsData.total.toLocaleString()}</div>
              </div>
              <div className="bg-[#1a1a1a] border border-[#252525] rounded-xl p-6">
                <div className="text-[#737373] text-sm mb-2">This Month</div>
                <div className="text-3xl font-bold text-[#10b981]">${earningsData.thisMonth.toLocaleString()}</div>
                <div className="text-xs text-[#10b981]">↑ {(((earningsData.thisMonth - earningsData.lastMonth) / earningsData.lastMonth) * 100).toFixed(0)}% vs last month</div>
              </div>
              <div className="bg-[#1a1a1a] border border-[#252525] rounded-xl p-6">
                <div className="text-[#737373] text-sm mb-2">Pending Payout</div>
                <div className="text-3xl font-bold text-[#f59e0b]">${earningsData.pending.toLocaleString()}</div>
                <div className="text-xs text-[#525252]">Pays out {earningsData.nextPayout}</div>
              </div>
              <div className="bg-gradient-to-br from-[#ff6b35]/20 to-[#8b5cf6]/20 border border-[#ff6b35]/30 rounded-xl p-6">
                <div className="text-[#ff6b35] text-sm mb-2">Payout Method</div>
                <div className="text-lg font-bold text-white mb-2">USDC</div>
                <div className="text-xs text-[#525252] font-mono">0x1234...5678</div>
              </div>
            </div>

            {/* Earnings Breakdown */}
            <div className="bg-[#1a1a1a] border border-[#252525] rounded-xl p-6">
              <h3 className="text-lg font-bold text-white mb-6">Revenue by Listing</h3>
              <div className="space-y-4">
                {mockListings
                  .filter(l => l.stats.revenue > 0)
                  .sort((a, b) => b.stats.revenue - a.stats.revenue)
                  .map((listing) => {
                    const type = typeConfig[listing.type]
                    const percentage = (listing.stats.revenue / totalStats.totalRevenue) * 100
                    return (
                      <div key={listing.id} className="flex items-center gap-4">
                        <div className="flex items-center gap-3 w-64">
                          <span className="text-xl">{type.icon}</span>
                          <div>
                            <div className="text-white font-medium text-sm">{listing.name}</div>
                            <div className="text-xs text-[#525252]">{listing.pricing.model}</div>
                          </div>
                        </div>
                        <div className="flex-1">
                          <div className="h-3 bg-[#252525] rounded-full overflow-hidden">
                            <div
                              className="h-full rounded-full transition-all"
                              style={{ 
                                width: `${percentage}%`,
                                backgroundColor: type.color
                              }}
                            />
                          </div>
                        </div>
                        <div className="w-32 text-right">
                          <div className="text-white font-bold">${listing.stats.revenue.toLocaleString()}</div>
                          <div className="text-xs text-[#525252]">{percentage.toFixed(1)}%</div>
                        </div>
                      </div>
                    )
                  })}
              </div>
            </div>

            {/* Payout History */}
            <div className="bg-[#1a1a1a] border border-[#252525] rounded-xl p-6">
              <h3 className="text-lg font-bold text-white mb-4">Payout History</h3>
              <div className="space-y-3">
                {[
                  { date: '2024-11-30', amount: 7890, status: 'completed', txHash: '0xabc...123' },
                  { date: '2024-10-31', amount: 6540, status: 'completed', txHash: '0xdef...456' },
                  { date: '2024-09-30', amount: 5230, status: 'completed', txHash: '0xghi...789' },
                ].map((payout, i) => (
                  <div key={i} className="flex items-center justify-between p-4 bg-[#0a0a0a] rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-[#10b981]/10 rounded-lg flex items-center justify-center">
                        <svg className="w-5 h-5 text-[#10b981]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                      <div>
                        <div className="text-white font-medium">${payout.amount.toLocaleString()} USDC</div>
                        <div className="text-xs text-[#525252]">{payout.date}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="px-2.5 py-1 bg-[#10b981]/10 text-[#10b981] text-xs font-medium rounded-full">
                        {payout.status}
                      </span>
                      <a href="#" className="text-[#ff6b35] text-xs hover:underline font-mono">
                        {payout.txHash}
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Analytics Tab */}
        {activeTab === 'analytics' && (
          <div className="space-y-6">
            {/* Period Selector */}
            <div className="flex items-center gap-2">
              <span className="text-[#737373] text-sm">Time period:</span>
              {['7d', '30d', '90d', 'all'].map((period) => (
                <button
                  key={period}
                  className="px-3 py-1.5 rounded-lg text-sm font-medium transition-all bg-[#1a1a1a] text-[#737373] hover:text-white border border-[#252525] first:bg-[#ff6b35] first:text-[#0a0a0a] first:border-transparent"
                >
                  {period === 'all' ? 'All Time' : period}
                </button>
              ))}
            </div>

            {/* Analytics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-[#1a1a1a] border border-[#252525] rounded-xl p-6">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-[#737373] text-sm">Page Views</span>
                  <span className="text-[#10b981] text-xs">↑ 12%</span>
                </div>
                <div className="text-3xl font-bold text-white mb-2">30.4K</div>
                <div className="h-12 flex items-end gap-1">
                  {[40, 55, 35, 65, 50, 80, 70].map((h, i) => (
                    <div key={i} className="flex-1 bg-[#ff6b35]/30 rounded-t" style={{ height: `${h}%` }} />
                  ))}
                </div>
              </div>

              <div className="bg-[#1a1a1a] border border-[#252525] rounded-xl p-6">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-[#737373] text-sm">Unique Visitors</span>
                  <span className="text-[#10b981] text-xs">↑ 8%</span>
                </div>
                <div className="text-3xl font-bold text-white mb-2">12.1K</div>
                <div className="h-12 flex items-end gap-1">
                  {[30, 45, 50, 55, 60, 75, 65].map((h, i) => (
                    <div key={i} className="flex-1 bg-[#8b5cf6]/30 rounded-t" style={{ height: `${h}%` }} />
                  ))}
                </div>
              </div>

              <div className="bg-[#1a1a1a] border border-[#252525] rounded-xl p-6">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-[#737373] text-sm">New Installs</span>
                  <span className="text-[#10b981] text-xs">↑ 23%</span>
                </div>
                <div className="text-3xl font-bold text-white mb-2">847</div>
                <div className="h-12 flex items-end gap-1">
                  {[25, 40, 35, 50, 60, 90, 85].map((h, i) => (
                    <div key={i} className="flex-1 bg-[#10b981]/30 rounded-t" style={{ height: `${h}%` }} />
                  ))}
                </div>
              </div>

              <div className="bg-[#1a1a1a] border border-[#252525] rounded-xl p-6">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-[#737373] text-sm">Conversion Rate</span>
                  <span className="text-[#10b981] text-xs">↑ 5%</span>
                </div>
                <div className="text-3xl font-bold text-white mb-2">18.7%</div>
                <div className="h-12 flex items-end gap-1">
                  {[50, 55, 52, 58, 60, 65, 70].map((h, i) => (
                    <div key={i} className="flex-1 bg-[#f59e0b]/30 rounded-t" style={{ height: `${h}%` }} />
                  ))}
                </div>
              </div>
            </div>

            {/* Traffic Sources */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-[#1a1a1a] border border-[#252525] rounded-xl p-6">
                <h3 className="text-lg font-bold text-white mb-4">Traffic Sources</h3>
                <div className="space-y-4">
                  {[
                    { source: 'Direct / Bookmark', visits: 12450, color: '#ff6b35' },
                    { source: 'Search (Google, Bing)', visits: 8920, color: '#8b5cf6' },
                    { source: 'Social (Twitter, LinkedIn)', visits: 5340, color: '#10b981' },
                    { source: 'Referral', visits: 3690, color: '#f59e0b' },
                  ].map((source, i) => (
                    <div key={i} className="flex items-center gap-4">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: source.color }} />
                      <div className="flex-1">
                        <div className="text-white text-sm">{source.source}</div>
                      </div>
                      <div className="text-white font-medium">{source.visits.toLocaleString()}</div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-[#1a1a1a] border border-[#252525] rounded-xl p-6">
                <h3 className="text-lg font-bold text-white mb-4">Top Regions</h3>
                <div className="space-y-4">
                  {[
                    { country: 'United States', flag: '🇺🇸', visits: 15230 },
                    { country: 'United Kingdom', flag: '🇬🇧', visits: 4560 },
                    { country: 'Germany', flag: '🇩🇪', visits: 3890 },
                    { country: 'Canada', flag: '🇨🇦', visits: 2340 },
                    { country: 'Australia', flag: '🇦🇺', visits: 1890 },
                  ].map((region, i) => (
                    <div key={i} className="flex items-center gap-4">
                      <span className="text-2xl">{region.flag}</span>
                      <div className="flex-1">
                        <div className="text-white text-sm">{region.country}</div>
                      </div>
                      <div className="text-white font-medium">{region.visits.toLocaleString()}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

