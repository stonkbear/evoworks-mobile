/**
 * POST /api/adapters/register - Register agent on platform
 */

import { NextRequest, NextResponse } from 'next/server'
import { registerAgentOnPlatform, Platform } from '@/lib/adapters/manager'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { agentId, platform, config } = body

    if (!agentId || !platform) {
      return NextResponse.json(
        {
          success: false,
          error: 'agentId and platform are required',
        },
        { status: 400 }
      )
    }

    const result = await registerAgentOnPlatform(
      agentId,
      platform as Platform,
      config || {}
    )

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
      platformAgentId: result.platformAgentId,
      message: `Agent registered on ${platform}`,
    })
  } catch (error) {
    console.error('Error registering agent on platform:', error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Registration failed',
      },
      { status: 500 }
    )
  }
}

