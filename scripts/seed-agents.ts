/**
 * Seed script - Create demo AI agents for Evoworks marketplace
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database with demo agents...');

  // Create demo user first
  const demoUser = await prisma.user.upsert({
    where: { email: 'demo@evoworks.app' },
    update: {},
    create: {
      email: 'demo@evoworks.app',
      name: 'Demo User',
      role: 'SELLER',
    },
  });

  console.log(`✅ Demo user: ${demoUser.email}`);

  // Create demo agents
  const agents = await Promise.all([
    prisma.agent.create({
      data: {
        did: 'did:key:legal-pro-123',
        publicKey: 'z6MkhaXgBZDvotDkL5257faiztiGiC2QtKLGpbnnEGta2doK',
        platform: 'NATIVE',
        ownerUserId: demoUser.id,
        name: 'Legal Analysis Pro',
        description: 'Expert in contract review, legal document analysis, and compliance checking. Specializes in NDA, employment agreements, and commercial contracts.',
        capabilities: {
          skills: ['legal', 'contract-review', 'compliance', 'document-analysis'],
          tools: ['NLP', 'Document Parser'],
          languages: ['English', 'Spanish'],
        },
        endpoints: {
          webhook: 'https://api.evoworks.app/webhooks/legal-pro',
          api: 'https://api.evoworks.app/agents/legal-pro',
        },
      },
    }),
    
    prisma.agent.create({
      data: {
        name: 'Market Research AI',
        description: 'Comprehensive market analysis, competitor research, and trend forecasting. Real-time data from 1000+ sources.',
        ownerDID: 'did:key:market-research-456',
        capabilities: ['market-research', 'competitor-analysis', 'data-analysis', 'forecasting'],
        trustScore: 0.92,
        totalEarnings: 8430.25,
        tasksCompleted: 189,
        isActive: true,
        metadata: {
          specialties: ['Market Analysis', 'Competitive Intelligence', 'Trend Forecasting'],
          dataSources: 1247,
          avgResponseTime: '30 minutes',
          successRate: 0.94,
        },
        walletAddress: '0x8Ba1f109551bD432803012645Ac136ddd64DBA72',
      },
    }),
    
    prisma.agent.create({
      data: {
        name: 'Code Review Bot',
        description: 'Automated code review for security, performance, and best practices. Supports 20+ languages.',
        ownerDID: 'did:key:code-review-789',
        capabilities: ['code-review', 'security-audit', 'performance-optimization', 'best-practices'],
        trustScore: 0.97,
        totalEarnings: 15230.00,
        tasksCompleted: 512,
        isActive: true,
        metadata: {
          specialties: ['Security Audits', 'Performance Optimization', 'Clean Code'],
          languages: ['JavaScript', 'Python', 'Go', 'Rust', 'TypeScript'],
          avgResponseTime: '10 minutes',
          successRate: 0.99,
        },
        walletAddress: '0x4B0897b0513fdC7C541B6d9D7E929C4e5364D2dB',
      },
    }),
    
    prisma.agent.create({
      data: {
        name: 'Content Creator AI',
        description: 'Professional content writing for blogs, marketing, social media, and technical documentation. SEO optimized.',
        ownerDID: 'did:key:content-creator-101',
        capabilities: ['content-writing', 'copywriting', 'seo', 'technical-writing', 'social-media'],
        trustScore: 0.89,
        totalEarnings: 6842.75,
        tasksCompleted: 342,
        isActive: true,
        metadata: {
          specialties: ['Blog Posts', 'Marketing Copy', 'Technical Docs', 'Social Media'],
          avgWordCount: 1500,
          avgResponseTime: '45 minutes',
          successRate: 0.91,
        },
        walletAddress: '0x0D8775F648430679A709E98d2b0Cb6250d2887EF',
      },
    }),
    
    prisma.agent.create({
      data: {
        name: 'Data Science Wizard',
        description: 'Statistical analysis, machine learning models, data visualization, and predictive analytics. PhD-level expertise.',
        ownerDID: 'did:key:data-science-202',
        capabilities: ['data-analysis', 'machine-learning', 'statistics', 'visualization', 'predictive-analytics'],
        trustScore: 0.96,
        totalEarnings: 18950.00,
        tasksCompleted: 178,
        isActive: true,
        metadata: {
          specialties: ['ML Models', 'Statistical Analysis', 'Data Viz', 'Predictions'],
          tools: ['Python', 'R', 'TensorFlow', 'PyTorch', 'Tableau'],
          avgResponseTime: '2 hours',
          successRate: 0.97,
        },
        walletAddress: '0x6B175474E89094C44Da98b954EedeAC495271d0F',
      },
    }),
    
    prisma.agent.create({
      data: {
        name: 'Financial Analyst AI',
        description: 'Financial modeling, investment analysis, risk assessment, and portfolio optimization. CFA-level insights.',
        ownerDID: 'did:key:financial-analyst-303',
        capabilities: ['financial-analysis', 'investment-research', 'risk-assessment', 'portfolio-management'],
        trustScore: 0.94,
        totalEarnings: 22100.50,
        tasksCompleted: 156,
        isActive: true,
        metadata: {
          specialties: ['Financial Modeling', 'Investment Analysis', 'Risk Management'],
          markets: ['Stocks', 'Crypto', 'Commodities', 'Real Estate'],
          avgResponseTime: '1 hour',
          successRate: 0.96,
        },
        walletAddress: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
      },
    }),

    prisma.agent.create({
      data: {
        name: 'Translation Master',
        description: 'Professional translation and localization for 95+ languages. Native-level fluency with cultural context.',
        ownerDID: 'did:key:translation-404',
        capabilities: ['translation', 'localization', 'proofreading', 'cultural-adaptation'],
        trustScore: 0.91,
        totalEarnings: 9650.25,
        tasksCompleted: 423,
        isActive: true,
        metadata: {
          specialties: ['Document Translation', 'Website Localization', 'Cultural Adaptation'],
          languages: ['English', 'Spanish', 'French', 'German', 'Chinese', 'Japanese', '...95 more'],
          avgResponseTime: '20 minutes',
          successRate: 0.93,
        },
        walletAddress: '0xdAC17F958D2ee523a2206206994597C13D831ec7',
      },
    }),

    prisma.agent.create({
      data: {
        name: 'UI/UX Design Bot',
        description: 'Interface design, user experience optimization, wireframing, and prototyping. Award-winning designs.',
        ownerDID: 'did:key:design-bot-505',
        capabilities: ['ui-design', 'ux-design', 'wireframing', 'prototyping', 'user-research'],
        trustScore: 0.93,
        totalEarnings: 14200.00,
        tasksCompleted: 198,
        isActive: true,
        metadata: {
          specialties: ['Mobile Apps', 'Web Design', 'Design Systems', 'User Research'],
          tools: ['Figma', 'Sketch', 'Adobe XD', 'Framer'],
          avgResponseTime: '3 hours',
          successRate: 0.95,
        },
        walletAddress: '0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599',
      },
    }),
  ]);

  console.log(`✅ Created ${agents.length} demo agents`);

  // Create a demo task for each agent
  console.log('📋 Creating demo tasks...');
  
  const tasks = await Promise.all(
    agents.slice(0, 3).map((agent, i) =>
      prisma.task.create({
        data: {
          title: `Demo Task ${i + 1}`,
          description: `Sample task for ${agent.name}`,
          clientId: 'demo-client-123',
          agentId: agent.id,
          status: i === 0 ? 'COMPLETED' : i === 1 ? 'IN_PROGRESS' : 'PENDING',
          budget: (i + 1) * 10,
          requirements: [`Requirement for ${agent.name}`],
        },
      })
    )
  );

  console.log(`✅ Created ${tasks.length} demo tasks`);

  console.log('\n🎉 Seeding complete!\n');
  console.log('Agent Summary:');
  agents.forEach((agent, i) => {
    console.log(`${i + 1}. ${agent.name} (Trust: ${agent.trustScore}, Tasks: ${agent.tasksCompleted}, Earned: $${agent.totalEarnings})`);
  });
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

