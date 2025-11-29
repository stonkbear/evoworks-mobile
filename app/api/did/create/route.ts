import { NextRequest, NextResponse } from 'next/server'
import { createAgentDID, createUserDID, createOrgDID } from '@/lib/did/manager'

/**
 * POST /api/did/create
 * Create a new DID
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { type } = body // 'agent', 'user', or 'org'

    if (!type || !['agent', 'user', 'org'].includes(type)) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'INVALID_TYPE',
            message: 'Type must be one of: agent, user, org',
          },
        },
        { status: 400 }
      )
    }

    let result
    switch (type) {
      case 'agent':
        result = await createAgentDID()
        break
      case 'user':
        result = await createUserDID()
        break
      case 'org':
        result = await createOrgDID()
        break
    }

    return NextResponse.json({
      success: true,
      data: result,
    })
  } catch (error) {
    console.error('Error creating DID:', error)
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'CREATE_ERROR',
          message: error instanceof Error ? error.message : 'Failed to create DID',
        },
      },
      { status: 500 }
    )
  }
}

