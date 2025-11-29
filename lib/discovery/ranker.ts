/**
 * Ranking Algorithm - Multi-signal scoring for agent discovery
 * Combines relevance, trust, price, recency, and popularity
 */

import { prisma } from '@/lib/db/prisma'

export interface RankingWeights {
  relevance: number // 0-1
  trust: number // 0-1
  price: number // 0-1
  recency: number // 0-1
  popularity: number // 0-1
}

export interface ScoredAgent {
  agentId: string
  agent: any
  scores: {
    relevance: number
    trust: number
    price: number
    recency: number
    popularity: number
    final: number
  }
}

const DEFAULT_WEIGHTS: RankingWeights = {
  relevance: 0.35,
  trust: 0.25,
  price: 0.15,
  recency: 0.15,
  popularity: 0.10,
}

/**
 * Rank agents with multi-signal scoring
 */
export async function rankAgents(
  agentIds: string[],
  weights: RankingWeights = DEFAULT_WEIGHTS
): Promise<ScoredAgent[]> {
  if (agentIds.length === 0) return []

  // Get agent data
  const agents = await prisma.agent.findMany({
    where: {
      id: { in: agentIds },
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

  // Score each agent
  const scoredAgents = agents.map((agent) => {
    const relevanceScore = calculateRelevanceScore(agent, agentIds.indexOf(agent.id))
    const trustScore = calculateTrustScore(agent)
    const priceScore = calculatePriceScore(agent)
    const recencyScore = calculateRecencyScore(agent)
    const popularityScore = calculatePopularityScore(agent)

    const finalScore =
      relevanceScore * weights.relevance +
      trustScore * weights.trust +
      priceScore * weights.price +
      recencyScore * weights.recency +
      popularityScore * weights.popularity

    return {
      agentId: agent.id,
      agent,
      scores: {
        relevance: relevanceScore,
        trust: trustScore,
        price: priceScore,
        recency: recencyScore,
        popularity: popularityScore,
        final: finalScore,
      },
    }
  })

  // Sort by final score (descending)
  return scoredAgents.sort((a, b) => b.scores.final - a.scores.final)
}

/**
 * Calculate relevance score (0-1)
 * Based on position in semantic search results
 */
function calculateRelevanceScore(agent: any, position: number): number {
  // Exponential decay based on position
  // Position 0 = 1.0, Position 10 = 0.37, Position 20 = 0.13
  return Math.exp(-position / 10)
}

/**
 * Calculate trust score (0-1)
 * Based on reputation
 */
function calculateTrustScore(agent: any): number {
  const reputation = agent.reputationScores?.[0]?.overallScore || 50
  // Normalize 0-100 to 0-1
  return reputation / 100
}

/**
 * Calculate price score (0-1)
 * Lower price = higher score (reverse)
 */
function calculatePriceScore(agent: any): number {
  const basePrice = agent.listing?.basePrice || 100

  // Use logarithmic scale
  // $10 = 1.0, $100 = 0.5, $1000 = 0.25
  const maxPrice = 1000
  const minPrice = 10

  if (basePrice <= minPrice) return 1.0
  if (basePrice >= maxPrice) return 0.0

  // Inverse logarithmic scale
  return 1 - Math.log(basePrice / minPrice) / Math.log(maxPrice / minPrice)
}

/**
 * Calculate recency score (0-1)
 * More recently active = higher score
 */
function calculateRecencyScore(agent: any): number {
  const lastActiveAt = agent.listing?.lastActiveAt || agent.createdAt
  const ageInDays = (Date.now() - new Date(lastActiveAt).getTime()) / (1000 * 60 * 60 * 24)

  // Exponential decay
  // 0 days = 1.0, 30 days = 0.37, 90 days = 0.05
  return Math.exp(-ageInDays / 30)
}

/**
 * Calculate popularity score (0-1)
 * Based on install count and ratings
 */
function calculatePopularityScore(agent: any): number {
  const installCount = agent.listing?.installCount || 0
  const avgRating = agent.listing?.avgRating || 3.5

  // Combine install count and rating
  const installScore = Math.min(Math.log10(installCount + 1) / 3, 1.0) // Log scale, max at 1000 installs
  const ratingScore = avgRating / 5.0

  // Weighted combination: 60% rating, 40% installs
  return ratingScore * 0.6 + installScore * 0.4
}

/**
 * Adjust ranking weights based on user preferences
 */
export function adjustWeightsForPreference(
  preference: 'quality' | 'price' | 'speed' | 'popular' | 'balanced'
): RankingWeights {
  switch (preference) {
    case 'quality':
      return {
        relevance: 0.25,
        trust: 0.45, // Emphasize trust
        price: 0.05,
        recency: 0.15,
        popularity: 0.10,
      }

    case 'price':
      return {
        relevance: 0.25,
        trust: 0.15,
        price: 0.40, // Emphasize price
        recency: 0.10,
        popularity: 0.10,
      }

    case 'speed':
      return {
        relevance: 0.30,
        trust: 0.20,
        price: 0.10,
        recency: 0.30, // Emphasize recency (faster response)
        popularity: 0.10,
      }

    case 'popular':
      return {
        relevance: 0.20,
        trust: 0.20,
        price: 0.10,
        recency: 0.10,
        popularity: 0.40, // Emphasize popularity
      }

    case 'balanced':
    default:
      return DEFAULT_WEIGHTS
  }
}

/**
 * Get personalized ranking weights based on user history
 */
export async function getPersonalizedWeights(userId: string): Promise<RankingWeights> {
  try {
    // Get user's past task assignments
    const tasks = await prisma.task.findMany({
      where: { buyerUserId: userId },
      include: {
        assignment: {
          include: {
            agent: {
              include: {
                listing: true,
                reputationScores: {
                  where: { period: 'ALL_TIME' },
                  take: 1,
                },
              },
            },
            review: true,
          },
        },
      },
      take: 20,
    })

    if (tasks.length < 3) {
      // Not enough data, use balanced weights
      return DEFAULT_WEIGHTS
    }

    // Analyze user preferences from past choices
    let avgPrice = 0
    let avgTrust = 0
    let avgRating = 0
    let count = 0

    tasks.forEach((task) => {
      if (task.assignment) {
        avgPrice += task.assignment.agreedPrice
        avgTrust += task.assignment.agent.reputationScores?.[0]?.overallScore || 50
        if (task.assignment.review) {
          avgRating += task.assignment.review.rating
        }
        count++
      }
    })

    if (count === 0) return DEFAULT_WEIGHTS

    avgPrice /= count
    avgTrust /= count
    avgRating /= count

    // Adjust weights based on user behavior
    const weights = { ...DEFAULT_WEIGHTS }

    // If user consistently chooses high-trust agents, increase trust weight
    if (avgTrust > 75) {
      weights.trust = 0.35
      weights.price = 0.10
    }

    // If user is price-sensitive (low avg price), increase price weight
    if (avgPrice < 100) {
      weights.price = 0.25
      weights.trust = 0.20
    }

    // Normalize weights to sum to 1.0
    const sum = Object.values(weights).reduce((a, b) => a + b, 0)
    Object.keys(weights).forEach((key) => {
      weights[key as keyof RankingWeights] /= sum
    })

    return weights
  } catch (error) {
    console.error('Error getting personalized weights:', error)
    return DEFAULT_WEIGHTS
  }
}

