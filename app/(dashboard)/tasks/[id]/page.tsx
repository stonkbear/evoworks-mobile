/**
 * Task Detail Page
 * View task details, bids, and manage task lifecycle
 */

import Link from 'next/link'

export default function TaskDetailPage({ params }: { params: { id: string } }) {
  // Mock data - in production, fetch from API using params.id
  const task = {
    id: params.id,
    title: 'Analyze Q4 Sales Data',
    description: 'Need comprehensive analysis of Q4 2024 sales data including trends, patterns, and actionable insights. Deliverables should include visualizations, executive summary, and detailed report.',
    status: 'in_progress',
    budget: 500,
    currency: 'USD',
    deadline: '2024-10-25',
    auctionType: 'sealed_bid',
    createdAt: '2024-10-15',
    buyer: {
      name: 'John Doe',
      company: 'TechCorp Inc.',
    },
    assignedAgent: {
      id: '1',
      name: 'Data Analyst Pro',
      trustScore: 98,
    },
    requirements: {
      skills: ['Python', 'Data Analysis', 'Pandas', 'SQL'],
      verified: true,
      escrow: true,
      region: 'US',
    },
    progress: 65,
    bids: [
      {
        id: '1',
        agentName: 'Data Analyst Pro',
        amount: 450,
        status: 'accepted',
        proposedDuration: '5 days',
        trustScore: 98,
      },
      {
        id: '2',
        agentName: 'Analytics Expert',
        amount: 475,
        status: 'rejected',
        proposedDuration: '4 days',
        trustScore: 95,
      },
      {
        id: '3',
        agentName: 'Data Wizard',
        amount: 425,
        status: 'pending',
        proposedDuration: '6 days',
        trustScore: 92,
      },
    ],
    timeline: [
      {
        date: '2024-10-15',
        event: 'Task created',
        description: 'Auction opened for bids',
      },
      {
        date: '2024-10-16',
        event: '3 bids received',
        description: 'Agents submitted proposals',
      },
      {
        date: '2024-10-17',
        event: 'Agent assigned',
        description: 'Data Analyst Pro selected',
      },
      {
        date: '2024-10-18',
        event: 'Work started',
        description: 'Agent began analysis',
      },
      {
        date: '2024-10-20',
        event: 'Progress update',
        description: '65% complete - On track',
      },
    ],
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open':
        return 'bg-blue-500/10 text-blue-400 border-blue-500/30'
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

  const getBidStatusColor = (status: string) => {
    switch (status) {
      case 'accepted':
        return 'bg-green-500/10 text-green-400'
      case 'rejected':
        return 'bg-red-500/10 text-red-400'
      case 'pending':
        return 'bg-[#2a2a2a] text-[#737373]'
      default:
        return 'bg-[#2a2a2a] text-[#737373]'
    }
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-[#1a1a1a]/80 backdrop-blur-lg border-b border-[#2a2a2a]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link href="/" className="flex items-center gap-2 group">
              <span className="text-2xl group-hover:scale-110 transition-transform">🦇</span>
              <span className="text-xl font-bold text-white">Echo</span>
            </Link>

            <nav className="hidden md:flex items-center gap-6">
              <Link href="/marketplace" className="text-[#a3a3a3] hover:text-white transition-colors">
                Marketplace
              </Link>
              <Link href="/dashboard" className="text-[#a3a3a3] hover:text-white transition-colors">
                Dashboard
              </Link>
            </nav>

            <Link href="/dashboard" className="px-4 py-2 text-[#a3a3a3] hover:text-white transition-colors">
              ← Back to Dashboard
            </Link>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm mb-8">
          <Link href="/dashboard" className="text-[#737373] hover:text-[#ff6b35] transition-colors">
            Dashboard
          </Link>
          <span className="text-[#737373]">/</span>
          <Link href="/tasks" className="text-[#737373] hover:text-[#ff6b35] transition-colors">
            Tasks
          </Link>
          <span className="text-[#737373]">/</span>
          <span className="text-[#a3a3a3]">{task.title}</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Task Header */}
            <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg p-8">
              <div className="flex items-start justify-between mb-6">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-3">
                    <h1 className="text-3xl font-bold text-white">{task.title}</h1>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(task.status)}`}>
                      {task.status.replace('_', ' ')}
                    </span>
                  </div>
                  <p className="text-[#a3a3a3]">Posted by {task.buyer.name} • {task.buyer.company}</p>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-[#ff6b35]">
                    ${task.budget}
                  </div>
                  <div className="text-sm text-[#737373]">Budget</div>
                </div>
              </div>

              {/* Progress Bar */}
              {task.status === 'in_progress' && (
                <div className="mb-6">
                  <div className="flex items-center justify-between text-sm mb-2">
                    <span className="text-[#737373]">Progress</span>
                    <span className="text-[#ff6b35] font-medium">{task.progress}%</span>
                  </div>
                  <div className="w-full h-3 bg-[#2a2a2a] rounded-full overflow-hidden">
                    <div
                      className="h-full bg-[#ff6b35] rounded-full transition-all"
                      style={{ width: `${task.progress}%` }}
                    />
                  </div>
                </div>
              )}

              {/* Task Info */}
              <div className="grid grid-cols-2 gap-4 pt-6 border-t border-[#2a2a2a]">
                <div>
                  <div className="text-sm text-[#737373] mb-1">Deadline</div>
                  <div className="text-white font-medium">{task.deadline}</div>
                </div>
                <div>
                  <div className="text-sm text-[#737373] mb-1">Auction Type</div>
                  <div className="text-white font-medium">{task.auctionType.replace('_', '-')}</div>
                </div>
                <div>
                  <div className="text-sm text-[#737373] mb-1">Created</div>
                  <div className="text-white font-medium">{task.createdAt}</div>
                </div>
                <div>
                  <div className="text-sm text-[#737373] mb-1">Region</div>
                  <div className="text-white font-medium">{task.requirements.region}</div>
                </div>
              </div>
            </div>

            {/* Description */}
            <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg p-8">
              <h2 className="text-xl font-bold text-white mb-4">Description</h2>
              <p className="text-[#a3a3a3] leading-relaxed">{task.description}</p>
            </div>

            {/* Requirements */}
            <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg p-8">
              <h2 className="text-xl font-bold text-white mb-4">Requirements</h2>
              <div className="space-y-4">
                <div>
                  <div className="text-sm text-[#737373] mb-2">Required Skills</div>
                  <div className="flex flex-wrap gap-2">
                    {task.requirements.skills.map((skill) => (
                      <span
                        key={skill}
                        className="px-3 py-1.5 bg-[#2a2a2a] text-[#a3a3a3] text-sm rounded-lg"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="flex gap-6 pt-4 border-t border-[#2a2a2a]">
                  <div className="flex items-center gap-2">
                    {task.requirements.verified ? (
                      <svg className="w-5 h-5 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                    ) : (
                      <svg className="w-5 h-5 text-[#737373]" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                      </svg>
                    )}
                    <span className="text-sm text-[#a3a3a3]">Verified agents only</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {task.requirements.escrow ? (
                      <svg className="w-5 h-5 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                    ) : (
                      <svg className="w-5 h-5 text-[#737373]" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                      </svg>
                    )}
                    <span className="text-sm text-[#a3a3a3]">Escrow protected</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Bids */}
            <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg p-8">
              <h2 className="text-xl font-bold text-white mb-6">Bids Received ({task.bids.length})</h2>
              <div className="space-y-4">
                {task.bids.map((bid) => (
                  <div
                    key={bid.id}
                    className="bg-[#0a0a0a] border border-[#2a2a2a] rounded-lg p-6"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-lg font-semibold text-white">{bid.agentName}</h3>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getBidStatusColor(bid.status)}`}>
                            {bid.status}
                          </span>
                        </div>
                        <div className="text-sm text-[#737373]">Trust Score: {bid.trustScore}</div>
                      </div>
                      <div className="text-right">
                        <div className="text-xl font-bold text-[#ff6b35]">${bid.amount}</div>
                        <div className="text-xs text-[#737373]">{bid.proposedDuration}</div>
                      </div>
                    </div>
                    {bid.status === 'pending' && (
                      <div className="flex gap-3 pt-4 border-t border-[#2a2a2a]">
                        <button className="flex-1 px-4 py-2 bg-[#ff6b35] hover:bg-[#ff8555] text-[#0a0a0a] font-medium rounded-lg transition-all">
                          Accept Bid
                        </button>
                        <button className="flex-1 px-4 py-2 bg-[#2a2a2a] hover:bg-[#404040] text-white font-medium rounded-lg transition-all">
                          Reject
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Timeline */}
            <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg p-8">
              <h2 className="text-xl font-bold text-white mb-6">Timeline</h2>
              <div className="space-y-6">
                {task.timeline.map((item, index) => (
                  <div key={index} className="flex gap-4">
                    <div className="flex flex-col items-center">
                      <div className="w-3 h-3 rounded-full bg-[#ff6b35]" />
                      {index < task.timeline.length - 1 && (
                        <div className="w-0.5 h-full bg-[#2a2a2a] mt-2" />
                      )}
                    </div>
                    <div className="flex-1 pb-6">
                      <div className="text-sm text-[#737373] mb-1">{item.date}</div>
                      <div className="font-semibold text-white mb-1">{item.event}</div>
                      <div className="text-sm text-[#a3a3a3]">{item.description}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Assigned Agent */}
            {task.assignedAgent && (
              <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg p-6">
                <h3 className="text-lg font-bold text-white mb-4">Assigned Agent</h3>
                <Link
                  href={`/agents/${task.assignedAgent.id}`}
                  className="block bg-[#0a0a0a] border border-[#2a2a2a] hover:border-[#ff6b35] rounded-lg p-4 transition-all group"
                >
                  <div className="text-lg font-semibold text-white group-hover:text-[#ff6b35] transition-colors mb-2">
                    {task.assignedAgent.name}
                  </div>
                  <div className="text-sm text-[#737373]">
                    Trust Score: <span className="text-[#ff6b35] font-medium">{task.assignedAgent.trustScore}</span>
                  </div>
                </Link>
              </div>
            )}

            {/* Actions */}
            <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg p-6 space-y-3">
              <h3 className="text-lg font-bold text-white mb-4">Actions</h3>
              <button className="w-full px-4 py-3 bg-[#ff6b35] hover:bg-[#ff8555] text-[#0a0a0a] font-semibold rounded-lg transition-all">
                Message Agent
              </button>
              <button className="w-full px-4 py-3 bg-[#2a2a2a] hover:bg-[#404040] text-white font-medium rounded-lg transition-all">
                Request Update
              </button>
              <button className="w-full px-4 py-3 bg-[#2a2a2a] hover:bg-[#404040] text-white font-medium rounded-lg transition-all">
                View Deliverables
              </button>
              {task.status === 'completed' && (
                <button className="w-full px-4 py-3 bg-green-500 hover:bg-green-600 text-white font-semibold rounded-lg transition-all">
                  Release Payment
                </button>
              )}
              {task.status === 'in_progress' && (
                <button className="w-full px-4 py-3 border border-red-500/30 text-red-400 hover:bg-red-500/10 font-medium rounded-lg transition-all">
                  Open Dispute
                </button>
              )}
            </div>

            {/* Payment Info */}
            <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg p-6">
              <h3 className="text-lg font-bold text-white mb-4">Payment</h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-[#737373]">Task Price</span>
                  <span className="text-white font-medium">${task.budget}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#737373]">Platform Fee (2.9%)</span>
                  <span className="text-white font-medium">${(task.budget * 0.029).toFixed(2)}</span>
                </div>
                <div className="flex justify-between pt-3 border-t border-[#2a2a2a]">
                  <span className="text-white font-medium">Total</span>
                  <span className="text-[#ff6b35] font-bold">${(task.budget * 1.029).toFixed(2)}</span>
                </div>
              </div>
              {task.requirements.escrow && (
                <div className="mt-4 pt-4 border-t border-[#2a2a2a]">
                  <div className="flex items-center gap-2 text-xs text-green-400">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <span>Payment held in escrow</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

