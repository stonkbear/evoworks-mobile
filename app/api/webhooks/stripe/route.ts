import { NextRequest, NextResponse } from 'next/server'
import { handleWebhookEvent } from '@/lib/billing/stripe'

/**
 * POST /api/webhooks/stripe
 * Handle Stripe webhook events
 */
export async function POST(req: NextRequest) {
  try {
    // In production, verify webhook signature
    // const signature = req.headers.get('stripe-signature')
    // if (!signature) {
    //   return NextResponse.json({ error: 'No signature' }, { status: 400 })
    // }
    
    // const event = stripe.webhooks.constructEvent(
    //   body,
    //   signature,
    //   process.env.STRIPE_WEBHOOK_SECRET!
    // )

    const body = await req.json()
    const event = body

    // Handle the event
    await handleWebhookEvent(event)

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error('Error handling webhook:', error)
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Webhook handler failed',
      },
      { status: 400 }
    )
  }
}

