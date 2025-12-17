/**
 * x402 Transaction Recording API
 * Records successful micropayment transactions
 */

import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { auth } from '@/lib/auth'

export async function POST(request: NextRequest) {
  try {
    // Get authenticated user
    const session = await auth()
    const userId = session?.user?.id || 'anonymous'

    const body = await request.json()
    const { listingSlug, txHash, amountCents, chainId = 8453 } = body // 8453 = Base

    // Validate required fields
    if (!listingSlug || !txHash) {
      return NextResponse.json(
        { error: 'listingSlug and txHash are required' },
        { status: 400 }
      )
    }

    // Check if transaction already recorded
    const existingTx = await prisma.x402Transaction.findFirst({
      where: { txHash },
    })

    if (existingTx) {
      return NextResponse.json(
        { message: 'Transaction already recorded', transaction: existingTx },
        { status: 200 }
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

    // Calculate amount if not provided
    const finalAmountCents = amountCents || listing.priceAmount || 0

    // Create transaction record
    const transaction = await prisma.x402Transaction.create({
      data: {
        listingId: listing.id,
        buyerUserId: userId,
        publisherId: listing.publisher.id,
        amountCents: Math.round(finalAmountCents),
        currency: 'USD',
        chainId,
        txHash,
        status: 'COMPLETED',
        completedAt: new Date(),
      },
    })

    // Update listing stats
    await prisma.marketplaceListing.update({
      where: { id: listing.id },
      data: {
        installCount: { increment: 1 },
        totalRevenue: { increment: finalAmountCents / 100 },
      },
    })

    // Update publisher stats
    await prisma.publisher.update({
      where: { id: listing.publisher.id },
      data: {
        totalInstalls: { increment: 1 },
        totalRevenue: { increment: finalAmountCents / 100 },
      },
    })

    return NextResponse.json({
      success: true,
      transaction: {
        id: transaction.id,
        txHash: transaction.txHash,
        amountCents: transaction.amountCents,
        status: transaction.status,
      },
    })
  } catch (error) {
    console.error('Error recording transaction:', error)
    return NextResponse.json(
      { error: 'Failed to record transaction' },
      { status: 500 }
    )
  }
}

