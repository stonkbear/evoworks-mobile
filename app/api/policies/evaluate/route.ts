import { NextRequest, NextResponse } from 'next/server'
import { evaluatePolicy } from '@/lib/policy/manager'

/**
 * POST /api/policies/evaluate
 * Evaluate a policy pack (testing endpoint)
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { policyPackId, input } = body

    if (!policyPackId || !input) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'INVALID_INPUT',
            message: 'policyPackId and input are required',
          },
        },
        { status: 400 }
      )
    }

    const result = await evaluatePolicy(policyPackId, input)

    return NextResponse.json({
      success: true,
      data: {
        policyPackId,
        evaluation: result,
        timestamp: new Date().toISOString(),
      },
    })
  } catch (error) {
    console.error('Error evaluating policy:', error)
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'EVALUATION_ERROR',
          message: error instanceof Error ? error.message : 'Failed to evaluate policy',
        },
      },
      { status: 500 }
    )
  }
}

