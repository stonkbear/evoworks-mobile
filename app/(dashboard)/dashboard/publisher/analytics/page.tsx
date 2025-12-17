'use client'

/**
 * Publisher Analytics Dashboard
 * View detailed analytics for listings and overall performance
 */

import { useState, useMemo } from 'react'
import Link from 'next/link'
import { LineChart, BarChart, Sparkline } from '@/components/analytics/Chart'

const timeRanges = [
  { value: 7, label: '7d' },
  { value: 30, label: '30d' },
  { value: 90, label: '90d' },
]

// Generate mock daily data
function generateMockDailyData(days: number) {
  const data = []
  const baseViews = 100 + Math.random() * 200
  const baseInstalls = 5 + Math.random() * 15
  const baseRevenue = 10 + Math.random() * 50

  for (let i = days - 1; i >= 0; i--) {
    const date = new Date()
    date.setDate(date.getDate() - i)
    const variance = 0.7 + Math.random() * 0.6
    data.push({
      date: date.toISOString().split('T')[0],
      views: Math.round(baseViews * variance),
      installs: Math.round(baseInstalls * variance),
      revenue: Math.round(baseRevenue * variance * 100) / 100,
    })
  }
  return data
}

// Mock data for demo
const mockListings = [
  { id: '1', name: 'Data Research Agent', slug: 'data-research-agent', type: 'AGENT', status: 'ACTIVE', viewCount: 12450, installCount: 890, totalRevenue: 4450.50, avgRating: 4.8 },
  { id: '2', name: 'Content Pipeline Workflow', slug: 'content-pipeline', type: 'WORKFLOW', status: 'ACTIVE', viewCount: 8700, installCount: 450, totalRevenue: 13500, avgRating: 4.7 },
  { id: '3', name: 'Customer Support Swarm', slug: 'support-swarm', type: 'SWARM', status: 'ACTIVE', viewCount: 5200, installCount: 120, totalRevenue: 2400, avgRating: 4.9 },
  { id: '4', name: 'Legal Knowledge Pack', slug: 'legal-knowledge', type: 'KNOWLEDGE_PACK', status: 'PENDING', viewCount: 3100, installCount: 85, totalRevenue: 8415, avgRating: 4.6 },
  { id: '5', name: 'Slack Integration', slug: 'slack-integration', type: 'INTEGRATION', status: 'ACTIVE', viewCount: 6800, installCount: 340, totalRevenue: 0, avgRating: 4.5 },
]

const typeColors: Record<string, string> = {
  AGENT: '#3b82f6',
  WORKFLOW: '#10b981',
  SWARM: '#8b5cf6',
  KNOWLEDGE_PACK: '#f59e0b',
  TEMPLATE: '#ef4444',
  INTEGRATION: '#06b6d4',
}

