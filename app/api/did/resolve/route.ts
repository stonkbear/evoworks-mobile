import { NextRequest, NextResponse } from 'next/server'
import { resolveDID } from '@/lib/did/manager'

/**
 * GET /api/did/resolve?did=did:key:...
 * Resolve a DID to its DID Document
 */
export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams
    const did = searchParams.get('did')

    if (!did) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'MISSING_DID',
            message: 'DID parameter is required',
          },
        },
        { status: 400 }
      )
    }

    const didDocument = await resolveDID(did)

    return NextResponse.json({
      success: true,
      data: {
        did,
        didDocument,
      },
    })
  } catch (error) {
    console.error('Error resolving DID:', error)
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'RESOLVE_ERROR',
          message: error instanceof Error ? error.message : 'Failed to resolve DID',
        },
      },
      { status: 500 }
    )
  }
}

