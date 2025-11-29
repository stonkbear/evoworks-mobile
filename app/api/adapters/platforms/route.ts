/**
 * GET /api/adapters/platforms - List supported platforms
 */

import { NextRequest, NextResponse } from 'next/server'
import { listPlatforms, getPlatformCapabilities } from '@/lib/adapters/manager'

export async function GET(request: NextRequest) {
  try {
    const platforms = listPlatforms()

    const platformsWithCapabilities = platforms.map((platform) => ({
      platform,
      ...getPlatformCapabilities(platform),
    }))

    return NextResponse.json({
      success: true,
      platforms: platformsWithCapabilities,
      count: platforms.length,
    })
  } catch (error) {
    console.error('Error listing platforms:', error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to list platforms',
      },
      { status: 500 }
    )
  }
}

