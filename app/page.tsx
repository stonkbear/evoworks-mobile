import Link from 'next/link'
import { SearchBar } from '@/components/search'

const STATS = [
  { value: '10K+', label: 'AI Agents' },
  { value: '$2.5M', label: 'Paid to Publishers' },
  { value: '150K+', label: 'Developers' },
  { value: '99.9%', label: 'Uptime' },
]

const TYPES = [
  {
    icon: '🤖',
    name: 'AI Agents',
    description: 'Autonomous agents that complete tasks, make decisions, and learn from interactions.',
    color: 'from-violet-500 to-purple-600',
    count: '3,200+',
  },
  {
    icon: '⚡',
    name: 'Workflows',
    description: 'Multi-step automations that chain together tools, APIs, and AI capabilities.',
    color: 'from-cyan-500 to-blue-600',
    count: '4,100+',
  },
  {
    icon: '🐝',
    name: 'Swarms',
    description: 'Coordinated multi-agent systems that tackle complex problems together.',
    color: 'from-amber-500 to-orange-600',
    count: '890+',
  },
  {
    icon: '📚',
    name: 'Knowledge Packs',
    description: 'Pre-built RAG collections and domain-specific knowledge bases.',
    color: 'from-emerald-500 to-teal-600',
    count: '1,500+',
  },
]

const FEATURES = [
  {
    icon: '💳',
    title: 'x402 Micropayments',
    description: 'Pay per API call with USDC on Base. No subscriptions, no minimums.',
  },
  {
    icon: '🔐',
    title: 'Verified Publishers',
    description: 'Every listing is reviewed. Top publishers earn verified badges.',
  },
  {
    icon: '📊',
    title: 'Real-time Analytics',
    description: 'Track usage, revenue, and performance with detailed dashboards.',
  },
  {
    icon: '🔗',
    title: 'Ghost Flow Integration',
    description: 'Build in Ghost Flow, publish to Evoworks with one click.',
  },
  {
    icon: '⚡',
    title: 'Instant Payouts',
    description: 'Get paid in USDC directly to your wallet. No waiting periods.',
  },
  {
    icon: '🌍',
    title: 'Global Distribution',
    description: 'Reach developers and businesses worldwide through our marketplace.',
  },
]

const PUBLISHERS = [
  { name: 'TechCorp AI', logo: '🏢', revenue: '$124K' },
  { name: 'DevTools Inc', logo: '🛠️', revenue: '$89K' },
  { name: 'AutomateHQ', logo: '⚙️', revenue: '$76K' },
  { name: 'AI Labs', logo: '🧪', revenue: '$62K' },
  { name: 'DataFlow', logo: '📈', revenue: '$54K' },
]

