/**
 * V1 Listing Unpublish API
 * Unpublish a listing (keeps it but marks as paused)
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
 * POST /api/v1/listings/:id/unpublish
 * Unpublish a listing
 */
export async function POST(
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
      return NextResponse.json({ error: 'Not authorized to unpublish this listing' }, { status: 403 })
    }

    // Mark as paused (not deleted)
    const updated = await prisma.marketplaceListing.update({
      where: { id: listing.id },
      data: { status: 'PAUSED' },
    })

    return NextResponse.json({
      id: updated.id,
      status: updated.status,
      message: 'Listing unpublished successfully',
    })
  } catch (error) {
    console.error('Unpublish listing error:', error)
    return NextResponse.json({ error: 'Failed to unpublish listing' }, { status: 500 })
  }
}

