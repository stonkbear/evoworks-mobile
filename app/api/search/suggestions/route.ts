/**
 * Search Suggestions API
 * Autocomplete and trending searches
 */

import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

/**
 * GET /api/search/suggestions
 * Get search suggestions
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const query = searchParams.get('q') || ''

    if (!query || query.length < 2) {
      // Return trending/popular listings
      const trending = await prisma.marketplaceListing.findMany({
        where: { status: 'ACTIVE' },
        orderBy: { installCount: 'desc' },
        take: 5,
        select: {
          name: true,
          slug: true,
          type: true,
        },
      })

      return NextResponse.json({
        suggestions: [],
        trending: trending.map(l => ({
          text: l.name,
          url: `/listing/${l.slug}`,
          type: l.type,
        })),
      })
    }

    // Search for matching listings
    const matches = await prisma.marketplaceListing.findMany({
      where: {
        status: 'ACTIVE',
        OR: [
          { name: { contains: query, mode: 'insensitive' } },
          { tags: { hasSome: [query.toLowerCase()] } },
        ],
      },
      orderBy: { installCount: 'desc' },
      take: 8,
      select: {
        name: true,
        slug: true,
        type: true,
        shortDescription: true,
        publisher: {
          select: {
            displayName: true,
          },
        },
      },
    })

    // Also get category suggestions
    const categories = await prisma.marketplaceListing.findMany({
      where: {
        status: 'ACTIVE',
        category: { contains: query, mode: 'insensitive' },
      },
      distinct: ['category'],
      select: { category: true },
      take: 3,
    })

    return NextResponse.json({
      suggestions: matches.map(l => ({
        text: l.name,
        url: `/listing/${l.slug}`,
        type: l.type,
        description: l.shortDescription?.slice(0, 60) + (l.shortDescription && l.shortDescription.length > 60 ? '...' : ''),
        publisher: l.publisher.displayName,
      })),
      categories: categories.map(c => ({
        text: c.category,
        url: `/marketplace?category=${encodeURIComponent(c.category)}`,
      })),
    })
  } catch (error) {
    console.error('Suggestions error:', error)
    return NextResponse.json({ error: 'Failed to get suggestions' }, { status: 500 })
  }
}

