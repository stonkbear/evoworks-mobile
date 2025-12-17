/**
 * Ghost Flow OAuth Callback
 * Handle OAuth redirect from Ghost Flow
 */

import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { getGhostFlowClient, createUserClient } from '@/lib/ghostflow/client'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const code = searchParams.get('code')
    const state = searchParams.get('state')
    const error = searchParams.get('error')

    // Handle OAuth errors
    if (error) {
      const errorUrl = new URL('/dashboard/publisher', request.url)
      errorUrl.searchParams.set('error', 'oauth_denied')
      return NextResponse.redirect(errorUrl)
    }

    if (!code || !state) {
      const errorUrl = new URL('/dashboard/publisher', request.url)
      errorUrl.searchParams.set('error', 'invalid_oauth_response')
      return NextResponse.redirect(errorUrl)
    }

    // Decode and validate state
    let stateData: { userId: string; nonce: string; returnUrl: string }
    try {
      stateData = JSON.parse(Buffer.from(state, 'base64url').toString())
    } catch {
      const errorUrl = new URL('/dashboard/publisher', request.url)
      errorUrl.searchParams.set('error', 'invalid_state')
      return NextResponse.redirect(errorUrl)
    }

    const { userId, returnUrl } = stateData

    // Exchange code for tokens
    const ghostFlowClient = getGhostFlowClient()
    const redirectUri = `${process.env.NEXTAUTH_URL}/api/ghostflow/oauth/callback`
    
    const tokens = await ghostFlowClient.exchangeOAuthCode(code, redirectUri)

    // Get Ghost Flow user info
    const userClient = createUserClient(tokens.access_token)
    const ghostFlowUser = await userClient.getCurrentUser()

    // Update publisher with Ghost Flow connection
    await prisma.publisher.upsert({
      where: { userId },
      update: {
        ghostFlowOrgId: ghostFlowUser.orgId,
        // Store encrypted API token (in production, use proper encryption)
        ghostFlowApiKey: tokens.refresh_token,
      },
      create: {
        userId,
        displayName: ghostFlowUser.orgName,
        slug: ghostFlowUser.orgName.toLowerCase().replace(/\s+/g, '-'),
        ghostFlowOrgId: ghostFlowUser.orgId,
        ghostFlowApiKey: tokens.refresh_token,
      },
    })

    // Redirect back to dashboard
    const successUrl = new URL(returnUrl || '/dashboard/publisher', request.url)
    successUrl.searchParams.set('connected', 'ghostflow')
    
    return NextResponse.redirect(successUrl)
  } catch (error) {
    console.error('Ghost Flow OAuth callback error:', error)
    const errorUrl = new URL('/dashboard/publisher', process.env.NEXTAUTH_URL || request.url)
    errorUrl.searchParams.set('error', 'oauth_failed')
    return NextResponse.redirect(errorUrl)
  }
}

