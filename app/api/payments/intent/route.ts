import { NextRequest, NextResponse } from 'next/server'
import { createPaymentIntent } from '@/lib/billing/stripe'

/**
 * POST /api/payments/intent
 * Create a Stripe Payment Intent for task funding
 */
export async function POST(req: NextRequest) {
  try {
    // TODO: Add authentication and get real buyer ID
    const body = await req.json()
    const { amount, currency = 'USD', buyerId } = body

    if (!amount || !buyerId) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'INVALID_INPUT',
            message: 'amount and buyerId are required',
          },
        },
        { status: 400 }
      )
    }

    if (amount <= 0) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'INVALID_AMOUNT',
            message: 'Amount must be positive',
          },
        },
        { status: 400 }
      )
    }

    const result = await createPaymentIntent(amount, currency, buyerId)

    if (!result.success) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'PAYMENT_FAILED',
            message: result.error,
          },
        },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      data: {
        paymentIntentId: result.paymentIntentId,
        clientSecret: result.clientSecret,
        amount,
        currency,
      },
    })
  } catch (error) {
    console.error('Error creating payment intent:', error)
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'PAYMENT_ERROR',
          message: error instanceof Error ? error.message : 'Failed to create payment intent',
        },
      },
      { status: 500 }
    )
  }
}

