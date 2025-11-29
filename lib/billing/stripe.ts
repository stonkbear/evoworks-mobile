/**
 * Stripe Integration - Payment processing and payouts
 * Uses Stripe Connect for agent payouts
 */

import { prisma } from '@/lib/db/prisma'

// Mock Stripe for now - in production, import actual Stripe SDK
// import Stripe from 'stripe'
// const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
//   apiVersion: '2023-10-16',
// })

export interface PaymentIntentResult {
  success: boolean
  paymentIntentId?: string
  clientSecret?: string
  error?: string
}

export interface ConnectedAccountResult {
  success: boolean
  accountId?: string
  error?: string
}

/**
 * Create Stripe Payment Intent for task funding
 */
export async function createPaymentIntent(
  amount: number,
  currency: string,
  buyerId: string
): Promise<PaymentIntentResult> {
  try {
    // In production:
    // const paymentIntent = await stripe.paymentIntents.create({
    //   amount: Math.round(amount * 100), // Convert to cents
    //   currency: currency.toLowerCase(),
    //   metadata: {
    //     buyerId,
    //   },
    // })
    //
    // return {
    //   success: true,
    //   paymentIntentId: paymentIntent.id,
    //   clientSecret: paymentIntent.client_secret,
    // }

    // Mock implementation
    const mockPaymentIntentId = `pi_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    const mockClientSecret = `${mockPaymentIntentId}_secret_${Math.random()
      .toString(36)
      .substr(2, 9)}`

    console.log(`[Stripe] Created payment intent for ${amount} ${currency}`)

    return {
      success: true,
      paymentIntentId: mockPaymentIntentId,
      clientSecret: mockClientSecret,
    }
  } catch (error) {
    console.error('Error creating payment intent:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to create payment intent',
    }
  }
}

/**
 * Create Stripe Connected Account for agent
 */
export async function createConnectedAccount(
  agentId: string,
  email: string
): Promise<ConnectedAccountResult> {
  try {
    // In production:
    // const account = await stripe.accounts.create({
    //   type: 'express',
    //   email,
    //   capabilities: {
    //     transfers: { requested: true },
    //   },
    //   metadata: {
    //     agentId,
    //   },
    // })
    //
    // return {
    //   success: true,
    //   accountId: account.id,
    // }

    // Mock implementation
    const mockAccountId = `acct_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

    console.log(`[Stripe] Created connected account for agent ${agentId}`)

    return {
      success: true,
      accountId: mockAccountId,
    }
  } catch (error) {
    console.error('Error creating connected account:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to create connected account',
    }
  }
}

/**
 * Transfer funds to agent (Stripe Connect)
 */
export async function transferToAgent(
  agentId: string,
  amount: number,
  currency: string
): Promise<{ success: boolean; transferId?: string; error?: string }> {
  try {
    // Get agent's Stripe account ID
    const agent = await prisma.agent.findUnique({
      where: { id: agentId },
    })

    if (!agent) {
      return { success: false, error: 'Agent not found' }
    }

    // In production:
    // const transfer = await stripe.transfers.create({
    //   amount: Math.round(amount * 100),
    //   currency: currency.toLowerCase(),
    //   destination: agent.stripeAccountId, // Store in agent model
    //   metadata: {
    //     agentId,
    //   },
    // })
    //
    // return {
    //   success: true,
    //   transferId: transfer.id,
    // }

    // Mock implementation
    const mockTransferId = `tr_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

    console.log(`[Stripe] Transferred ${amount} ${currency} to agent ${agentId}`)

    return {
      success: true,
      transferId: mockTransferId,
    }
  } catch (error) {
    console.error('Error transferring to agent:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to transfer funds',
    }
  }
}

/**
 * Refund payment
 */
export async function refundPayment(
  paymentIntentId: string,
  amount?: number
): Promise<{ success: boolean; refundId?: string; error?: string }> {
  try {
    // In production:
    // const refund = await stripe.refunds.create({
    //   payment_intent: paymentIntentId,
    //   amount: amount ? Math.round(amount * 100) : undefined,
    // })
    //
    // return {
    //   success: true,
    //   refundId: refund.id,
    // }

    // Mock implementation
    const mockRefundId = `re_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

    console.log(`[Stripe] Refunded payment ${paymentIntentId}`)

    return {
      success: true,
      refundId: mockRefundId,
    }
  } catch (error) {
    console.error('Error refunding payment:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to refund payment',
    }
  }
}

