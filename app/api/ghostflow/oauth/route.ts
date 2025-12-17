/**
 * Ghost Flow OAuth Flow
 * Connect Ghost Flow accounts to Evoworks publishers
 */

import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import prisma from '@/lib/prisma'
import { getGhostFlowClient } from '@/lib/ghostflow/client'
import crypto from 'crypto'

// Generate OAuth authorization URL
export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const action = searchParams.get('action')

    if (action === 'start') {
      // Generate OAuth state with CSRF protection
      const nonce = crypto.randomBytes(16).toString('hex')
      const state = Buffer.from(JSON.stringify({
        userId: session.user.id,
        nonce,
        returnUrl: searchParams.get('returnUrl') || '/dashboard/publisher',
      })).toString('base64url')

      // Build Ghost Flow OAuth URL
      const ghostFlowUrl = process.env.GHOSTFLOW_API_URL || 'https://ghostflow.ai'
      const clientId = process.env.GHOSTFLOW_CLIENT_ID
      const redirectUri = `${process.env.NEXTAUTH_URL}/api/ghostflow/oauth/callback`
      const scopes = 'read:boards read:agents read:swarms publish:marketplace'

      const authUrl = new URL(`${ghostFlowUrl}/oauth/authorize`)
      authUrl.searchParams.set('client_id', clientId || '')
      authUrl.searchParams.set('redirect_uri', redirectUri)
      authUrl.searchParams.set('response_type', 'code')
      authUrl.searchParams.set('scope', scopes)
      authUrl.searchParams.set('state', state)

      return NextResponse.json({ url: authUrl.toString() })
    }

    // Get connection status
    const publisher = await prisma.publisher.findUnique({
      where: { userId: session.user.id },
      select: {
        ghostFlowOrgId: true,
      },
    })

    return NextResponse.json({
      connected: !!publisher?.ghostFlowOrgId,
      ghostFlowOrgId: publisher?.ghostFlowOrgId,
    })
  } catch (error) {
    console.error('Ghost Flow OAuth error:', error)
    return NextResponse.json({ error: 'OAuth error' }, { status: 500 })
  }
}

// Disconnect Ghost Flow account
export async function DELETE(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    await prisma.publisher.update({
      where: { userId: session.user.id },
      data: {
        ghostFlowOrgId: null,
        ghostFlowApiKey: null,
      },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Ghost Flow disconnect error:', error)
    return NextResponse.json({ error: 'Disconnect failed' }, { status: 500 })
  }
}

