/**
 * POST /api/enterprise/rbac/permissions/check - Check if user has permission
 */

import { NextRequest, NextResponse } from 'next/server'
import { hasPermission, hasAllPermissions, hasAnyPermission } from '@/lib/enterprise/rbac'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { userId, permission, permissions, mode } = body

    if (!userId) {
      return NextResponse.json(
        {
          success: false,
          error: 'userId is required',
        },
        { status: 400 }
      )
    }

    let authorized = false

    if (permissions && Array.isArray(permissions)) {
      // Check multiple permissions
      if (mode === 'any') {
        authorized = await hasAnyPermission(userId, permissions)
      } else {
        // Default to 'all'
        authorized = await hasAllPermissions(userId, permissions)
      }
    } else if (permission) {
      // Check single permission
      authorized = await hasPermission(userId, permission)
    } else {
      return NextResponse.json(
        {
          success: false,
          error: 'permission or permissions is required',
        },
        { status: 400 }
      )
    }

    return NextResponse.json({
      success: true,
      authorized,
    })
  } catch (error) {
    console.error('Error checking permission:', error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to check permission',
      },
      { status: 500 }
    )
  }
}

