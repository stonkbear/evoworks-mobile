'use client'

/**
 * Admin Platform Analytics
 * Platform-wide analytics and reporting
 */

import { useState, useMemo } from 'react'
import { LineChart, BarChart, DonutChart } from '@/components/analytics/Chart'

// Generate mock data for the past N days
function generateDailyData(days: number) {
  const data = []
  for (let i = days - 1; i >= 0; i--) {
    const date = new Date()
    date.setDate(date.getDate() - i)
    const baseUsers = 50 + Math.random() * 30
    const baseRevenue = 800 + Math.random() * 400
    const variance = 0.7 + Math.random() * 0.6
    
    data.push({
      date: date.toISOString().split('T')[0],
      users: Math.round(baseUsers * variance),
      activeUsers: Math.round(baseUsers * variance * 0.3),
      revenue: Math.round(baseRevenue * variance * 100) / 100,
      transactions: Math.round(50 + Math.random() * 50),
      views: Math.round(5000 + Math.random() * 3000),
      installs: Math.round(100 + Math.random() * 100),
    })
  }
  return data
}

const timeRanges = [
  { value: 7, label: '7 days' },
  { value: 30, label: '30 days' },
  { value: 90, label: '90 days' },
]

const typeColors: Record<string, string> = {
  AGENT: '#3b82f6',
  WORKFLOW: '#10b981',
  SWARM: '#8b5cf6',
  KNOWLEDGE_PACK: '#f59e0b',
  TEMPLATE: '#ef4444',
  INTEGRATION: '#06b6d4',
}

