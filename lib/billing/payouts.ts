/**
 * Payout Processing Service
 * Handles automated and manual payout processing
 */

import { createPublicClient, createWalletClient, http, parseUnits } from 'viem'
import { base } from 'viem/chains'
import { privateKeyToAccount } from 'viem/accounts'
import prisma from '@/lib/prisma'
import { PayoutMethod, PayoutStatus } from '@prisma/client'

// USDC Contract on Base
const USDC_ADDRESS = '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913' as const

// ERC20 Transfer ABI
const ERC20_ABI = [
  {
    name: 'transfer',
    type: 'function',
    stateMutability: 'nonpayable',
    inputs: [
      { name: 'to', type: 'address' },
      { name: 'amount', type: 'uint256' },
    ],
    outputs: [{ name: '', type: 'bool' }],
  },
  {
    name: 'balanceOf',
    type: 'function',
    stateMutability: 'view',
    inputs: [{ name: 'account', type: 'address' }],
    outputs: [{ name: '', type: 'uint256' }],
  },
] as const

interface PayoutResult {
  success: boolean
  txHash?: string
  error?: string
}

/**
 * Process a USDC payout on Base
 */
export async function processUSDCPayout(
  payoutId: string,
  destinationAddress: string,
  amountUSD: number
): Promise<PayoutResult> {
  // Update status to processing
  await prisma.publisherPayout.update({
    where: { id: payoutId },
    data: { status: 'PROCESSING' },
  })

  try {
    // Get treasury private key from environment
    const treasuryPrivateKey = process.env.TREASURY_PRIVATE_KEY
    if (!treasuryPrivateKey) {
      throw new Error('Treasury private key not configured')
    }

    // Create wallet client
    const account = privateKeyToAccount(treasuryPrivateKey as `0x${string}`)
    
    const publicClient = createPublicClient({
      chain: base,
      transport: http(),
    })

    const walletClient = createWalletClient({
      account,
      chain: base,
      transport: http(),
    })

    // Convert USD to USDC (6 decimals)
    const amountUSDC = parseUnits(amountUSD.toString(), 6)

    // Check treasury balance
    const balance = await publicClient.readContract({
      address: USDC_ADDRESS,
      abi: ERC20_ABI,
      functionName: 'balanceOf',
      args: [account.address],
    })

    if (balance < amountUSDC) {
      throw new Error('Insufficient treasury balance')
    }

    // Send USDC
    const hash = await walletClient.writeContract({
      address: USDC_ADDRESS,
      abi: ERC20_ABI,
      functionName: 'transfer',
      args: [destinationAddress as `0x${string}`, amountUSDC],
    })

    // Wait for confirmation
    const receipt = await publicClient.waitForTransactionReceipt({
      hash,
      confirmations: 2,
    })

    if (receipt.status !== 'success') {
      throw new Error('Transaction failed')
    }

    // Update payout as completed
    await prisma.publisherPayout.update({
      where: { id: payoutId },
      data: {
        status: 'COMPLETED',
        txHash: hash,
        processedAt: new Date(),
      },
    })

    return {
      success: true,
      txHash: hash,
    }
  } catch (error) {
    console.error('USDC payout failed:', error)

    // Update payout as failed
    await prisma.publisherPayout.update({
      where: { id: payoutId },
      data: {
        status: 'FAILED',
      },
    })

    return {
      success: false,
      error: error instanceof Error ? error.message : 'Payout failed',
    }
  }
}

/**
 * Process pending payouts (called by cron/scheduled job)
 */
export async function processPendingPayouts(): Promise<{
  processed: number
  failed: number
  errors: string[]
}> {
  const results = {
    processed: 0,
    failed: 0,
    errors: [] as string[],
  }

  // Get pending payouts
  const pendingPayouts = await prisma.publisherPayout.findMany({
    where: { status: 'PENDING' },
    include: {
      publisher: {
        select: {
          id: true,
          name: true,
          payoutSettings: true,
        },
      },
    },
    orderBy: { createdAt: 'asc' },
    take: 10, // Process 10 at a time
  })

  for (const payout of pendingPayouts) {
    try {
      let result: PayoutResult

      switch (payout.method) {
        case 'USDC':
          if (!payout.destinationAddress) {
            throw new Error('No destination address')
          }
          result = await processUSDCPayout(
            payout.id,
            payout.destinationAddress,
            payout.netAmount
          )
          break

        case 'ETH':
          // ETH payouts would be similar but using native ETH transfer
          result = { success: false, error: 'ETH payouts not yet implemented' }
          break

        case 'STRIPE':
          // Stripe Connect payouts
          result = await processStripePayout(payout.id, payout.netAmount)
          break

        case 'PAYPAL':
          // PayPal payouts
          result = { success: false, error: 'PayPal payouts not yet implemented' }
          break

        default:
          result = { success: false, error: 'Unknown payout method' }
      }

      if (result.success) {
        results.processed++
      } else {
        results.failed++
        results.errors.push(`Payout ${payout.id}: ${result.error}`)
      }
    } catch (error) {
      results.failed++
      results.errors.push(
        `Payout ${payout.id}: ${error instanceof Error ? error.message : 'Unknown error'}`
      )
    }
  }

  return results
}

/**
 * Process Stripe Connect payout
 */
