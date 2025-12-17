/**
 * Single Payout API
 * GET - Get payout details
 * PATCH - Update payout (admin only - for processing)
 * DELETE - Cancel pending payout
 */

import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { auth } from '@/lib/auth'
import { PayoutStatus } from '@prisma/client'

// GET /api/payouts/[id] - Get payout details
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const payout = await prisma.publisherPayout.findUnique({
      where: { id: params.id },
      include: {
        publisher: {
          select: {
            id: true,
            name: true,
            userId: true,
          },
        },
      },
    })

    if (!payout) {
      return NextResponse.json({ error: 'Payout not found' }, { status: 404 })
    }

    // Check authorization (publisher or admin)
    const isAdmin = session.user.role === 'ADMIN'
    const isOwner = payout.publisher.userId === session.user.id

    if (!isAdmin && !isOwner) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    return NextResponse.json(payout)
  } catch (error) {
    console.error('Error fetching payout:', error)
    return NextResponse.json({ error: 'Failed to fetch payout' }, { status: 500 })
  }
}

// PATCH /api/payouts/[id] - Update payout status (admin/system)
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Only admins can process payouts
    if (session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 })
    }

    const body = await request.json()
    const { status, txHash, stripePayoutId, failureReason } = body

    const payout = await prisma.publisherPayout.findUnique({
      where: { id: params.id },
    })

    if (!payout) {
      return NextResponse.json({ error: 'Payout not found' }, { status: 404 })
    }

    // Validate status transition
    const validTransitions: Record<PayoutStatus, PayoutStatus[]> = {
      PENDING: ['PROCESSING', 'FAILED'],
      PROCESSING: ['COMPLETED', 'FAILED'],
      COMPLETED: [],
      FAILED: ['PENDING'], // Allow retry
    }

    if (status && !validTransitions[payout.status].includes(status)) {
      return NextResponse.json(
        { error: `Cannot transition from ${payout.status} to ${status}` },
        { status: 400 }
      )
    }

    // Update payout
    const updateData: any = {}
    
    if (status) {
      updateData.status = status
      if (status === 'COMPLETED') {
        updateData.processedAt = new Date()
      }
    }
    
    if (txHash) updateData.txHash = txHash
    if (stripePayoutId) updateData.stripePayoutId = stripePayoutId

    const updatedPayout = await prisma.publisherPayout.update({
      where: { id: params.id },
      data: updateData,
    })

    // If completed, update publisher's total paid out
    if (status === 'COMPLETED') {
      await prisma.publisher.update({
        where: { id: payout.publisherId },
        data: {
          // Could track totalPaidOut here if needed
        },
      })
    }

    return NextResponse.json({
      success: true,
      payout: updatedPayout,
    })
  } catch (error) {
    console.error('Error updating payout:', error)
    return NextResponse.json({ error: 'Failed to update payout' }, { status: 500 })
  }
}

// DELETE /api/payouts/[id] - Cancel pending payout
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const payout = await prisma.publisherPayout.findUnique({
      where: { id: params.id },
      include: {
        publisher: {
          select: {
            userId: true,
          },
        },
      },
    })

    if (!payout) {
      return NextResponse.json({ error: 'Payout not found' }, { status: 404 })
    }

    // Check authorization
    const isAdmin = session.user.role === 'ADMIN'
    const isOwner = payout.publisher.userId === session.user.id

    if (!isAdmin && !isOwner) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Can only cancel pending payouts
    if (payout.status !== 'PENDING') {
      return NextResponse.json(
        { error: 'Can only cancel pending payouts' },
        { status: 400 }
      )
    }

    // Delete the payout
    await prisma.publisherPayout.delete({
      where: { id: params.id },
    })

    return NextResponse.json({
      success: true,
      message: 'Payout request cancelled',
    })
  } catch (error) {
    console.error('Error cancelling payout:', error)
    return NextResponse.json({ error: 'Failed to cancel payout' }, { status: 500 })
  }
}

