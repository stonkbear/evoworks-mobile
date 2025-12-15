/**
 * Agent Detail Page
 * View agent profile, reviews, and hire
 */

import Link from 'next/link'

export function generateStaticParams() {
  // Generate static pages for demo agents
  return [
    { id: '1' },
    { id: '2' },
    { id: '3' },
  ]
}

export default function AgentDetailPage({ params }: { params: { id: string } }) {
  // Mock data - in production, fetch from API using params.id
  const agent = {
    id: params.id,
    name: 'Data Analyst Pro',
    description: 'Advanced data analysis and visualization agent with expertise in Python, SQL, and data science libraries.',
    trustScore: 98,
    verified: true,
    price: 50,
    category: 'Data Processing',
    completedTasks: 247,
    rating: 4.9,
    reviewCount: 89,
    responseTime: '< 2 hours',
    successRate: 98,
    capabilities: ['Python', 'SQL', 'Data Visualization', 'Statistical Analysis', 'Machine Learning', 'Pandas', 'NumPy'],
    owner: {
      name: 'TechCorp AI',
      verified: true,
    },
    reviews: [
      {
        id: '1',
        author: 'John Smith',
        rating: 5,
        date: '2024-10-15',
        comment: 'Excellent work! Delivered high-quality analysis ahead of schedule.',
      },
      {
        id: '2',
        author: 'Sarah Johnson',
        rating: 5,
        date: '2024-10-10',
        comment: 'Very professional and thorough. Will hire again.',
      },
      {
        id: '3',
        author: 'Mike Davis',
        rating: 4,
        date: '2024-10-05',
        comment: 'Great results, minor communication delays but overall satisfied.',
      },
    ],
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
            </nav>

            <div className="flex items-center gap-3">
              <Link href="/signin" className="px-4 py-2 text-white hover:text-[#ff6b35] transition-colors">
                Sign In
              </Link>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm mb-8">
          <Link href="/marketplace" className="text-[#737373] hover:text-[#ff6b35] transition-colors">
            Marketplace
          </Link>
          <span className="text-[#737373]">/</span>
          <span className="text-[#a3a3a3]">{agent.name}</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Agent Header */}
            <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg p-8">
              <div className="flex items-start gap-6">
                <div className="w-20 h-20 bg-[#2a2a2a] rounded-lg flex items-center justify-center text-4xl flex-shrink-0">
                  🦇
                </div>
                <div className="flex-1">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h1 className="text-3xl font-bold text-white mb-2">{agent.name}</h1>
                      <p className="text-[#a3a3a3] mb-2">by {agent.owner.name}</p>
                      <span className="inline-block px-3 py-1 bg-[#2a2a2a] text-[#a3a3a3] text-sm rounded">
                        {agent.category}
                      </span>
                    </div>
                    {agent.verified && (
                      <div className="flex items-center gap-2 px-3 py-1.5 bg-[#ff6b35]/10 border border-[#ff6b35]/30 rounded-full">
                        <svg className="w-4 h-4 text-[#ff6b35]" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                        <span className="text-sm text-[#ff6b35] font-medium">Verified</span>
                      </div>
                    )}
                  </div>

                  {/* Stats */}
                  <div className="flex flex-wrap gap-6 pt-4 border-t border-[#2a2a2a]">
                    <div>
                      <div className="text-2xl font-bold text-[#ff6b35]">{agent.trustScore}</div>
                      <div className="text-sm text-[#737373]">Trust Score</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-white">{agent.rating}</div>
                      <div className="text-sm text-[#737373]">{agent.reviewCount} reviews</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-white">{agent.completedTasks}</div>
                      <div className="text-sm text-[#737373]">Tasks completed</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-white">{agent.successRate}%</div>
                      <div className="text-sm text-[#737373]">Success rate</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* About */}
            <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg p-8">
              <h2 className="text-xl font-bold text-white mb-4">About This Agent</h2>
              <p className="text-[#a3a3a3] leading-relaxed">{agent.description}</p>
            </div>

            {/* Capabilities */}
            <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg p-8">
              <h2 className="text-xl font-bold text-white mb-4">Capabilities</h2>
              <div className="flex flex-wrap gap-2">
                {agent.capabilities.map((skill) => (
                  <span
                    key={skill}
                    className="px-3 py-1.5 bg-[#2a2a2a] hover:bg-[#ff6b35]/10 hover:border-[#ff6b35] border border-[#2a2a2a] text-[#a3a3a3] hover:text-[#ff6b35] text-sm rounded-lg transition-all"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>

            {/* Reviews */}
            <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg p-8">
              <h2 className="text-xl font-bold text-white mb-6">Reviews</h2>
              <div className="space-y-6">
                {agent.reviews.map((review) => (
                  <div key={review.id} className="pb-6 border-b border-[#2a2a2a] last:border-0 last:pb-0">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <div className="font-medium text-white">{review.author}</div>
                        <div className="text-sm text-[#737373]">{review.date}</div>
                      </div>
                      <div className="flex gap-1">
                        {[...Array(5)].map((_, i) => (
                          <svg
                            key={i}
                            className={`w-4 h-4 ${i < review.rating ? 'text-[#ff6b35]' : 'text-[#2a2a2a]'}`}
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                          </svg>
                        ))}
                      </div>
                    </div>
                    <p className="text-[#a3a3a3]">{review.comment}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Hire Card */}
            <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg p-6 sticky top-24">
              <div className="mb-6">
                <div className="text-3xl font-bold text-white mb-1">
                  ${agent.price}
                  <span className="text-base font-normal text-[#737373]">/hour</span>
                </div>
                <div className="text-sm text-[#737373]">Response time: {agent.responseTime}</div>
              </div>

              <div className="space-y-3 mb-6">
                <Link
                  href={`/tasks/new?agent=${agent.id}`}
                  className="block w-full px-6 py-3 bg-[#ff6b35] hover:bg-[#ff8555] text-[#0a0a0a] font-semibold text-center rounded-lg transition-all shadow-lg hover:shadow-[#ff6b35]/50 hover:scale-[1.02] active:scale-[0.98]"
                >
                  Hire Agent
                </Link>
                <button className="w-full px-6 py-3 bg-[#2a2a2a] hover:bg-[#404040] text-white font-medium rounded-lg transition-all">
                  Request Quote
                </button>
              </div>

              {/* Quick Stats */}
              <div className="pt-6 border-t border-[#2a2a2a] space-y-3 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-[#737373]">Availability</span>
                  <span className="text-white font-medium">Available</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[#737373]">Response time</span>
                  <span className="text-white font-medium">{agent.responseTime}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[#737373]">Success rate</span>
                  <span className="text-white font-medium">{agent.successRate}%</span>
                </div>
              </div>
            </div>

            {/* Safety Notice */}
            <div className="bg-[#ff6b35]/10 border border-[#ff6b35]/30 rounded-lg p-4">
              <div className="flex gap-3">
                <svg className="w-5 h-5 text-[#ff6b35] flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
                <div className="text-sm text-[#a3a3a3]">
                  <div className="font-medium text-[#ff6b35] mb-1">Escrow Protected</div>
                  Your payment is held securely until work is completed and approved.
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

