/**
 * Search Engine - Hybrid search combining keyword, semantic, and filters
 */

import { prisma } from '@/lib/db/prisma'
import { generateEmbedding, searchSimilar } from './embeddings'
import { rankAgents, RankingWeights, adjustWeightsForPreference } from './ranker'

export interface SearchFilters {
  category?: string
  minTrust?: number
  maxPrice?: number
  region?: string
  dataClass?: string[]
  verified?: boolean
  platform?: string
}

export interface SearchResult {
  agents: any[]
  total: number
  page: number
  pageSize: number
  totalPages: number
}

/**
 * Main search function - hybrid search
 */
export async function search(
  query: string,
  filters: SearchFilters = {},
  rankingWeights?: RankingWeights,
  page: number = 1,
  pageSize: number = 20
): Promise<SearchResult> {
  try {
    let agentIds: string[] = []

    if (query && query.trim().length > 0) {
      // Semantic search if query provided
      const embedding = await generateEmbedding(query)
      agentIds = await searchSimilar(embedding, 100) // Get top 100 candidates
    } else {
      // No query, get all active agents
      const agents = await prisma.agent.findMany({
        where: { status: 'ACTIVE' },
        select: { id: true },
        take: 100,
      })
      agentIds = agents.map((a) => a.id)
    }

    // Apply filters
    const where: any = {
      id: { in: agentIds },
      status: 'ACTIVE',
    }

    if (filters.platform) {
      where.platform = filters.platform
    }

    if (filters.region) {
      where.capabilities = {
        path: ['regions'],
        array_contains: filters.region,
      }
    }

    // Get filtered agents
    let filteredAgents = await prisma.agent.findMany({
      where,
      include: {
        listing: true,
        reputationScores: {
          where: { period: 'ALL_TIME' },
          take: 1,
        },
        owner: {
          select: {
            name: true,
          },
        },
      },
    })

    // Apply additional filters
    if (filters.category) {
      filteredAgents = filteredAgents.filter(
        (a) => a.listing?.category === filters.category
      )
    }

    if (filters.minTrust !== undefined) {
      filteredAgents = filteredAgents.filter(
        (a) => (a.reputationScores?.[0]?.overallScore || 0) >= filters.minTrust
      )
    }

    if (filters.maxPrice !== undefined) {
      filteredAgents = filteredAgents.filter(
        (a) => (a.listing?.basePrice || Infinity) <= filters.maxPrice
      )
    }

    if (filters.verified !== undefined) {
      filteredAgents = filteredAgents.filter(
        (a) => a.listing?.verified === filters.verified
      )
    }

    // Rank filtered agents
    const rankedAgents = await rankAgents(
      filteredAgents.map((a) => a.id),
      rankingWeights
    )

    // Paginate
    const total = rankedAgents.length
    const totalPages = Math.ceil(total / pageSize)
    const startIndex = (page - 1) * pageSize
    const paginatedAgents = rankedAgents.slice(startIndex, startIndex + pageSize)

    return {
      agents: paginatedAgents,
      total,
      page,
      pageSize,
      totalPages,
    }
  } catch (error) {
    console.error('Error searching agents:', error)
    return {
      agents: [],
      total: 0,
      page,
      pageSize,
      totalPages: 0,
    }
  }
}

/**
 * Search by category
 */
export async function searchByCategory(
  category: string,
  filters: SearchFilters = {},
  page: number = 1,
  pageSize: number = 20
): Promise<SearchResult> {
  return search('', { ...filters, category }, undefined, page, pageSize)
}

/**
 * Get recommended agents for a buyer
 */
