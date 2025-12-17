'use client'

/**
 * Evoworks Marketplace
 * Browse AI Agents, Workflows, Swarms, Knowledge Packs, Templates & Integrations
 * Powered by Ghost Flow
 */

import { useState, useMemo } from 'react'
import Link from 'next/link'
import dynamic from 'next/dynamic'

const NetworkSphere = dynamic(() => import('@/components/three/NetworkSphere').then(mod => mod.NetworkSphere), { ssr: false })

// Listing types from Ghost Flow
type ListingType = 'agent' | 'workflow' | 'swarm' | 'knowledge-pack' | 'template' | 'integration'
type PricingModel = 'free' | 'per-call' | 'subscription' | 'one-time'
type VerificationLevel = 'none' | 'basic' | 'verified'

interface Listing {
  id: string
  name: string
  slug: string
  shortDescription: string
  type: ListingType
  category: string
  tags: string[]
  author: {
    name: string
    orgId: string
    avatar?: string
  }
  pricing: {
    model: PricingModel
    amount?: number
    perCallCents?: number
    subMonthly?: number
    subYearly?: number
  }
  models: string[]
  tools: string[]
  rating: number
  reviews: number
  installs: number
  verified: VerificationLevel
  coverUrl?: string
}

// Type configuration with icons and colors
const typeConfig: Record<ListingType, { icon: string; label: string; color: string; bgColor: string }> = {
  'agent': { icon: '🤖', label: 'Agent', color: '#ff6b35', bgColor: 'rgba(255, 107, 53, 0.1)' },
  'workflow': { icon: '⚡', label: 'Workflow', color: '#8b5cf6', bgColor: 'rgba(139, 92, 246, 0.1)' },
  'swarm': { icon: '🐝', label: 'Swarm', color: '#f59e0b', bgColor: 'rgba(245, 158, 11, 0.1)' },
  'knowledge-pack': { icon: '📚', label: 'Knowledge Pack', color: '#10b981', bgColor: 'rgba(16, 185, 129, 0.1)' },
  'template': { icon: '📋', label: 'Template', color: '#6366f1', bgColor: 'rgba(99, 102, 241, 0.1)' },
  'integration': { icon: '🔌', label: 'Integration', color: '#ec4899', bgColor: 'rgba(236, 72, 153, 0.1)' },
}

// Model badges
const modelConfig: Record<string, { label: string; color: string }> = {
  'gpt-4': { label: 'GPT-4', color: '#10a37f' },
  'gpt-4-turbo': { label: 'GPT-4T', color: '#10a37f' },
  'claude-3-opus': { label: 'Opus', color: '#d97706' },
  'claude-3-sonnet': { label: 'Sonnet', color: '#d97706' },
  'gemini-pro': { label: 'Gemini', color: '#4285f4' },
}

