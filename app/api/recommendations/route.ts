/**
 * Recommendations API
 * Similar listings and personalized recommendations
 */

import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

/**
 * GET /api/recommendations
 * Get recommendations
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const listingId = searchParams.get('listingId')
    const listingSlug = searchParams.get('listingSlug')
    const type = searchParams.get('type') || 'similar' // similar, popular, new
    const limit = parseInt(searchParams.get('limit') || '6')

    // For similar listings, we need a reference listing
    if (type === 'similar' && (listingId || listingSlug)) {
      const listing = await prisma.marketplaceListing.findFirst({
        where: listingId ? { id: listingId } : { slug: listingSlug! },
        select: {
          id: true,
          type: true,
          category: true,
          tags: true,
          publisherId: true,
        },
      })

      if (!listing) {
        return NextResponse.json({ listings: [] })
      }

      // Find similar listings
      const similar = await prisma.marketplaceListing.findMany({
        where: {
          id: { not: listing.id },
          status: 'ACTIVE',
          OR: [
            { type: listing.type },
            { category: listing.category },
            { tags: { hasSome: listing.tags } },
          ],
        },
        orderBy: [
          { avgRating: 'desc' },
          { installCount: 'desc' },
        ],
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
      })

      // Also get from same publisher
      const samePublisher = await prisma.marketplaceListing.findMany({
        where: {
          id: { not: listing.id },
          publisherId: listing.publisherId,
          status: 'ACTIVE',
        },
        orderBy: { installCount: 'desc' },
        take: 3,
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
      })

      return NextResponse.json({
        similar,
        fromPublisher: samePublisher,
      })
    }

    // Popular listings
    if (type === 'popular') {
      const listings = await prisma.marketplaceListing.findMany({
        where: { status: 'ACTIVE' },
        orderBy: { installCount: 'desc' },
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
      })

      return NextResponse.json({ listings })
    }

    // New listings
    if (type === 'new') {
      const listings = await prisma.marketplaceListing.findMany({
        where: { status: 'ACTIVE' },
        orderBy: { createdAt: 'desc' },
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
      })

      return NextResponse.json({ listings })
    }

    // Featured/curated listings
    const featured = await prisma.marketplaceListing.findMany({
      where: {
        status: 'ACTIVE',
        verificationLevel: 'VERIFIED',
        avgRating: { gte: 4.0 },
      },
      orderBy: { installCount: 'desc' },
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
    })

    return NextResponse.json({ listings: featured })
  } catch (error) {
    console.error('Recommendations error:', error)
    return NextResponse.json({ error: 'Failed to get recommendations' }, { status: 500 })
  }
}

