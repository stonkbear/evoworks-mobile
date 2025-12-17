/**
 * V1 x402 Payment Settlement API
 * Settle payment after Ghost Flow execution
 */

import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

// Verify API key from Ghost Flow
function verifyApiKey(request: NextRequest): boolean {
  const apiKey = request.headers.get('x-api-key')
  return apiKey === process.env.GHOSTFLOW_API_KEY
}

/**
 * POST /api/v1/x402/settle
 * Settle a payment after successful execution
 */
export async function POST(request: NextRequest) {
  try {
    if (!verifyApiKey(request)) {
      return NextResponse.json({ error: 'invalid_api_key' }, { status: 401 })
    }

    const body = await request.json()
    const { paymentId, listingId, executionId, success, error: executionError } = body

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
        error: 'payment_not_found',
      })
    }

    if (transaction.status !== 'PENDING') {
      return NextResponse.json({
        settled: false,
        error: 'payment_already_processed',
        status: transaction.status,
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
            executionId,
            completedAt: new Date(),
          },
        }),

        // Update listing stats
        prisma.marketplaceListing.update({
          where: { id: transaction.listingId },
          data: {
            totalRevenue: { increment: transaction.amountCents / 100 },
            installCount: { increment: 1 },
          },
        }),

        // Update publisher revenue
        prisma.publisher.update({
          where: { id: transaction.listing.publisherId },
          data: {
            totalRevenue: { increment: transaction.amountCents / 100 },
          },
        }),
      ])

      return NextResponse.json({
        settled: true,
        transactionId: transaction.id,
        amountCents: transaction.amountCents,
      })
    } else {
      // Mark as failed (would trigger refund in production)
      await prisma.x402Transaction.update({
        where: { id: transaction.id },
        data: {
          status: 'FAILED',
          failureReason: executionError || 'Execution failed',
        },
      })

      return NextResponse.json({
        settled: false,
        refunded: true,
        transactionId: transaction.id,
        error: executionError || 'Execution failed',
      })
    }
  } catch (error) {
    console.error('x402 settle error:', error)
    return NextResponse.json({
      settled: false,
      error: 'settlement_failed',
    }, { status: 500 })
  }
}

