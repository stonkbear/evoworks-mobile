'use client'

/**
 * Admin Users Management
 * View, search, and manage platform users
 */

import { useState, useMemo } from 'react'
import Link from 'next/link'

type UserRole = 'BUYER' | 'CREATOR' | 'ADMIN'
type UserStatus = 'active' | 'suspended' | 'pending'

interface User {
  id: string
  email: string
  name: string | null
  role: UserRole
  status: UserStatus
  emailVerified: boolean
  createdAt: string
  lastLoginAt: string | null
  publisherId: string | null
  totalSpent: number
  totalEarned: number
}

// Mock users data
const mockUsers: User[] = [
  { id: '1', email: 'admin@evoworks.ai', name: 'Admin User', role: 'ADMIN', status: 'active', emailVerified: true, createdAt: '2023-01-01T00:00:00Z', lastLoginAt: '2024-01-15T10:00:00Z', publisherId: null, totalSpent: 0, totalEarned: 0 },
  { id: '2', email: 'john@techcorp.ai', name: 'John Smith', role: 'CREATOR', status: 'active', emailVerified: true, createdAt: '2023-06-15T10:30:00Z', lastLoginAt: '2024-01-15T09:30:00Z', publisherId: 'pub-1', totalSpent: 150, totalEarned: 12500 },
  { id: '3', email: 'jane@startup.io', name: 'Jane Doe', role: 'BUYER', status: 'active', emailVerified: true, createdAt: '2023-09-20T14:00:00Z', lastLoginAt: '2024-01-14T18:45:00Z', publisherId: null, totalSpent: 890, totalEarned: 0 },
  { id: '4', email: 'bob@enterprise.com', name: 'Bob Wilson', role: 'CREATOR', status: 'active', emailVerified: true, createdAt: '2023-10-05T09:15:00Z', lastLoginAt: '2024-01-15T08:00:00Z', publisherId: 'pub-2', totalSpent: 50, totalEarned: 8900 },
  { id: '5', email: 'alice@dev.co', name: 'Alice Chen', role: 'BUYER', status: 'suspended', emailVerified: true, createdAt: '2023-11-10T16:30:00Z', lastLoginAt: '2024-01-10T12:00:00Z', publisherId: null, totalSpent: 245, totalEarned: 0 },
  { id: '6', email: 'charlie@agency.io', name: 'Charlie Brown', role: 'CREATOR', status: 'active', emailVerified: false, createdAt: '2024-01-10T11:00:00Z', lastLoginAt: null, publisherId: 'pub-3', totalSpent: 0, totalEarned: 340 },
  { id: '7', email: 'diana@corp.net', name: 'Diana Prince', role: 'BUYER', status: 'pending', emailVerified: false, createdAt: '2024-01-14T20:00:00Z', lastLoginAt: null, publisherId: null, totalSpent: 0, totalEarned: 0 },
  { id: '8', email: 'eve@tech.co', name: null, role: 'BUYER', status: 'active', emailVerified: true, createdAt: '2024-01-15T06:00:00Z', lastLoginAt: '2024-01-15T06:30:00Z', publisherId: null, totalSpent: 15, totalEarned: 0 },
]

const roleColors: Record<UserRole, string> = {
  ADMIN: 'bg-red-500/20 text-red-400',
  CREATOR: 'bg-purple-500/20 text-purple-400',
  BUYER: 'bg-blue-500/20 text-blue-400',
}

const statusColors: Record<UserStatus, string> = {
  active: 'bg-green-500/20 text-green-400',
  suspended: 'bg-red-500/20 text-red-400',
  pending: 'bg-yellow-500/20 text-yellow-400',
}

