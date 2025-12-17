/**
 * Single Listing API
 * GET /api/marketplace/listings/[slug] - Get listing by slug
 * PATCH /api/marketplace/listings/[slug] - Update listing (owner only)
 * DELETE /api/marketplace/listings/[slug] - Delete listing (owner only)
 */

import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { ListingStatus } from '@prisma/client'

interface RouteParams {
  params: Promise<{ slug: string }>
}

// GET /api/marketplace/listings/[slug]
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { slug } = await params

    const listing = await prisma.marketplaceListing.findUnique({
      where: { slug },
      include: {
        publisher: {
          select: {
            id: true,
            displayName: true,
            slug: true,
            avatarUrl: true,
            bio: true,
            verified: true,
            websiteUrl: true,
            twitterHandle: true,
            githubHandle: true,
            totalListings: true,
            avgRating: true,
          },
        },
        reviews: {
          where: { flagged: false },
          orderBy: { createdAt: 'desc' },
          take: 10,
          select: {
            id: true,
            rating: true,
            title: true,
            content: true,
            verifiedPurchase: true,
            createdAt: true,
          },
        },
      },
    })

    if (!listing) {
      return NextResponse.json(
        { error: 'Listing not found' },
        { status: 404 }
      )
    }

    // Increment view count (fire and forget)
    prisma.marketplaceListing.update({
      where: { id: listing.id },
      data: { viewCount: { increment: 1 } },
    }).catch(() => {}) // Ignore errors for view tracking

    // Get similar listings
    const similarListings = await prisma.marketplaceListing.findMany({
      where: {
        id: { not: listing.id },
        status: ListingStatus.ACTIVE,
        OR: [
          { type: listing.type },
          { category: listing.category },
        ],
      },
      take: 4,
      orderBy: { installCount: 'desc' },
      select: {
        id: true,
        slug: true,
        name: true,
        shortDescription: true,
        type: true,
        pricingModel: true,
        priceAmount: true,
        subscriptionMonthly: true,
        coverImageUrl: true,
        avgRating: true,
        installCount: true,
        verificationLevel: true,
        publisher: {
          select: {
            displayName: true,
            slug: true,
            verified: true,
          },
        },
      },
    })

    // Transform response
    const data = {
      id: listing.id,
      slug: listing.slug,
      name: listing.name,
      shortDescription: listing.shortDescription,
      longDescription: listing.longDescription,
      type: listing.type,
      category: listing.category,
      tags: listing.tags,
      
      // Technical details
      supportedModels: listing.supportedModels,
      availableTools: listing.availableTools,
      nodeCount: listing.nodeCount,
      estimatedLatency: listing.estimatedLatency,
      ghostFlowConfig: listing.ghostFlowConfig,
      
      // Pricing
      pricingModel: listing.pricingModel,
      priceAmount: listing.priceAmount,
      subscriptionMonthly: listing.subscriptionMonthly,
      subscriptionYearly: listing.subscriptionYearly,
      
      // Media
      coverImageUrl: listing.coverImageUrl,
      screenshotUrls: listing.screenshotUrls,
      demoVideoUrl: listing.demoVideoUrl,
      
      // Status
      status: listing.status,
      verificationLevel: listing.verificationLevel,
      
      // Stats
      stats: {
        views: listing.viewCount,
        installs: listing.installCount,
        rating: listing.avgRating,
        reviews: listing.reviewCount,
        revenue: listing.totalRevenue,
      },
      
      // Relations
      publisher: listing.publisher,
      reviews: listing.reviews,
      similarListings,
      
      // Timestamps
      publishedAt: listing.publishedAt,
      createdAt: listing.createdAt,
      updatedAt: listing.updatedAt,
    }

    return NextResponse.json({ data })
  } catch (error) {
    console.error('Error fetching listing:', error)
    return NextResponse.json(
      { error: 'Failed to fetch listing' },
      { status: 500 }
    )
  }
}

// PATCH /api/marketplace/listings/[slug]
export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const { slug } = await params
    const body = await request.json()
    
    // TODO: Add authentication and ownership check
    
    const listing = await prisma.marketplaceListing.findUnique({
      where: { slug },
    })

    if (!listing) {
      return NextResponse.json(
        { error: 'Listing not found' },
        { status: 404 }
      )
    }

    // Fields that can be updated
    const allowedFields = [
      'name', 'shortDescription', 'longDescription', 'category', 'tags',
      'supportedModels', 'availableTools', 'pricingModel', 'priceAmount',
      'subscriptionMonthly', 'subscriptionYearly', 'coverImageUrl',
      'screenshotUrls', 'demoVideoUrl', 'status',
    ]

    const updateData: Record<string, unknown> = {}
    for (const field of allowedFields) {
      if (body[field] !== undefined) {
        updateData[field] = body[field]
      }
    }

    const updatedListing = await prisma.marketplaceListing.update({
      where: { slug },
      data: updateData,
    })

    return NextResponse.json({ data: updatedListing })
  } catch (error) {
    console.error('Error updating listing:', error)
    return NextResponse.json(
      { error: 'Failed to update listing' },
      { status: 500 }
    )
  }
}

// DELETE /api/marketplace/listings/[slug]
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const { slug } = await params
    
    // TODO: Add authentication and ownership check
    
    const listing = await prisma.marketplaceListing.findUnique({
      where: { slug },
      select: { id: true, publisherId: true },
    })

    if (!listing) {
      return NextResponse.json(
        { error: 'Listing not found' },
        { status: 404 }
      )
    }

    // Delete the listing
    await prisma.marketplaceListing.delete({
      where: { slug },
    })

    // Update publisher listing count
    await prisma.publisher.update({
      where: { id: listing.publisherId },
      data: { totalListings: { decrement: 1 } },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting listing:', error)
    return NextResponse.json(
      { error: 'Failed to delete listing' },
      { status: 500 }
    )
  }
}

