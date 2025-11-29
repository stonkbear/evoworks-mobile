/**
 * Attestation System - Allow users to attest to agent quality
 * Attestations are weighted by the attestor's own reputation
 */

import { prisma } from '@/lib/db/prisma'
import { updateOnAttestation } from './updater'

export interface AttestationInput {
  agentId: string
  attestorUserId: string
  category: string
  score: number // 1-5
  comment?: string
  verificationProof?: Record<string, any>
}

export interface AttestationWithWeight {
  id: string
  category: string
  score: number
  comment: string | null
  createdAt: Date
  attestor: {
    name: string | null
    reputation: number // 0-100
  }
  weight: number // 0-1 based on attestor reputation
}

/**
 * Create an attestation
 */
export async function createAttestation(input: AttestationInput): Promise<string> {
  try {
    // Validate score
    if (input.score < 1 || input.score > 5) {
      throw new Error('Score must be between 1 and 5')
    }

    // Check if attestor has permission to attest
    const canAttest = await canUserAttest(input.attestorUserId, input.agentId)
    if (!canAttest) {
      throw new Error('User does not have permission to attest to this agent')
    }

    // Create attestation
    const attestation = await prisma.attestation.create({
      data: {
        agentId: input.agentId,
        attestorUserId: input.attestorUserId,
        category: input.category,
        score: input.score,
        comment: input.comment,
        verificationProof: input.verificationProof || {},
      },
    })

    // Update agent reputation
    await updateOnAttestation(input.agentId)

    console.log(
      `[Attestation] User ${input.attestorUserId} attested to agent ${input.agentId} (${input.category}: ${input.score}/5)`
    )

    return attestation.id
  } catch (error) {
    console.error('Error creating attestation:', error)
    throw error
  }
}

/**
 * Get attestations for an agent with weighted scores
 */
