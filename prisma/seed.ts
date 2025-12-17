/**
 * Database Seed Script
 * Run with: npx prisma db seed
 */

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding database...')

  // Create demo publishers
  const publishers = await Promise.all([
    prisma.publisher.upsert({
      where: { slug: 'techcorp-ai' },
      update: {},
      create: {
        userId: 'user_techcorp',
        ghostFlowOrgId: 'gf_org_techcorp',
        displayName: 'TechCorp AI',
        slug: 'techcorp-ai',
        bio: 'Building intelligent automation solutions for modern enterprises.',
        verified: true,
        verifiedAt: new Date(),
        payoutMethod: 'USDC',
        payoutAddress: '0x1234567890123456789012345678901234567890',
      },
    }),
    prisma.publisher.upsert({
      where: { slug: 'devtools-inc' },
      update: {},
      create: {
        userId: 'user_devtools',
        ghostFlowOrgId: 'gf_org_devtools',
        displayName: 'DevTools Inc',
        slug: 'devtools-inc',
        bio: 'Developer productivity tools and AI-powered code assistants.',
        verified: true,
        verifiedAt: new Date(),
        payoutMethod: 'USDC',
        payoutAddress: '0x2345678901234567890123456789012345678901',
      },
    }),
    prisma.publisher.upsert({
      where: { slug: 'contentlab' },
      update: {},
      create: {
        userId: 'user_contentlab',
        ghostFlowOrgId: 'gf_org_contentlab',
        displayName: 'ContentLab',
        slug: 'contentlab',
        bio: 'AI-powered content creation and marketing automation.',
        verified: true,
        verifiedAt: new Date(),
        payoutMethod: 'STRIPE',
      },
    }),
    prisma.publisher.upsert({
      where: { slug: 'swarmlabs' },
      update: {},
      create: {
        userId: 'user_swarmlabs',
        ghostFlowOrgId: 'gf_org_swarmlabs',
        displayName: 'SwarmLabs',
        slug: 'swarmlabs',
        bio: 'Multi-agent systems and swarm intelligence solutions.',
        verified: true,
        verifiedAt: new Date(),
        payoutMethod: 'USDC',
        payoutAddress: '0x3456789012345678901234567890123456789012',
      },
    }),
    prisma.publisher.upsert({
      where: { slug: 'integrationhub' },
      update: {},
      create: {
        userId: 'user_integrationhub',
        ghostFlowOrgId: 'gf_org_integrationhub',
        displayName: 'IntegrationHub',
        slug: 'integrationhub',
        bio: 'Connecting your favorite tools with AI automation.',
        verified: true,
        verifiedAt: new Date(),
        payoutMethod: 'USDC',
        payoutAddress: '0x4567890123456789012345678901234567890123',
      },
    }),
  ])

  console.log(`✅ Created ${publishers.length} publishers`)

  // Create demo listings
  const listings = [
    // Agents
    {
      publisherSlug: 'techcorp-ai',
      slug: 'data-research-agent',
      name: 'Data Research Agent',
      shortDescription: 'Autonomous researcher that gathers, analyzes, and synthesizes information from multiple sources',
      longDescription: `The Data Research Agent is a powerful AI-powered research assistant that can autonomously gather, analyze, and synthesize information from multiple sources.

## Features
- **Multi-source Research**: Searches web, academic papers, and databases
- **Data Analysis**: Performs statistical analysis and generates insights
- **Report Generation**: Creates comprehensive research reports
- **Citation Management**: Automatically tracks and formats citations

## Use Cases
- Market research and competitive analysis
- Academic research assistance
- Due diligence and background checks
- Trend analysis and forecasting`,
      type: 'AGENT',
      category: 'research',
      tags: ['research', 'analysis', 'web-scraping', 'reports'],
      supportedModels: ['gpt-4', 'claude-3-opus'],
      availableTools: ['http', 'filesystem', 'database'],
      pricingModel: 'PER_CALL',
      priceAmount: 5,
      viewCount: 12450,
      installCount: 2847,
      avgRating: 4.9,
      reviewCount: 127,
      totalRevenue: 14235,
    },
    {
      publisherSlug: 'devtools-inc',
      slug: 'code-builder-pro',
      name: 'Code Builder Pro',
      shortDescription: 'Full-stack code generation agent with Git integration and automated testing',
      longDescription: `Code Builder Pro is an advanced AI agent that generates production-ready code with automatic testing and Git integration.

## Features
- **Full-Stack Generation**: Frontend, backend, and database code
- **Git Integration**: Automatic commits, PRs, and branch management
- **Test Generation**: Unit tests, integration tests, and E2E tests
- **Code Review**: Automated code review and suggestions`,
      type: 'AGENT',
      category: 'development',
      tags: ['coding', 'development', 'automation', 'git'],
      supportedModels: ['gpt-4-turbo', 'claude-3-sonnet'],
      availableTools: ['codegen', 'git', 'filesystem'],
      pricingModel: 'PER_CALL',
      priceAmount: 10,
      viewCount: 8920,
      installCount: 1923,
      avgRating: 4.8,
      reviewCount: 89,
      totalRevenue: 19230,
    },
    {
      publisherSlug: 'contentlab',
      slug: 'content-writer-ai',
      name: 'Content Writer AI',
      shortDescription: 'Professional content creation with SEO optimization and brand voice matching',
      longDescription: `Content Writer AI creates high-quality, SEO-optimized content that matches your brand voice perfectly.`,
      type: 'AGENT',
      category: 'content',
      tags: ['writing', 'seo', 'marketing', 'content'],
      supportedModels: ['gpt-4', 'claude-3-opus'],
      availableTools: ['http', 'filesystem'],
      pricingModel: 'SUBSCRIPTION',
      subscriptionMonthly: 29,
      subscriptionYearly: 290,
      viewCount: 15600,
      installCount: 4521,
      avgRating: 4.7,
      reviewCount: 234,
      totalRevenue: 42228,
    },
    // Workflows
    {
      publisherSlug: 'contentlab',
      slug: 'content-repurposing-engine',
      name: 'Content Repurposing Engine',
      shortDescription: 'Transform blog posts into tweets, LinkedIn posts, newsletters, and video scripts',
      longDescription: `Automatically repurpose your content across multiple platforms and formats.`,
      type: 'WORKFLOW',
      category: 'content',
      tags: ['content', 'social-media', 'repurposing', 'automation'],
      supportedModels: ['gpt-4', 'claude-3-sonnet'],
      availableTools: ['http', 'filesystem'],
      nodeCount: 8,
      estimatedLatency: 5000,
      pricingModel: 'SUBSCRIPTION',
      subscriptionMonthly: 19,
      viewCount: 9800,
      installCount: 2341,
      avgRating: 4.8,
      reviewCount: 156,
      totalRevenue: 44479,
    },
    {
      publisherSlug: 'techcorp-ai',
      slug: 'lead-qualification-pipeline',
      name: 'Lead Qualification Pipeline',
      shortDescription: 'Automated workflow: Capture leads → Enrich data → Score → Route to sales',
      longDescription: `End-to-end lead qualification workflow that enriches, scores, and routes leads automatically.`,
      type: 'WORKFLOW',
      category: 'sales',
      tags: ['leads', 'crm', 'automation', 'sales'],
      supportedModels: ['gpt-4'],
      availableTools: ['http', 'database'],
      nodeCount: 6,
      estimatedLatency: 3000,
      pricingModel: 'PER_CALL',
      priceAmount: 2,
      viewCount: 5670,
      installCount: 892,
      avgRating: 4.6,
      reviewCount: 78,
      totalRevenue: 1784,
    },
    // Swarms
    {
      publisherSlug: 'swarmlabs',
      slug: 'market-research-swarm',
      name: 'Market Research Swarm',
      shortDescription: '5-agent team: Researcher + Analyst + Writer + Reviewer + Editor working in coordination',
      longDescription: `A coordinated team of 5 AI agents working together to produce comprehensive market research reports.`,
      type: 'SWARM',
      category: 'research',
      tags: ['research', 'analysis', 'multi-agent', 'reports'],
      supportedModels: ['gpt-4', 'claude-3-opus', 'gemini-pro'],
      availableTools: ['http', 'filesystem', 'database'],
      nodeCount: 5,
      estimatedLatency: 60000,
      pricingModel: 'PER_CALL',
      priceAmount: 25,
      viewCount: 4500,
      installCount: 567,
      avgRating: 4.9,
      reviewCount: 45,
      totalRevenue: 14175,
    },
    {
      publisherSlug: 'devtools-inc',
      slug: 'code-review-committee',
      name: 'Code Review Committee',
      shortDescription: 'Multi-agent code review: Security + Performance + Style + Architecture reviewers',
      longDescription: `Four specialized AI agents review your code from different perspectives.`,
      type: 'SWARM',
      category: 'development',
      tags: ['code-review', 'security', 'multi-agent', 'development'],
      supportedModels: ['gpt-4-turbo', 'claude-3-opus'],
      availableTools: ['git', 'codegen', 'filesystem'],
      nodeCount: 4,
      estimatedLatency: 30000,
      pricingModel: 'PER_CALL',
      priceAmount: 15,
      viewCount: 6200,
      installCount: 1234,
      avgRating: 4.7,
      reviewCount: 89,
      totalRevenue: 18510,
    },
    // Integrations
    {
      publisherSlug: 'integrationhub',
      slug: 'slack-command-center',
      name: 'Slack Command Center',
      shortDescription: 'Trigger any Ghost Flow automation directly from Slack with /gf commands',
      longDescription: `Control your Ghost Flow automations directly from Slack.`,
      type: 'INTEGRATION',
      category: 'productivity',
      tags: ['slack', 'commands', 'triggers', 'automation'],
      supportedModels: [],
      availableTools: ['http'],
      pricingModel: 'FREE',
      viewCount: 12000,
      installCount: 5678,
      avgRating: 4.8,
      reviewCount: 234,
      totalRevenue: 0,
    },
    {
      publisherSlug: 'integrationhub',
      slug: 'notion-ai-pipeline',
      name: 'Notion ↔ AI Pipeline',
      shortDescription: 'Bi-directional sync between Notion databases and AI agents',
      longDescription: `Seamlessly sync data between Notion and your AI workflows.`,
      type: 'INTEGRATION',
      category: 'productivity',
      tags: ['notion', 'sync', 'productivity', 'database'],
      supportedModels: [],
      availableTools: ['http'],
      pricingModel: 'SUBSCRIPTION',
      subscriptionMonthly: 9,
      viewCount: 8900,
      installCount: 3456,
      avgRating: 4.7,
      reviewCount: 189,
      totalRevenue: 31104,
    },
    {
      publisherSlug: 'devtools-inc',
      slug: 'github-actions-bridge',
      name: 'GitHub Actions Bridge',
      shortDescription: 'Trigger Ghost Flow workflows from GitHub events and vice versa',
      longDescription: `Connect GitHub Actions with Ghost Flow for powerful CI/CD automation.`,
      type: 'INTEGRATION',
      category: 'development',
      tags: ['github', 'ci-cd', 'automation', 'devops'],
      supportedModels: [],
      availableTools: ['git', 'http'],
      pricingModel: 'PER_CALL',
      priceAmount: 1,
      viewCount: 5400,
      installCount: 1234,
      avgRating: 4.6,
      reviewCount: 78,
      totalRevenue: 1234,
    },
  ]

  for (const listingData of listings) {
    const publisher = publishers.find(p => p.slug === listingData.publisherSlug)
    if (!publisher) continue

    await prisma.marketplaceListing.upsert({
      where: { slug: listingData.slug },
      update: {},
      create: {
        publisherId: publisher.id,
        slug: listingData.slug,
        name: listingData.name,
        shortDescription: listingData.shortDescription,
        longDescription: listingData.longDescription,
        type: listingData.type as any,
        category: listingData.category,
        tags: listingData.tags,
        supportedModels: listingData.supportedModels,
        availableTools: listingData.availableTools,
        nodeCount: listingData.nodeCount,
        estimatedLatency: listingData.estimatedLatency,
        pricingModel: listingData.pricingModel as any,
        priceAmount: listingData.priceAmount,
        subscriptionMonthly: listingData.subscriptionMonthly,
        subscriptionYearly: listingData.subscriptionYearly,
        status: 'ACTIVE',
        verificationLevel: 'VERIFIED',
        verifiedAt: new Date(),
        viewCount: listingData.viewCount,
        installCount: listingData.installCount,
        avgRating: listingData.avgRating,
        reviewCount: listingData.reviewCount,
        totalRevenue: listingData.totalRevenue,
        publishedAt: new Date(Date.now() - Math.random() * 90 * 24 * 60 * 60 * 1000), // Random date within 90 days
      },
    })
  }

  console.log(`✅ Created ${listings.length} listings`)

  // Update publisher stats
  for (const publisher of publishers) {
    const stats = await prisma.marketplaceListing.aggregate({
      where: { publisherId: publisher.id },
      _count: true,
      _sum: {
        installCount: true,
        totalRevenue: true,
      },
      _avg: {
        avgRating: true,
      },
    })

    await prisma.publisher.update({
      where: { id: publisher.id },
      data: {
        totalListings: stats._count,
        totalInstalls: stats._sum.installCount || 0,
        totalRevenue: stats._sum.totalRevenue || 0,
        avgRating: stats._avg.avgRating,
      },
    })
  }

  console.log('✅ Updated publisher stats')
  console.log('🎉 Seed completed!')
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })

