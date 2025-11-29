import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db/prisma'

// GET /api/tasks - List tasks
export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams
    const status = searchParams.get('status')
    const page = parseInt(searchParams.get('page') || '1')
    const pageSize = parseInt(searchParams.get('pageSize') || '20')

    const where: any = {}
    if (status) where.status = status

    const [tasks, total] = await Promise.all([
      prisma.task.findMany({
        where,
        include: {
          buyer: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          bids: {
            select: {
              id: true,
              amount: true,
              status: true,
            },
          },
          assignment: {
            select: {
              id: true,
              status: true,
              agent: {
                select: {
                  id: true,
                  name: true,
                },
              },
            },
          },
        },
        skip: (page - 1) * pageSize,
        take: pageSize,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.task.count({ where }),
    ])

    return NextResponse.json({
      success: true,
      data: tasks,
      pagination: {
        page,
        pageSize,
        total,
        totalPages: Math.ceil(total / pageSize),
      },
    })
  } catch (error) {
    console.error('Error fetching tasks:', error)
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'FETCH_ERROR',
          message: 'Failed to fetch tasks',
        },
      },
      { status: 500 }
    )
  }
}

// POST /api/tasks - Create task (placeholder)
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()

    // TODO: Add authentication
    // TODO: Add validation
    // TODO: Add auction creation

    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'NOT_IMPLEMENTED',
          message: 'Task creation will be implemented in PROMPT 4',
        },
      },
      { status: 501 }
    )
  } catch (error) {
    console.error('Error creating task:', error)
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'CREATE_ERROR',
          message: 'Failed to create task',
        },
      },
      { status: 500 }
    )
  }
}