// Mock data
const allListings: Listing[] = [
  // AI Agents
    {
      id: '1',
    name: 'Data Research Agent',
    slug: 'data-research-agent',
    shortDescription: 'Autonomous researcher that gathers, analyzes, and synthesizes information from multiple sources',
    type: 'agent',
    category: 'research',
    tags: ['research', 'analysis', 'web-scraping'],
    author: { name: 'TechCorp AI', orgId: 'org_1' },
    pricing: { model: 'per-call', perCallCents: 5 },
    models: ['gpt-4', 'claude-3-opus'],
    tools: ['http', 'filesystem', 'database'],
    rating: 4.9,
    reviews: 127,
    installs: 2847,
    verified: 'verified',
    },
    {
      id: '2',
    name: 'Code Builder Pro',
    slug: 'code-builder-pro',
    shortDescription: 'Full-stack code generation agent with Git integration and automated testing',
    type: 'agent',
    category: 'development',
    tags: ['coding', 'development', 'automation'],
    author: { name: 'DevTools Inc', orgId: 'org_2' },
    pricing: { model: 'per-call', perCallCents: 10 },
    models: ['gpt-4-turbo', 'claude-3-sonnet'],
    tools: ['codegen', 'git', 'filesystem'],
    rating: 4.8,
    reviews: 89,
    installs: 1923,
    verified: 'verified',
    },
    {
      id: '3',
    name: 'Content Writer AI',
    slug: 'content-writer-ai',
    shortDescription: 'Professional content creation with SEO optimization and brand voice matching',
    type: 'agent',
    category: 'content',
    tags: ['writing', 'seo', 'marketing'],
    author: { name: 'ContentLab', orgId: 'org_3' },
    pricing: { model: 'subscription', subMonthly: 29 },
    models: ['gpt-4', 'claude-3-opus'],
    tools: ['http', 'filesystem'],
    rating: 4.7,
    reviews: 234,
    installs: 4521,
    verified: 'verified',
    },
  // Workflows
    {
      id: '4',
    name: 'Lead Qualification Pipeline',
    slug: 'lead-qualification-pipeline',
    shortDescription: 'Automated workflow: Capture leads → Enrich data → Score → Route to sales',
    type: 'workflow',
    category: 'sales',
    tags: ['leads', 'crm', 'automation'],
    author: { name: 'SalesFlow', orgId: 'org_4' },
    pricing: { model: 'per-call', perCallCents: 2 },
    models: ['gpt-4'],
    tools: ['http', 'database'],
    rating: 4.6,
    reviews: 78,
    installs: 892,
    verified: 'verified',
    },
    {
      id: '5',
    name: 'Content Repurposing Engine',
    slug: 'content-repurposing-engine',
    shortDescription: 'Transform blog posts into tweets, LinkedIn posts, newsletters, and video scripts',
    type: 'workflow',
    category: 'content',
    tags: ['content', 'social-media', 'repurposing'],
    author: { name: 'ContentLab', orgId: 'org_3' },
    pricing: { model: 'subscription', subMonthly: 19 },
    models: ['gpt-4', 'claude-3-sonnet'],
    tools: ['http', 'filesystem'],
    rating: 4.8,
    reviews: 156,
    installs: 2341,
    verified: 'verified',
    },
    {
      id: '6',
    name: 'Customer Support Triage',
    slug: 'customer-support-triage',
    shortDescription: 'Webhook → Classify ticket → Route to agent or auto-respond → Update CRM',
    type: 'workflow',
    category: 'support',
    tags: ['support', 'tickets', 'automation'],
    author: { name: 'SupportAI', orgId: 'org_5' },
    pricing: { model: 'per-call', perCallCents: 1 },
    models: ['gpt-4-turbo'],
    tools: ['http', 'database'],
    rating: 4.5,
    reviews: 67,
    installs: 1456,
    verified: 'basic',
    },
  // Swarms
    {
      id: '7',
    name: 'Market Research Swarm',
    slug: 'market-research-swarm',
    shortDescription: '5-agent team: Researcher + Analyst + Writer + Reviewer + Editor working in coordination',
    type: 'swarm',
    category: 'research',
    tags: ['research', 'analysis', 'multi-agent'],
    author: { name: 'SwarmLabs', orgId: 'org_6' },
    pricing: { model: 'per-call', perCallCents: 25 },
    models: ['gpt-4', 'claude-3-opus', 'gemini-pro'],
    tools: ['http', 'filesystem', 'database'],
    rating: 4.9,
    reviews: 45,
    installs: 567,
    verified: 'verified',
    },
    {
      id: '8',
    name: 'Code Review Committee',
    slug: 'code-review-committee',
    shortDescription: 'Multi-agent code review: Security + Performance + Style + Architecture reviewers',
    type: 'swarm',
    category: 'development',
    tags: ['code-review', 'security', 'multi-agent'],
    author: { name: 'DevTools Inc', orgId: 'org_2' },
    pricing: { model: 'per-call', perCallCents: 15 },
    models: ['gpt-4-turbo', 'claude-3-opus'],
    tools: ['git', 'codegen', 'filesystem'],
    rating: 4.7,
    reviews: 89,
    installs: 1234,
    verified: 'verified',
    },
  // Knowledge Packs
    {
      id: '9',
    name: 'Legal Contracts RAG',
    slug: 'legal-contracts-rag',
    shortDescription: '50,000+ contract clauses, legal precedents, and compliance requirements',
    type: 'knowledge-pack',
    category: 'legal',
    tags: ['legal', 'contracts', 'compliance'],
    author: { name: 'LegalAI', orgId: 'org_7' },
    pricing: { model: 'subscription', subMonthly: 99 },
    models: ['gpt-4'],
    tools: ['database'],
    rating: 4.8,
    reviews: 34,
    installs: 234,
    verified: 'verified',
    },
    {
      id: '10',
    name: 'Medical Research Database',
    slug: 'medical-research-database',
    shortDescription: 'Curated medical literature, drug interactions, and clinical guidelines',
    type: 'knowledge-pack',
    category: 'healthcare',
    tags: ['medical', 'research', 'healthcare'],
    author: { name: 'MedAI Labs', orgId: 'org_8' },
    pricing: { model: 'subscription', subMonthly: 149 },
    models: ['gpt-4', 'claude-3-opus'],
    tools: ['database'],
    rating: 4.9,
    reviews: 23,
    installs: 178,
    verified: 'verified',
    },
  // Templates
    {
      id: '11',
    name: 'SaaS Customer Success Bot',
    slug: 'saas-customer-success-bot',
    shortDescription: 'Ready-to-deploy template for onboarding, support, and churn prevention',
    type: 'template',
    category: 'support',
    tags: ['saas', 'customer-success', 'template'],
    author: { name: 'TemplateHQ', orgId: 'org_9' },
    pricing: { model: 'one-time', amount: 199 },
    models: ['gpt-4'],
    tools: ['http', 'database'],
    rating: 4.6,
    reviews: 67,
    installs: 456,
    verified: 'basic',
    },
    {
      id: '12',
    name: 'E-commerce Assistant Starter',
    slug: 'ecommerce-assistant-starter',
    shortDescription: 'Product recommendations, inventory queries, order tracking - ready to customize',
    type: 'template',
    category: 'ecommerce',
    tags: ['ecommerce', 'shopping', 'template'],
    author: { name: 'TemplateHQ', orgId: 'org_9' },
    pricing: { model: 'free' },
    models: ['gpt-4-turbo'],
    tools: ['http', 'database'],
    rating: 4.4,
    reviews: 123,
    installs: 2341,
    verified: 'basic',
    },
  // Integrations
    {
      id: '13',
    name: 'Notion ↔ AI Pipeline',
    slug: 'notion-ai-pipeline',
    shortDescription: 'Bi-directional sync between Notion databases and AI agents',
    type: 'integration',
    category: 'productivity',
    tags: ['notion', 'sync', 'productivity'],
    author: { name: 'IntegrationHub', orgId: 'org_10' },
    pricing: { model: 'subscription', subMonthly: 9 },
    models: [],
    tools: ['http'],
    rating: 4.7,
    reviews: 189,
    installs: 3456,
    verified: 'verified',
    },
    {
      id: '14',
    name: 'Slack Command Center',
    slug: 'slack-command-center',
    shortDescription: 'Trigger any Ghost Flow automation directly from Slack with /gf commands',
    type: 'integration',
    category: 'productivity',
    tags: ['slack', 'commands', 'triggers'],
    author: { name: 'IntegrationHub', orgId: 'org_10' },
    pricing: { model: 'free' },
    models: [],
    tools: ['http'],
    rating: 4.8,
    reviews: 234,
    installs: 5678,
    verified: 'verified',
    },
    {
      id: '15',
    name: 'GitHub Actions Bridge',
    slug: 'github-actions-bridge',
    shortDescription: 'Trigger Ghost Flow workflows from GitHub events and vice versa',
    type: 'integration',
    category: 'development',
    tags: ['github', 'ci-cd', 'automation'],
    author: { name: 'DevTools Inc', orgId: 'org_2' },
    pricing: { model: 'per-call', perCallCents: 1 },
    models: [],
    tools: ['git', 'http'],
    rating: 4.6,
    reviews: 78,
    installs: 1234,
    verified: 'verified',
  },
]

