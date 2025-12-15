/**
 * Jarvis SDK Endpoint - Get Wallet Balance
 * 
 * GET /api/jarvis/balance?address=0x...
 * 
 * Returns USDC balance on Base for a given wallet address.
 * Jarvis can check if user has sufficient funds before hiring agents.
 */

import { NextRequest, NextResponse } from 'next/server';
import { getWalletBalance } from '@/lib/billing/x402';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const address = searchParams.get('address');

    if (!address) {
      return NextResponse.json(
        {
          success: false,
          error: 'Missing required parameter: address',
        },
        { status: 400 }
      );
    }

    // Get USDC balance on Base
    const balance = await getWalletBalance(address);

    return NextResponse.json({
      success: true,
      wallet: {
        address,
        balance,
        currency: 'USDC',
        chain: 'base',
      },
    });
  } catch (error) {
    console.error('Balance check error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to get balance',
      },
      { status: 500 }
    );
  }
}

