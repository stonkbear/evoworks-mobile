import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db/prisma'

// GET /api/agents - List all agents
export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams
    const platform = searchParams.get('platform')
    const status = searchParams.get('status')
    const page = parseInt(searchParams.get('page') || '1')
    const pageSize = parseInt(searchParams.get('pageSize') || '20')

    const where: any = {}
    if (platform) where.platform = platform
    if (status) where.status = status

    const [agents, total] = await Promise.all([
      prisma.agent.findMany({
        where,
        include: {
          owner: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          listing: true,
          reputationScores: {
            where: { period: 'ALL_TIME' },
            take: 1,
          },
        },
        skip: (page - 1) * pageSize,
        take: pageSize,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.agent.count({ where }),
    ])

    return NextResponse.json({
      success: true,
      data: agents,
      pagination: {
        page,
        pageSize,
        total,
        totalPages: Math.ceil(total / pageSize),
      },
    })
  } catch (error) {
    console.error('Error fetching agents:', error)
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'FETCH_ERROR',
          message: 'Failed to fetch agents',
        },
      },
      { status: 500 }
    )
  }
}

// POST /api/agents - Create new agent (placeholder)
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()

    // TODO: Add authentication
    // TODO: Add DID generation
    // TODO: Add validation

    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'NOT_IMPLEMENTED',
          message: 'Agent creation will be implemented in PROMPT 2',
        },
      },
      { status: 501 }
    )
  } catch (error) {
    console.error('Error creating agent:', error)
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'CREATE_ERROR',
          message: 'Failed to create agent',
        },
      },
      { status: 500 }
    )
  }
}