export default function AdminAnalyticsPage() {
  const [days, setDays] = useState(30)

  const dailyData = useMemo(() => generateDailyData(days), [days])

  const totals = useMemo(() => ({
    newUsers: dailyData.reduce((sum, d) => sum + d.users, 0),
    activeUsers: dailyData.reduce((sum, d) => sum + d.activeUsers, 0),
    revenue: dailyData.reduce((sum, d) => sum + d.revenue, 0),
    transactions: dailyData.reduce((sum, d) => sum + d.transactions, 0),
    views: dailyData.reduce((sum, d) => sum + d.views, 0),
    installs: dailyData.reduce((sum, d) => sum + d.installs, 0),
  }), [dailyData])

  // Mock revenue by type
  const revenueByType = [
    { label: 'Agent', value: 34500, color: typeColors.AGENT },
    { label: 'Workflow', value: 28900, color: typeColors.WORKFLOW },
    { label: 'Knowledge', value: 18500, color: typeColors.KNOWLEDGE_PACK },
    { label: 'Template', value: 8900, color: typeColors.TEMPLATE },
    { label: 'Swarm', value: 12300, color: typeColors.SWARM },
    { label: 'Integration', value: 6700, color: typeColors.INTEGRATION },
  ]

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white">Platform Analytics</h1>
          <p className="text-[#737373] mt-1">Platform-wide metrics and reporting</p>
        </div>
        
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

      {/* Summary Stats */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
        <StatCard label="New Users" value={totals.newUsers.toLocaleString()} />
        <StatCard label="Active Users" value={totals.activeUsers.toLocaleString()} />
        <StatCard label="Revenue" value={`$${totals.revenue.toLocaleString()}`} highlight />
        <StatCard label="Transactions" value={totals.transactions.toLocaleString()} />
        <StatCard label="Views" value={totals.views.toLocaleString()} />
        <StatCard label="Installs" value={totals.installs.toLocaleString()} />
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Revenue Over Time */}
        <div className="bg-[#141414] border border-[#1f1f1f] rounded-xl p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Revenue Over Time</h3>
          <LineChart
            data={dailyData.map(d => ({ date: d.date, value: d.revenue }))}
            color="#ff6b35"
            height={220}
            showLabels
            formatValue={(v) => `$${v.toFixed(0)}`}
          />
        </div>

        {/* Users Over Time */}
        <div className="bg-[#141414] border border-[#1f1f1f] rounded-xl p-6">
          <h3 className="text-lg font-semibold text-white mb-4">New Users Over Time</h3>
          <LineChart
            data={dailyData.map(d => ({ date: d.date, value: d.users }))}
            color="#3b82f6"
            height={220}
            showLabels
          />
        </div>

        {/* Revenue by Type */}
        <div className="bg-[#141414] border border-[#1f1f1f] rounded-xl p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Revenue by Listing Type</h3>
          <div className="flex items-center justify-between">
            <DonutChart data={revenueByType} size={180} />
            <div className="flex-1 ml-6 space-y-2">
              {revenueByType.map(item => (
                <div key={item.label} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                    <span className="text-sm text-[#a3a3a3]">{item.label}</span>
                  </div>
                  <span className="text-sm font-medium text-white">${item.value.toLocaleString()}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Transactions & Installs */}
        <div className="bg-[#141414] border border-[#1f1f1f] rounded-xl p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Daily Activity</h3>
          <BarChart
            data={dailyData.slice(-7).map(d => ({
              label: d.date.slice(5),
              value: d.transactions,
              color: '#10b981',
            }))}
            height={180}
          />
          <div className="mt-4 grid grid-cols-2 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-[#10b981]">{totals.transactions.toLocaleString()}</div>
              <div className="text-sm text-[#737373]">Transactions</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-[#3b82f6]">{totals.installs.toLocaleString()}</div>
              <div className="text-sm text-[#737373]">Installs</div>
            </div>
          </div>
        </div>
      </div>

      {/* Top Performers */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Listings */}
        <div className="bg-[#141414] border border-[#1f1f1f] rounded-xl overflow-hidden">
          <div className="px-6 py-4 border-b border-[#1f1f1f]">
            <h3 className="text-lg font-semibold text-white">Top Performing Listings</h3>
          </div>
          <div className="divide-y divide-[#1f1f1f]">
            {[
              { name: 'Data Research Agent', type: 'AGENT', revenue: 12500, installs: 890 },
              { name: 'Content Pipeline', type: 'WORKFLOW', revenue: 28500, installs: 1890 },
              { name: 'Legal Knowledge Pack', type: 'KNOWLEDGE_PACK', revenue: 45000, installs: 340 },
              { name: 'Code Review Swarm', type: 'SWARM', revenue: 8900, installs: 670 },
              { name: 'Slack Integration', type: 'INTEGRATION', revenue: 3400, installs: 2340 },
            ].map((item, i) => (
              <div key={i} className="px-6 py-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="text-lg font-bold text-[#525252]">#{i + 1}</div>
                  <div>
                    <div className="font-medium text-white">{item.name}</div>
                    <div className="text-sm" style={{ color: typeColors[item.type] }}>
                      {item.type.replace('_', ' ')}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-medium text-[#10b981]">${item.revenue.toLocaleString()}</div>
                  <div className="text-sm text-[#525252]">{item.installs.toLocaleString()} installs</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Top Publishers */}
        <div className="bg-[#141414] border border-[#1f1f1f] rounded-xl overflow-hidden">
          <div className="px-6 py-4 border-b border-[#1f1f1f]">
            <h3 className="text-lg font-semibold text-white">Top Publishers</h3>
          </div>
          <div className="divide-y divide-[#1f1f1f]">
            {[
              { name: 'LegalAI', verified: true, revenue: 45000, listings: 4 },
              { name: 'ContentLab', verified: true, revenue: 28500, listings: 5 },
              { name: 'DevTools Inc', verified: true, revenue: 18900, listings: 12 },
              { name: 'TechCorp AI', verified: true, revenue: 12500, listings: 8 },
              { name: 'TemplateHQ', verified: false, revenue: 8900, listings: 15 },
            ].map((item, i) => (
              <div key={i} className="px-6 py-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="text-lg font-bold text-[#525252]">#{i + 1}</div>
                  <div>
                    <div className="font-medium text-white flex items-center gap-1">
                      {item.name}
                      {item.verified && <span className="text-green-400 text-sm">✓</span>}
                    </div>
                    <div className="text-sm text-[#525252]">{item.listings} listings</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-medium text-[#10b981]">${item.revenue.toLocaleString()}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

// Simple stat card
function StatCard({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div className="bg-[#141414] border border-[#1f1f1f] rounded-lg p-4">
      <div className="text-sm text-[#737373]">{label}</div>
      <div className={`text-xl font-bold ${highlight ? 'text-[#10b981]' : 'text-white'}`}>{value}</div>
    </div>
  )
}