export default function HomePage() {
  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-[#0a0a0a]/80 backdrop-blur-xl border-b border-[#1a1a1a]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link href="/" className="flex items-center gap-2">
              <span className="text-2xl">🦇</span>
              <span className="text-xl font-bold bg-gradient-to-r from-violet-400 to-fuchsia-400 bg-clip-text text-transparent">
                Evoworks
              </span>
            </Link>
            
            <div className="hidden md:flex items-center gap-8">
              <Link href="/marketplace" className="text-[#888] hover:text-white transition-colors">
                Marketplace
              </Link>
              <Link href="/publish" className="text-[#888] hover:text-white transition-colors">
                Publish
              </Link>
              <Link href="/docs" className="text-[#888] hover:text-white transition-colors">
                Docs
              </Link>
            </div>

            <div className="flex items-center gap-4">
              <Link
                href="/signin"
                className="text-[#888] hover:text-white transition-colors"
              >
                Sign In
              </Link>
              <Link
                href="/signup"
                className="px-4 py-2 bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-500 hover:to-fuchsia-500 text-white font-medium rounded-lg transition-all"
              >
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 overflow-hidden">
        {/* Background effects */}
        <div className="absolute inset-0">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-violet-600/20 rounded-full blur-3xl" />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-fuchsia-600/20 rounded-full blur-3xl" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-conic from-violet-600/10 via-transparent to-fuchsia-600/10 rounded-full blur-2xl" />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-[#111] border border-[#222] rounded-full text-sm mb-8">
            <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
            <span className="text-[#888]">Powered by</span>
            <span className="text-white font-medium">Ghost Flow</span>
          </div>

          {/* Headline */}
          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold mb-6 leading-tight">
            The AI Agent
            <br />
            <span className="bg-gradient-to-r from-violet-400 via-fuchsia-400 to-pink-400 bg-clip-text text-transparent">
              Marketplace
            </span>
          </h1>

          {/* Subheadline */}
          <p className="text-xl text-[#888] max-w-2xl mx-auto mb-10">
            Discover, deploy, and monetize AI agents, workflows, and swarms.
            Pay per call with x402 micropayments. No subscriptions required.
          </p>

          {/* Search Bar */}
          <div className="max-w-2xl mx-auto mb-10">
            <SearchBar size="large" placeholder="Search 10,000+ AI agents, workflows, swarms..." />
          </div>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
            <Link
              href="/marketplace"
              className="px-8 py-4 bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-500 hover:to-fuchsia-500 text-white font-semibold rounded-xl transition-all shadow-lg shadow-violet-500/25 hover:shadow-violet-500/40"
            >
              Explore Marketplace
            </Link>
            <Link
              href="/publish"
              className="px-8 py-4 bg-[#111] hover:bg-[#1a1a1a] text-white font-semibold rounded-xl border border-[#222] transition-all"
            >
              Start Publishing
            </Link>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto">
            {STATS.map((stat) => (
              <div key={stat.label}>
                <div className="text-3xl sm:text-4xl font-bold text-white mb-1">{stat.value}</div>
                <div className="text-[#666]">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Types Section */}
      <section className="py-20 border-t border-[#1a1a1a]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
              Everything AI, One Marketplace
            </h2>
            <p className="text-[#888] text-lg max-w-2xl mx-auto">
              From simple agents to complex multi-agent swarms, find the perfect AI solution for any task.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {TYPES.map((type) => (
              <Link
                key={type.name}
                href={`/marketplace?type=${type.name.toLowerCase().replace(' ', '_')}`}
                className="group relative bg-[#111] border border-[#1a1a1a] hover:border-[#333] rounded-2xl p-6 transition-all hover:shadow-lg"
              >
                <div
                  className={`w-14 h-14 rounded-xl bg-gradient-to-br ${type.color} flex items-center justify-center text-2xl mb-4`}
                >
                  {type.icon}
                </div>
                <h3 className="text-xl font-semibold text-white mb-2 group-hover:text-violet-400 transition-colors">
                  {type.name}
                </h3>
                <p className="text-[#666] text-sm mb-4">{type.description}</p>
                <div className="text-violet-400 font-medium">{type.count}</div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-[#080808]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
              Built for the AI Economy
            </h2>
            <p className="text-[#888] text-lg max-w-2xl mx-auto">
              Everything you need to discover, deploy, and monetize AI agents at scale.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {FEATURES.map((feature) => (
              <div
                key={feature.title}
                className="bg-[#0a0a0a] border border-[#1a1a1a] rounded-xl p-6"
              >
                <div className="text-3xl mb-4">{feature.icon}</div>
                <h3 className="text-lg font-semibold text-white mb-2">{feature.title}</h3>
                <p className="text-[#666]">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Publisher Section */}
      <section className="py-20 border-t border-[#1a1a1a]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-3xl sm:text-4xl font-bold text-white mb-6">
                Monetize Your AI Creations
              </h2>
              <p className="text-[#888] text-lg mb-8">
                Built something amazing in Ghost Flow? Publish it to Evoworks and start earning.
                Set your own prices, get paid per API call, and reach thousands of developers.
              </p>
              
              <div className="space-y-4 mb-8">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-emerald-500/20 flex items-center justify-center">
                    <svg className="w-4 h-4 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <span className="text-white">One-click publishing from Ghost Flow</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-emerald-500/20 flex items-center justify-center">
                    <svg className="w-4 h-4 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <span className="text-white">Set per-call pricing with x402</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-emerald-500/20 flex items-center justify-center">
                    <svg className="w-4 h-4 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <span className="text-white">Instant USDC payouts to your wallet</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-emerald-500/20 flex items-center justify-center">
                    <svg className="w-4 h-4 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <span className="text-white">Detailed analytics and insights</span>
                </div>
              </div>

              <Link
                href="/publish"
                className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-500 hover:to-fuchsia-500 text-white font-semibold rounded-xl transition-all"
              >
                Start Publishing
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </Link>
            </div>

            <div className="bg-[#111] border border-[#1a1a1a] rounded-2xl p-8">
              <h3 className="text-lg font-semibold text-white mb-6">Top Earning Publishers</h3>
              <div className="space-y-4">
                {PUBLISHERS.map((publisher, i) => (
                  <div
                    key={publisher.name}
                    className="flex items-center gap-4 p-4 bg-[#0a0a0a] rounded-xl"
                  >
                    <div className="w-8 h-8 flex items-center justify-center text-lg font-bold text-[#444]">
                      #{i + 1}
                    </div>
                    <div className="w-10 h-10 bg-gradient-to-br from-violet-500 to-fuchsia-500 rounded-lg flex items-center justify-center text-xl">
                      {publisher.logo}
                    </div>
                    <div className="flex-1">
                      <div className="text-white font-medium">{publisher.name}</div>
                    </div>
                    <div className="text-emerald-400 font-semibold">{publisher.revenue}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-br from-violet-600/10 via-[#0a0a0a] to-fuchsia-600/10">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-6">
            Ready to Join the AI Economy?
          </h2>
          <p className="text-[#888] text-lg mb-10">
            Whether you're looking to use AI or sell it, Evoworks is your gateway.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/signup"
              className="px-8 py-4 bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-500 hover:to-fuchsia-500 text-white font-semibold rounded-xl transition-all shadow-lg shadow-violet-500/25 hover:shadow-violet-500/40"
            >
              Create Free Account
            </Link>
            <Link
              href="/marketplace"
              className="px-8 py-4 bg-[#111] hover:bg-[#1a1a1a] text-white font-semibold rounded-xl border border-[#222] transition-all"
            >
              Browse Marketplace
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t border-[#1a1a1a]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
            <div>
              <h4 className="text-white font-semibold mb-4">Product</h4>
              <ul className="space-y-2 text-[#666]">
                <li><Link href="/marketplace" className="hover:text-white transition-colors">Marketplace</Link></li>
                <li><Link href="/publish" className="hover:text-white transition-colors">Publish</Link></li>
                <li><Link href="/pricing" className="hover:text-white transition-colors">Pricing</Link></li>
                <li><Link href="/docs" className="hover:text-white transition-colors">Documentation</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-[#666]">
                <li><Link href="/about" className="hover:text-white transition-colors">About</Link></li>
                <li><Link href="/blog" className="hover:text-white transition-colors">Blog</Link></li>
                <li><Link href="/careers" className="hover:text-white transition-colors">Careers</Link></li>
                <li><Link href="/contact" className="hover:text-white transition-colors">Contact</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Resources</h4>
              <ul className="space-y-2 text-[#666]">
                <li><Link href="/docs/api" className="hover:text-white transition-colors">API Reference</Link></li>
                <li><Link href="/docs/x402" className="hover:text-white transition-colors">x402 Protocol</Link></li>
                <li><Link href="/status" className="hover:text-white transition-colors">Status</Link></li>
                <li><Link href="/changelog" className="hover:text-white transition-colors">Changelog</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Legal</h4>
              <ul className="space-y-2 text-[#666]">
                <li><Link href="/terms" className="hover:text-white transition-colors">Terms</Link></li>
                <li><Link href="/privacy" className="hover:text-white transition-colors">Privacy</Link></li>
                <li><Link href="/cookies" className="hover:text-white transition-colors">Cookies</Link></li>
              </ul>
            </div>
          </div>

          <div className="flex flex-col md:flex-row items-center justify-between pt-8 border-t border-[#1a1a1a]">
            <div className="flex items-center gap-2 mb-4 md:mb-0">
              <span className="text-2xl">🦇</span>
              <span className="text-xl font-bold bg-gradient-to-r from-violet-400 to-fuchsia-400 bg-clip-text text-transparent">
                Evoworks
              </span>
            </div>
            <p className="text-[#666] text-sm">
              © {new Date().getFullYear()} Evoworks. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
