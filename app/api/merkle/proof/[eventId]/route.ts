/**
 * GET /api/merkle/proof/{eventId} - Get Merkle proof for an event
 */

import { NextRequest, NextResponse } from 'next/server'
import { getMerkleProof, verifyBlockchainAnchor } from '@/lib/observability/merkle'

interface RouteParams {
  params: {
    eventId: string
  }
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { eventId } = params

    const result = await getMerkleProof(eventId)

    if (!result.success) {
      return NextResponse.json(
        {
          success: false,
          error: result.error || 'Failed to get proof',
        },
        { status: 404 }
      )
    }

    // Optionally verify blockchain anchor
    const { searchParams } = new URL(request.url)
    const verifyAnchor = searchParams.get('verify') === 'true'

    let anchorVerified = undefined
    if (verifyAnchor && result.rootHash) {
      // Get transaction hash from anchor (would need to query DB)
      // anchorVerified = await verifyBlockchainAnchor(txHash)
    }

    return NextResponse.json({
      success: true,
      eventId,
      proof: result.proof,
      rootHash: result.rootHash,
      anchorVerified,
    })
  } catch (error) {
    console.error('Error getting Merkle proof:', error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to get proof',
      },
      { status: 500 }
    )
  }
}

