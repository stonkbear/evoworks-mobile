/**
 * Tasks List Page
 * View all user's tasks (posted and in progress)
 */

import Link from 'next/link'

export default function TasksPage() {
  // Mock data - in production, fetch from API
  const tasks = [
    {
      id: '1',
      title: 'Analyze Q4 Sales Data',
      description: 'Need comprehensive analysis of Q4 2024 sales data',
      status: 'in_progress',
      budget: 500,
      deadline: '2024-10-25',
      agentName: 'Data Analyst Pro',
      progress: 65,
      bidsCount: 3,
    },
    {
      id: '2',
      title: 'Generate Marketing Copy',
      description: 'Create compelling marketing copy for new product launch',
      status: 'pending',
      budget: 300,
      deadline: '2024-10-28',
      agentName: null,
      progress: 0,
      bidsCount: 5,
    },
    {
      id: '3',
      title: 'Code Review - API Module',
      description: 'Security and performance review of REST API implementation',
      status: 'completed',
      budget: 750,
      deadline: '2024-10-20',
      agentName: 'Code Reviewer',
      progress: 100,
      bidsCount: 4,
    },
    {
      id: '4',
      title: 'Market Research Report',
      description: 'Comprehensive market analysis for AI agent industry',
      status: 'open',
      budget: 1000,
      deadline: '2024-11-05',
      agentName: null,
      progress: 0,
      bidsCount: 2,
    },
    {
      id: '5',
      title: 'UI/UX Design Review',
      description: 'Evaluate current dashboard design and provide recommendations',
      status: 'in_progress',
      budget: 600,
      deadline: '2024-10-30',
      agentName: 'UX Expert',
      progress: 40,
      bidsCount: 6,
    },
  ]

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open':
        return 'bg-blue-500/10 text-blue-400 border-blue-500/30'
      case 'pending':
        return 'bg-yellow-500/10 text-yellow-400 border-yellow-500/30'
      case 'in_progress':
        return 'bg-[#ff6b35]/10 text-[#ff6b35] border-[#ff6b35]/30'
      case 'completed':
        return 'bg-green-500/10 text-green-400 border-green-500/30'
      case 'cancelled':
        return 'bg-red-500/10 text-red-400 border-red-500/30'
      default:
        return 'bg-[#2a2a2a] text-[#737373] border-[#2a2a2a]'
    }
  }

  const stats = {
    active: tasks.filter(t => t.status === 'in_progress').length,
    open: tasks.filter(t => t.status === 'open' || t.status === 'pending').length,
    completed: tasks.filter(t => t.status === 'completed').length,
    totalSpent: tasks.filter(t => t.status === 'completed').reduce((sum, t) => sum + t.budget, 0),
  }

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
              <Link href="/dashboard" className="text-[#a3a3a3] hover:text-white transition-colors">
                Dashboard
              </Link>
              <Link href="/tasks" className="text-[#ff6b35] font-medium">
                Tasks
              </Link>
            </nav>

            <div className="flex items-center gap-3">
              <Link
                href="/tasks/new"
                className="px-4 py-2 bg-[#ff6b35] hover:bg-[#ff8555] text-[#0a0a0a] font-semibold rounded-lg transition-all"
              >
                + New Task
              </Link>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">My Tasks</h1>
          <p className="text-[#a3a3a3] text-lg">Manage your posted tasks and track progress</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[#737373] text-sm">Active</span>
              <div className="w-10 h-10 bg-[#ff6b35]/10 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-[#ff6b35]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
            </div>
            <div className="text-3xl font-bold text-white">{stats.active}</div>
          </div>

          <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[#737373] text-sm">Open</span>
              <div className="w-10 h-10 bg-blue-500/10 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
            <div className="text-3xl font-bold text-white">{stats.open}</div>
          </div>

          <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[#737373] text-sm">Completed</span>
              <div className="w-10 h-10 bg-green-500/10 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
            <div className="text-3xl font-bold text-white">{stats.completed}</div>
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
            <div className="text-3xl font-bold text-white">${stats.totalSpent}</div>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-3 mb-8">
          <button className="px-4 py-2 bg-[#ff6b35] text-[#0a0a0a] font-medium rounded-lg">
            All Tasks
          </button>
          <button className="px-4 py-2 bg-[#1a1a1a] text-[#a3a3a3] hover:bg-[#2a2a2a] hover:text-white border border-[#2a2a2a] rounded-lg transition-all">
            Active
          </button>
          <button className="px-4 py-2 bg-[#1a1a1a] text-[#a3a3a3] hover:bg-[#2a2a2a] hover:text-white border border-[#2a2a2a] rounded-lg transition-all">
            Open
          </button>
          <button className="px-4 py-2 bg-[#1a1a1a] text-[#a3a3a3] hover:bg-[#2a2a2a] hover:text-white border border-[#2a2a2a] rounded-lg transition-all">
            Completed
          </button>
          <div className="ml-auto">
            <select className="px-4 py-2 bg-[#1a1a1a] border border-[#2a2a2a] text-white rounded-lg focus:border-[#ff6b35] focus:ring-2 focus:ring-[#ff6b35]/20 outline-none">
              <option>Sort by Date</option>
              <option>Sort by Budget</option>
              <option>Sort by Status</option>
            </select>
          </div>
        </div>

        {/* Tasks List */}
        <div className="space-y-4">
          {tasks.map((task) => (
            <Link
              key={task.id}
              href={`/tasks/${task.id}`}
              className="block bg-[#1a1a1a] border border-[#2a2a2a] hover:border-[#ff6b35] rounded-lg p-6 transition-all group"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-xl font-semibold text-white group-hover:text-[#ff6b35] transition-colors">
                      {task.title}
                    </h3>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(task.status)}`}>
                      {task.status.replace('_', ' ')}
                    </span>
                  </div>
                  <p className="text-sm text-[#a3a3a3] mb-3 line-clamp-1">{task.description}</p>
                  <div className="flex items-center gap-6 text-sm text-[#737373]">
                    <div className="flex items-center gap-1">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span>${task.budget}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      <span>{task.deadline}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z" />
                      </svg>
                      <span>{task.bidsCount} bids</span>
                    </div>
                    {task.agentName && (
                      <div className="flex items-center gap-1">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                        <span>{task.agentName}</span>
                      </div>
                    )}
                  </div>
                </div>
                <div className="text-right ml-4">
                  <button className="px-4 py-2 bg-[#2a2a2a] hover:bg-[#404040] text-white text-sm font-medium rounded-lg transition-all">
                    View Details →
                  </button>
                </div>
              </div>

              {/* Progress Bar */}
              {task.status === 'in_progress' && (
                <div className="pt-4 border-t border-[#2a2a2a]">
                  <div className="flex items-center justify-between text-sm mb-2">
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
            </Link>
          ))}
        </div>

        {/* Empty State (if no tasks) */}
        {tasks.length === 0 && (
          <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg p-16 text-center">
            <div className="text-6xl mb-4">📋</div>
            <h3 className="text-2xl font-bold text-white mb-2">No tasks yet</h3>
            <p className="text-[#a3a3a3] mb-6">Create your first task to get started</p>
            <Link
              href="/tasks/new"
              className="inline-block px-6 py-3 bg-[#ff6b35] hover:bg-[#ff8555] text-[#0a0a0a] font-semibold rounded-lg transition-all"
            >
              Create Task
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}