export async function recommendForBuyer(
  buyerId: string,
  topK: number = 10
): Promise<any[]> {
  try {
    // Get buyer's task history
    const tasks = await prisma.task.findMany({
      where: { buyerUserId: buyerId },
      include: {
        assignment: {
          select: {
            agentId: true,
          },
        },
      },
      take: 10,
    })

    // Get agents the buyer has worked with
    const usedAgentIds = tasks
      .filter((t) => t.assignment)
      .map((t) => t.assignment!.agentId)

    if (usedAgentIds.length === 0) {
      // New user, return trending agents
      return trending('7d', topK)
    }

    // Find similar agents (collaborative filtering)
    const recommendations = await findSimilarAgents(usedAgentIds, topK)

    // Exclude agents already used
    return recommendations.filter((r) => !usedAgentIds.includes(r.id))
  } catch (error) {
    console.error('Error getting recommendations:', error)
    return []
  }
}

/**
 * Find similar agents (collaborative filtering)
 */
async function findSimilarAgents(agentIds: string[], topK: number): Promise<any[]> {
  try {
    // Find buyers who also used these agents
    const similarBuyers = await prisma.task.findMany({
      where: {
        assignment: {
          agentId: { in: agentIds },
        },
      },
      select: {
        buyerUserId: true,
        assignment: {
          select: {
            agentId: true,
          },
        },
      },
      distinct: ['buyerUserId'],
    })

    // Get other agents these buyers used
    const otherAgentIds = similarBuyers
      .map((b) => b.assignment?.agentId)
      .filter((id): id is string => id !== undefined && !agentIds.includes(id))

    // Count frequency
    const agentCounts = new Map<string, number>()
    otherAgentIds.forEach((id) => {
      agentCounts.set(id, (agentCounts.get(id) || 0) + 1)
    })

    // Sort by frequency and get top K
    const sortedAgentIds = Array.from(agentCounts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, topK)
      .map(([id]) => id)

    // Get full agent data
    return await prisma.agent.findMany({
      where: {
        id: { in: sortedAgentIds },
        status: 'ACTIVE',
      },
      include: {
        listing: true,
        reputationScores: {
          where: { period: 'ALL_TIME' },
          take: 1,
        },
      },
    })
  } catch (error) {
    console.error('Error finding similar agents:', error)
    return []
  }
}

/**
 * Get trending agents
 */
export async function trending(
  period: '24h' | '7d' | '30d' = '7d',
  limit: number = 10
): Promise<any[]> {
  try {
    const periodMap = {
      '24h': 1,
      '7d': 7,
      '30d': 30,
    }

    const days = periodMap[period]
    const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000)

    // Get agents with most recent activity
    const trendingAgents = await prisma.agent.findMany({
      where: {
        status: 'ACTIVE',
        taskAssignments: {
          some: {
            startedAt: {
              gte: since,
            },
          },
        },
      },
      include: {
        listing: true,
        reputationScores: {
          where: { period: 'ALL_TIME' },
          take: 1,
        },
        taskAssignments: {
          where: {
            startedAt: {
              gte: since,
            },
          },
          select: {
            id: true,
          },
        },
      },
      take: limit * 2, // Get more for scoring
    })

    // Score by activity + reputation
    const scored = trendingAgents
      .map((agent) => {
        const activityCount = agent.taskAssignments.length
        const reputation = agent.reputationScores?.[0]?.overallScore || 50

        // Combine activity and reputation
        const score = activityCount * 10 + reputation

        return { agent, score }
      })
      .sort((a, b) => b.score - a.score)
      .slice(0, limit)
      .map((s) => s.agent)

    return scored
  } catch (error) {
    console.error('Error getting trending agents:', error)
    return []
  }
}

/**
 * Autocomplete search suggestions
 */
export async function autocomplete(query: string, limit: number = 10): Promise<string[]> {
  try {
    if (!query || query.trim().length < 2) return []

    const agents = await prisma.agent.findMany({
      where: {
        status: 'ACTIVE',
        OR: [
          { name: { contains: query, mode: 'insensitive' } },
          { description: { contains: query, mode: 'insensitive' } },
        ],
      },
      select: {
        name: true,
      },
      take: limit,
    })

    return agents.map((a) => a.name)
  } catch (error) {
    console.error('Error getting autocomplete:', error)
    return []
  }
}

