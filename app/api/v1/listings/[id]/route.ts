/**
 * V1 Single Listing API
 * View, update, and unpublish individual listings
 */

import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import jwt from 'jsonwebtoken'

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

/**
 * GET /api/v1/listings/:id
 * Get a single listing
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const listing = await prisma.marketplaceListing.findFirst({
      where: {
        OR: [
          { id },
          { slug: id },
          { ghostFlowId: id },
        ],
      },
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

    if (!listing) {
      return NextResponse.json({ error: 'Listing not found' }, { status: 404 })
    }

    return NextResponse.json({
      ...listing,
      url: `${process.env.NEXTAUTH_URL}/listing/${listing.slug}`,
    })
  } catch (error) {
    console.error('Get listing error:', error)
    return NextResponse.json({ error: 'Failed to fetch listing' }, { status: 500 })
  }
}

/**
 * PATCH /api/v1/listings/:id
 * Update a listing
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await verifyOAuthToken(request)
    if (!auth) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    if (!auth.scope.includes('write:listings')) {
      return NextResponse.json({ error: 'Insufficient scope' }, { status: 403 })
    }

    const { id } = await params
    const body = await request.json()

    // Find the listing and verify ownership
    const listing = await prisma.marketplaceListing.findFirst({
      where: {
        OR: [
          { id },
          { slug: id },
          { ghostFlowId: id },
        ],
      },
      include: {
        publisher: true,
      },
    })

    if (!listing) {
      return NextResponse.json({ error: 'Listing not found' }, { status: 404 })
    }

    if (listing.publisher.userId !== auth.sub) {
      return NextResponse.json({ error: 'Not authorized to update this listing' }, { status: 403 })
    }

    // Update allowed fields
    const updateData: any = {}
    
    if (body.name) updateData.name = body.name
    if (body.description) {
      updateData.shortDescription = body.description.slice(0, 200)
      updateData.longDescription = body.description
    }
    if (body.category) updateData.category = body.category
    if (body.tags) updateData.tags = body.tags
    if (body.pricingModel) {
      const PRICING_MAP: Record<string, string> = {
        'free': 'FREE',
        'per-call': 'PER_CALL',
        'subscription': 'SUBSCRIPTION',
        'one-time': 'ONE_TIME',
      }
      updateData.pricingModel = PRICING_MAP[body.pricingModel] || body.pricingModel
    }
    if (body.price !== undefined) updateData.priceAmount = body.price
    if (body.coverImageUrl) updateData.coverImageUrl = body.coverImageUrl
    if (body.config) updateData.ghostFlowConfig = body.config

    const updated = await prisma.marketplaceListing.update({
      where: { id: listing.id },
      data: updateData,
    })

    return NextResponse.json({
      ...updated,
      url: `${process.env.NEXTAUTH_URL}/listing/${updated.slug}`,
    })
  } catch (error) {
    console.error('Update listing error:', error)
    return NextResponse.json({ error: 'Failed to update listing' }, { status: 500 })
  }
}

/**
 * DELETE /api/v1/listings/:id
 * Delete/unpublish a listing
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await verifyOAuthToken(request)
    if (!auth) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    if (!auth.scope.includes('write:listings')) {
      return NextResponse.json({ error: 'Insufficient scope' }, { status: 403 })
    }

    const { id } = await params

    // Find the listing and verify ownership
    const listing = await prisma.marketplaceListing.findFirst({
      where: {
        OR: [
          { id },
          { slug: id },
          { ghostFlowId: id },
        ],
      },
      include: {
        publisher: true,
      },
    })

    if (!listing) {
      return NextResponse.json({ error: 'Listing not found' }, { status: 404 })
    }

    if (listing.publisher.userId !== auth.sub) {
      return NextResponse.json({ error: 'Not authorized to delete this listing' }, { status: 403 })
    }

    // Soft delete - mark as archived
    await prisma.marketplaceListing.update({
      where: { id: listing.id },
      data: { status: 'ARCHIVED' },
    })

    // Update publisher stats
    await prisma.publisher.update({
      where: { id: listing.publisher.id },
      data: { totalListings: { decrement: 1 } },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Delete listing error:', error)
    return NextResponse.json({ error: 'Failed to delete listing' }, { status: 500 })
  }
}