/**
 * Create payout to agent's bank account
 */
export async function createPayout(
  agentId: string,
  amount: number,
  currency: string = 'USD'
): Promise<{ success: boolean; payoutId?: string; error?: string }> {
  try {
    // Get agent's connected account
    const agent = await prisma.agent.findUnique({
      where: { id: agentId },
    })

    if (!agent) {
      return { success: false, error: 'Agent not found' }
    }

    // In production:
    // const payout = await stripe.payouts.create(
    //   {
    //     amount: Math.round(amount * 100),
    //     currency: currency.toLowerCase(),
    //   },
    //   {
    //     stripeAccount: agent.stripeAccountId,
    //   }
    // )
    //
    // Create payout record
    // await prisma.payout.create({
    //   data: {
    //     agentId,
    //     amount,
    //     currency,
    //     stripePayoutId: payout.id,
    //     status: 'PENDING',
    //   },
    // })
    //
    // return {
    //   success: true,
    //   payoutId: payout.id,
    // }

    // Mock implementation
    const mockPayoutId = `po_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

    const payout = await prisma.payout.create({
      data: {
        agentId,
        amount,
        currency,
        stripePayoutId: mockPayoutId,
        status: 'PENDING',
      },
    })

    console.log(`[Stripe] Created payout ${payout.id} for ${amount} ${currency}`)

    return {
      success: true,
      payoutId: payout.id,
    }
  } catch (error) {
    console.error('Error creating payout:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to create payout',
    }
  }
}

/**
 * Handle Stripe webhook events
 */
export async function handleWebhookEvent(event: any): Promise<void> {
  try {
    switch (event.type) {
      case 'payment_intent.succeeded':
        await handlePaymentSucceeded(event.data.object)
        break

      case 'payment_intent.payment_failed':
        await handlePaymentFailed(event.data.object)
        break

      case 'payout.paid':
        await handlePayoutPaid(event.data.object)
        break

      case 'account.updated':
        await handleAccountUpdated(event.data.object)
        break

      default:
        console.log(`[Stripe] Unhandled event type: ${event.type}`)
    }
  } catch (error) {
    console.error('Error handling webhook event:', error)
    throw error
  }
}

/**
 * Handle successful payment
 */
async function handlePaymentSucceeded(paymentIntent: any): Promise<void> {
  console.log(`[Stripe] Payment succeeded: ${paymentIntent.id}`)

  // Update payment record
  await prisma.payment.updateMany({
    where: { stripePaymentIntentId: paymentIntent.id },
    data: {
      status: 'SUCCEEDED',
      paidAt: new Date(),
    },
  })
}

/**
 * Handle failed payment
 */
async function handlePaymentFailed(paymentIntent: any): Promise<void> {
  console.log(`[Stripe] Payment failed: ${paymentIntent.id}`)

  await prisma.payment.updateMany({
    where: { stripePaymentIntentId: paymentIntent.id },
    data: {
      status: 'FAILED',
    },
  })
}

/**
 * Handle payout paid
 */
async function handlePayoutPaid(payout: any): Promise<void> {
  console.log(`[Stripe] Payout paid: ${payout.id}`)

  await prisma.payout.updateMany({
    where: { stripePayoutId: payout.id },
    data: {
      status: 'SUCCEEDED',
      paidAt: new Date(),
    },
  })
}

/**
 * Handle connected account updated
 */
async function handleAccountUpdated(account: any): Promise<void> {
  console.log(`[Stripe] Account updated: ${account.id}`)

  // Update agent's account status
  // await prisma.agent.updateMany({
  //   where: { stripeAccountId: account.id },
  //   data: {
  //     stripeAccountStatus: account.charges_enabled ? 'active' : 'pending',
  //   },
  // })
}