function formatCurrency(value: number): string {
  return `$${value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

function formatPercent(value: number): string {
  const sign = value >= 0 ? '+' : ''
  return `${sign}${value.toFixed(1)}%`
}

export default function AnalyticsPage() {
  const [days, setDays] = useState(30)

  // Use mock data for demo
  const dailyData = useMemo(() => generateMockDailyData(days), [days])
  
  const totals = useMemo(() => ({
    views: dailyData.reduce((sum, d) => sum + d.views, 0),
    installs: dailyData.reduce((sum, d) => sum + d.installs, 0),
    revenue: dailyData.reduce((sum, d) => sum + d.revenue, 0),
    executions: Math.round(dailyData.reduce((sum, d) => sum + d.installs, 0) * 2.5),
  }), [dailyData])

  const currentStats = {
    totalListings: mockListings.length,
    totalInstalls: mockListings.reduce((sum, l) => sum + l.installCount, 0),
    totalRevenue: mockListings.reduce((sum, l) => sum + l.totalRevenue, 0),
    avgRating: 4.7,
  }

  const topListings = mockListings
    .sort((a, b) => b.totalRevenue - a.totalRevenue)
    .slice(0, 5)
    .map(l => ({
      listingId: l.id,
      name: l.name,
      views: l.viewCount,
      installs: l.installCount,
      revenue: l.totalRevenue,
    }))

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      {/* Header */}
      <div className="border-b border-[#1f1f1f]">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/dashboard/publisher" className="text-[#737373] hover:text-white transition-colors">
                ← Back
              </Link>
              <h1 className="text-2xl font-bold">Analytics</h1>
            </div>
            
            {/* Time Range Selector */}
            <div className="flex items-center gap-2 bg-[#141414] rounded-lg p-1">
              {timeRanges.map((range) => (
                <button
                  key={range.value}
                  onClick={() => setDays(range.value)}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                    days === range.value
                      ? 'bg-[#ff6b35] text-[#0a0a0a]'
                      : 'text-[#737373] hover:text-white'
                  }`}
                >
                  {range.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Demo Banner */}
        <div className="mb-6 p-4 bg-[#ff6b35]/10 border border-[#ff6b35]/20 rounded-lg text-[#ff6b35] flex items-center gap-3">
          <span className="text-xl">📊</span>
          <span>Viewing demo analytics data. Sign in as a publisher to see your real analytics.</span>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            title="Total Views"
            value={totals.views.toLocaleString()}
            subtitle={`${days} day period`}
            sparklineData={dailyData.map(d => d.views)}
            color="#3b82f6"
          />
          <StatCard
            title="Installs"
            value={totals.installs.toLocaleString()}
            subtitle={`${currentStats.totalInstalls.toLocaleString()} all-time`}
            sparklineData={dailyData.map(d => d.installs)}
            color="#10b981"
          />
          <StatCard
            title="Revenue"
            value={formatCurrency(totals.revenue)}
            subtitle={`${formatCurrency(currentStats.totalRevenue)} all-time`}
            sparklineData={dailyData.map(d => d.revenue)}
            color="#ff6b35"
          />
          <StatCard
            title="Executions"
            value={totals.executions.toLocaleString()}
            subtitle={`${days} day period`}
            sparklineData={dailyData.map(d => Math.round(d.installs * 2.5))}
            color="#8b5cf6"
          />
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Views Over Time */}
          <div className="bg-[#141414] border border-[#1f1f1f] rounded-xl p-6">
            <h3 className="text-lg font-semibold mb-4">Views Over Time</h3>
            <LineChart
              data={dailyData.map(d => ({
                date: d.date,
                value: d.views,
              }))}
              color="#3b82f6"
              height={200}
              showLabels
            />
          </div>

          {/* Revenue Over Time */}
          <div className="bg-[#141414] border border-[#1f1f1f] rounded-xl p-6">
            <h3 className="text-lg font-semibold mb-4">Revenue Over Time</h3>
            <LineChart
              data={dailyData.map(d => ({
                date: d.date,
                value: d.revenue,
              }))}
              color="#ff6b35"
              height={200}
              showLabels
              formatValue={formatCurrency}
            />
          </div>
        </div>

        {/* Top Listings & Type Breakdown */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Top Performing Listings */}
          <div className="bg-[#141414] border border-[#1f1f1f] rounded-xl p-6">
            <h3 className="text-lg font-semibold mb-4">Top Performing Listings</h3>
            <BarChart
              data={topListings.map(l => ({
                label: l.name.slice(0, 15) + (l.name.length > 15 ? '...' : ''),
                value: l.revenue,
                color: '#ff6b35',
              }))}
              horizontal
              formatValue={formatCurrency}
            />
          </div>

          {/* Listings by Type */}
          <div className="bg-[#141414] border border-[#1f1f1f] rounded-xl p-6">
            <h3 className="text-lg font-semibold mb-4">Listings by Type</h3>
            <BarChart
              data={Object.entries(
                mockListings.reduce((acc, l) => {
                  acc[l.type] = (acc[l.type] || 0) + 1
                  return acc
                }, {} as Record<string, number>)
              ).map(([type, count]) => ({
                label: type.replace('_', ' '),
                value: count as number,
                color: typeColors[type] || '#737373',
              }))}
              height={200}
            />
          </div>
        </div>

        {/* All Listings Table */}
        <div className="bg-[#141414] border border-[#1f1f1f] rounded-xl overflow-hidden">
          <div className="px-6 py-4 border-b border-[#1f1f1f]">
            <h3 className="text-lg font-semibold">All Listings Performance</h3>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-left text-sm text-[#737373] border-b border-[#1f1f1f]">
                  <th className="px-6 py-3 font-medium">Listing</th>
                  <th className="px-6 py-3 font-medium">Type</th>
                  <th className="px-6 py-3 font-medium">Status</th>
                  <th className="px-6 py-3 font-medium text-right">Views</th>
                  <th className="px-6 py-3 font-medium text-right">Installs</th>
                  <th className="px-6 py-3 font-medium text-right">Revenue</th>
                  <th className="px-6 py-3 font-medium text-right">Rating</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1f1f1f]">
                {mockListings.map((listing) => (
                  <tr key={listing.id} className="hover:bg-[#1f1f1f]/50 transition-colors">
                    <td className="px-6 py-4">
                      <Link
                        href={`/listing/${listing.slug}`}
                        className="text-white hover:text-[#ff6b35] font-medium"
                      >
                        {listing.name}
                      </Link>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className="px-2 py-1 rounded text-xs font-medium"
                        style={{
                          backgroundColor: `${typeColors[listing.type] || '#737373'}20`,
                          color: typeColors[listing.type] || '#737373',
                        }}
                      >
                        {listing.type.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-2 py-1 rounded text-xs font-medium ${
                          listing.status === 'ACTIVE'
                            ? 'bg-green-500/20 text-green-400'
                            : listing.status === 'PENDING'
                              ? 'bg-yellow-500/20 text-yellow-400'
                              : 'bg-gray-500/20 text-gray-400'
                        }`}
                      >
                        {listing.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right text-[#a3a3a3]">
                      {listing.viewCount.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 text-right text-[#a3a3a3]">
                      {listing.installCount.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 text-right font-medium text-[#10b981]">
                      {formatCurrency(listing.totalRevenue)}
                    </td>
                    <td className="px-6 py-4 text-right text-[#a3a3a3]">
                      {listing.avgRating ? `${listing.avgRating.toFixed(1)} ★` : '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}

// Stat Card Component
function StatCard({
  title,
  value,
  subtitle,
  sparklineData,
  color,
}: {
  title: string
  value: string
  subtitle: string
  sparklineData: number[]
  color: string
}) {
  return (
    <div className="bg-[#141414] border border-[#1f1f1f] rounded-xl p-6">
      <div className="flex items-start justify-between">
        <div>
          <div className="text-sm text-[#737373] mb-1">{title}</div>
          <div className="text-3xl font-bold text-white">{value}</div>
          <div className="text-xs text-[#525252] mt-1">{subtitle}</div>
        </div>
        {sparklineData.length > 0 && (
          <Sparkline data={sparklineData} color={color} height={40} width={80} />
        )}
      </div>
    </div>
  )
}

