/**
 * POST /api/enterprise/sso/configure - Configure SAML SSO
 */

import { NextRequest, NextResponse } from 'next/server'
import { configureSAML, SSOConfig } from '@/lib/enterprise/sso'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { organizationId, provider, entityId, ssoUrl, certificate, enabled, attributeMapping } =
      body

    if (!organizationId || !provider || !entityId || !ssoUrl || !certificate) {
      return NextResponse.json(
        {
          success: false,
          error: 'Missing required fields',
        },
        { status: 400 }
      )
    }

    const result = await configureSAML(organizationId, {
      provider,
      entityId,
      ssoUrl,
      certificate,
      enabled: enabled ?? true,
      attributeMapping,
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
      message: 'SAML SSO configured successfully',
    })
  } catch (error) {
    console.error('Error configuring SSO:', error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to configure SSO',
      },
      { status: 500 }
    )
  }
}

