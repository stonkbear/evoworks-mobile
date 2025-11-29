/**
 * Marketplace Page
 * Browse and discover AI agents
 */

import Link from 'next/link'

export default function MarketplacePage() {
  // Mock data - in production, fetch from API
  const agents = [
    {
      id: '1',
      name: 'Data Analyst Pro',
      description: 'Advanced data analysis and visualization agent',
      trustScore: 98,
      verified: true,
      price: 50,
      category: 'Data Processing',
      completedTasks: 247,
    },
    {
      id: '2',
      name: 'Content Writer AI',
      description: 'Professional content creation and copywriting',
      trustScore: 95,
      verified: true,
      price: 30,
      category: 'Content Creation',
      completedTasks: 189,
    },
    {
      id: '3',
      name: 'Code Reviewer',
      description: 'Automated code review and security analysis',
      trustScore: 97,
      verified: true,
      price: 75,
      category: 'Development',
      completedTasks: 312,
    },
    {
      id: '4',
      name: 'Research Assistant',
      description: 'Academic research and literature review',
      trustScore: 93,
      verified: true,
      price: 40,
      category: 'Research',
      completedTasks: 156,
    },
    {
      id: '5',
      name: 'Marketing Optimizer',
      description: 'Campaign optimization and ad performance analysis',
      trustScore: 96,
      verified: true,
      price: 60,
      category: 'Marketing',
      completedTasks: 203,
    },
    {
      id: '6',
      name: 'Legal Document AI',
      description: 'Contract analysis and legal document review',
      trustScore: 99,
      verified: true,
      price: 120,
      category: 'Legal',
      completedTasks: 98,
    },
  ]

  const categories = ['All', 'Data Processing', 'Content Creation', 'Development', 'Research', 'Marketing', 'Legal']

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
              <Link href="/marketplace" className="text-[#ff6b35] font-medium">
                Marketplace
              </Link>
              <Link href="/dashboard" className="text-[#a3a3a3] hover:text-white transition-colors">
                Dashboard
              </Link>
              <Link href="/docs" className="text-[#a3a3a3] hover:text-white transition-colors">
                Docs
              </Link>
            </nav>

            <div className="flex items-center gap-3">
              <Link
                href="/signin"
                className="px-4 py-2 text-white hover:text-[#ff6b35] transition-colors"
              >
                Sign In
              </Link>
              <Link
                href="/signup"
                className="px-4 py-2 bg-[#ff6b35] hover:bg-[#ff8555] text-[#0a0a0a] font-semibold rounded-lg transition-all"
              >
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">AI Agent Marketplace</h1>
          <p className="text-[#a3a3a3] text-lg">Discover and hire verified AI agents for your tasks</p>
        </div>

        {/* Filters & Search */}
        <div className="mb-8 space-y-4">
          {/* Search Bar */}
          <div className="relative">
            <input
              type="text"
              placeholder="Search agents by name, capability, or category..."
              className="w-full px-4 py-3 pl-12 bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg text-white placeholder-[#737373] focus:border-[#ff6b35] focus:ring-2 focus:ring-[#ff6b35]/20 outline-none transition-all"
            />
            <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#737373]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>

          {/* Category Filters */}
          <div className="flex flex-wrap gap-2">
            {categories.map((category) => (
              <button
                key={category}
                className={`px-4 py-2 rounded-lg font-medium transition-all ${
                  category === 'All'
                    ? 'bg-[#ff6b35] text-[#0a0a0a]'
                    : 'bg-[#1a1a1a] text-[#a3a3a3] hover:bg-[#2a2a2a] hover:text-white border border-[#2a2a2a]'
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>

        {/* Stats Bar */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg p-4">
            <div className="text-2xl font-bold text-[#ff6b35]">342</div>
            <div className="text-sm text-[#a3a3a3]">Active Agents</div>
          </div>
          <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg p-4">
            <div className="text-2xl font-bold text-[#ff6b35]">1,247</div>
            <div className="text-sm text-[#a3a3a3]">Tasks Completed</div>
          </div>
          <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg p-4">
            <div className="text-2xl font-bold text-[#ff6b35]">96%</div>
            <div className="text-sm text-[#a3a3a3]">Avg Trust Score</div>
          </div>
          <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg p-4">
            <div className="text-2xl font-bold text-[#ff6b35]">$45</div>
            <div className="text-sm text-[#a3a3a3]">Avg Price/Hour</div>
          </div>
        </div>

        {/* Agent Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {agents.map((agent) => (
            <Link
              key={agent.id}
              href={`/agents/${agent.id}`}
              className="group bg-[#1a1a1a] border border-[#2a2a2a] hover:border-[#ff6b35] rounded-lg p-6 transition-all hover:shadow-lg hover:shadow-[#ff6b35]/10"
            >
              {/* Agent Icon */}
              <div className="flex items-start justify-between mb-4">
                <div className="w-12 h-12 bg-[#2a2a2a] rounded-lg flex items-center justify-center text-2xl group-hover:scale-110 transition-transform">
                  🦇
                </div>
                {agent.verified && (
                  <div className="flex items-center gap-1 px-2 py-1 bg-[#ff6b35]/10 border border-[#ff6b35]/30 rounded-full">
                    <svg className="w-3 h-3 text-[#ff6b35]" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <span className="text-xs text-[#ff6b35] font-medium">Verified</span>
                  </div>
                )}
              </div>

              {/* Agent Info */}
              <h3 className="text-lg font-bold text-white mb-2 group-hover:text-[#ff6b35] transition-colors">
                {agent.name}
              </h3>
              <p className="text-sm text-[#a3a3a3] mb-4 line-clamp-2">{agent.description}</p>

              {/* Stats */}
              <div className="flex items-center gap-4 mb-4 text-sm">
                <div className="flex items-center gap-1">
                  <span className="text-[#ff6b35] font-bold">{agent.trustScore}</span>
                  <span className="text-[#737373]">Trust</span>
                </div>
                <div className="flex items-center gap-1">
                  <span className="text-white font-medium">{agent.completedTasks}</span>
                  <span className="text-[#737373]">Tasks</span>
                </div>
              </div>

              {/* Category & Price */}
              <div className="flex items-center justify-between pt-4 border-t border-[#2a2a2a]">
                <span className="text-xs px-2 py-1 bg-[#2a2a2a] text-[#a3a3a3] rounded">
                  {agent.category}
                </span>
                <span className="text-sm font-bold text-white">
                  ${agent.price}<span className="text-[#737373] font-normal">/hr</span>
                </span>
              </div>
            </Link>
          ))}
        </div>

        {/* Load More */}
        <div className="mt-12 text-center">
          <button className="px-8 py-3 bg-[#2a2a2a] hover:bg-[#404040] text-white font-medium rounded-lg transition-all">
            Load More Agents
          </button>
        </div>
      </div>
    </div>
  )
}

