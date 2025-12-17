/**
 * V1 Listings API
 * Used by Ghost Flow to publish and manage listings
 */

import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import jwt from 'jsonwebtoken'

// Middleware to verify OAuth token
async function verifyOAuthToken(request: NextRequest) {
  const authHeader = request.headers.get('authorization')
  if (!authHeader?.startsWith('Bearer ')) {
    return null
  }

  const token = authHeader.slice(7)
  
  try {
    const decoded = jwt.verify(token, process.env.NEXTAUTH_SECRET || 'secret') as {
      sub: string
      client_id: string
      scope: string
    }
    return decoded
  } catch {
    return null
  }
}

// Map Ghost Flow types to our types
const TYPE_MAP: Record<string, string> = {
  'automation': 'WORKFLOW',
  'agent': 'AGENT',
  'swarm': 'SWARM',
  'knowledge-pack': 'KNOWLEDGE_PACK',
}

const PRICING_MAP: Record<string, string> = {
  'free': 'FREE',
  'per-call': 'PER_CALL',
  'subscription': 'SUBSCRIPTION',
  'one-time': 'ONE_TIME',
}

/**
 * POST /api/v1/listings
 * Create a new listing from Ghost Flow
 */
export async function POST(request: NextRequest) {
  try {
    const auth = await verifyOAuthToken(request)
    if (!auth) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check scope
    if (!auth.scope.includes('write:listings')) {
      return NextResponse.json({ error: 'Insufficient scope' }, { status: 403 })
    }

    const body = await request.json()
    const {
      sourceId,
      sourceType,
      name,
      description,
      category,
      tags,
      pricingModel,
      price,
      coverImageUrl,
      config,
    } = body

    // Get or create publisher for this user
    let publisher = await prisma.publisher.findUnique({
      where: { userId: auth.sub },
    })

    if (!publisher) {
      publisher = await prisma.publisher.create({
        data: {
          userId: auth.sub,
          displayName: 'Ghost Flow Publisher',
          slug: `gf-${auth.sub.slice(0, 8)}-${Date.now()}`,
          ghostFlowOrgId: body.orgId,
        },
      })
    }

    // Create the listing
    const slug = `${name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-${Date.now()}`
    
    const listing = await prisma.marketplaceListing.create({
      data: {
        publisherId: publisher.id,
        slug,
        name,
        shortDescription: description?.slice(0, 200) || '',
        longDescription: description || '',
        type: (TYPE_MAP[sourceType] || 'WORKFLOW') as any,
        category: category || 'Uncategorized',
        tags: tags || [],
        ghostFlowId: sourceId,
        ghostFlowType: sourceType,
        ghostFlowConfig: config,
        pricingModel: (PRICING_MAP[pricingModel] || 'FREE') as any,
        priceAmount: price,
        coverImageUrl,
        status: 'PENDING_REVIEW',
      },
    })

    // Update publisher stats
    await prisma.publisher.update({
      where: { id: publisher.id },
      data: { totalListings: { increment: 1 } },
    })

    return NextResponse.json({
      id: listing.id,
      slug: listing.slug,
      status: listing.status,
      url: `${process.env.NEXTAUTH_URL}/listing/${listing.slug}`,
      dashboardUrl: `${process.env.NEXTAUTH_URL}/dashboard/publisher`,
    }, { status: 201 })
  } catch (error) {
    console.error('Create listing error:', error)
    return NextResponse.json({ error: 'Failed to create listing' }, { status: 500 })
  }
}

/**
 * GET /api/v1/listings
 * Get publisher's listings (mine)
 */
export async function GET(request: NextRequest) {
  try {
    const auth = await verifyOAuthToken(request)
    if (!auth) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const limit = parseInt(searchParams.get('limit') || '50')
    const offset = parseInt(searchParams.get('offset') || '0')

    const publisher = await prisma.publisher.findUnique({
      where: { userId: auth.sub },
    })

    if (!publisher) {
      return NextResponse.json({ listings: [], total: 0 })
    }

    const where: any = { publisherId: publisher.id }
    if (status) {
      where.status = status.toUpperCase()
    }

    const [listings, total] = await Promise.all([
      prisma.marketplaceListing.findMany({
        where,
        take: limit,
        skip: offset,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          slug: true,
          name: true,
          shortDescription: true,
          type: true,
          status: true,
          pricingModel: true,
          priceAmount: true,
          viewCount: true,
          installCount: true,
          totalRevenue: true,
          avgRating: true,
          ghostFlowId: true,
          createdAt: true,
          updatedAt: true,
        },
      }),
      prisma.marketplaceListing.count({ where }),
    ])

    return NextResponse.json({
      listings: listings.map(l => ({
        ...l,
        url: `${process.env.NEXTAUTH_URL}/listing/${l.slug}`,
      })),
      total,
      limit,
      offset,
    })
  } catch (error) {
    console.error('Get listings error:', error)
    return NextResponse.json({ error: 'Failed to fetch listings' }, { status: 500 })
  }
}

