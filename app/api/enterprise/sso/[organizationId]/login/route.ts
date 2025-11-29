/**
 * GET /api/enterprise/sso/{organizationId}/login - Initiate SAML login
 */

import { NextRequest, NextResponse } from 'next/server'
import { initiateSAMLAuth } from '@/lib/enterprise/sso'

interface RouteParams {
  params: {
    organizationId: string
  }
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { organizationId } = params

    const result = await initiateSAMLAuth(organizationId)

    if (!result.success || !result.redirectUrl) {
      return NextResponse.json(
        {
          success: false,
          error: result.error || 'Failed to initiate SSO',
        },
        { status: 400 }
      )
    }

    // Redirect to IdP
    return NextResponse.redirect(result.redirectUrl)
  } catch (error) {
    console.error('Error initiating SSO:', error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to initiate SSO',
      },
      { status: 500 }
    )
  }
}

