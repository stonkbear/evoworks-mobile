import { NextRequest, NextResponse } from 'next/server'
import { getPolicyDecisions } from '@/lib/policy/manager'

/**
 * GET /api/policies/:id/decisions
 * Get decision history for a policy pack
 */
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const searchParams = req.nextUrl.searchParams
    const decision = searchParams.get('decision') as 'ALLOW' | 'DENY' | null
    const limit = parseInt(searchParams.get('limit') || '100')

    const decisions = await getPolicyDecisions({
      policyPackId: params.id,
      decision: decision || undefined,
      limit,
    })

    // Calculate summary stats
    const totalDecisions = decisions.length
    const allowCount = decisions.filter((d) => d.decision === 'ALLOW').length
    const denyCount = decisions.filter((d) => d.decision === 'DENY').length
    const allowRate = totalDecisions > 0 ? (allowCount / totalDecisions) * 100 : 0

    return NextResponse.json({
      success: true,
      data: {
        policyPackId: params.id,
        decisions,
        summary: {
          total: totalDecisions,
          allowed: allowCount,
          denied: denyCount,
          allowRate: Math.round(allowRate * 100) / 100,
        },
      },
    })
  } catch (error) {
    console.error('Error getting policy decisions:', error)
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'GET_ERROR',
          message: 'Failed to get policy decisions',
        },
      },
      { status: 500 }
    )
  }
}

