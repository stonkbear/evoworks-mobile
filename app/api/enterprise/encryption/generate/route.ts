/**
 * POST /api/enterprise/encryption/generate - Generate encryption key
 */

import { NextRequest, NextResponse } from 'next/server'
import { generateEncryptionKey } from '@/lib/enterprise/encryption'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { organizationId, name, algorithm } = body

    if (!organizationId || !name) {
      return NextResponse.json(
        {
          success: false,
          error: 'organizationId and name are required',
        },
        { status: 400 }
      )
    }

    const result = await generateEncryptionKey(
      organizationId,
      name,
      algorithm || 'AES-256-GCM'
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
      key: result.key,
      privateKey: result.privateKey,
      message: 'Store the private key securely - it cannot be retrieved later',
    })
  } catch (error) {
    console.error('Error generating encryption key:', error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to generate key',
      },
      { status: 500 }
    )
  }
}