export default function MarketplacePage() {
  // Filter state
  const [selectedType, setSelectedType] = useState<ListingType | 'all'>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [sortBy, setSortBy] = useState<'popular' | 'rating' | 'newest' | 'price-low' | 'price-high'>('popular')

  // Type filters
  const typeFilters: { key: ListingType | 'all'; label: string; icon: string }[] = [
    { key: 'all', label: 'All', icon: '🦇' },
    { key: 'agent', label: 'Agents', icon: '🤖' },
    { key: 'workflow', label: 'Workflows', icon: '⚡' },
    { key: 'swarm', label: 'Swarms', icon: '🐝' },
    { key: 'knowledge-pack', label: 'Knowledge', icon: '📚' },
    { key: 'template', label: 'Templates', icon: '📋' },
    { key: 'integration', label: 'Integrations', icon: '🔌' },
  ]

  // Category filters
  const categories = ['All', 'Development', 'Research', 'Content', 'Sales', 'Support', 'Legal', 'Healthcare', 'Productivity', 'Ecommerce']

  // Filter and sort listings
  const filteredListings = useMemo(() => {
    let results = [...allListings]

    // Filter by type
    if (selectedType !== 'all') {
      results = results.filter(listing => listing.type === selectedType)
    }

    // Filter by category
    if (selectedCategory !== 'all') {
      results = results.filter(listing => 
        listing.category.toLowerCase() === selectedCategory.toLowerCase()
      )
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase()
      results = results.filter(listing =>
        listing.name.toLowerCase().includes(query) ||
        listing.shortDescription.toLowerCase().includes(query) ||
        listing.tags.some(tag => tag.toLowerCase().includes(query)) ||
        listing.author.name.toLowerCase().includes(query)
      )
    }

    // Sort
    switch (sortBy) {
      case 'popular':
        results.sort((a, b) => b.installs - a.installs)
        break
      case 'rating':
        results.sort((a, b) => b.rating - a.rating)
        break
      case 'newest':
        // In real app, would sort by createdAt
        results.sort((a, b) => parseInt(b.id) - parseInt(a.id))
        break
      case 'price-low':
        results.sort((a, b) => {
          const priceA = a.pricing.model === 'free' ? 0 : (a.pricing.perCallCents || a.pricing.subMonthly || a.pricing.amount || 0)
          const priceB = b.pricing.model === 'free' ? 0 : (b.pricing.perCallCents || b.pricing.subMonthly || b.pricing.amount || 0)
          return priceA - priceB
        })
        break
      case 'price-high':
        results.sort((a, b) => {
          const priceA = a.pricing.model === 'free' ? 0 : (a.pricing.perCallCents || a.pricing.subMonthly || a.pricing.amount || 0)
          const priceB = b.pricing.model === 'free' ? 0 : (b.pricing.perCallCents || b.pricing.subMonthly || b.pricing.amount || 0)
          return priceB - priceA
        })
        break
    }

    return results
  }, [selectedType, selectedCategory, searchQuery, sortBy])

  // Stats based on filtered results
  const stats = useMemo(() => {
    const typeCount = (type: ListingType) => allListings.filter(l => l.type === type).length
    return {
      total: allListings.length,
      workflows: typeCount('workflow'),
      swarms: typeCount('swarm'),
      knowledgePacks: typeCount('knowledge-pack'),
      totalInstalls: allListings.reduce((sum, l) => sum + l.installs, 0),
      avgRating: (allListings.reduce((sum, l) => sum + l.rating, 0) / allListings.length).toFixed(1),
    }
  }, [])

  // Helper to format price
  const formatPrice = (pricing: Listing['pricing']) => {
    switch (pricing.model) {
      case 'free':
        return { label: 'Free', sublabel: '' }
      case 'per-call':
        return { label: `$${((pricing.perCallCents || 0) / 100).toFixed(2)}`, sublabel: '/call' }
      case 'subscription':
        return { label: `$${pricing.subMonthly}`, sublabel: '/mo' }
      case 'one-time':
        return { label: `$${pricing.amount}`, sublabel: 'once' }
      default:
        return { label: 'Contact', sublabel: '' }
    }
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] relative overflow-hidden">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-[#0a0a0a]/90 backdrop-blur-xl border-b border-[#1a1a1a]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link href="/" className="flex items-center gap-2 group">
              <span className="text-2xl group-hover:scale-110 transition-transform">🦇</span>
              <span className="text-xl font-bold text-white">Evoworks</span>
            </Link>

            <nav className="hidden md:flex items-center gap-6">
              <Link href="/marketplace" className="text-[#ff6b35] font-medium">
                Marketplace
              </Link>
              <Link href="/dashboard" className="text-[#737373] hover:text-white transition-colors">
                Dashboard
              </Link>
              <Link href="/publish" className="text-[#737373] hover:text-white transition-colors">
                Publish
              </Link>
            </nav>

            <div className="flex items-center gap-3">
              <Link
                href="/signin"
                className="px-4 py-2 text-[#a3a3a3] hover:text-white transition-colors"
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

      {/* 3D Background */}
      <div className="absolute right-0 top-20 w-96 h-96 opacity-10 pointer-events-none">
        <NetworkSphere />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative z-10">
        {/* Page Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-4xl font-bold text-white">Marketplace</h1>
            <span className="px-3 py-1 bg-[#ff6b35]/10 border border-[#ff6b35]/30 rounded-full text-sm text-[#ff6b35] font-medium">
              Powered by Ghost Flow
            </span>
          </div>
          <p className="text-[#737373] text-lg">
            Discover AI agents, workflows, swarms, and more from the community
          </p>
        </div>

        {/* Type Filters (Primary) */}
        <div className="mb-6">
          <div className="flex flex-wrap gap-2">
            {typeFilters.map((filter) => (
              <button
                key={filter.key}
                onClick={() => setSelectedType(filter.key)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium transition-all ${
                  selectedType === filter.key
                    ? 'bg-[#ff6b35] text-[#0a0a0a] shadow-lg shadow-[#ff6b35]/20'
                    : 'bg-[#1a1a1a] text-[#a3a3a3] hover:bg-[#252525] hover:text-white border border-[#252525]'
                }`}
              >
                <span className="text-lg">{filter.icon}</span>
                <span>{filter.label}</span>
                {filter.key !== 'all' && (
                  <span className={`text-xs px-1.5 py-0.5 rounded ${
                    selectedType === filter.key ? 'bg-[#0a0a0a]/20' : 'bg-[#252525]'
                  }`}>
                    {allListings.filter(l => l.type === filter.key).length}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Search & Category Row */}
        <div className="flex flex-col lg:flex-row gap-4 mb-8">
          {/* Search Bar */}
          <div className="relative flex-1">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by name, capability, model, or tool..."
              className="w-full px-4 py-3 pl-12 bg-[#1a1a1a] border border-[#252525] rounded-xl text-white placeholder-[#525252] focus:border-[#ff6b35] focus:ring-2 focus:ring-[#ff6b35]/20 outline-none transition-all"
            />
            <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#525252]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-[#525252] hover:text-white"
              >
                ✕
              </button>
            )}
          </div>

          {/* Category Dropdown */}
          <select 
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-4 py-3 bg-[#1a1a1a] border border-[#252525] rounded-xl text-white outline-none focus:border-[#ff6b35] cursor-pointer"
          >
            {categories.map((cat) => (
              <option key={cat} value={cat.toLowerCase()}>{cat}</option>
            ))}
          </select>

          {/* Sort Dropdown */}
          <select 
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
            className="px-4 py-3 bg-[#1a1a1a] border border-[#252525] rounded-xl text-white outline-none focus:border-[#ff6b35] cursor-pointer"
          >
            <option value="popular">Most Popular</option>
            <option value="rating">Highest Rated</option>
            <option value="newest">Newest</option>
            <option value="price-low">Price: Low to High</option>
            <option value="price-high">Price: High to Low</option>
          </select>
          </div>

        {/* Results Count */}
        <div className="flex items-center justify-between mb-6">
          <p className="text-[#737373]">
            Showing <span className="text-white font-medium">{filteredListings.length}</span> of {allListings.length} listings
            {selectedType !== 'all' && (
              <span className="ml-2 px-2 py-0.5 bg-[#252525] rounded text-xs">
                {typeFilters.find(t => t.key === selectedType)?.icon} {typeFilters.find(t => t.key === selectedType)?.label}
              </span>
            )}
            {searchQuery && (
              <span className="ml-2 px-2 py-0.5 bg-[#252525] rounded text-xs">
                &quot;{searchQuery}&quot;
              </span>
            )}
          </p>
          {(selectedType !== 'all' || searchQuery || selectedCategory !== 'all') && (
            <button
              onClick={() => {
                setSelectedType('all')
                setSearchQuery('')
                setSelectedCategory('all')
              }}
              className="text-[#ff6b35] hover:underline text-sm"
            >
              Clear filters
            </button>
          )}
        </div>

        {/* Stats Bar */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3 mb-8">
          <div className="bg-[#1a1a1a] border border-[#252525] rounded-xl p-4 text-center">
            <div className="text-2xl font-bold text-[#ff6b35]">{stats.total}</div>
            <div className="text-xs text-[#525252]">Total Listings</div>
          </div>
          <div className="bg-[#1a1a1a] border border-[#252525] rounded-xl p-4 text-center">
            <div className="text-2xl font-bold text-[#8b5cf6]">{stats.workflows}</div>
            <div className="text-xs text-[#525252]">Workflows</div>
          </div>
          <div className="bg-[#1a1a1a] border border-[#252525] rounded-xl p-4 text-center">
            <div className="text-2xl font-bold text-[#f59e0b]">{stats.swarms}</div>
            <div className="text-xs text-[#525252]">Swarms</div>
          </div>
          <div className="bg-[#1a1a1a] border border-[#252525] rounded-xl p-4 text-center">
            <div className="text-2xl font-bold text-[#10b981]">{stats.knowledgePacks}</div>
            <div className="text-xs text-[#525252]">Knowledge Packs</div>
          </div>
          <div className="bg-[#1a1a1a] border border-[#252525] rounded-xl p-4 text-center">
            <div className="text-2xl font-bold text-white">{(stats.totalInstalls / 1000).toFixed(1)}K</div>
            <div className="text-xs text-[#525252]">Installs</div>
          </div>
          <div className="bg-[#1a1a1a] border border-[#252525] rounded-xl p-4 text-center">
            <div className="text-2xl font-bold text-white">{stats.avgRating}</div>
            <div className="text-xs text-[#525252]">Avg Rating</div>
          </div>
        </div>

        {/* Listings Grid */}
        {filteredListings.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredListings.map((listing) => {
              const type = typeConfig[listing.type]
              const price = formatPrice(listing.pricing)
              
              return (
            <Link
                  key={listing.id}
                  href={`/listing/${listing.slug}`}
                  className="group bg-[#141414] border border-[#1f1f1f] hover:border-[#ff6b35]/50 rounded-2xl overflow-hidden transition-all hover:shadow-xl hover:shadow-[#ff6b35]/5 hover:-translate-y-1"
            >
                  {/* Type Badge Header */}
                  <div 
                    className="px-5 py-3 flex items-center justify-between"
                    style={{ backgroundColor: type.bgColor }}
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{type.icon}</span>
                      <span className="text-sm font-medium" style={{ color: type.color }}>
                        {type.label}
                      </span>
                </div>
                    {listing.verified !== 'none' && (
                      <div className="flex items-center gap-1 px-2 py-0.5 bg-[#0a0a0a]/50 rounded-full">
                    <svg className="w-3 h-3 text-[#ff6b35]" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                        <span className="text-[10px] text-[#ff6b35] font-medium uppercase">
                          {listing.verified}
                        </span>
                  </div>
                )}
              </div>

                  {/* Content */}
                  <div className="p-5">
                    {/* Title & Author */}
                    <h3 className="text-lg font-bold text-white mb-1 group-hover:text-[#ff6b35] transition-colors line-clamp-1">
                      {listing.name}
              </h3>
                    <p className="text-xs text-[#525252] mb-3">
                      by {listing.author.name}
                    </p>

                    {/* Description */}
                    <p className="text-sm text-[#737373] mb-4 line-clamp-2 min-h-[40px]">
                      {listing.shortDescription}
                    </p>

                    {/* Models */}
                    {listing.models.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mb-4">
                        {listing.models.slice(0, 3).map((model) => {
                          const config = modelConfig[model]
                          return config ? (
                            <span
                              key={model}
                              className="px-2 py-0.5 text-[10px] font-medium rounded-md"
                              style={{ 
                                backgroundColor: `${config.color}15`,
                                color: config.color 
                              }}
                            >
                              {config.label}
                            </span>
                          ) : null
                        })}
                        {listing.models.length > 3 && (
                          <span className="px-2 py-0.5 text-[10px] font-medium rounded-md bg-[#252525] text-[#737373]">
                            +{listing.models.length - 3}
                          </span>
                        )}
                      </div>
                    )}

                    {/* Tools */}
                    {listing.tools.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mb-4">
                        {listing.tools.slice(0, 4).map((tool) => (
                          <span
                            key={tool}
                            className="px-2 py-0.5 text-[10px] font-medium rounded-md bg-[#1f1f1f] text-[#525252]"
                          >
                            {tool}
                          </span>
                        ))}
                        {listing.tools.length > 4 && (
                          <span className="px-2 py-0.5 text-[10px] font-medium rounded-md bg-[#1f1f1f] text-[#525252]">
                            +{listing.tools.length - 4}
                          </span>
                        )}
                      </div>
                    )}

                    {/* Stats Row */}
                    <div className="flex items-center gap-4 text-xs text-[#525252] mb-4">
                <div className="flex items-center gap-1">
                        <svg className="w-3.5 h-3.5 text-[#f59e0b]" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                        <span className="text-white font-medium">{listing.rating}</span>
                        <span>({listing.reviews})</span>
                </div>
                <div className="flex items-center gap-1">
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                        </svg>
                        <span>{listing.installs.toLocaleString()}</span>
                </div>
              </div>

                    {/* Price & CTA */}
                    <div className="flex items-center justify-between pt-4 border-t border-[#1f1f1f]">
                      <div className="flex items-baseline gap-1">
                        <span className={`text-lg font-bold ${listing.pricing.model === 'free' ? 'text-[#10b981]' : 'text-white'}`}>
                          {price.label}
                        </span>
                        {price.sublabel && (
                          <span className="text-xs text-[#525252]">{price.sublabel}</span>
                        )}
                        {listing.pricing.model === 'per-call' && (
                          <span className="ml-2 px-1.5 py-0.5 text-[9px] font-medium bg-[#ff6b35]/10 text-[#ff6b35] rounded">
                            x402
                </span>
                        )}
                      </div>
                      <span className="text-xs px-3 py-1.5 bg-[#252525] text-[#a3a3a3] rounded-lg group-hover:bg-[#ff6b35] group-hover:text-[#0a0a0a] transition-all font-medium">
                        View Details
                </span>
              </div>
                  </div>
                </Link>
              )
            })}
          </div>
        ) : (
          <div className="text-center py-16">
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="text-xl font-bold text-white mb-2">No listings found</h3>
            <p className="text-[#737373] mb-6">
              Try adjusting your filters or search query
            </p>
            <button
              onClick={() => {
                setSelectedType('all')
                setSearchQuery('')
                setSelectedCategory('all')
              }}
              className="px-6 py-3 bg-[#ff6b35] hover:bg-[#ff8555] text-[#0a0a0a] font-semibold rounded-xl transition-all"
            >
              Clear All Filters
            </button>
          </div>
        )}

        {/* Load More (only show if there are results) */}
        {filteredListings.length > 0 && filteredListings.length >= 15 && (
          <div className="mt-12 text-center">
            <button className="px-8 py-3 bg-[#1a1a1a] hover:bg-[#252525] text-white font-medium rounded-xl border border-[#252525] transition-all">
              Load More Listings
            </button>
          </div>
        )}

        {/* CTA Section */}
        <div className="mt-16 p-8 bg-gradient-to-r from-[#ff6b35]/10 via-[#1a1a1a] to-[#8b5cf6]/10 rounded-2xl border border-[#252525] text-center">
          <h2 className="text-2xl font-bold text-white mb-2">
            Build on Ghost Flow, Sell on Evoworks
          </h2>
          <p className="text-[#737373] mb-6 max-w-xl mx-auto">
            Create AI agents, workflows, and swarms on Ghost Flow, then list them on Evoworks to reach thousands of buyers. Earn with x402 micropayments or subscriptions.
          </p>
          <div className="flex items-center justify-center gap-4">
            <Link
              href="/publish"
              className="px-6 py-3 bg-[#ff6b35] hover:bg-[#ff8555] text-[#0a0a0a] font-semibold rounded-xl transition-all"
            >
              Publish Your Creation
            </Link>
            <Link
              href="/docs/publishing"
              className="px-6 py-3 bg-[#252525] hover:bg-[#333] text-white font-medium rounded-xl transition-all"
            >
              Learn More
            </Link>
        </div>
        </div>
      </div>
    </div>
  )
}
