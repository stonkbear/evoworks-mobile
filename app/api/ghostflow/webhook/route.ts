/**
 * Ghost Flow Webhook Receiver
 * Handle events from Ghost Flow
 */

import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import crypto from 'crypto'
import type { GhostFlowWebhookEvent, GhostFlowListingType } from '@/lib/ghostflow/types'
import { GHOSTFLOW_TYPE_MAP } from '@/lib/ghostflow/types'

// Verify webhook signature
function verifyWebhookSignature(payload: string, signature: string): boolean {
  const secret = process.env.GHOSTFLOW_WEBHOOK_SECRET
  if (!secret) {
    console.warn('GHOSTFLOW_WEBHOOK_SECRET not set')
    return false
  }

  const expectedSignature = crypto
    .createHmac('sha256', secret)
    .update(payload)
    .digest('hex')

  return crypto.timingSafeEqual(
    Buffer.from(signature),
    Buffer.from(expectedSignature)
  )
}

export async function POST(request: NextRequest) {
  try {
    const payload = await request.text()
    const signature = request.headers.get('x-ghostflow-signature') || ''

    // Verify signature in production
    if (process.env.NODE_ENV === 'production') {
      if (!verifyWebhookSignature(payload, signature)) {
        return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
      }
    }

    const event: GhostFlowWebhookEvent = JSON.parse(payload)
    console.log(`[Ghost Flow Webhook] ${event.event}:`, event.data)

    // Handle different event types
    switch (event.event) {
      case 'listing:created':
        await handleListingCreated(event.data)
        break

      case 'listing:published':
        await handleListingPublished(event.data)
        break

      case 'listing:unpublished':
        await handleListingUnpublished(event.data)
        break

      case 'execution:started':
        await handleExecutionStarted(event.data)
        break

      case 'execution:completed':
        await handleExecutionCompleted(event.data)
        break

      case 'execution:failed':
        await handleExecutionFailed(event.data)
        break

      case 'payment:received':
        await handlePaymentReceived(event.data)
        break

      default:
        console.log(`Unhandled webhook event: ${event.event}`)
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error('Webhook error:', error)
    return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 })
  }
}

// ============================================================================
// EVENT HANDLERS
// ============================================================================

async function handleListingCreated(data: {
  listingId: string
  orgId: string
  type: GhostFlowListingType
  name: string
}) {
  // Find publisher by Ghost Flow org ID
  const publisher = await prisma.publisher.findUnique({
    where: { ghostFlowOrgId: data.orgId },
  })

  if (!publisher) {
    console.log(`No publisher found for Ghost Flow org: ${data.orgId}`)
    return
  }

  // Create or update marketplace listing
  await prisma.marketplaceListing.upsert({
    where: { ghostFlowId: data.listingId },
    update: {
      name: data.name,
      type: GHOSTFLOW_TYPE_MAP[data.type] as any,
      updatedAt: new Date(),
    },
    create: {
      publisherId: publisher.id,
      ghostFlowId: data.listingId,
      ghostFlowType: data.type,
      slug: `${data.name.toLowerCase().replace(/\s+/g, '-')}-${Date.now()}`,
      name: data.name,
      shortDescription: '',
      longDescription: '',
      type: GHOSTFLOW_TYPE_MAP[data.type] as any,
      category: 'Uncategorized',
      tags: [],
      pricingModel: 'FREE',
      status: 'DRAFT',
    },
  })
}

async function handleListingPublished(data: {
  listingId: string
  status: string
}) {
  await prisma.marketplaceListing.updateMany({
    where: { ghostFlowId: data.listingId },
    data: {
      status: 'ACTIVE',
      publishedAt: new Date(),
    },
  })
}

async function handleListingUnpublished(data: { listingId: string }) {
  await prisma.marketplaceListing.updateMany({
    where: { ghostFlowId: data.listingId },
    data: {
      status: 'PAUSED',
    },
  })
}

async function handleExecutionStarted(data: {
  listingId: string
  callerId: string
  requestId: string
}) {
  // Track execution start (could be stored in a separate executions table)
  console.log(`Execution started: ${data.requestId} for listing ${data.listingId}`)
}

async function handleExecutionCompleted(data: {
  listingId: string
  requestId: string
  output: Record<string, any>
  duration: number
  callerId: string
}) {
  // Update listing stats
  await prisma.marketplaceListing.updateMany({
    where: { ghostFlowId: data.listingId },
    data: {
      installCount: { increment: 1 },
    },
  })
}

async function handleExecutionFailed(data: {
  listingId: string
  requestId: string
  error: string
}) {
  console.error(`Execution failed: ${data.requestId}`, data.error)
}

async function handlePaymentReceived(data: {
  listingId: string
  amountCents: number
  callerId: string
  transactionId: string
}) {
  // Find the listing
  const listing = await prisma.marketplaceListing.findFirst({
    where: { ghostFlowId: data.listingId },
    include: { publisher: true },
  })

  if (!listing) {
    console.error(`Listing not found for Ghost Flow ID: ${data.listingId}`)
    return
  }

  const amountUsd = data.amountCents / 100

  // Create x402 transaction record
  await prisma.x402Transaction.create({
    data: {
      listingId: listing.id,
      publisherId: listing.publisherId,
      buyerUserId: data.callerId,
      amount: amountUsd,
      currency: 'USD',
      status: 'COMPLETED',
      transactionHash: data.transactionId,
      completedAt: new Date(),
    },
  })

  // Update listing revenue
  await prisma.marketplaceListing.update({
    where: { id: listing.id },
    data: {
      totalRevenue: { increment: amountUsd },
    },
  })

  // Update publisher revenue
  await prisma.publisher.update({
    where: { id: listing.publisherId },
    data: {
      totalRevenue: { increment: amountUsd },
    },
  })
}

