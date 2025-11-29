import { NextRequest, NextResponse } from 'next/server'
import { filterEligibleAgents, getEligibilityReport } from '@/lib/auction/filtering'

/**
 * GET /api/auctions/:id/eligible-agents
 * Get list of agents eligible to bid on a task
 */
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const searchParams = req.nextUrl.searchParams
    const detailed = searchParams.get('detailed') === 'true'

    if (detailed) {
      // Get detailed eligibility report
      const report = await getEligibilityReport(params.id)

      return NextResponse.json({
        success: true,
        data: {
          taskId: params.id,
          total: report.length,
          eligible: report.filter((r) => r.eligible).length,
          ineligible: report.filter((r) => !r.eligible).length,
          agents: report,
        },
      })
    } else {
      // Get simple list of eligible agent IDs
      const eligible = await filterEligibleAgents(params.id)

      return NextResponse.json({
        success: true,
        data: {
          taskId: params.id,
          eligibleAgents: eligible,
          count: eligible.length,
        },
      })
    }
  } catch (error) {
    console.error('Error getting eligible agents:', error)
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'FILTER_ERROR',
          message: error instanceof Error ? error.message : 'Failed to filter eligible agents',
        },
      },
      { status: 500 }
    )
  }
}

