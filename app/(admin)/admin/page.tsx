'use client'

/**
 * Admin Overview Dashboard
 * Platform statistics and quick actions
 */

import { useState, useEffect, useMemo } from 'react'
import Link from 'next/link'
import { Sparkline } from '@/components/analytics/Chart'

// Mock data generator for demo
function generateMockData() {
  const now = new Date()
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const date = new Date(now)
    date.setDate(date.getDate() - (6 - i))
    return {
      date: date.toISOString().split('T')[0],
      users: Math.round(50 + Math.random() * 30),
      revenue: Math.round(500 + Math.random() * 300),
      listings: Math.round(5 + Math.random() * 10),
    }
  })

  return {
    overview: {
      totalUsers: 12847,
      newUsersToday: 127,
      activeUsers: 3421,
      totalPublishers: 892,
      totalListings: 1456,
      activeListings: 1234,
      pendingListings: 45,
      totalTransactions: 89234,
      totalRevenue: 847523.45,
      revenueToday: 4521.23,
      pendingPayouts: 23,
      totalPayoutsValue: 12450.00,
    },
    recentUsers: [
      { id: '1', email: 'john@acme.com', name: 'John Doe', role: 'CREATOR', createdAt: '2024-01-15T10:30:00Z' },
      { id: '2', email: 'jane@startup.io', name: 'Jane Smith', role: 'BUYER', createdAt: '2024-01-15T09:15:00Z' },
      { id: '3', email: 'bob@enterprise.com', name: 'Bob Wilson', role: 'CREATOR', createdAt: '2024-01-15T08:45:00Z' },
      { id: '4', email: 'alice@dev.co', name: 'Alice Chen', role: 'BUYER', createdAt: '2024-01-14T22:30:00Z' },
    ],
    pendingListings: [
      { id: '1', name: 'Customer Support Swarm', type: 'SWARM', publisher: 'TechCorp AI', createdAt: '2024-01-15T08:00:00Z' },
      { id: '2', name: 'Legal Analysis Agent', type: 'AGENT', publisher: 'LegalAI', createdAt: '2024-01-14T16:30:00Z' },
      { id: '3', name: 'Sales Pipeline Workflow', type: 'WORKFLOW', publisher: 'SalesFlow', createdAt: '2024-01-14T12:00:00Z' },
    ],
    recentTransactions: [
      { id: '1', listing: 'Data Research Agent', amount: 0.10, user: 'john@acme.com', createdAt: '2024-01-15T10:45:00Z' },
      { id: '2', listing: 'Content Pipeline', amount: 29.99, user: 'jane@startup.io', createdAt: '2024-01-15T10:30:00Z' },
      { id: '3', listing: 'Code Review Swarm', amount: 0.15, user: 'bob@dev.co', createdAt: '2024-01-15T10:15:00Z' },
    ],
    dailyData: last7Days,
  }
}

