/**
 * POST /api/adapters/execute - Execute task on agent's platform
 */

import { NextRequest, NextResponse } from 'next/server'
import { executeTaskOnPlatform } from '@/lib/adapters/manager'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { agentId, taskId, input, parameters, context } = body

    if (!agentId || !taskId || !input) {
      return NextResponse.json(
        {
          success: false,
          error: 'agentId, taskId, and input are required',
        },
        { status: 400 }
      )
    }

    const result = await executeTaskOnPlatform(agentId, {
      id: taskId,
      input,
      parameters,
      context,
    })

    if (!result.success) {
      return NextResponse.json(
        {
          success: false,
          error: result.error,
        },
        { status: 400 }
      )
    }

    return NextResponse.json({
      success: true,
      output: result.output,
      metadata: result.metadata,
    })
  } catch (error) {
    console.error('Error executing task on platform:', error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Execution failed',
      },
      { status: 500 }
    )
  }
}

