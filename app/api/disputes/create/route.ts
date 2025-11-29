import { NextRequest, NextResponse } from 'next/server'
import { raiseDispute } from '@/lib/billing/disputes'

/**
 * POST /api/disputes/create
 * Raise a dispute for a task assignment
 */
export async function POST(req: NextRequest) {
  try {
    // TODO: Add authentication and determine role
    const body = await req.json()
    const { taskAssignmentId, reason, evidence, raisedBy = 'buyer' } = body

    if (!taskAssignmentId || !reason) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'INVALID_INPUT',
            message: 'taskAssignmentId and reason are required',
          },
        },
        { status: 400 }
      )
    }

    const result = await raiseDispute(taskAssignmentId, reason, evidence || [], raisedBy)

    if (!result.success) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'DISPUTE_FAILED',
            message: result.error,
          },
        },
        { status: 400 }
      )
    }

    return NextResponse.json({
      success: true,
      data: {
        disputeId: result.disputeId,
        taskAssignmentId,
        raisedBy,
        raisedAt: new Date().toISOString(),
      },
    })
  } catch (error) {
    console.error('Error raising dispute:', error)
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'DISPUTE_ERROR',
          message: error instanceof Error ? error.message : 'Failed to raise dispute',
        },
      },
      { status: 500 }
    )
  }
}

