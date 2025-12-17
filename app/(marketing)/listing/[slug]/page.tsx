/**
 * Listing Detail Page
 * Supports all Ghost Flow types: Agents, Workflows, Swarms, Knowledge Packs, Templates, Integrations
 */

import Link from 'next/link'
import { ListingCTA } from '@/components/listings/ListingCTA'

type ListingType = 'agent' | 'workflow' | 'swarm' | 'knowledge-pack' | 'template' | 'integration'
type PricingModel = 'free' | 'per-call' | 'subscription' | 'one-time'

// Type configuration
const typeConfig: Record<ListingType, { icon: string; label: string; color: string; bgColor: string; cta: string }> = {
  'agent': { icon: '🤖', label: 'AI Agent', color: '#ff6b35', bgColor: 'rgba(255, 107, 53, 0.1)', cta: 'Run Agent' },
  'workflow': { icon: '⚡', label: 'Workflow', color: '#8b5cf6', bgColor: 'rgba(139, 92, 246, 0.1)', cta: 'Run Workflow' },
  'swarm': { icon: '🐝', label: 'Swarm', color: '#f59e0b', bgColor: 'rgba(245, 158, 11, 0.1)', cta: 'Deploy Swarm' },
  'knowledge-pack': { icon: '📚', label: 'Knowledge Pack', color: '#10b981', bgColor: 'rgba(16, 185, 129, 0.1)', cta: 'Subscribe' },
  'template': { icon: '📋', label: 'Template', color: '#6366f1', bgColor: 'rgba(99, 102, 241, 0.1)', cta: 'Use Template' },
  'integration': { icon: '🔌', label: 'Integration', color: '#ec4899', bgColor: 'rgba(236, 72, 153, 0.1)', cta: 'Connect' },
}

// Model badges
const modelConfig: Record<string, { label: string; color: string }> = {
  'gpt-4': { label: 'GPT-4', color: '#10a37f' },
  'gpt-4-turbo': { label: 'GPT-4 Turbo', color: '#10a37f' },
  'claude-3-opus': { label: 'Claude 3 Opus', color: '#d97706' },
  'claude-3-sonnet': { label: 'Claude 3 Sonnet', color: '#d97706' },
  'gemini-pro': { label: 'Gemini Pro', color: '#4285f4' },
}

// Tool icons
const toolIcons: Record<string, string> = {
  'filesystem': '📁',
  'http': '🌐',
  'git': '🔀',
  'database': '🗄️',
  'codegen': '💻',
  'timeline': '📅',
  'mitosis': '🧬',
  'speciation': '🎯',
}

export function generateStaticParams() {
  return [
    { slug: 'data-research-agent' },
    { slug: 'code-builder-pro' },
    { slug: 'market-research-swarm' },
    { slug: 'lead-qualification-pipeline' },
    { slug: 'legal-contracts-rag' },
  ]
}

