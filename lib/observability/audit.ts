/**
 * Audit Event Logger - Tamper-evident audit trail with hash chaining
 * Every event is cryptographically linked to the previous event
 */

import { prisma } from '@/lib/db/prisma'
import crypto from 'crypto'

export interface AuditEventPayload {
  [key: string]: any
}

/**
 * Log an audit event
 */
export async function logEvent(
  eventType: string,
  payload: AuditEventPayload,
  agentId?: string,
  userId?: string,
  taskId?: string
): Promise<string> {
  try {
    // Get the last event to link to
    const lastEvent = await prisma.auditEvent.findFirst({
      orderBy: { sequenceNumber: 'desc' },
      select: {
        currentHash: true,
        sequenceNumber: true,
      },
    })

    const previousHash = lastEvent?.currentHash || '0'.repeat(64)
    const sequenceNumber = (lastEvent?.sequenceNumber || 0) + 1

    // Create event data
    const eventData = {
      eventType,
      agentId,
      userId,
      taskId,
      payload,
      previousHash,
      sequenceNumber,
      timestamp: new Date(),
    }

    // Calculate current hash
    const currentHash = calculateEventHash(eventData)

    // Store event
    const event = await prisma.auditEvent.create({
      data: {
        ...eventData,
        currentHash,
      },
    })

    console.log(`[Audit] Logged event ${eventType} (seq: ${sequenceNumber})`)

    return event.id
  } catch (error) {
    console.error('Error logging audit event:', error)
    throw error
  }
}

/**
 * Calculate hash for an audit event
 */
function calculateEventHash(eventData: any): string {
  const dataString = JSON.stringify({
    eventType: eventData.eventType,
    agentId: eventData.agentId,
    userId: eventData.userId,
    taskId: eventData.taskId,
    payload: eventData.payload,
    previousHash: eventData.previousHash,
    sequenceNumber: eventData.sequenceNumber,
    timestamp: eventData.timestamp.toISOString(),
  })

  return crypto.createHash('sha256').update(dataString).digest('hex')
}

/**
 * Get event chain (range of events)
 */
export async function getEventChain(
  fromSeq: number,
  toSeq: number
): Promise<any[]> {
  try {
    return await prisma.auditEvent.findMany({
      where: {
        sequenceNumber: {
          gte: fromSeq,
          lte: toSeq,
        },
      },
      orderBy: { sequenceNumber: 'asc' },
    })
  } catch (error) {
    console.error('Error getting event chain:', error)
    return []
  }
}

/**
 * Verify integrity of event chain
 */
export async function verifyChain(
  fromSeq: number,
  toSeq: number
): Promise<{
  valid: boolean
  tamperedEvents: number[]
}> {
  try {
    const events = await getEventChain(fromSeq, toSeq)
    const tamperedEvents: number[] = []

    for (let i = 0; i < events.length; i++) {
      const event = events[i]

      // Recalculate hash
      const expectedHash = calculateEventHash({
        eventType: event.eventType,
        agentId: event.agentId,
        userId: event.userId,
        taskId: event.taskId,
        payload: event.payload,
        previousHash: event.previousHash,
        sequenceNumber: event.sequenceNumber,
        timestamp: event.timestamp,
      })

      // Check if hash matches
      if (expectedHash !== event.currentHash) {
        tamperedEvents.push(event.sequenceNumber)
        console.warn(`[Audit] Tampered event detected at sequence ${event.sequenceNumber}`)
      }

      // Check if previous hash links correctly
      if (i > 0) {
        const previousEvent = events[i - 1]
        if (event.previousHash !== previousEvent.currentHash) {
          tamperedEvents.push(event.sequenceNumber)
          console.warn(`[Audit] Broken chain at sequence ${event.sequenceNumber}`)
        }
      }
    }

    return {
      valid: tamperedEvents.length === 0,
      tamperedEvents,
    }
  } catch (error) {
    console.error('Error verifying chain:', error)
    return { valid: false, tamperedEvents: [] }
  }
}

/**
 * Log specific event types
 */

export async function logAgentRegistration(agentId: string, agentData: any): Promise<void> {
  await logEvent('AGENT_REGISTERED', agentData, agentId)
}

export async function logTaskCreation(taskId: string, buyerId: string, taskData: any): Promise<void> {
  await logEvent('TASK_CREATED', taskData, undefined, buyerId, taskId)
}

export async function logBidSubmission(taskId: string, agentId: string, bidData: any): Promise<void> {
  await logEvent('BID_SUBMITTED', bidData, agentId, undefined, taskId)
}

export async function logPolicyDecision(
  agentId: string,
  taskId: string,
  decision: any
): Promise<void> {
  await logEvent('POLICY_DECISION', decision, agentId, undefined, taskId)
}

export async function logEscrowOperation(
  operation: string,
  escrowId: string,
  details: any
): Promise<void> {
  await logEvent('ESCROW_' + operation.toUpperCase(), { escrowId, ...details })
}

export async function logVCIssuance(agentId: string, vcData: any): Promise<void> {
  await logEvent('VC_ISSUED', vcData, agentId)
}

export async function logVCRevocation(agentId: string, vcId: string): Promise<void> {
  await logEvent('VC_REVOKED', { vcId }, agentId)
}

/**
 * Get audit trail for a specific entity
 */
export async function getAuditTrail(
  entityType: 'agent' | 'user' | 'task',
  entityId: string,
  limit: number = 100
): Promise<any[]> {
  try {
    const where: any = {}

    if (entityType === 'agent') where.agentId = entityId
    else if (entityType === 'user') where.userId = entityId
    else if (entityType === 'task') where.taskId = entityId

    return await prisma.auditEvent.findMany({
      where,
      orderBy: { timestamp: 'desc' },
      take: limit,
    })
  } catch (error) {
    console.error('Error getting audit trail:', error)
    return []
  }
}

/**
 * Search audit events by type and date range
 */
export async function searchAuditEvents(
  eventType?: string,
  startDate?: Date,
  endDate?: Date,
  limit: number = 100
): Promise<any[]> {
  try {
    const where: any = {}

    if (eventType) where.eventType = eventType
    if (startDate || endDate) {
      where.timestamp = {}
      if (startDate) where.timestamp.gte = startDate
      if (endDate) where.timestamp.lte = endDate
    }

    return await prisma.auditEvent.findMany({
      where,
      orderBy: { timestamp: 'desc' },
      take: limit,
    })
  } catch (error) {
    console.error('Error searching audit events:', error)
    return []
  }
}

/**
 * Get audit statistics
 */
export async function getAuditStats(period: '24h' | '7d' | '30d' | 'all' = '7d'): Promise<any> {
  try {
    const since =
      period === 'all'
        ? new Date(0)
        : new Date(Date.now() - (period === '24h' ? 1 : period === '7d' ? 7 : 30) * 24 * 60 * 60 * 1000)

    const [totalEvents, eventsByType] = await Promise.all([
      prisma.auditEvent.count({
        where: { timestamp: { gte: since } },
      }),
      prisma.auditEvent.groupBy({
        by: ['eventType'],
        where: { timestamp: { gte: since } },
        _count: { id: true },
        orderBy: { _count: { id: 'desc' } },
        take: 10,
      }),
    ])

    return {
      totalEvents,
      period,
      eventsByType: eventsByType.map((e) => ({
        type: e.eventType,
        count: e._count.id,
      })),
    }
  } catch (error) {
    console.error('Error getting audit stats:', error)
    return {}
  }
}

