/**
 * Vector Embeddings - Generate and store embeddings for semantic search
 * Uses OpenAI's text-embedding-ada-002 model
 */

import { prisma } from '@/lib/db/prisma'

// In production, use actual OpenAI SDK
// For now, mock implementation
interface EmbeddingVector {
  embedding: number[]
  text: string
}

/**
 * Generate embedding for text using OpenAI
 */
export async function generateEmbedding(text: string): Promise<number[]> {
  try {
    // In production, use OpenAI API:
    // const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
    // const response = await openai.embeddings.create({
    //   model: 'text-embedding-ada-002',
    //   input: text,
    // })
    // return response.data[0].embedding

    // For now, return mock embedding (1536 dimensions like ada-002)
    return Array(1536)
      .fill(0)
      .map(() => Math.random() * 2 - 1)
  } catch (error) {
    console.error('Error generating embedding:', error)
    throw new Error('Failed to generate embedding')
  }
}

/**
 * Upsert agent embedding (store in vector DB or PostgreSQL pgvector)
 */
export async function upsertAgentEmbedding(
  agentId: string,
  capabilities: string
): Promise<void> {
  try {
    // Generate embedding from agent capabilities
    const embedding = await generateEmbedding(capabilities)

    // In production, store in Pinecone or PostgreSQL with pgvector extension
    // For now, store in agent metadata
    await prisma.agent.update({
      where: { id: agentId },
      data: {
        capabilities: {
          ...(await prisma.agent
            .findUnique({ where: { id: agentId } })
            .then((a) => a?.capabilities as any)),
          embedding: embedding.slice(0, 10), // Store truncated version for demo
        },
      },
    })

    console.log(`[Embeddings] Updated embedding for agent ${agentId}`)
  } catch (error) {
    console.error('Error upserting agent embedding:', error)
    throw error
  }
}

/**
 * Search for similar agents using cosine similarity
 */
export async function searchSimilar(
  queryEmbedding: number[],
  topK: number = 10
): Promise<string[]> {
  try {
    // Get all agents with embeddings
    const agents = await prisma.agent.findMany({
      where: { status: 'ACTIVE' },
      select: {
        id: true,
        capabilities: true,
      },
    })

    // Calculate cosine similarity for each agent
    const similarities = agents
      .map((agent) => {
        const agentCapabilities = agent.capabilities as any
        const agentEmbedding = agentCapabilities?.embedding || []

        if (agentEmbedding.length === 0) {
          return { agentId: agent.id, similarity: 0 }
        }

        const similarity = cosineSimilarity(
          queryEmbedding.slice(0, agentEmbedding.length),
          agentEmbedding
        )

        return { agentId: agent.id, similarity }
      })
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, topK)

    return similarities.map((s) => s.agentId)
  } catch (error) {
    console.error('Error searching similar agents:', error)
    return []
  }
}

/**
 * Calculate cosine similarity between two vectors
 */
function cosineSimilarity(vec1: number[], vec2: number[]): number {
  if (vec1.length !== vec2.length) return 0

  let dotProduct = 0
  let norm1 = 0
  let norm2 = 0

  for (let i = 0; i < vec1.length; i++) {
    dotProduct += vec1[i] * vec2[i]
    norm1 += vec1[i] * vec1[i]
    norm2 += vec2[i] * vec2[i]
  }

  if (norm1 === 0 || norm2 === 0) return 0

  return dotProduct / (Math.sqrt(norm1) * Math.sqrt(norm2))
}

/**
 * Batch update embeddings for all agents
 */
export async function batchUpdateEmbeddings(): Promise<void> {
  console.log('[Embeddings] Starting batch update...')

  const agents = await prisma.agent.findMany({
    where: { status: 'ACTIVE' },
    select: {
      id: true,
      name: true,
      description: true,
      capabilities: true,
    },
  })

  for (const agent of agents) {
    try {
      const capabilitiesText = `${agent.name} ${agent.description || ''} ${JSON.stringify(
        agent.capabilities
      )}`
      await upsertAgentEmbedding(agent.id, capabilitiesText)
    } catch (error) {
      console.error(`Failed to update embedding for agent ${agent.id}:`, error)
    }
  }

  console.log(`[Embeddings] Batch update complete. Updated ${agents.length} agents.`)
}

