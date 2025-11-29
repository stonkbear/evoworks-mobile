/**
 * POST /api/enterprise/encryption/rotate - Rotate encryption key
 */

import { NextRequest, NextResponse } from 'next/server'
import { rotateEncryptionKey } from '@/lib/enterprise/encryption'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { organizationId, keyId } = body

    if (!organizationId || !keyId) {
      return NextResponse.json(
        {
          success: false,
          error: 'organizationId and keyId are required',
        },
        { status: 400 }
      )
    }

    const result = await rotateEncryptionKey(organizationId, keyId)

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
      newKeyId: result.newKeyId,
      message: 'Key rotated successfully',
    })
  } catch (error) {
    console.error('Error rotating encryption key:', error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to rotate key',
      },
      { status: 500 }
    )
  }
}

