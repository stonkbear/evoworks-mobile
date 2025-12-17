/**
 * OAuth Authorization API
 * Generate authorization codes for third-party apps (Ghost Flow)
 */

import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import prisma from '@/lib/prisma'
import crypto from 'crypto'

// Registered OAuth clients
const OAUTH_CLIENTS: Record<string, { secret: string; allowedRedirects: string[] }> = {
  'ghostflow': {
    secret: process.env.OAUTH_GHOSTFLOW_SECRET || '',
    allowedRedirects: [
      'https://ghostflow.ai/oauth/callback',
      'https://app.ghostflow.ai/oauth/callback',
      'http://localhost:3001/oauth/callback', // Dev
    ],
  },
}

// In-memory store for auth codes (use Redis in production)
const authCodes = new Map<string, {
  userId: string
  clientId: string
  scope: string
  redirectUri: string
  expiresAt: Date
}>()

/**
 * POST /api/oauth/authorize
 * Generate an authorization code
 */
export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { clientId, redirectUri, scope, userId } = body

    // Validate client
    const client = OAUTH_CLIENTS[clientId]
    if (!client) {
      return NextResponse.json({ error: 'Invalid client_id' }, { status: 400 })
    }

    // Validate redirect URI
    const isValidRedirect = client.allowedRedirects.some(allowed => 
      redirectUri.startsWith(allowed)
    )
    if (!isValidRedirect) {
      return NextResponse.json({ error: 'Invalid redirect_uri' }, { status: 400 })
    }

    // Ensure user owns this request
    if (userId !== session.user.id) {
      return NextResponse.json({ error: 'User mismatch' }, { status: 403 })
    }

    // Generate authorization code
    const code = crypto.randomBytes(32).toString('hex')
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000) // 10 minutes

    // Store code
    authCodes.set(code, {
      userId,
      clientId,
      scope: scope || '',
      redirectUri,
      expiresAt,
    })

    // Clean up expired codes
    for (const [key, value] of authCodes.entries()) {
      if (value.expiresAt < new Date()) {
        authCodes.delete(key)
      }
    }

    return NextResponse.json({ code })
  } catch (error) {
    console.error('OAuth authorize error:', error)
    return NextResponse.json({ error: 'Authorization failed' }, { status: 500 })
  }
}

