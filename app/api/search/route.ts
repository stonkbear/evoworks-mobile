/**
 * Search API
 * Full-text search for marketplace listings
 */

import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

/**
 * GET /api/search
 * Search listings with filters
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const query = searchParams.get('q') || ''
    const type = searchParams.get('type')
    const category = searchParams.get('category')
    const pricing = searchParams.get('pricing')
    const minRating = parseFloat(searchParams.get('minRating') || '0')
    const sort = searchParams.get('sort') || 'relevance'
    const limit = parseInt(searchParams.get('limit') || '20')
    const offset = parseInt(searchParams.get('offset') || '0')

    // Build where clause
    const where: any = {
      status: 'ACTIVE',
    }

    // Full-text search on name, description, tags
    if (query) {
      where.OR = [
        { name: { contains: query, mode: 'insensitive' } },
        { shortDescription: { contains: query, mode: 'insensitive' } },
        { longDescription: { contains: query, mode: 'insensitive' } },
        { tags: { hasSome: query.toLowerCase().split(' ') } },
      ]
    }

    if (type) {
      where.type = type.toUpperCase()
    }

    if (category) {
      where.category = category
    }

    if (pricing) {
      where.pricingModel = pricing.toUpperCase()
    }

    if (minRating > 0) {
      where.avgRating = { gte: minRating }
    }

    // Build order by
    let orderBy: any = { installCount: 'desc' }
    switch (sort) {
      case 'recent':
        orderBy = { createdAt: 'desc' }
        break
      case 'popular':
        orderBy = { installCount: 'desc' }
        break
      case 'rating':
        orderBy = { avgRating: 'desc' }
        break
      case 'price_low':
        orderBy = { priceAmount: 'asc' }
        break
      case 'price_high':
        orderBy = { priceAmount: 'desc' }
        break
    }

    const [listings, total] = await Promise.all([
      prisma.marketplaceListing.findMany({
        where,
        take: limit,
        skip: offset,
        orderBy,
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

    // Get facets for filtering
    const [typeFacets, categoryFacets, pricingFacets] = await Promise.all([
      prisma.marketplaceListing.groupBy({
        by: ['type'],
        where: { status: 'ACTIVE' },
        _count: true,
      }),
      prisma.marketplaceListing.groupBy({
        by: ['category'],
        where: { status: 'ACTIVE' },
        _count: true,
        orderBy: { _count: { category: 'desc' } },
        take: 10,
      }),
      prisma.marketplaceListing.groupBy({
        by: ['pricingModel'],
        where: { status: 'ACTIVE' },
        _count: true,
      }),
    ])

    return NextResponse.json({
      listings,
      total,
      limit,
      offset,
      facets: {
        types: typeFacets.map(f => ({ value: f.type, count: f._count })),
        categories: categoryFacets.map(f => ({ value: f.category, count: f._count })),
        pricing: pricingFacets.map(f => ({ value: f.pricingModel, count: f._count })),
      },
    })
  } catch (error) {
    console.error('Search error:', error)
    return NextResponse.json({ error: 'Search failed' }, { status: 500 })
  }
}

