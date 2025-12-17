/**
 * Publisher Payouts API
 * GET - List payouts for a publisher
 * POST - Request a new payout
 */

import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { auth } from '@/lib/auth'
import { PayoutStatus, PayoutMethod } from '@prisma/client'

// Platform fee percentage (e.g., 15% = 0.15)
const PLATFORM_FEE_RATE = 0.15
const MINIMUM_PAYOUT_USD = 25

// GET /api/payouts - Get publisher's payout history
export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status') as PayoutStatus | null
    const limit = parseInt(searchParams.get('limit') || '20')

    // Get publisher for user
    const publisher = await prisma.publisher.findUnique({
      where: { userId: session.user.id },
    })

    if (!publisher) {
      return NextResponse.json({ error: 'Publisher not found' }, { status: 404 })
    }

    // Build query
    const where: any = { publisherId: publisher.id }
    if (status) {
      where.status = status
    }

    const payouts = await prisma.publisherPayout.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: limit,
    })

    // Calculate stats
    const stats = await getPayoutStats(publisher.id)

    return NextResponse.json({
      payouts,
      stats,
    })
  } catch (error) {
    console.error('Error fetching payouts:', error)
    return NextResponse.json({ error: 'Failed to fetch payouts' }, { status: 500 })
  }
}

// POST /api/payouts - Request a new payout
export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { method, destinationAddress } = body

    if (!method || !Object.values(PayoutMethod).includes(method)) {
      return NextResponse.json(
        { error: 'Valid payout method required (USDC, ETH, STRIPE, PAYPAL)' },
        { status: 400 }
      )
    }

    // Get publisher
    const publisher = await prisma.publisher.findUnique({
      where: { userId: session.user.id },
    })

    if (!publisher) {
      return NextResponse.json({ error: 'Publisher not found' }, { status: 404 })
    }

    // Calculate available balance
    const stats = await getPayoutStats(publisher.id)

    if (stats.availableBalance < MINIMUM_PAYOUT_USD) {
      return NextResponse.json(
        { error: `Minimum payout is $${MINIMUM_PAYOUT_USD}. Your balance: $${stats.availableBalance.toFixed(2)}` },
        { status: 400 }
      )
    }

    // Check for pending payout
    const pendingPayout = await prisma.publisherPayout.findFirst({
      where: {
        publisherId: publisher.id,
        status: { in: ['PENDING', 'PROCESSING'] },
      },
    })

    if (pendingPayout) {
      return NextResponse.json(
        { error: 'You already have a pending payout request' },
        { status: 400 }
      )
    }

    // Calculate amounts
    const grossAmount = stats.availableBalance
    const platformFee = grossAmount * PLATFORM_FEE_RATE
    const netAmount = grossAmount - platformFee

    // Get period (last payout to now, or account creation to now)
    const lastPayout = await prisma.publisherPayout.findFirst({
      where: { publisherId: publisher.id, status: 'COMPLETED' },
      orderBy: { periodEnd: 'desc' },
    })

    const periodStart = lastPayout?.periodEnd || publisher.createdAt
    const periodEnd = new Date()

    // Create payout request
    const payout = await prisma.publisherPayout.create({
      data: {
        publisherId: publisher.id,
        grossAmount,
        platformFee,
        netAmount,
        currency: 'USD',
        method,
        destinationAddress,
        periodStart,
        periodEnd,
        status: 'PENDING',
      },
    })

    return NextResponse.json({
      success: true,
      payout: {
        id: payout.id,
        grossAmount: payout.grossAmount,
        platformFee: payout.platformFee,
        netAmount: payout.netAmount,
        method: payout.method,
        status: payout.status,
        createdAt: payout.createdAt,
      },
      message: `Payout request of $${netAmount.toFixed(2)} submitted successfully`,
    })
  } catch (error) {
    console.error('Error creating payout:', error)
    return NextResponse.json({ error: 'Failed to create payout' }, { status: 500 })
  }
}

// Helper: Calculate payout stats for publisher
async function getPayoutStats(publisherId: string) {
  // Get total earnings from completed transactions
  const totalEarnings = await prisma.x402Transaction.aggregate({
    where: {
      publisherId,
      status: 'COMPLETED',
    },
    _sum: {
      amountCents: true,
    },
  })

  // Get total already paid out
  const totalPaidOut = await prisma.publisherPayout.aggregate({
    where: {
      publisherId,
      status: 'COMPLETED',
    },
    _sum: {
      grossAmount: true,
    },
  })

  // Get pending payouts
  const pendingPayouts = await prisma.publisherPayout.aggregate({
    where: {
      publisherId,
      status: { in: ['PENDING', 'PROCESSING'] },
    },
    _sum: {
      grossAmount: true,
    },
  })

  const totalEarningsUSD = (totalEarnings._sum.amountCents || 0) / 100
  const totalPaidOutUSD = totalPaidOut._sum.grossAmount || 0
  const pendingPayoutsUSD = pendingPayouts._sum.grossAmount || 0
  const availableBalance = totalEarningsUSD - totalPaidOutUSD - pendingPayoutsUSD

  // Get transaction count
  const transactionCount = await prisma.x402Transaction.count({
    where: {
      publisherId,
      status: 'COMPLETED',
    },
  })

  // Get this month's earnings
  const startOfMonth = new Date()
  startOfMonth.setDate(1)
  startOfMonth.setHours(0, 0, 0, 0)

  const thisMonthEarnings = await prisma.x402Transaction.aggregate({
    where: {
      publisherId,
      status: 'COMPLETED',
      createdAt: { gte: startOfMonth },
    },
    _sum: {
      amountCents: true,
    },
  })

  return {
    totalEarnings: totalEarningsUSD,
    totalPaidOut: totalPaidOutUSD,
    pendingPayouts: pendingPayoutsUSD,
    availableBalance: Math.max(0, availableBalance),
    transactionCount,
    thisMonthEarnings: (thisMonthEarnings._sum.amountCents || 0) / 100,
    platformFeeRate: PLATFORM_FEE_RATE,
    minimumPayout: MINIMUM_PAYOUT_USD,
  }
}