export default function ListingDetailPage({ params }: { params: { slug: string } }) {
  // Mock listing data - in production, fetch by slug
  const listing = {
    id: '1',
    slug: params.slug,
    name: 'Data Research Agent',
    shortDescription: 'Autonomous researcher that gathers, analyzes, and synthesizes information from multiple sources',
    fullDescription: `This advanced AI agent is designed for comprehensive data research tasks. It can autonomously:

• **Gather Information**: Search the web, query APIs, and extract data from documents
• **Analyze Data**: Apply statistical analysis, identify patterns, and generate insights
• **Synthesize Results**: Create comprehensive reports with visualizations and recommendations

Built on Ghost Flow's agent framework, this researcher can be customized with your own system prompts and integrated into larger workflows.

### Use Cases
- Market research and competitive analysis
- Academic literature reviews
- Technical documentation analysis
- Customer sentiment analysis
- Trend identification and forecasting`,
    type: 'agent' as ListingType,
    category: 'Research',
    tags: ['research', 'analysis', 'web-scraping', 'data', 'automation'],
    author: {
      name: 'TechCorp AI',
      orgId: 'org_1',
      avatar: '🏢',
      verified: true,
      walletAddress: '0x742d35Cc6634C0532925a3b844Bc9e7595f8c4e0',
    },
    pricing: {
      model: 'per-call' as PricingModel,
      perCallCents: 5,
    },
    models: ['gpt-4', 'claude-3-opus'],
    tools: ['http', 'filesystem', 'database'],
    // Stats
    rating: 4.9,
    reviews: 127,
    installs: 2847,
    executions: 45678,
    verified: 'verified',
    // Dates
    createdAt: '2024-06-15',
    updatedAt: '2024-12-10',
    // Config
    executionModes: ['manual', 'pipeline'],
    triggers: ['webhook', 'schedule', 'manual'],
    // Reviews
    reviewList: [
      { id: '1', author: 'Sarah Chen', rating: 5, date: '2024-12-08', comment: 'Incredibly thorough research output. Saved me hours of work on my market analysis project.' },
      { id: '2', author: 'Mike Johnson', rating: 5, date: '2024-12-05', comment: 'The synthesized reports are publication-ready. Great value for the price.' },
      { id: '3', author: 'Emma Davis', rating: 4, date: '2024-11-28', comment: 'Very capable agent. Would love to see more customization options for output format.' },
    ],
    // Similar listings
    similar: [
      { id: '2', name: 'Academic Research Assistant', type: 'agent', rating: 4.7, installs: 1234 },
      { id: '3', name: 'Market Analysis Swarm', type: 'swarm', rating: 4.8, installs: 567 },
      { id: '4', name: 'Research Pipeline Template', type: 'template', rating: 4.5, installs: 892 },
    ],
  }

  const type = typeConfig[listing.type]
  
  // Format price
  const formatPrice = () => {
    switch (listing.pricing.model) {
      case 'free':
        return { main: 'Free', sub: '' }
      case 'per-call':
        return { main: `$${((listing.pricing.perCallCents || 0) / 100).toFixed(2)}`, sub: 'per execution' }
      case 'subscription':
        return { main: `$${listing.pricing.perCallCents}`, sub: '/month' }
      case 'one-time':
        return { main: `$${listing.pricing.perCallCents}`, sub: 'one-time' }
      default:
        return { main: 'Contact', sub: '' }
    }
  }

  const price = formatPrice()

  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-[#0a0a0a]/90 backdrop-blur-xl border-b border-[#1a1a1a]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link href="/" className="flex items-center gap-2 group">
              <span className="text-2xl group-hover:scale-110 transition-transform">🦇</span>
              <span className="text-xl font-bold text-white">Evoworks</span>
            </Link>

            <nav className="hidden md:flex items-center gap-6">
              <Link href="/marketplace" className="text-[#737373] hover:text-white transition-colors">
                Marketplace
              </Link>
              <Link href="/dashboard" className="text-[#737373] hover:text-white transition-colors">
                Dashboard
              </Link>
            </nav>

            <div className="flex items-center gap-3">
              <Link href="/signin" className="px-4 py-2 text-[#a3a3a3] hover:text-white transition-colors">
                Sign In
              </Link>
              <Link href="/signup" className="px-4 py-2 bg-[#ff6b35] hover:bg-[#ff8555] text-[#0a0a0a] font-semibold rounded-lg transition-all">
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm mb-6">
          <Link href="/marketplace" className="text-[#525252] hover:text-[#ff6b35] transition-colors">
            Marketplace
          </Link>
          <span className="text-[#525252]">/</span>
          <span style={{ color: type.color }}>{type.label}s</span>
          <span className="text-[#525252]">/</span>
          <span className="text-[#a3a3a3]">{listing.name}</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Header Card */}
            <div className="bg-[#141414] border border-[#1f1f1f] rounded-2xl overflow-hidden">
              {/* Type Banner */}
              <div 
                className="px-6 py-4 flex items-center justify-between"
                style={{ backgroundColor: type.bgColor }}
              >
                <div className="flex items-center gap-3">
                  <span className="text-3xl">{type.icon}</span>
                  <div>
                    <span className="text-sm font-medium" style={{ color: type.color }}>
                      {type.label}
                    </span>
                    <span className="text-[#525252] mx-2">•</span>
                    <span className="text-sm text-[#737373]">{listing.category}</span>
                  </div>
                </div>
                {listing.verified === 'verified' && (
                  <div className="flex items-center gap-2 px-3 py-1.5 bg-[#0a0a0a]/50 rounded-full">
                    <svg className="w-4 h-4 text-[#ff6b35]" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <span className="text-sm text-[#ff6b35] font-medium">Verified</span>
                  </div>
                )}
              </div>

              {/* Content */}
              <div className="p-6">
                <h1 className="text-3xl font-bold text-white mb-2">{listing.name}</h1>
                <p className="text-[#737373] mb-4">
                  by <span className="text-[#a3a3a3]">{listing.author.name}</span>
                  {listing.author.verified && (
                    <svg className="w-4 h-4 text-[#ff6b35] inline ml-1" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  )}
                </p>

                <p className="text-[#a3a3a3] text-lg mb-6">{listing.shortDescription}</p>

                {/* Stats Row */}
                <div className="flex flex-wrap gap-6 py-4 border-y border-[#1f1f1f]">
                  <div>
                    <div className="flex items-center gap-1 mb-1">
                      <svg className="w-5 h-5 text-[#f59e0b]" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                      <span className="text-xl font-bold text-white">{listing.rating}</span>
                    </div>
                    <div className="text-xs text-[#525252]">{listing.reviews} reviews</div>
                  </div>
                  <div>
                    <div className="text-xl font-bold text-white mb-1">{listing.installs.toLocaleString()}</div>
                    <div className="text-xs text-[#525252]">installs</div>
                  </div>
                  <div>
                    <div className="text-xl font-bold text-white mb-1">{listing.executions.toLocaleString()}</div>
                    <div className="text-xs text-[#525252]">executions</div>
                  </div>
                  <div>
                    <div className="text-xl font-bold text-white mb-1">{listing.updatedAt}</div>
                    <div className="text-xs text-[#525252]">last updated</div>
                  </div>
                </div>

                {/* Tags */}
                <div className="flex flex-wrap gap-2 pt-4">
                  {listing.tags.map((tag) => (
                    <span
                      key={tag}
                      className="px-3 py-1 bg-[#1f1f1f] text-[#737373] text-sm rounded-lg hover:bg-[#252525] hover:text-white transition-all cursor-pointer"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Models & Tools */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Models */}
              {listing.models.length > 0 && (
                <div className="bg-[#141414] border border-[#1f1f1f] rounded-2xl p-6">
                  <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                    <span>🧠</span> Supported Models
                  </h3>
                  <div className="space-y-3">
                    {listing.models.map((model) => {
                      const config = modelConfig[model]
                      return config ? (
                        <div
                          key={model}
                          className="flex items-center gap-3 px-4 py-3 rounded-xl"
                          style={{ backgroundColor: `${config.color}10` }}
                        >
                          <div 
                            className="w-3 h-3 rounded-full"
                            style={{ backgroundColor: config.color }}
                          />
                          <span className="font-medium text-white">{config.label}</span>
                        </div>
                      ) : null
                    })}
                  </div>
                </div>
              )}

              {/* Tools */}
              {listing.tools.length > 0 && (
                <div className="bg-[#141414] border border-[#1f1f1f] rounded-2xl p-6">
                  <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                    <span>🔧</span> Available Tools
                  </h3>
                  <div className="space-y-3">
                    {listing.tools.map((tool) => (
                      <div
                        key={tool}
                        className="flex items-center gap-3 px-4 py-3 bg-[#1f1f1f] rounded-xl"
                      >
                        <span className="text-xl">{toolIcons[tool] || '🔧'}</span>
                        <span className="font-medium text-white capitalize">{tool}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Description */}
            <div className="bg-[#141414] border border-[#1f1f1f] rounded-2xl p-6">
              <h3 className="text-lg font-bold text-white mb-4">About This {type.label}</h3>
              <div className="prose prose-invert prose-sm max-w-none">
                <div className="text-[#a3a3a3] leading-relaxed whitespace-pre-line">
                  {listing.fullDescription}
                </div>
              </div>
            </div>

            {/* Triggers & Execution */}
            <div className="bg-[#141414] border border-[#1f1f1f] rounded-2xl p-6">
              <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                <span>⚡</span> Execution Options
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {listing.triggers.map((trigger) => (
                  <div
                    key={trigger}
                    className="px-4 py-3 bg-[#1f1f1f] rounded-xl text-center"
                  >
                    <div className="text-xl mb-1">
                      {trigger === 'webhook' && '🔗'}
                      {trigger === 'schedule' && '⏰'}
                      {trigger === 'manual' && '👆'}
                    </div>
                    <div className="text-sm text-[#a3a3a3] capitalize">{trigger}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Reviews */}
            <div className="bg-[#141414] border border-[#1f1f1f] rounded-2xl p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-bold text-white">Reviews ({listing.reviews})</h3>
                <button className="text-sm text-[#ff6b35] hover:underline">Write a Review</button>
              </div>
              <div className="space-y-6">
                {listing.reviewList.map((review) => (
                  <div key={review.id} className="pb-6 border-b border-[#1f1f1f] last:border-0 last:pb-0">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <div className="font-medium text-white">{review.author}</div>
                        <div className="text-xs text-[#525252]">{review.date}</div>
                      </div>
                      <div className="flex gap-0.5">
                        {[...Array(5)].map((_, i) => (
                          <svg
                            key={i}
                            className={`w-4 h-4 ${i < review.rating ? 'text-[#f59e0b]' : 'text-[#1f1f1f]'}`}
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
            {/* Purchase Card */}
            <div className="bg-[#141414] border border-[#1f1f1f] rounded-2xl p-6 sticky top-24">
              {/* Price */}
              <div className="mb-6">
                <div className="flex items-baseline gap-2 mb-2">
                  <span className={`text-4xl font-bold ${listing.pricing.model === 'free' ? 'text-[#10b981]' : 'text-white'}`}>
                    {price.main}
                  </span>
                  {price.sub && (
                    <span className="text-[#525252]">{price.sub}</span>
                  )}
                </div>
                {listing.pricing.model === 'per-call' && (
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-1 text-xs font-medium bg-[#ff6b35]/10 text-[#ff6b35] rounded">
                      x402 Micropayments
                    </span>
                    <span className="text-xs text-[#525252]">Pay only for what you use</span>
                  </div>
                )}
              </div>

              {/* CTA Buttons */}
              <ListingCTA 
                listing={{
                  slug: listing.slug,
                  name: listing.name,
                  type: listing.type,
                  pricing: {
                    model: listing.pricing.model,
                    perCallCents: listing.pricing.perCallCents,
                    monthlyPrice: listing.pricing.monthlyPrice,
                    yearlyPrice: listing.pricing.yearlyPrice,
                    oneTimePrice: listing.pricing.oneTimePrice,
                  },
                  author: {
                    name: listing.author.name,
                    walletAddress: listing.author.walletAddress,
                  },
                }}
                typeConfig={{
                  color: type.color,
                  cta: type.cta,
                }}
              />

              {/* Quick Info */}
              <div className="space-y-3 text-sm border-t border-[#1f1f1f] pt-4">
                <div className="flex items-center justify-between">
                  <span className="text-[#525252]">Type</span>
                  <span className="text-white font-medium flex items-center gap-1">
                    <span>{type.icon}</span> {type.label}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[#525252]">Last Updated</span>
                  <span className="text-white font-medium">{listing.updatedAt}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[#525252]">Created</span>
                  <span className="text-white font-medium">{listing.createdAt}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[#525252]">License</span>
                  <span className="text-white font-medium">Commercial</span>
                </div>
              </div>
            </div>

            {/* Author Card */}
            <div className="bg-[#141414] border border-[#1f1f1f] rounded-2xl p-6">
              <h4 className="text-sm font-medium text-[#525252] mb-4">PUBLISHED BY</h4>
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 bg-[#1f1f1f] rounded-xl flex items-center justify-center text-2xl">
                  {listing.author.avatar}
                </div>
                <div>
                  <div className="font-bold text-white flex items-center gap-1">
                    {listing.author.name}
                    {listing.author.verified && (
                      <svg className="w-4 h-4 text-[#ff6b35]" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                    )}
                  </div>
                  <div className="text-xs text-[#525252]">12 listings • 4.8 avg rating</div>
                </div>
              </div>
              <Link
                href={`/publisher/${listing.author.orgId}`}
                className="block w-full px-4 py-2 bg-[#1f1f1f] hover:bg-[#252525] text-center text-sm text-white font-medium rounded-lg transition-all"
              >
                View Profile
              </Link>
            </div>

            {/* Support */}
            <div className="bg-[#ff6b35]/10 border border-[#ff6b35]/20 rounded-2xl p-6">
              <div className="flex gap-3">
                <svg className="w-5 h-5 text-[#ff6b35] flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
                <div className="text-sm">
                  <div className="font-medium text-[#ff6b35] mb-1">Powered by Ghost Flow</div>
                  <p className="text-[#a3a3a3]">
                    This {type.label.toLowerCase()} runs on Ghost Flow infrastructure with x402 micropayment support.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Similar Listings */}
        <div className="mt-12">
          <h3 className="text-xl font-bold text-white mb-6">Similar Listings</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {listing.similar.map((item) => (
              <Link
                key={item.id}
                href={`/listing/${item.id}`}
                className="bg-[#141414] border border-[#1f1f1f] hover:border-[#ff6b35]/50 rounded-2xl p-5 transition-all hover:-translate-y-1"
              >
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-xl">{typeConfig[item.type as ListingType]?.icon}</span>
                  <span className="text-xs text-[#525252]">{typeConfig[item.type as ListingType]?.label}</span>
                </div>
                <h4 className="font-bold text-white mb-2">{item.name}</h4>
                <div className="flex items-center gap-4 text-xs text-[#525252]">
                  <span className="flex items-center gap-1">
                    <svg className="w-3 h-3 text-[#f59e0b]" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                    {item.rating}
                  </span>
                  <span>{item.installs.toLocaleString()} installs</span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

