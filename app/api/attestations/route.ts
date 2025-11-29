import { NextRequest, NextResponse } from 'next/server'
import { createAttestation, getAttestations } from '@/lib/reputation/attestations'

/**
 * POST /api/attestations
 * Create an attestation
 */
export async function POST(req: NextRequest) {
  try {
    // TODO: Add authentication and get real user ID
    const userId = 'mock-user-id' // Replace with authenticated user

    const body = await req.json()
    const { agentId, category, score, comment, verificationProof } = body

    if (!agentId || !category || !score) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'INVALID_INPUT',
            message: 'agentId, category, and score are required',
          },
        },
        { status: 400 }
      )
    }

    const attestationId = await createAttestation({
      agentId,
      attestorUserId: userId,
      category,
      score,
      comment,
      verificationProof,
    })

    return NextResponse.json({
      success: true,
      data: {
        attestationId,
        agentId,
        category,
        score,
      },
    })
  } catch (error) {
    console.error('Error creating attestation:', error)
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'ATTESTATION_ERROR',
          message: error instanceof Error ? error.message : 'Failed to create attestation',
        },
      },
      { status: 500 }
    )
  }
}

/**
 * GET /api/attestations?agentId=xxx&category=xxx
 * Get attestations for an agent
 */
export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams
    const agentId = searchParams.get('agentId')
    const category = searchParams.get('category') || undefined

    if (!agentId) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'INVALID_INPUT',
            message: 'agentId is required',
          },
        },
        { status: 400 }
      )
    }

    const attestations = await getAttestations(agentId, category)

    return NextResponse.json({
      success: true,
      data: attestations,
    })
  } catch (error) {
    console.error('Error fetching attestations:', error)
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'FETCH_ERROR',
          message: 'Failed to fetch attestations',
        },
      },
      { status: 500 }
    )
  }
}