export default function AdminUsersPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [roleFilter, setRoleFilter] = useState<UserRole | 'all'>('all')
  const [statusFilter, setStatusFilter] = useState<UserStatus | 'all'>('all')
  const [selectedUsers, setSelectedUsers] = useState<Set<string>>(new Set())

  const filteredUsers = useMemo(() => {
    return mockUsers.filter(user => {
      const matchesSearch = !searchQuery || 
        user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.name?.toLowerCase().includes(searchQuery.toLowerCase())
      const matchesRole = roleFilter === 'all' || user.role === roleFilter
      const matchesStatus = statusFilter === 'all' || user.status === statusFilter
      return matchesSearch && matchesRole && matchesStatus
    })
  }, [searchQuery, roleFilter, statusFilter])

  const toggleSelectUser = (id: string) => {
    const newSelected = new Set(selectedUsers)
    if (newSelected.has(id)) {
      newSelected.delete(id)
    } else {
      newSelected.add(id)
    }
    setSelectedUsers(newSelected)
  }

  const toggleSelectAll = () => {
    if (selectedUsers.size === filteredUsers.length) {
      setSelectedUsers(new Set())
    } else {
      setSelectedUsers(new Set(filteredUsers.map(u => u.id)))
    }
  }

  const handleBulkAction = (action: 'suspend' | 'activate' | 'delete') => {
    alert(`${action} ${selectedUsers.size} users`)
    setSelectedUsers(new Set())
  }

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white">Users</h1>
          <p className="text-[#737373] mt-1">Manage platform users and permissions</p>
        </div>
        <Link
          href="/admin/users/new"
          className="px-4 py-2 bg-[#ff6b35] hover:bg-[#ff8555] text-[#0a0a0a] font-semibold rounded-lg transition-colors"
        >
          + Add User
        </Link>
      </div>

      {/* Filters */}
      <div className="bg-[#141414] border border-[#1f1f1f] rounded-xl p-4 mb-6">
        <div className="flex flex-wrap gap-4">
          {/* Search */}
          <div className="flex-1 min-w-[200px]">
            <input
              type="text"
              placeholder="Search by email or name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-4 py-2 bg-[#0a0a0a] border border-[#1f1f1f] rounded-lg text-white placeholder-[#525252] focus:border-[#ff6b35] focus:outline-none"
            />
          </div>

          {/* Role Filter */}
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value as UserRole | 'all')}
            className="px-4 py-2 bg-[#0a0a0a] border border-[#1f1f1f] rounded-lg text-white focus:border-[#ff6b35] focus:outline-none"
          >
            <option value="all">All Roles</option>
            <option value="BUYER">Buyers</option>
            <option value="CREATOR">Creators</option>
            <option value="ADMIN">Admins</option>
          </select>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as UserStatus | 'all')}
            className="px-4 py-2 bg-[#0a0a0a] border border-[#1f1f1f] rounded-lg text-white focus:border-[#ff6b35] focus:outline-none"
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="suspended">Suspended</option>
            <option value="pending">Pending</option>
          </select>
        </div>
      </div>

      {/* Bulk Actions */}
      {selectedUsers.size > 0 && (
        <div className="bg-[#ff6b35]/10 border border-[#ff6b35]/20 rounded-lg p-4 mb-6 flex items-center justify-between">
          <span className="text-[#ff6b35]">{selectedUsers.size} users selected</span>
          <div className="flex gap-2">
            <button
              onClick={() => handleBulkAction('activate')}
              className="px-3 py-1 bg-green-500/20 text-green-400 text-sm rounded-lg hover:bg-green-500/30 transition-colors"
            >
              Activate
            </button>
            <button
              onClick={() => handleBulkAction('suspend')}
              className="px-3 py-1 bg-yellow-500/20 text-yellow-400 text-sm rounded-lg hover:bg-yellow-500/30 transition-colors"
            >
              Suspend
            </button>
            <button
              onClick={() => handleBulkAction('delete')}
              className="px-3 py-1 bg-red-500/20 text-red-400 text-sm rounded-lg hover:bg-red-500/30 transition-colors"
            >
              Delete
            </button>
          </div>
        </div>
      )}

      {/* Users Table */}
      <div className="bg-[#141414] border border-[#1f1f1f] rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-left text-sm text-[#737373] border-b border-[#1f1f1f]">
                <th className="px-6 py-4">
                  <input
                    type="checkbox"
                    checked={selectedUsers.size === filteredUsers.length && filteredUsers.length > 0}
                    onChange={toggleSelectAll}
                    className="rounded border-[#1f1f1f] bg-[#0a0a0a] text-[#ff6b35] focus:ring-[#ff6b35]"
                  />
                </th>
                <th className="px-6 py-4 font-medium">User</th>
                <th className="px-6 py-4 font-medium">Role</th>
                <th className="px-6 py-4 font-medium">Status</th>
                <th className="px-6 py-4 font-medium">Verified</th>
                <th className="px-6 py-4 font-medium text-right">Spent</th>
                <th className="px-6 py-4 font-medium text-right">Earned</th>
                <th className="px-6 py-4 font-medium">Joined</th>
                <th className="px-6 py-4 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1f1f1f]">
              {filteredUsers.map((user) => (
                <tr key={user.id} className="hover:bg-[#1f1f1f]/50 transition-colors">
                  <td className="px-6 py-4">
                    <input
                      type="checkbox"
                      checked={selectedUsers.has(user.id)}
                      onChange={() => toggleSelectUser(user.id)}
                      className="rounded border-[#1f1f1f] bg-[#0a0a0a] text-[#ff6b35] focus:ring-[#ff6b35]"
                    />
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-[#1f1f1f] flex items-center justify-center text-white font-medium">
                        {user.name?.charAt(0) || user.email.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <div className="font-medium text-white">{user.name || 'Unnamed'}</div>
                        <div className="text-sm text-[#737373]">{user.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded text-xs font-medium ${roleColors[user.role]}`}>
                      {user.role}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded text-xs font-medium ${statusColors[user.status]}`}>
                      {user.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    {user.emailVerified ? (
                      <span className="text-green-400">✓</span>
                    ) : (
                      <span className="text-[#525252]">✗</span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-right text-[#a3a3a3]">
                    ${user.totalSpent.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 text-right text-[#10b981]">
                    ${user.totalEarned.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 text-[#737373] text-sm">
                    {new Date(user.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex gap-2">
                      <Link
                        href={`/admin/users/${user.id}`}
                        className="text-[#ff6b35] hover:underline text-sm"
                      >
                        View
                      </Link>
                      <button className="text-[#737373] hover:text-white text-sm">
                        Edit
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Empty State */}
        {filteredUsers.length === 0 && (
          <div className="px-6 py-12 text-center text-[#525252]">
            <div className="text-4xl mb-3">👥</div>
            <p>No users found</p>
          </div>
        )}

        {/* Pagination */}
        <div className="px-6 py-4 border-t border-[#1f1f1f] flex items-center justify-between">
          <div className="text-sm text-[#737373]">
            Showing {filteredUsers.length} of {mockUsers.length} users
          </div>
          <div className="flex gap-2">
            <button className="px-3 py-1 bg-[#1f1f1f] text-[#737373] rounded-lg text-sm" disabled>
              Previous
            </button>
            <button className="px-3 py-1 bg-[#ff6b35] text-[#0a0a0a] rounded-lg text-sm font-medium">
              1
            </button>
            <button className="px-3 py-1 bg-[#1f1f1f] text-[#737373] rounded-lg text-sm" disabled>
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

