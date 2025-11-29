/**
 * POST /api/adapters/unregister - Unregister agent from platform
 */

import { NextRequest, NextResponse } from 'next/server'
import { unregisterAgentFromPlatform } from '@/lib/adapters/manager'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { agentId } = body

    if (!agentId) {
      return NextResponse.json(
        {
          success: false,
          error: 'agentId is required',
        },
        { status: 400 }
      )
    }

    const result = await unregisterAgentFromPlatform(agentId)

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
      message: 'Agent unregistered from platform',
    })
  } catch (error) {
    console.error('Error unregistering agent:', error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unregistration failed',
      },
      { status: 500 }
    )
  }
}

