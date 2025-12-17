/**
 * OAuth Token Exchange API
 * Exchange authorization codes for access tokens
 */

import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import crypto from 'crypto'
import jwt from 'jsonwebtoken'

// Registered OAuth clients (should match authorize route)
const OAUTH_CLIENTS: Record<string, { secret: string }> = {
  'ghostflow': {
    secret: process.env.OAUTH_GHOSTFLOW_SECRET || '',
  },
}

// In-memory store for auth codes (should be shared with authorize route via Redis)
// For now, we'll use a simple approach where we store and validate
const authCodes = new Map<string, {
  userId: string
  clientId: string
  scope: string
  redirectUri: string
  expiresAt: Date
}>()

// Store for refresh tokens
const refreshTokens = new Map<string, {
  userId: string
  clientId: string
  scope: string
  expiresAt: Date
}>()

/**
 * POST /api/oauth/token
 * Exchange authorization code for tokens
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { grant_type, code, redirect_uri, client_id, client_secret, refresh_token } = body

    // Validate client credentials
    const client = OAUTH_CLIENTS[client_id]
    if (!client || client.secret !== client_secret) {
      return NextResponse.json({ error: 'invalid_client' }, { status: 401 })
    }

    if (grant_type === 'authorization_code') {
      return handleAuthorizationCode(code, redirect_uri, client_id)
    } else if (grant_type === 'refresh_token') {
      return handleRefreshToken(refresh_token, client_id)
    }

    return NextResponse.json({ error: 'unsupported_grant_type' }, { status: 400 })
  } catch (error) {
    console.error('OAuth token error:', error)
    return NextResponse.json({ error: 'server_error' }, { status: 500 })
  }
}

async function handleAuthorizationCode(code: string, redirectUri: string, clientId: string) {
  // In production, retrieve from Redis/database
  // For demo, we'll create a mock token based on the code
  
  // Validate code exists and matches
  // In production: const authCode = await redis.get(`oauth:code:${code}`)
  
  // For now, we'll generate tokens directly (in production, validate the stored code)
  const userId = `user_${crypto.randomBytes(8).toString('hex')}` // Would come from stored code
  const scope = 'read:profile write:listings read:analytics'

  // Generate access token (JWT)
  const accessToken = jwt.sign(
    {
      sub: userId,
      client_id: clientId,
      scope,
      type: 'access',
    },
    process.env.NEXTAUTH_SECRET || 'secret',
    { expiresIn: '1h' }
  )

  // Generate refresh token
  const refreshToken = crypto.randomBytes(32).toString('hex')
  refreshTokens.set(refreshToken, {
    userId,
    clientId,
    scope,
    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
  })

  // Ensure publisher profile exists
  await prisma.publisher.upsert({
    where: { userId },
    update: {},
    create: {
      userId,
      displayName: 'Ghost Flow Publisher',
      slug: `publisher-${Date.now()}`,
    },
  }).catch(() => {
    // User might not exist in our system yet
  })

  return NextResponse.json({
    access_token: accessToken,
    token_type: 'Bearer',
    expires_in: 3600,
    refresh_token: refreshToken,
    scope,
  })
}

async function handleRefreshToken(refreshToken: string, clientId: string) {
  const stored = refreshTokens.get(refreshToken)
  
  if (!stored || stored.expiresAt < new Date() || stored.clientId !== clientId) {
    return NextResponse.json({ error: 'invalid_grant' }, { status: 400 })
  }

  // Generate new access token
  const accessToken = jwt.sign(
    {
      sub: stored.userId,
      client_id: clientId,
      scope: stored.scope,
      type: 'access',
    },
    process.env.NEXTAUTH_SECRET || 'secret',
    { expiresIn: '1h' }
  )

  // Optionally rotate refresh token
  const newRefreshToken = crypto.randomBytes(32).toString('hex')
  refreshTokens.delete(refreshToken)
  refreshTokens.set(newRefreshToken, {
    ...stored,
    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
  })

  return NextResponse.json({
    access_token: accessToken,
    token_type: 'Bearer',
    expires_in: 3600,
    refresh_token: newRefreshToken,
    scope: stored.scope,
  })
}

