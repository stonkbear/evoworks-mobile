/**
 * Marketplace Listings API
 * GET /api/marketplace/listings - List all listings with filters
 * POST /api/marketplace/listings - Create a new listing (requires auth)
 */

import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { ListingType, ListingStatus, ListingPricingModel, VerificationLevel } from '@prisma/client'

// GET /api/marketplace/listings
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    
    // Parse query parameters
    const type = searchParams.get('type') as ListingType | null
    const category = searchParams.get('category')
    const status = searchParams.get('status') as ListingStatus | null
    const pricingModel = searchParams.get('pricing') as ListingPricingModel | null
    const verified = searchParams.get('verified')
    const search = searchParams.get('search')
    const sort = searchParams.get('sort') || 'popular'
    const page = parseInt(searchParams.get('page') || '1')
    const limit = Math.min(parseInt(searchParams.get('limit') || '20'), 100)
    const offset = (page - 1) * limit

    // Build where clause
    const where: Record<string, unknown> = {
      status: status || ListingStatus.ACTIVE,
    }

    if (type) {
      where.type = type
    }

    if (category && category !== 'all') {
      where.category = category
    }

    if (pricingModel) {
      where.pricingModel = pricingModel
    }

    if (verified === 'true') {
      where.verificationLevel = {
        in: [VerificationLevel.VERIFIED, VerificationLevel.PARTNER],
      }
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { shortDescription: { contains: search, mode: 'insensitive' } },
        { tags: { has: search.toLowerCase() } },
      ]
    }

    // Build order by
    let orderBy: Record<string, string> = {}
    switch (sort) {
      case 'popular':
        orderBy = { installCount: 'desc' }
        break
      case 'rating':
        orderBy = { avgRating: 'desc' }
        break
      case 'newest':
        orderBy = { publishedAt: 'desc' }
        break
      case 'price-low':
        orderBy = { priceAmount: 'asc' }
        break
      case 'price-high':
        orderBy = { priceAmount: 'desc' }
        break
      default:
        orderBy = { installCount: 'desc' }
    }

    // Execute queries in parallel
    const [listings, total] = await Promise.all([
      prisma.marketplaceListing.findMany({
        where,
        orderBy,
        skip: offset,
        take: limit,
        include: {
          publisher: {
            select: {
              id: true,
              displayName: true,
              slug: true,
              avatarUrl: true,
              verified: true,
            },
          },
        },
      }),
      prisma.marketplaceListing.count({ where }),
    ])

    // Transform for API response
    const data = listings.map((listing) => ({
      id: listing.id,
      slug: listing.slug,
      name: listing.name,
      shortDescription: listing.shortDescription,
      type: listing.type,
      category: listing.category,
      tags: listing.tags,
      pricingModel: listing.pricingModel,
      priceAmount: listing.priceAmount,
      subscriptionMonthly: listing.subscriptionMonthly,
      coverImageUrl: listing.coverImageUrl,
      supportedModels: listing.supportedModels,
      availableTools: listing.availableTools,
      verificationLevel: listing.verificationLevel,
      stats: {
        views: listing.viewCount,
        installs: listing.installCount,
        rating: listing.avgRating,
        reviews: listing.reviewCount,
      },
      publisher: listing.publisher,
      publishedAt: listing.publishedAt,
    }))

    return NextResponse.json({
      data,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error('Error fetching listings:', error)
    return NextResponse.json(
      { error: 'Failed to fetch listings' },
      { status: 500 }
    )
  }
}

// POST /api/marketplace/listings
export async function POST(request: NextRequest) {
  try {
    // TODO: Add authentication check
    const body = await request.json()
    
    const {
      publisherId,
      name,
      slug,
      shortDescription,
      longDescription,
      type,
      category,
      tags,
      supportedModels,
      availableTools,
      pricingModel,
      priceAmount,
      subscriptionMonthly,
      subscriptionYearly,
      ghostFlowId,
      ghostFlowType,
      ghostFlowConfig,
      coverImageUrl,
      screenshotUrls,
      demoVideoUrl,
    } = body

    // Validate required fields
    if (!publisherId || !name || !slug || !shortDescription || !type || !category || !pricingModel) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Check if slug is unique
    const existingListing = await prisma.marketplaceListing.findUnique({
      where: { slug },
    })

    if (existingListing) {
      return NextResponse.json(
        { error: 'Slug already exists' },
        { status: 409 }
      )
    }

    // Create listing
    const listing = await prisma.marketplaceListing.create({
      data: {
        publisherId,
        slug,
        name,
        shortDescription,
        longDescription: longDescription || '',
        type: type as ListingType,
        category,
        tags: tags || [],
        supportedModels: supportedModels || [],
        availableTools: availableTools || [],
        pricingModel: pricingModel as ListingPricingModel,
        priceAmount,
        subscriptionMonthly,
        subscriptionYearly,
        ghostFlowId,
        ghostFlowType,
        ghostFlowConfig,
        coverImageUrl,
        screenshotUrls: screenshotUrls || [],
        demoVideoUrl,
        status: ListingStatus.PENDING,
      },
      include: {
        publisher: {
          select: {
            id: true,
            displayName: true,
            slug: true,
          },
        },
      },
    })

    // Update publisher listing count
    await prisma.publisher.update({
      where: { id: publisherId },
      data: { totalListings: { increment: 1 } },
    })

    return NextResponse.json({ data: listing }, { status: 201 })
  } catch (error) {
    console.error('Error creating listing:', error)
    return NextResponse.json(
      { error: 'Failed to create listing' },
      { status: 500 }
    )
  }
}

