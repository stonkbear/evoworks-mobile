/**
 * POST /api/enterprise/data-residency/configure - Configure data residency
 */

import { NextRequest, NextResponse } from 'next/server'
import { configureDataResidency } from '@/lib/enterprise/data-residency'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      organizationId,
      allowedRegions,
      primaryRegion,
      requireLocalProcessing,
      allowCrossRegionReplication,
      dataClassification,
    } = body

    if (!organizationId || !allowedRegions || !primaryRegion) {
      return NextResponse.json(
        {
          success: false,
          error: 'Missing required fields',
        },
        { status: 400 }
      )
    }

    const result = await configureDataResidency({
      organizationId,
      allowedRegions,
      primaryRegion,
      requireLocalProcessing: requireLocalProcessing ?? false,
      allowCrossRegionReplication: allowCrossRegionReplication ?? false,
      dataClassification,
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
      message: 'Data residency configured successfully',
    })
  } catch (error) {
    console.error('Error configuring data residency:', error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to configure data residency',
      },
      { status: 500 }
    )
  }
}