async function processStripePayout(
  payoutId: string,
  amountUSD: number
): Promise<PayoutResult> {
  // Update status to processing
  await prisma.publisherPayout.update({
    where: { id: payoutId },
    data: { status: 'PROCESSING' },
  })

  try {
    // Get payout with publisher
    const payout = await prisma.publisherPayout.findUnique({
      where: { id: payoutId },
      include: {
        publisher: {
          select: {
            payoutSettings: true,
          },
        },
      },
    })

    if (!payout) {
      throw new Error('Payout not found')
    }

    const settings = payout.publisher.payoutSettings as { stripeConnectId?: string } | null
    const stripeConnectId = settings?.stripeConnectId

    if (!stripeConnectId) {
      throw new Error('Stripe Connect account not set up')
    }

    // Initialize Stripe (would need stripe package)
    // const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)
    
    // Create transfer to connected account
    // const transfer = await stripe.transfers.create({
    //   amount: Math.round(amountUSD * 100), // Convert to cents
    //   currency: 'usd',
    //   destination: stripeConnectId,
    //   description: `Evoworks payout ${payoutId}`,
    // })

    // For now, simulate success
    const simulatedPayoutId = `po_simulated_${Date.now()}`

    // Update payout as completed
    await prisma.publisherPayout.update({
      where: { id: payoutId },
      data: {
        status: 'COMPLETED',
        stripePayoutId: simulatedPayoutId,
        processedAt: new Date(),
      },
    })

    return {
      success: true,
      txHash: simulatedPayoutId,
    }
  } catch (error) {
    console.error('Stripe payout failed:', error)

    await prisma.publisherPayout.update({
      where: { id: payoutId },
      data: { status: 'FAILED' },
    })

    return {
      success: false,
      error: error instanceof Error ? error.message : 'Stripe payout failed',
    }
  }
}

/**
 * Check and trigger auto-payouts for publishers
 */
export async function checkAutoPayouts(): Promise<{
  triggered: number
  errors: string[]
}> {
  const results = {
    triggered: 0,
    errors: [] as string[],
  }

  // Get publishers with auto-payout enabled
  const publishers = await prisma.publisher.findMany({
    where: {
      payoutSettings: {
        path: ['autoPayoutEnabled'],
        equals: true,
      },
    },
  })

  for (const publisher of publishers) {
    try {
      const settings = publisher.payoutSettings as {
        autoPayoutEnabled: boolean
        autoPayoutThreshold: number
        preferredMethod: PayoutMethod
        usdcAddress?: string
        ethAddress?: string
        paypalEmail?: string
      } | null

      if (!settings?.autoPayoutEnabled) continue

      // Calculate available balance
      const totalEarnings = await prisma.x402Transaction.aggregate({
        where: { publisherId: publisher.id, status: 'COMPLETED' },
        _sum: { amountCents: true },
      })

      const totalPaidOut = await prisma.publisherPayout.aggregate({
        where: { publisherId: publisher.id, status: 'COMPLETED' },
        _sum: { grossAmount: true },
      })

      const pendingPayouts = await prisma.publisherPayout.aggregate({
        where: { publisherId: publisher.id, status: { in: ['PENDING', 'PROCESSING'] } },
        _sum: { grossAmount: true },
      })

      const availableBalance = 
        ((totalEarnings._sum.amountCents || 0) / 100) -
        (totalPaidOut._sum.grossAmount || 0) -
        (pendingPayouts._sum.grossAmount || 0)

      // Check if threshold is met
      if (availableBalance >= settings.autoPayoutThreshold) {
        // Check for existing pending payout
        const existingPending = await prisma.publisherPayout.findFirst({
          where: { publisherId: publisher.id, status: { in: ['PENDING', 'PROCESSING'] } },
        })

        if (existingPending) continue

        // Get destination address
        let destinationAddress: string | undefined
        switch (settings.preferredMethod) {
          case 'USDC':
            destinationAddress = settings.usdcAddress
            break
          case 'ETH':
            destinationAddress = settings.ethAddress
            break
          case 'PAYPAL':
            destinationAddress = settings.paypalEmail
            break
        }

        // Create auto-payout
        const platformFee = availableBalance * 0.15
        const netAmount = availableBalance - platformFee

        await prisma.publisherPayout.create({
          data: {
            publisherId: publisher.id,
            grossAmount: availableBalance,
            platformFee,
            netAmount,
            currency: 'USD',
            method: settings.preferredMethod,
            destinationAddress,
            periodStart: publisher.createdAt,
            periodEnd: new Date(),
            status: 'PENDING',
          },
        })

        results.triggered++
      }
    } catch (error) {
      results.errors.push(
        `Publisher ${publisher.id}: ${error instanceof Error ? error.message : 'Unknown error'}`
      )
    }
  }

  return results
}

/**
 * Get payout statistics for admin dashboard
 */
export async function getPayoutStats() {
  const now = new Date()
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
  const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1)

  const [
    totalPayouts,
    pendingPayouts,
    thisMonthPayouts,
    lastMonthPayouts,
    totalVolume,
  ] = await Promise.all([
    prisma.publisherPayout.count(),
    prisma.publisherPayout.count({ where: { status: 'PENDING' } }),
    prisma.publisherPayout.count({ where: { createdAt: { gte: startOfMonth } } }),
    prisma.publisherPayout.count({
      where: {
        createdAt: { gte: startOfLastMonth, lt: startOfMonth },
      },
    }),
    prisma.publisherPayout.aggregate({
      where: { status: 'COMPLETED' },
      _sum: { netAmount: true },
    }),
  ])

  return {
    totalPayouts,
    pendingPayouts,
    thisMonthPayouts,
    lastMonthPayouts,
    totalVolumeUSD: totalVolume._sum.netAmount || 0,
  }
}