export default function AdminOverviewPage() {
  const [data, setData] = useState<ReturnType<typeof generateMockData> | null>(null)

  useEffect(() => {
    // In real app, fetch from API
    setData(generateMockData())
  }, [])

  if (!data) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-[#ff6b35] border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white">Dashboard Overview</h1>
        <p className="text-[#737373] mt-1">Welcome to the Evoworks admin panel</p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          title="Total Users"
          value={data.overview.totalUsers.toLocaleString()}
          change={`+${data.overview.newUsersToday} today`}
          changePositive
          sparklineData={data.dailyData.map(d => d.users)}
          color="#3b82f6"
        />
        <StatCard
          title="Total Revenue"
          value={`$${data.overview.totalRevenue.toLocaleString()}`}
          change={`+$${data.overview.revenueToday.toLocaleString()} today`}
          changePositive
          sparklineData={data.dailyData.map(d => d.revenue)}
          color="#10b981"
        />
        <StatCard
          title="Active Listings"
          value={data.overview.activeListings.toLocaleString()}
          change={`${data.overview.pendingListings} pending review`}
          sparklineData={data.dailyData.map(d => d.listings)}
          color="#ff6b35"
        />
        <StatCard
          title="Pending Payouts"
          value={data.overview.pendingPayouts.toString()}
          change={`$${data.overview.totalPayoutsValue.toLocaleString()} value`}
          sparklineData={[]}
          color="#8b5cf6"
        />
      </div>

      {/* Secondary Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <MiniStatCard label="Publishers" value={data.overview.totalPublishers} />
        <MiniStatCard label="Transactions" value={data.overview.totalTransactions} />
        <MiniStatCard label="Active Users" value={data.overview.activeUsers} />
        <MiniStatCard label="Total Listings" value={data.overview.totalListings} />
      </div>

      {/* Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pending Listings */}
        <div className="bg-[#141414] border border-[#1f1f1f] rounded-xl overflow-hidden">
          <div className="px-6 py-4 border-b border-[#1f1f1f] flex items-center justify-between">
            <h2 className="text-lg font-semibold text-white">Pending Review</h2>
            <Link href="/admin/listings?status=pending" className="text-sm text-[#ff6b35] hover:underline">
              View all →
            </Link>
          </div>
          <div className="divide-y divide-[#1f1f1f]">
            {data.pendingListings.map((listing) => (
              <div key={listing.id} className="px-6 py-4 flex items-center justify-between">
                <div>
                  <div className="font-medium text-white">{listing.name}</div>
                  <div className="text-sm text-[#737373]">
                    {listing.type} by {listing.publisher}
                  </div>
                </div>
                <div className="flex gap-2">
                  <button className="px-3 py-1 bg-green-500/20 text-green-400 text-sm rounded-lg hover:bg-green-500/30 transition-colors">
                    Approve
                  </button>
                  <button className="px-3 py-1 bg-red-500/20 text-red-400 text-sm rounded-lg hover:bg-red-500/30 transition-colors">
                    Reject
                  </button>
                </div>
              </div>
            ))}
            {data.pendingListings.length === 0 && (
              <div className="px-6 py-8 text-center text-[#525252]">
                No pending listings
              </div>
            )}
          </div>
        </div>

        {/* Recent Users */}
        <div className="bg-[#141414] border border-[#1f1f1f] rounded-xl overflow-hidden">
          <div className="px-6 py-4 border-b border-[#1f1f1f] flex items-center justify-between">
            <h2 className="text-lg font-semibold text-white">Recent Signups</h2>
            <Link href="/admin/users" className="text-sm text-[#ff6b35] hover:underline">
              View all →
            </Link>
          </div>
          <div className="divide-y divide-[#1f1f1f]">
            {data.recentUsers.map((user) => (
              <div key={user.id} className="px-6 py-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-[#1f1f1f] flex items-center justify-center text-white font-medium">
                    {user.name?.charAt(0) || user.email.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <div className="font-medium text-white">{user.name || 'Unnamed'}</div>
                    <div className="text-sm text-[#737373]">{user.email}</div>
                  </div>
                </div>
                <span className={`px-2 py-1 rounded text-xs font-medium ${
                  user.role === 'CREATOR' ? 'bg-purple-500/20 text-purple-400' :
                  user.role === 'ADMIN' ? 'bg-red-500/20 text-red-400' :
                  'bg-blue-500/20 text-blue-400'
                }`}>
                  {user.role}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Transactions */}
        <div className="bg-[#141414] border border-[#1f1f1f] rounded-xl overflow-hidden">
          <div className="px-6 py-4 border-b border-[#1f1f1f] flex items-center justify-between">
            <h2 className="text-lg font-semibold text-white">Recent Transactions</h2>
            <Link href="/admin/transactions" className="text-sm text-[#ff6b35] hover:underline">
              View all →
            </Link>
          </div>
          <div className="divide-y divide-[#1f1f1f]">
            {data.recentTransactions.map((tx) => (
              <div key={tx.id} className="px-6 py-4 flex items-center justify-between">
                <div>
                  <div className="font-medium text-white">{tx.listing}</div>
                  <div className="text-sm text-[#737373]">{tx.user}</div>
                </div>
                <div className="text-right">
                  <div className="font-medium text-[#10b981]">${tx.amount.toFixed(2)}</div>
                  <div className="text-xs text-[#525252]">
                    {new Date(tx.createdAt).toLocaleTimeString()}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-[#141414] border border-[#1f1f1f] rounded-xl p-6">
          <h2 className="text-lg font-semibold text-white mb-4">Quick Actions</h2>
          <div className="grid grid-cols-2 gap-3">
            <QuickActionButton icon="👤" label="Add User" href="/admin/users/new" />
            <QuickActionButton icon="📦" label="Review Listings" href="/admin/listings?status=pending" />
            <QuickActionButton icon="💸" label="Process Payouts" href="/admin/payouts" />
            <QuickActionButton icon="📊" label="View Reports" href="/admin/analytics" />
            <QuickActionButton icon="⚙️" label="Platform Settings" href="/admin/settings" />
            <QuickActionButton icon="🔔" label="Send Announcement" href="/admin/settings#announcements" />
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
  change,
  changePositive,
  sparklineData,
  color,
}: {
  title: string
  value: string
  change: string
  changePositive?: boolean
  sparklineData: number[]
  color: string
}) {
  return (
    <div className="bg-[#141414] border border-[#1f1f1f] rounded-xl p-6">
      <div className="flex items-start justify-between">
        <div>
          <div className="text-sm text-[#737373] mb-1">{title}</div>
          <div className="text-3xl font-bold text-white">{value}</div>
          <div className={`text-sm mt-1 ${changePositive ? 'text-[#10b981]' : 'text-[#737373]'}`}>
            {change}
          </div>
        </div>
        {sparklineData.length > 0 && (
          <Sparkline data={sparklineData} color={color} height={40} width={80} />
        )}
      </div>
    </div>
  )
}

// Mini Stat Card
function MiniStatCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="bg-[#141414] border border-[#1f1f1f] rounded-lg p-4">
      <div className="text-sm text-[#737373]">{label}</div>
      <div className="text-xl font-bold text-white">{value.toLocaleString()}</div>
    </div>
  )
}

// Quick Action Button
function QuickActionButton({ icon, label, href }: { icon: string; label: string; href: string }) {
  return (
    <Link
      href={href}
      className="flex items-center gap-3 p-3 bg-[#1f1f1f] hover:bg-[#252525] rounded-lg transition-colors"
    >
      <span className="text-xl">{icon}</span>
      <span className="text-sm font-medium text-white">{label}</span>
    </Link>
  )
}

