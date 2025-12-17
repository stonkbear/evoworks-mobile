/**
 * Reviews API
 * Create and list reviews for marketplace listings
 */

import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import prisma from '@/lib/prisma'
import { sendNewReview } from '@/lib/email'

/**
 * GET /api/reviews
 * Get reviews for a listing
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const listingId = searchParams.get('listingId')
    const listingSlug = searchParams.get('listingSlug')
    const limit = parseInt(searchParams.get('limit') || '20')
    const offset = parseInt(searchParams.get('offset') || '0')
    const sort = searchParams.get('sort') || 'recent' // recent, helpful, rating_high, rating_low

    if (!listingId && !listingSlug) {
      return NextResponse.json({ error: 'listingId or listingSlug required' }, { status: 400 })
    }

    // Find listing
    const listing = await prisma.marketplaceListing.findFirst({
      where: listingId ? { id: listingId } : { slug: listingSlug! },
      select: { id: true, avgRating: true, reviewCount: true },
    })

    if (!listing) {
      return NextResponse.json({ error: 'Listing not found' }, { status: 404 })
    }

    // Build sort order
    let orderBy: any = { createdAt: 'desc' }
    if (sort === 'rating_high') orderBy = { rating: 'desc' }
    if (sort === 'rating_low') orderBy = { rating: 'asc' }

    const reviews = await prisma.listingReview.findMany({
      where: { 
        listingId: listing.id,
        flagged: false,
      },
      take: limit,
      skip: offset,
      orderBy,
    })

    // Get rating distribution
    const ratingDistribution = await prisma.listingReview.groupBy({
      by: ['rating'],
      where: { listingId: listing.id, flagged: false },
      _count: true,
    })

    const distribution = [0, 0, 0, 0, 0]
    ratingDistribution.forEach(r => {
      distribution[r.rating - 1] = r._count
    })

    return NextResponse.json({
      reviews,
      total: listing.reviewCount,
      avgRating: listing.avgRating,
      distribution,
    })
  } catch (error) {
    console.error('Get reviews error:', error)
    return NextResponse.json({ error: 'Failed to fetch reviews' }, { status: 500 })
  }
}

/**
 * POST /api/reviews
 * Create a new review
 */
export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { listingId, rating, title, content } = body

    if (!listingId || !rating || rating < 1 || rating > 5) {
      return NextResponse.json({ error: 'Invalid review data' }, { status: 400 })
    }

    // Check if user already reviewed this listing
    const existingReview = await prisma.listingReview.findUnique({
      where: {
        listingId_userId: {
          listingId,
          userId: session.user.id,
        },
      },
    })

    if (existingReview) {
      return NextResponse.json({ error: 'You already reviewed this listing' }, { status: 400 })
    }

    // Check if user has purchased/installed the listing
    const install = await prisma.listingInstall.findUnique({
      where: {
        listingId_userId: {
          listingId,
          userId: session.user.id,
        },
      },
    })

    // Get listing with publisher info
    const listing = await prisma.marketplaceListing.findUnique({
      where: { id: listingId },
      include: {
        publisher: {
          select: {
            id: true,
            displayName: true,
            userId: true,
          },
        },
      },
    })

    if (!listing) {
      return NextResponse.json({ error: 'Listing not found' }, { status: 404 })
    }

    // Create the review
    const review = await prisma.listingReview.create({
      data: {
        listingId,
        userId: session.user.id,
        rating,
        title: title || null,
        content: content || null,
        verifiedPurchase: !!install,
      },
    })

    // Update listing average rating
    const stats = await prisma.listingReview.aggregate({
      where: { listingId, flagged: false },
      _avg: { rating: true },
      _count: true,
    })

    await prisma.marketplaceListing.update({
      where: { id: listingId },
      data: {
        avgRating: stats._avg.rating || 0,
        reviewCount: stats._count,
      },
    })

    // Update publisher average rating
    const publisherStats = await prisma.listingReview.aggregate({
      where: {
        listing: { publisherId: listing.publisher.id },
        flagged: false,
      },
      _avg: { rating: true },
    })

    await prisma.publisher.update({
      where: { id: listing.publisher.id },
      data: {
        avgRating: publisherStats._avg.rating || null,
      },
    })

    // Send notification to publisher
    const publisherUser = await prisma.user.findUnique({
      where: { id: listing.publisher.userId },
      select: { email: true },
    })

    if (publisherUser?.email) {
      await sendNewReview(publisherUser.email, {
        publisherName: listing.publisher.displayName,
        listingName: listing.name,
        reviewerName: session.user.name || 'A user',
        rating,
        content: content || 'No comment provided',
        listingUrl: `${process.env.NEXTAUTH_URL}/listing/${listing.slug}`,
      })
    }

    return NextResponse.json(review, { status: 201 })
  } catch (error) {
    console.error('Create review error:', error)
    return NextResponse.json({ error: 'Failed to create review' }, { status: 500 })
  }
}

