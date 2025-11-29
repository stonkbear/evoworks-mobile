/**
 * POST /api/enterprise/data-residency/validate - Validate agent residency
 */

import { NextRequest, NextResponse } from 'next/server'
import { validateAgentResidency } from '@/lib/enterprise/data-residency'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { agentId, organizationId } = body

    if (!agentId || !organizationId) {
      return NextResponse.json(
        {
          success: false,
          error: 'agentId and organizationId are required',
        },
        { status: 400 }
      )
    }

    const result = await validateAgentResidency(agentId, organizationId)

    return NextResponse.json({
      success: true,
      allowed: result.allowed,
      reason: result.reason,
    })
  } catch (error) {
    console.error('Error validating agent residency:', error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to validate residency',
      },
      { status: 500 }
    )
  }
}

