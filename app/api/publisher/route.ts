/**
 * Publisher API
 * GET /api/publisher - Get publisher profile (current user)
 * POST /api/publisher - Create publisher profile
 * PATCH /api/publisher - Update publisher profile
 */

import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { ListingStatus, PayoutMethod } from '@prisma/client'

// For demo purposes - in production, get from auth session
function getCurrentUserId(): string | null {
  // TODO: Implement proper auth
  return 'demo-user-id'
}

// GET /api/publisher
export async function GET() {
  try {
    const userId = getCurrentUserId()
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const publisher = await prisma.publisher.findUnique({
      where: { userId },
      include: {
        listings: {
          where: { status: { not: ListingStatus.ARCHIVED } },
          orderBy: { createdAt: 'desc' },
          select: {
            id: true,
            slug: true,
            name: true,
            type: true,
            status: true,
            pricingModel: true,
            priceAmount: true,
            subscriptionMonthly: true,
            viewCount: true,
            installCount: true,
            totalRevenue: true,
            avgRating: true,
            reviewCount: true,
            publishedAt: true,
            createdAt: true,
            updatedAt: true,
          },
        },
        payouts: {
          orderBy: { createdAt: 'desc' },
          take: 10,
        },
      },
    })

    if (!publisher) {
      return NextResponse.json(
        { error: 'Publisher profile not found', needsSetup: true },
        { status: 404 }
      )
    }

    // Calculate additional stats
    const thisMonth = new Date()
    thisMonth.setDate(1)
    thisMonth.setHours(0, 0, 0, 0)

    const lastMonth = new Date(thisMonth)
    lastMonth.setMonth(lastMonth.getMonth() - 1)

    // Get monthly earnings from transactions
    const [thisMonthEarnings, lastMonthEarnings] = await Promise.all([
      prisma.x402Transaction.aggregate({
        where: {
          publisherId: publisher.id,
          status: 'COMPLETED',
          createdAt: { gte: thisMonth },
        },
        _sum: { amountCents: true },
      }),
      prisma.x402Transaction.aggregate({
        where: {
          publisherId: publisher.id,
          status: 'COMPLETED',
          createdAt: { gte: lastMonth, lt: thisMonth },
        },
        _sum: { amountCents: true },
      }),
    ])

    return NextResponse.json({
      data: {
        ...publisher,
        earnings: {
          total: publisher.totalRevenue,
          thisMonth: (thisMonthEarnings._sum.amountCents || 0) / 100,
          lastMonth: (lastMonthEarnings._sum.amountCents || 0) / 100,
        },
      },
    })
  } catch (error) {
    console.error('Error fetching publisher:', error)
    return NextResponse.json(
      { error: 'Failed to fetch publisher profile' },
      { status: 500 }
    )
  }
}

// POST /api/publisher
export async function POST(request: NextRequest) {
  try {
    const userId = getCurrentUserId()
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Check if publisher already exists
    const existing = await prisma.publisher.findUnique({
      where: { userId },
    })

    if (existing) {
      return NextResponse.json(
        { error: 'Publisher profile already exists' },
        { status: 409 }
      )
    }

    const body = await request.json()
    const {
      displayName,
      slug,
      bio,
      avatarUrl,
      websiteUrl,
      twitterHandle,
      githubHandle,
      ghostFlowOrgId,
      payoutMethod,
      payoutAddress,
    } = body

    // Validate required fields
    if (!displayName || !slug) {
      return NextResponse.json(
        { error: 'Display name and slug are required' },
        { status: 400 }
      )
    }

    // Check if slug is unique
    const existingSlug = await prisma.publisher.findUnique({
      where: { slug },
    })

    if (existingSlug) {
      return NextResponse.json(
        { error: 'Slug already taken' },
        { status: 409 }
      )
    }

    const publisher = await prisma.publisher.create({
      data: {
        userId,
        displayName,
        slug,
        bio,
        avatarUrl,
        websiteUrl,
        twitterHandle,
        githubHandle,
        ghostFlowOrgId,
        payoutMethod: payoutMethod as PayoutMethod || PayoutMethod.USDC,
        payoutAddress,
      },
    })

    return NextResponse.json({ data: publisher }, { status: 201 })
  } catch (error) {
    console.error('Error creating publisher:', error)
    return NextResponse.json(
      { error: 'Failed to create publisher profile' },
      { status: 500 }
    )
  }
}

// PATCH /api/publisher
export async function PATCH(request: NextRequest) {
  try {
    const userId = getCurrentUserId()
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const publisher = await prisma.publisher.findUnique({
      where: { userId },
    })

    if (!publisher) {
      return NextResponse.json(
        { error: 'Publisher profile not found' },
        { status: 404 }
      )
    }

    const body = await request.json()
    
    // Fields that can be updated
    const allowedFields = [
      'displayName', 'bio', 'avatarUrl', 'websiteUrl',
      'twitterHandle', 'githubHandle', 'ghostFlowOrgId',
      'ghostFlowApiKey', 'payoutMethod', 'payoutAddress',
    ]

    const updateData: Record<string, unknown> = {}
    for (const field of allowedFields) {
      if (body[field] !== undefined) {
        updateData[field] = body[field]
      }
    }

    const updatedPublisher = await prisma.publisher.update({
      where: { userId },
      data: updateData,
    })

    return NextResponse.json({ data: updatedPublisher })
  } catch (error) {
    console.error('Error updating publisher:', error)
    return NextResponse.json(
      { error: 'Failed to update publisher profile' },
      { status: 500 }
    )
  }
}

