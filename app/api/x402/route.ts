/**
 * x402 Micropayment API
 * POST /api/x402 - Create a new payment transaction
 * GET /api/x402 - Get transaction history
 */

import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { TransactionStatus } from '@prisma/client'

// For demo - get from auth session in production
function getCurrentUserId(): string | null {
  return 'demo-user-id'
}

// GET /api/x402 - Get user's transaction history
export async function GET(request: NextRequest) {
  try {
    const userId = getCurrentUserId()
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const role = searchParams.get('role') || 'buyer' // 'buyer' or 'publisher'
    const limit = Math.min(parseInt(searchParams.get('limit') || '50'), 100)
    const offset = parseInt(searchParams.get('offset') || '0')

    // Get publisher ID if needed
    let publisherId: string | undefined
    if (role === 'publisher') {
      const publisher = await prisma.publisher.findUnique({
        where: { userId },
        select: { id: true },
      })
      publisherId = publisher?.id
    }

    const where = role === 'publisher' && publisherId
      ? { publisherId }
      : { buyerUserId: userId }

    const [transactions, total] = await Promise.all([
      prisma.x402Transaction.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        take: limit,
        skip: offset,
        include: {
          listing: {
            select: {
              id: true,
              slug: true,
              name: true,
              type: true,
            },
          },
        },
      }),
      prisma.x402Transaction.count({ where }),
    ])

    return NextResponse.json({
      data: transactions,
      pagination: { total, limit, offset },
    })
  } catch (error) {
    console.error('Error fetching transactions:', error)
    return NextResponse.json(
      { error: 'Failed to fetch transactions' },
      { status: 500 }
    )
  }
}

// POST /api/x402 - Create payment for listing execution
export async function POST(request: NextRequest) {
  try {
    const userId = getCurrentUserId()
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const {
      listingSlug,
      executionId,
      inputHash,
      x402PaymentHash,
      x402Receipt,
      chainId,
      txHash,
    } = body

    // Validate required fields
    if (!listingSlug) {
      return NextResponse.json(
        { error: 'Listing slug is required' },
        { status: 400 }
      )
    }

    // Get listing details
    const listing = await prisma.marketplaceListing.findUnique({
      where: { slug: listingSlug },
      include: {
        publisher: {
          select: { id: true },
        },
      },
    })

    if (!listing) {
      return NextResponse.json(
        { error: 'Listing not found' },
        { status: 404 }
      )
    }

    if (listing.pricingModel !== 'PER_CALL') {
      return NextResponse.json(
        { error: 'This listing does not use per-call pricing' },
        { status: 400 }
      )
    }

    // Calculate amount
    const amountCents = listing.priceAmount || 0

    // Create transaction
    const transaction = await prisma.x402Transaction.create({
      data: {
        listingId: listing.id,
        buyerUserId: userId,
        publisherId: listing.publisher.id,
        amountCents: Math.round(amountCents),
        currency: 'USD',
        x402PaymentHash,
        x402Receipt,
        chainId,
        txHash,
        executionId,
        inputHash,
        status: txHash ? TransactionStatus.COMPLETED : TransactionStatus.PENDING,
        completedAt: txHash ? new Date() : null,
      },
    })

    // If payment completed, update stats
    if (txHash) {
      await Promise.all([
        // Update listing stats
        prisma.marketplaceListing.update({
          where: { id: listing.id },
          data: {
            installCount: { increment: 1 },
            totalRevenue: { increment: amountCents / 100 },
          },
        }),
        // Update publisher stats
        prisma.publisher.update({
          where: { id: listing.publisher.id },
          data: {
            totalInstalls: { increment: 1 },
            totalRevenue: { increment: amountCents / 100 },
          },
        }),
      ])
    }

    return NextResponse.json({ data: transaction }, { status: 201 })
  } catch (error) {
    console.error('Error creating transaction:', error)
    return NextResponse.json(
      { error: 'Failed to create transaction' },
      { status: 500 }
    )
  }
}

