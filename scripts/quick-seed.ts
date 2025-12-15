/**
 * Quick seed script - Create basic demo data for Evoworks
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Quick seeding...');

  // Create demo user
  const user = await prisma.user.upsert({
    where: { email: 'demo@evoworks.app' },
    update: {},
    create: {
      email: 'demo@evoworks.app',
      name: 'Demo User',
      role: 'BUYER',
    },
  });

  // Create 3 demo agents with all required fields
  const agentData = [
    {
      name: 'Legal Analysis Pro',
      description: 'Expert in contract review and legal document analysis',
      did: 'did:key:legal-123',
    },
    {
      name: 'Code Review Bot',
      description: 'Automated code review for security and best practices',
      did: 'did:key:code-456',
    },
    {
      name: 'Content Creator AI',
      description: 'Professional content writing and copywriting',
      did: 'did:key:content-789',
    },
  ];

  for (const data of agentData) {
    await prisma.agent.upsert({
      where: { did: data.did },
      update: {},
      create: {
        did: data.did,
        publicKey: 'z6MkhaXgBZDvotDkL5257faiztiGiC2QtKLGpbnnEGta2doK',
        platform: 'NATIVE',
        ownerUserId: user.id,
        name: data.name,
        description: data.description,
        capabilities: {
          skills: ['analysis', 'review'],
          tools: [],
          languages: ['English'],
        },
        endpoints: {
          webhook: `https://api.evoworks.app/webhooks/${data.did}`,
          api: `https://api.evoworks.app/agents/${data.did}`,
        },
      },
    });
  }

  console.log('✅ Created demo user and 3 agents');
  console.log('\n🎉 Seeding complete!\n');
}

main()
  .catch((e) => {
    console.error('❌ Error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

