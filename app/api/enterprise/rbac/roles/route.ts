/**
 * GET /api/enterprise/rbac/roles - List roles
 * POST /api/enterprise/rbac/roles - Create role
 */

import { NextRequest, NextResponse } from 'next/server'
import { listRoles, createRole } from '@/lib/enterprise/rbac'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const organizationId = searchParams.get('organizationId')

    if (!organizationId) {
      return NextResponse.json(
        {
          success: false,
          error: 'organizationId is required',
        },
        { status: 400 }
      )
    }

    const roles = await listRoles(organizationId)

    return NextResponse.json({
      success: true,
      roles,
      count: roles.length,
    })
  } catch (error) {
    console.error('Error listing roles:', error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to list roles',
      },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { organizationId, name, description, permissions } = body

    if (!organizationId || !name || !permissions) {
      return NextResponse.json(
        {
          success: false,
          error: 'Missing required fields',
        },
        { status: 400 }
      )
    }

    const result = await createRole(organizationId, {
      name,
      description,
      permissions,
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
      role: result.role,
    })
  } catch (error) {
    console.error('Error creating role:', error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to create role',
      },
      { status: 500 }
    )
  }
}

