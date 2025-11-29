/**
 * POST /api/audit/verify - Verify integrity of audit chain
 */

import { NextRequest, NextResponse } from 'next/server'
import { verifyChain } from '@/lib/observability/audit'

export async function POST(request: NextRequest) {
  try {
    const { fromSeq, toSeq } = await request.json()

    if (!fromSeq || !toSeq) {
      return NextResponse.json(
        {
          success: false,
          error: 'fromSeq and toSeq are required',
        },
        { status: 400 }
      )
    }

    if (fromSeq > toSeq) {
      return NextResponse.json(
        {
          success: false,
          error: 'fromSeq must be less than or equal to toSeq',
        },
        { status: 400 }
      )
    }

    const result = await verifyChain(fromSeq, toSeq)

    return NextResponse.json({
      success: true,
      verified: result.valid,
      tamperedEvents: result.tamperedEvents,
      message: result.valid
        ? 'Chain integrity verified'
        : `Chain integrity compromised: ${result.tamperedEvents.length} tampered events`,
    })
  } catch (error) {
    console.error('Error verifying chain:', error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to verify chain',
      },
      { status: 500 }
    )
  }
}

