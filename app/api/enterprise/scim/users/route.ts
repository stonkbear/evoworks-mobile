/**
 * SCIM 2.0 Users Endpoint
 * GET /api/enterprise/scim/users - List users
 * POST /api/enterprise/scim/users - Provision user
 */

import { NextRequest, NextResponse } from 'next/server'
import { provisionUser, listSCIMUsers, verifySCIMToken } from '@/lib/enterprise/scim'

export async function GET(request: NextRequest) {
  try {
    // Verify SCIM bearer token
    const authHeader = request.headers.get('authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { schemas: ['urn:ietf:params:scim:api:messages:2.0:Error'], detail: 'Unauthorized' },
        { status: 401 }
      )
    }

    const token = authHeader.substring(7)
    const verification = await verifySCIMToken(token)

    if (!verification.valid || !verification.organizationId) {
      return NextResponse.json(
        { schemas: ['urn:ietf:params:scim:api:messages:2.0:Error'], detail: 'Invalid token' },
        { status: 401 }
      )
    }

    // Get pagination parameters
    const { searchParams } = new URL(request.url)
    const startIndex = parseInt(searchParams.get('startIndex') || '1')
    const count = parseInt(searchParams.get('count') || '100')

    const result = await listSCIMUsers(verification.organizationId, startIndex, count)

    return NextResponse.json({
      schemas: ['urn:ietf:params:scim:api:messages:2.0:ListResponse'],
      ...result,
    })
  } catch (error) {
    console.error('Error listing SCIM users:', error)
    return NextResponse.json(
      {
        schemas: ['urn:ietf:params:scim:api:messages:2.0:Error'],
        detail: error instanceof Error ? error.message : 'Internal server error',
      },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    // Verify SCIM bearer token
    const authHeader = request.headers.get('authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { schemas: ['urn:ietf:params:scim:api:messages:2.0:Error'], detail: 'Unauthorized' },
        { status: 401 }
      )
    }

    const token = authHeader.substring(7)
    const verification = await verifySCIMToken(token)

    if (!verification.valid || !verification.organizationId) {
      return NextResponse.json(
        { schemas: ['urn:ietf:params:scim:api:messages:2.0:Error'], detail: 'Invalid token' },
        { status: 401 }
      )
    }

    const userData = await request.json()

    const result = await provisionUser(verification.organizationId, userData)

    if (!result.success) {
      return NextResponse.json(
        {
          schemas: ['urn:ietf:params:scim:api:messages:2.0:Error'],
          detail: result.error || 'Failed to provision user',
        },
        { status: 400 }
      )
    }

    return NextResponse.json(
      {
        schemas: ['urn:ietf:params:scim:schemas:core:2.0:User'],
        id: result.user.id,
        userName: result.user.email,
        active: true,
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('Error provisioning SCIM user:', error)
    return NextResponse.json(
      {
        schemas: ['urn:ietf:params:scim:api:messages:2.0:Error'],
        detail: error instanceof Error ? error.message : 'Internal server error',
      },
      { status: 500 }
    )
  }
}

