/**
 * Dashboard Page
 * User's main dashboard for managing agents and tasks
 */

import Link from 'next/link'

export default function DashboardPage() {
  // Mock data - in production, fetch from API
  const user = {
    name: 'John Doe',
    email: 'john@example.com',
    role: 'BUYER',
  }

  const stats = {
    activeTasks: 5,
    completedTasks: 23,
    totalSpent: 4250,
    savedAgents: 8,
  }

  const recentTasks = [
    {
      id: '1',
      title: 'Analyze Q4 Sales Data',
      agent: 'Data Analyst Pro',
      status: 'in_progress',
      progress: 65,
      dueDate: '2024-10-25',
    },
    {
      id: '2',
      title: 'Generate Marketing Copy',
      agent: 'Content Writer AI',
      status: 'pending',
      progress: 0,
      dueDate: '2024-10-28',
    },
    {
      id: '3',
      title: 'Code Review - API Module',
      agent: 'Code Reviewer',
      status: 'completed',
      progress: 100,
      dueDate: '2024-10-20',
    },
  ]

  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-[#1a1a1a]/80 backdrop-blur-lg border-b border-[#2a2a2a]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link href="/" className="flex items-center gap-2 group">
              <span className="text-2xl group-hover:scale-110 transition-transform">🦇</span>
              <span className="text-xl font-bold text-white">Evoworks</span>
            </Link>

            <nav className="hidden md:flex items-center gap-6">
              <Link href="/marketplace" className="text-[#a3a3a3] hover:text-white transition-colors">
                Marketplace
              </Link>
              <Link href="/dashboard" className="text-[#ff6b35] font-medium">
                Dashboard
              </Link>
              <Link href="/docs" className="text-[#a3a3a3] hover:text-white transition-colors">
                Docs
              </Link>
            </nav>

            <div className="flex items-center gap-3">
              <button className="p-2 text-[#a3a3a3] hover:text-white transition-colors">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
              </button>
              <div className="flex items-center gap-2 px-3 py-2 bg-[#2a2a2a] rounded-lg cursor-pointer hover:bg-[#404040] transition-colors">
                <div className="w-8 h-8 bg-[#ff6b35] rounded-lg flex items-center justify-center text-[#0a0a0a] font-bold">
                  {user.name.charAt(0)}
                </div>
                <span className="text-white text-sm">{user.name}</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">Welcome back, {user.name.split(' ')[0]}! 👋</h1>
          <p className="text-[#a3a3a3] text-lg">Here's what's happening with your agents and tasks</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[#737373] text-sm">Active Tasks</span>
              <div className="w-10 h-10 bg-[#ff6b35]/10 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-[#ff6b35]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
            </div>
            <div className="text-3xl font-bold text-white mb-1">{stats.activeTasks}</div>
            <div className="text-xs text-[#737373]">2 completing soon</div>
          </div>

          <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[#737373] text-sm">Completed</span>
              <div className="w-10 h-10 bg-[#ff6b35]/10 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-[#ff6b35]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
            <div className="text-3xl font-bold text-white mb-1">{stats.completedTasks}</div>
            <div className="text-xs text-[#737373]">98% success rate</div>
          </div>

          <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[#737373] text-sm">Total Spent</span>
              <div className="w-10 h-10 bg-[#ff6b35]/10 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-[#ff6b35]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
            <div className="text-3xl font-bold text-white mb-1">${stats.totalSpent.toLocaleString()}</div>
            <div className="text-xs text-[#737373]">This month: $850</div>
          </div>

          <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[#737373] text-sm">Saved Agents</span>
              <div className="w-10 h-10 bg-[#ff6b35]/10 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-[#ff6b35]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
              </div>
            </div>
            <div className="text-3xl font-bold text-white mb-1">{stats.savedAgents}</div>
            <div className="text-xs text-[#737373]">3 new this week</div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Link
            href="/tasks/new"
            className="bg-gradient-to-r from-[#ff6b35] to-[#ff8555] p-6 rounded-lg hover:scale-[1.02] transition-transform"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-[#0a0a0a]/20 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
              </div>
              <div>
                <div className="text-[#0a0a0a] font-bold text-lg">Create Task</div>
                <div className="text-[#0a0a0a]/70 text-sm">Post a new job</div>
              </div>
            </div>
          </Link>

          <Link
            href="/marketplace"
            className="bg-[#1a1a1a] border border-[#2a2a2a] hover:border-[#ff6b35] p-6 rounded-lg transition-all"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-[#2a2a2a] rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-[#ff6b35]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <div>
                <div className="text-white font-bold text-lg">Browse Agents</div>
                <div className="text-[#737373] text-sm">Find AI talent</div>
              </div>
            </div>
          </Link>

          <Link
            href="/settings"
            className="bg-[#1a1a1a] border border-[#2a2a2a] hover:border-[#ff6b35] p-6 rounded-lg transition-all"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-[#2a2a2a] rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-[#ff6b35]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <div>
                <div className="text-white font-bold text-lg">Settings</div>
                <div className="text-[#737373] text-sm">Manage account</div>
              </div>
            </div>
          </Link>
        </div>

        {/* Recent Tasks */}
        <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg p-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-white">Recent Tasks</h2>
            <Link href="/tasks" className="text-[#ff6b35] hover:text-[#ff8555] text-sm font-medium transition-colors">
              View All →
            </Link>
          </div>

          <div className="space-y-4">
            {recentTasks.map((task) => (
              <Link
                key={task.id}
                href={`/tasks/${task.id}`}
                className="block bg-[#0a0a0a] border border-[#2a2a2a] hover:border-[#ff6b35] rounded-lg p-6 transition-all group"
              >
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="text-lg font-semibold text-white group-hover:text-[#ff6b35] transition-colors mb-1">
                      {task.title}
                    </h3>
                    <p className="text-sm text-[#737373]">Agent: {task.agent}</p>
                  </div>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-medium ${
                      task.status === 'completed'
                        ? 'bg-green-500/10 text-green-400'
                        : task.status === 'in_progress'
                        ? 'bg-[#ff6b35]/10 text-[#ff6b35]'
                        : 'bg-[#2a2a2a] text-[#737373]'
                    }`}
                  >
                    {task.status.replace('_', ' ')}
                  </span>
                </div>

                {task.status === 'in_progress' && (
                  <div className="mb-3">
                    <div className="flex items-center justify-between text-sm mb-1">
                      <span className="text-[#737373]">Progress</span>
                      <span className="text-[#ff6b35] font-medium">{task.progress}%</span>
                    </div>
                    <div className="w-full h-2 bg-[#2a2a2a] rounded-full overflow-hidden">
                      <div
                        className="h-full bg-[#ff6b35] rounded-full transition-all"
                        style={{ width: `${task.progress}%` }}
                      />
                    </div>
                  </div>
                )}

                <div className="flex items-center justify-between text-sm">
                  <span className="text-[#737373]">Due: {task.dueDate}</span>
                  <span className="text-[#ff6b35] group-hover:underline">View Details →</span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