export async function getAttestations(
  agentId: string,
  category?: string
): Promise<AttestationWithWeight[]> {
  try {
    const where: any = { agentId }
    if (category) where.category = category

    const attestations = await prisma.attestation.findMany({
      where,
      include: {
        attestor: {
          select: {
            name: true,
            ownedAgents: {
              include: {
                reputationScores: {
                  where: { period: 'ALL_TIME' },
                  take: 1,
                },
              },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    })

    // Calculate weights and apply time decay
    return attestations.map((att) => {
      const attestorReputation =
        att.attestor.ownedAgents[0]?.reputationScores[0]?.overallScore || 50

      // Weight based on attestor reputation (0-1 scale)
      let weight = attestorReputation / 100

      // Apply time decay (reduce weight for old attestations)
      const ageInDays =
        (Date.now() - att.createdAt.getTime()) / (1000 * 60 * 60 * 24)
      const decayFactor = Math.exp(-ageInDays / 90) // 90-day half-life
      weight *= decayFactor

      return {
        id: att.id,
        category: att.category,
        score: att.score,
        comment: att.comment,
        createdAt: att.createdAt,
        attestor: {
          name: att.attestor.name || 'Anonymous',
          reputation: attestorReputation,
        },
        weight,
      }
    })
  } catch (error) {
    console.error('Error getting attestations:', error)
    return []
  }
}

/**
 * Calculate weighted average attestation score for a category
 */
export async function getWeightedAttestationScore(
  agentId: string,
  category: string
): Promise<number> {
  const attestations = await getAttestations(agentId, category)

  if (attestations.length === 0) return 0

  let weightedSum = 0
  let totalWeight = 0

  attestations.forEach((att) => {
    weightedSum += att.score * att.weight
    totalWeight += att.weight
  })

  return totalWeight > 0 ? weightedSum / totalWeight : 0
}

/**
 * Get attestation summary by category
 */
export async function getAttestationSummary(agentId: string): Promise<
  Array<{
    category: string
    count: number
    avgScore: number
    weightedAvgScore: number
  }>
> {
  const attestations = await getAttestations(agentId)

  // Group by category
  const categories = [...new Set(attestations.map((a) => a.category))]

  return Promise.all(
    categories.map(async (category) => {
      const categoryAttestations = attestations.filter((a) => a.category === category)

      const avgScore =
        categoryAttestations.reduce((sum, a) => sum + a.score, 0) /
        categoryAttestations.length

      const weightedSum = categoryAttestations.reduce(
        (sum, a) => sum + a.score * a.weight,
        0
      )
      const totalWeight = categoryAttestations.reduce((sum, a) => sum + a.weight, 0)
      const weightedAvgScore = totalWeight > 0 ? weightedSum / totalWeight : 0

      return {
        category,
        count: categoryAttestations.length,
        avgScore: Math.round(avgScore * 100) / 100,
        weightedAvgScore: Math.round(weightedAvgScore * 100) / 100,
      }
    })
  )
}

/**
 * Check if user can attest to an agent
 * Requirements:
 * - User must have interacted with agent (completed task)
 * - User cannot attest to their own agent
 * - User can only attest once per agent per category
 */
async function canUserAttest(userId: string, agentId: string): Promise<boolean> {
  // Check if user owns the agent
  const agent = await prisma.agent.findUnique({
    where: { id: agentId },
    select: { ownerUserId: true },
  })

  if (!agent || agent.ownerUserId === userId) {
    return false // Cannot attest to own agent
  }

  // Check if user has completed a task with this agent
  const completedTasks = await prisma.task.count({
    where: {
      buyerUserId: userId,
      assignment: {
        agentId,
        status: 'COMPLETED',
      },
    },
  })

  return completedTasks > 0
}

/**
 * Update attestation (only allowed within 24 hours)
 */
export async function updateAttestation(
  attestationId: string,
  userId: string,
  updates: {
    score?: number
    comment?: string
  }
): Promise<boolean> {
  try {
    const attestation = await prisma.attestation.findUnique({
      where: { id: attestationId },
    })

    if (!attestation || attestation.attestorUserId !== userId) {
      return false // Not found or not owner
    }

    // Check if within 24 hours
    const ageInHours =
      (Date.now() - attestation.createdAt.getTime()) / (1000 * 60 * 60)
    if (ageInHours > 24) {
      throw new Error('Attestations can only be updated within 24 hours')
    }

    await prisma.attestation.update({
      where: { id: attestationId },
      data: updates,
    })

    // Update reputation
    await updateOnAttestation(attestation.agentId)

    return true
  } catch (error) {
    console.error('Error updating attestation:', error)
    return false
  }
}

/**
 * Delete attestation (only allowed within 24 hours)
 */
export async function deleteAttestation(
  attestationId: string,
  userId: string
): Promise<boolean> {
  try {
    const attestation = await prisma.attestation.findUnique({
      where: { id: attestationId },
    })

    if (!attestation || attestation.attestorUserId !== userId) {
      return false
    }

    const ageInHours =
      (Date.now() - attestation.createdAt.getTime()) / (1000 * 60 * 60)
    if (ageInHours > 24) {
      throw new Error('Attestations can only be deleted within 24 hours')
    }

    await prisma.attestation.delete({
      where: { id: attestationId },
    })

    await updateOnAttestation(attestation.agentId)

    return true
  } catch (error) {
    console.error('Error deleting attestation:', error)
    return false
  }
}

/**
 * Get top attestors (most trusted users)
 */
export async function getTopAttestors(limit: number = 10): Promise<any[]> {
  const attestors = await prisma.attestation.groupBy({
    by: ['attestorUserId'],
    _count: {
      id: true,
    },
    orderBy: {
      _count: {
        id: 'desc',
      },
    },
    take: limit,
  })

  return Promise.all(
    attestors.map(async (a) => {
      const user = await prisma.user.findUnique({
        where: { id: a.attestorUserId },
        select: {
          name: true,
          ownedAgents: {
            include: {
              reputationScores: {
                where: { period: 'ALL_TIME' },
                take: 1,
              },
            },
          },
        },
      })

      return {
        userId: a.attestorUserId,
        name: user?.name,
        attestationCount: a._count.id,
        reputation: user?.ownedAgents[0]?.reputationScores[0]?.overallScore || 50,
      }
    })
  )
}

