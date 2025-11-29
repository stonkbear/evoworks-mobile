/**
 * GET /api/audit/{entityType}/{entityId} - Get audit trail for an entity
 */

import { NextRequest, NextResponse } from 'next/server'
import { getAuditTrail } from '@/lib/observability/audit'

interface RouteParams {
  params: {
    entityType: string
    entityId: string
  }
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { entityType, entityId } = params
    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '100')

    // Validate entity type
    if (!['agent', 'user', 'task'].includes(entityType)) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid entity type. Must be agent, user, or task',
        },
        { status: 400 }
      )
    }

    const trail = await getAuditTrail(
      entityType as 'agent' | 'user' | 'task',
      entityId,
      limit
    )

    return NextResponse.json({
      success: true,
      entityType,
      entityId,
      trail,
      count: trail.length,
    })
  } catch (error) {
    console.error('Error getting audit trail:', error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to get audit trail',
      },
      { status: 500 }
    )
  }
}

