/**
 * V1 x402 Payment Verification API
 * Verify payment before Ghost Flow executes
 */

import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import crypto from 'crypto'

// Verify API key from Ghost Flow
function verifyApiKey(request: NextRequest): boolean {
  const apiKey = request.headers.get('x-api-key')
  return apiKey === process.env.GHOSTFLOW_API_KEY
}

/**
 * POST /api/v1/x402/verify
 * Verify a payment header before allowing execution
 */
export async function POST(request: NextRequest) {
  try {
    if (!verifyApiKey(request)) {
      return NextResponse.json({ error: 'invalid_api_key' }, { status: 401 })
    }

    const body = await request.json()
    const { paymentHeader, amount, listingId, callerId, requestId } = body

    // Find the listing
    const listing = await prisma.marketplaceListing.findFirst({
      where: {
        OR: [
          { id: listingId },
          { ghostFlowId: listingId },
        ],
      },
      select: {
        id: true,
        ghostFlowId: true,
        name: true,
        priceAmount: true,
        pricingModel: true,
        status: true,
        publisherId: true,
      },
    })

    if (!listing) {
      return NextResponse.json({
        valid: false,
        error: 'listing_not_found',
      })
    }

    if (listing.status !== 'ACTIVE') {
      return NextResponse.json({
        valid: false,
        error: 'listing_not_active',
      })
    }

    if (listing.pricingModel !== 'PER_CALL') {
      return NextResponse.json({
        valid: false,
        error: 'listing_not_per_call',
      })
    }

    // Verify payment amount
    const expectedAmount = listing.priceAmount || 0
    if (amount < expectedAmount) {
      return NextResponse.json({
        valid: false,
        error: 'insufficient_payment',
        expected: expectedAmount,
        received: amount,
      })
    }

    // In production: Verify the actual payment on-chain
    // For now, we trust the payment header and create a pending transaction

    const paymentId = `pay_${Date.now()}_${crypto.randomBytes(8).toString('hex')}`

    // Create pending transaction
    await prisma.x402Transaction.create({
      data: {
        listingId: listing.id,
        publisherId: listing.publisherId,
        buyerUserId: callerId,
        amountCents: Math.round(amount * 100), // Convert dollars to cents
        currency: 'USDC',
        status: 'PENDING',
        x402PaymentHash: paymentHeader,
        x402Receipt: { paymentId }, // Store as JSON
        executionId: requestId,
      },
    })

    return NextResponse.json({
      valid: true,
      paymentId,
      listingId: listing.id,
      ghostFlowId: listing.ghostFlowId,
    })
  } catch (error) {
    console.error('x402 verify error:', error)
    return NextResponse.json({
      valid: false,
      error: 'verification_failed',
    }, { status: 500 })
  }
}

