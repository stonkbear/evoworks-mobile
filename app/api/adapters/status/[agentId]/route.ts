/**
 * GET /api/adapters/status/{agentId} - Check agent status on platform
 */

import { NextRequest, NextResponse } from 'next/server'
import { checkAgentStatus } from '@/lib/adapters/manager'

interface RouteParams {
  params: {
    agentId: string
  }
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { agentId } = params

    const status = await checkAgentStatus(agentId)

    return NextResponse.json({
      success: true,
      agentId,
      ...status,
    })
  } catch (error) {
    console.error('Error checking agent status:', error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Status check failed',
      },
      { status: 500 }
    )
  }
}

