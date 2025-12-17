/**
 * Payout Settings API
 * GET/PATCH - Manage publisher payout preferences
 */

import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { auth } from '@/lib/auth'
import { PayoutMethod } from '@prisma/client'

interface PayoutSettings {
  preferredMethod: PayoutMethod
  usdcAddress?: string
  ethAddress?: string
  stripeConnectId?: string
  paypalEmail?: string
  autoPayoutEnabled: boolean
  autoPayoutThreshold: number // USD
}

// GET /api/payouts/settings
export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const publisher = await prisma.publisher.findUnique({
      where: { userId: session.user.id },
      select: {
        id: true,
        payoutSettings: true,
      },
    })

    if (!publisher) {
      return NextResponse.json({ error: 'Publisher not found' }, { status: 404 })
    }

    // Parse stored settings or return defaults
    const settings: PayoutSettings = publisher.payoutSettings as PayoutSettings || {
      preferredMethod: 'USDC',
      autoPayoutEnabled: false,
      autoPayoutThreshold: 100,
    }

    return NextResponse.json(settings)
  } catch (error) {
    console.error('Error fetching payout settings:', error)
    return NextResponse.json({ error: 'Failed to fetch settings' }, { status: 500 })
  }
}

// PATCH /api/payouts/settings
export async function PATCH(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const {
      preferredMethod,
      usdcAddress,
      ethAddress,
      stripeConnectId,
      paypalEmail,
      autoPayoutEnabled,
      autoPayoutThreshold,
    } = body

    // Validate method
    if (preferredMethod && !Object.values(PayoutMethod).includes(preferredMethod)) {
      return NextResponse.json(
        { error: 'Invalid payout method' },
        { status: 400 }
      )
    }

    // Validate addresses based on method
    if (preferredMethod === 'USDC' && !usdcAddress) {
      return NextResponse.json(
        { error: 'USDC address required for USDC payouts' },
        { status: 400 }
      )
    }

    if (preferredMethod === 'ETH' && !ethAddress) {
      return NextResponse.json(
        { error: 'ETH address required for ETH payouts' },
        { status: 400 }
      )
    }

    // Basic address validation
    if (usdcAddress && !isValidEthAddress(usdcAddress)) {
      return NextResponse.json(
        { error: 'Invalid USDC address' },
        { status: 400 }
      )
    }

    if (ethAddress && !isValidEthAddress(ethAddress)) {
      return NextResponse.json(
        { error: 'Invalid ETH address' },
        { status: 400 }
      )
    }

    // Get publisher
    const publisher = await prisma.publisher.findUnique({
      where: { userId: session.user.id },
    })

    if (!publisher) {
      return NextResponse.json({ error: 'Publisher not found' }, { status: 404 })
    }

    // Build settings object
    const currentSettings = publisher.payoutSettings as PayoutSettings || {}
    const newSettings: PayoutSettings = {
      ...currentSettings,
      preferredMethod: preferredMethod || currentSettings.preferredMethod || 'USDC',
      usdcAddress: usdcAddress ?? currentSettings.usdcAddress,
      ethAddress: ethAddress ?? currentSettings.ethAddress,
      stripeConnectId: stripeConnectId ?? currentSettings.stripeConnectId,
      paypalEmail: paypalEmail ?? currentSettings.paypalEmail,
      autoPayoutEnabled: autoPayoutEnabled ?? currentSettings.autoPayoutEnabled ?? false,
      autoPayoutThreshold: autoPayoutThreshold ?? currentSettings.autoPayoutThreshold ?? 100,
    }

    // Update publisher
    await prisma.publisher.update({
      where: { id: publisher.id },
      data: {
        payoutSettings: newSettings as any,
      },
    })

    return NextResponse.json({
      success: true,
      settings: newSettings,
      message: 'Payout settings updated successfully',
    })
  } catch (error) {
    console.error('Error updating payout settings:', error)
    return NextResponse.json({ error: 'Failed to update settings' }, { status: 500 })
  }
}

// Helper: Validate Ethereum address
function isValidEthAddress(address: string): boolean {
  return /^0x[a-fA-F0-9]{40}$/.test(address)
}

