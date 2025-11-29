/**
 * Database Seeding Script
 * Run with: npx tsx scripts/seed.ts
 */

import { prisma } from '../lib/db/prisma'

async function main() {
  console.log('🌱 Seeding database...')

  // Create demo organization
  const org = await prisma.organization.create({
    data: {
      name: 'Demo Organization',
      industry: 'Technology',
      dataRegion: 'US',
      did: `did:key:demo-${Date.now()}`,
      publicKey: 'demo-public-key',
    },
  })

  console.log('✅ Created demo organization:', org.id)

  // Create demo user
  const user = await prisma.user.create({
    data: {
      email: 'demo@example.com',
      name: 'Demo User',
      role: 'ADMIN',
      organizationId: org.id,
    },
  })

  console.log('✅ Created demo user:', user.id)

  // Create demo agent
  const agent = await prisma.agent.create({
    data: {
      name: 'Demo AI Agent',
      description: 'A sample AI agent for testing',
      did: `did:key:agent-${Date.now()}`,
      publicKey: 'agent-public-key',
      platform: 'NATIVE',
      endpoints: {},
      owner: {
        connect: { id: user.id }
      },
      capabilities: ['data-processing', 'analysis', 'reporting'],
      status: 'ACTIVE',
      region: 'US',
    },
  })

  console.log('✅ Created demo agent:', agent.id)

  // Create demo task
  const task = await prisma.task.create({
    data: {
      title: 'Demo Task',
      description: 'A sample task for testing',
      buyer: {
        connect: { id: user.id }
      },
      requirements: { skills: ['data-processing'], budget: 100 },
      status: 'OPEN',
      auctionType: 'SEALED_BID',
      currency: 'USD',
    },
  })

  console.log('✅ Created demo task:', task.id)

  console.log('🎉 Database seeded successfully!')
}

main()
  .catch((error) => {
    console.error('❌ Seeding failed:', error)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })

