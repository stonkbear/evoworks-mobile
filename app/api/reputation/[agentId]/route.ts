import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db/prisma'
import { ScorePeriod } from '@prisma/client'

/**
 * GET /api/reputation/:agentId
 * Get reputation scores for an agent
 */
export async function GET(
  req: NextRequest,
  { params }: { params: { agentId: string } }
) {
  try {
    const { agentId } = params
    const searchParams = req.nextUrl.searchParams
    const period = (searchParams.get('period') as ScorePeriod) || ScorePeriod.ALL_TIME

    // Get reputation score
    const score = await prisma.reputationScore.findUnique({
      where: {
        agentId_period: {
          agentId,
          period,
        },
      },
    })

    if (!score) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'NOT_FOUND',
            message: 'Reputation score not found for this agent',
          },
        },
        { status: 404 }
      )
    }

    // Get all periods for comparison
    const allScores = await prisma.reputationScore.findMany({
      where: { agentId },
      orderBy: { period: 'asc' },
    })

    // Get stake positions
    const stakes = await prisma.stakePosition.findMany({
      where: {
        agentId,
        status: 'ACTIVE',
      },
    })

    const totalStaked = stakes.reduce((sum, s) => sum + s.amount, 0)

    return NextResponse.json({
      success: true,
      data: {
        current: score,
        allPeriods: allScores,
        totalStaked,
        activeStakes: stakes.length,
      },
    })
  } catch (error) {
    console.error('Error fetching reputation:', error)
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'FETCH_ERROR',
          message: 'Failed to fetch reputation',
        },
      },
      { status: 500 }
    )
  }
}

