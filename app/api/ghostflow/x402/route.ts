/**
 * x402 Payment Verification & Settlement
 * APIs for Ghost Flow to verify and settle payments
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
 * POST /api/ghostflow/x402/verify
 * Verify a payment before execution
 */
export async function POST(request: NextRequest) {
  try {
    if (!verifyApiKey(request)) {
      return NextResponse.json({ error: 'Invalid API key' }, { status: 401 })
    }

    const body = await request.json()
    const { action } = body

    if (action === 'verify') {
      return handleVerify(body)
    } else if (action === 'settle') {
      return handleSettle(body)
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
  } catch (error) {
    console.error('x402 API error:', error)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}

/**
 * Verify payment header before allowing execution
 */
async function handleVerify(body: {
  paymentHeader: string
  amount: number
  listingId: string
  callerId: string
}) {
  const { paymentHeader, amount, listingId, callerId } = body

  try {
    // Find the listing
    const listing = await prisma.marketplaceListing.findFirst({
      where: { ghostFlowId: listingId },
      select: {
        id: true,
        priceAmount: true,
        pricingModel: true,
        status: true,
      },
    })

    if (!listing) {
      return NextResponse.json({
        valid: false,
        error: 'Listing not found',
      })
    }

    if (listing.status !== 'ACTIVE') {
      return NextResponse.json({
        valid: false,
        error: 'Listing is not active',
      })
    }

    // Verify pricing model supports x402
    if (listing.pricingModel !== 'PER_CALL') {
      return NextResponse.json({
        valid: false,
        error: 'Listing does not support per-call payments',
      })
    }

    // Verify payment amount matches listing price
    const expectedAmount = listing.priceAmount || 0
    if (amount < expectedAmount) {
      return NextResponse.json({
        valid: false,
        error: `Insufficient payment. Expected $${expectedAmount}, got $${amount}`,
      })
    }

    // In production, verify the actual payment header/transaction
    // This would involve checking the blockchain or payment processor
    const paymentId = `pay_${Date.now()}_${crypto.randomBytes(8).toString('hex')}`

    // Store pending payment for settlement
    await prisma.x402Transaction.create({
      data: {
        listingId: listing.id,
        buyerUserId: callerId,
        publisherId: '', // Will be filled on settlement
        amount: amount,
        currency: 'USD',
        status: 'PENDING',
        x402PaymentHash: paymentHeader,
        x402Receipt: paymentId,
      },
    })

    return NextResponse.json({
      valid: true,
      paymentId,
    })
  } catch (error) {
    console.error('Payment verification error:', error)
    return NextResponse.json({
      valid: false,
      error: 'Verification failed',
    })
  }
}

/**
 * Settle payment after successful execution
 */
async function handleSettle(body: {
  paymentId: string
  listingId: string
  executionId: string
  success: boolean
}) {
  const { paymentId, listingId, executionId, success } = body

  try {
    // Find the pending transaction
    const transaction = await prisma.x402Transaction.findFirst({
      where: { x402Receipt: paymentId },
      include: {
        listing: {
          include: { publisher: true },
        },
      },
    })

    if (!transaction) {
      return NextResponse.json({
        settled: false,
        error: 'Payment not found',
      })
    }

    if (success) {
      // Mark as completed and update stats
      await prisma.$transaction([
        // Update transaction
        prisma.x402Transaction.update({
          where: { id: transaction.id },
          data: {
            status: 'COMPLETED',
            publisherId: transaction.listing.publisherId,
            executionId,
            completedAt: new Date(),
          },
        }),

        // Update listing revenue
        prisma.marketplaceListing.update({
          where: { id: transaction.listingId },
          data: {
            totalRevenue: { increment: transaction.amount },
            installCount: { increment: 1 },
          },
        }),

        // Update publisher revenue
        prisma.publisher.update({
          where: { id: transaction.listing.publisherId },
          data: {
            totalRevenue: { increment: transaction.amount },
          },
        }),
      ])

      return NextResponse.json({
        settled: true,
        transactionId: transaction.id,
      })
    } else {
      // Mark as failed (refund in production)
      await prisma.x402Transaction.update({
        where: { id: transaction.id },
        data: {
          status: 'FAILED',
        },
      })

      return NextResponse.json({
        settled: false,
        refunded: true,
        transactionId: transaction.id,
      })
    }
  } catch (error) {
    console.error('Payment settlement error:', error)
    return NextResponse.json({
      settled: false,
      error: 'Settlement failed',
    })
  }
}

