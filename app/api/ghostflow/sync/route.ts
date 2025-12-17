/**
 * Ghost Flow Sync API
 * Sync publisher's Ghost Flow assets to Evoworks
 */

import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import prisma from '@/lib/prisma'
import { createUserClient } from '@/lib/ghostflow/client'
import { GHOSTFLOW_TYPE_MAP } from '@/lib/ghostflow/types'

/**
 * GET /api/ghostflow/sync
 * Get list of syncable assets from Ghost Flow
 */
export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get publisher with Ghost Flow connection
    const publisher = await prisma.publisher.findUnique({
      where: { userId: session.user.id },
      select: {
        id: true,
        ghostFlowOrgId: true,
        ghostFlowApiKey: true,
      },
    })

    if (!publisher?.ghostFlowOrgId || !publisher?.ghostFlowApiKey) {
      return NextResponse.json({
        connected: false,
        error: 'Ghost Flow not connected',
      })
    }

    // Create authenticated client
    const client = createUserClient(publisher.ghostFlowApiKey)

    // Fetch assets from Ghost Flow
    const [boards, agents, swarms] = await Promise.all([
      client.listBoards(publisher.ghostFlowOrgId).catch(() => []),
      client.listAgents().catch(() => []),
      client.listSwarms().catch(() => []),
    ])

    // Get existing listings to show sync status
    const existingListings = await prisma.marketplaceListing.findMany({
      where: { publisherId: publisher.id },
      select: {
        ghostFlowId: true,
        ghostFlowType: true,
        name: true,
        status: true,
      },
    })

    const syncedIds = new Set(existingListings.map(l => l.ghostFlowId).filter(Boolean))

    // Format assets for response
    const assets = [
      ...boards.map((b: any) => ({
        id: b.id,
        type: 'automation' as const,
        name: b.name,
        description: b.description,
        nodeCount: b.nodes?.length || 0,
        synced: syncedIds.has(b.id),
        lastModified: b.updatedAt,
      })),
      ...agents.map((a: any) => ({
        id: a.id,
        type: 'agent' as const,
        name: a.name,
        description: a.role || a.description,
        model: a.model,
        synced: syncedIds.has(a.id),
        lastModified: a.updatedAt,
      })),
      ...swarms.map((s: any) => ({
        id: s.id,
        type: 'swarm' as const,
        name: s.name,
        description: s.description,
        agentCount: s.agents?.length || 0,
        synced: syncedIds.has(s.id),
        lastModified: s.updatedAt,
      })),
    ]

    return NextResponse.json({
      connected: true,
      orgId: publisher.ghostFlowOrgId,
      assets,
      existingListings,
    })
  } catch (error) {
    console.error('Ghost Flow sync error:', error)
    return NextResponse.json({ error: 'Sync failed' }, { status: 500 })
  }
}

/**
 * POST /api/ghostflow/sync
 * Import selected assets from Ghost Flow
 */
export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { assetIds, assetType } = body

    if (!assetIds?.length || !assetType) {
      return NextResponse.json({ error: 'Missing assetIds or assetType' }, { status: 400 })
    }

    // Get publisher with Ghost Flow connection
    const publisher = await prisma.publisher.findUnique({
      where: { userId: session.user.id },
      select: {
        id: true,
        ghostFlowOrgId: true,
        ghostFlowApiKey: true,
      },
    })

    if (!publisher?.ghostFlowOrgId || !publisher?.ghostFlowApiKey) {
      return NextResponse.json({ error: 'Ghost Flow not connected' }, { status: 400 })
    }

    // Create authenticated client
    const client = createUserClient(publisher.ghostFlowApiKey)

    // Get Ghost Flow listings for these assets
    const ghostFlowListings = await client.getMyListings()
    const listingMap = new Map(ghostFlowListings.map(l => [l.ghostFlowId, l]))

    // Import each asset
    const imported: string[] = []
    const errors: Array<{ id: string; error: string }> = []

    for (const assetId of assetIds) {
      try {
        // Check if already exists
        const existing = await prisma.marketplaceListing.findFirst({
          where: {
            publisherId: publisher.id,
            ghostFlowId: assetId,
          },
        })

        if (existing) {
          // Update existing listing
          const ghostFlowListing = listingMap.get(assetId)
          if (ghostFlowListing) {
            await prisma.marketplaceListing.update({
              where: { id: existing.id },
              data: {
                name: ghostFlowListing.name,
                shortDescription: ghostFlowListing.description,
              },
            })
          }
          imported.push(assetId)
          continue
        }

        // Get asset details from Ghost Flow
        let assetDetails: any
        if (assetType === 'automation') {
          assetDetails = await client.getBoard(assetId)
        }
        // Add other asset type fetches as needed

        const name = assetDetails?.name || `Untitled ${assetType}`
        const description = assetDetails?.description || ''

        // Create new listing
        await prisma.marketplaceListing.create({
          data: {
            publisherId: publisher.id,
            ghostFlowId: assetId,
            ghostFlowType: assetType,
            ghostFlowConfig: assetDetails,
            slug: `${name.toLowerCase().replace(/\s+/g, '-')}-${Date.now()}`,
            name,
            shortDescription: description.slice(0, 200),
            longDescription: description,
            type: (GHOSTFLOW_TYPE_MAP[assetType as keyof typeof GHOSTFLOW_TYPE_MAP] || 'WORKFLOW') as any,
            category: 'Uncategorized',
            tags: [],
            pricingModel: 'FREE',
            status: 'DRAFT',
            nodeCount: assetDetails?.nodes?.length,
          },
        })

        // Update publisher listing count
        await prisma.publisher.update({
          where: { id: publisher.id },
          data: { totalListings: { increment: 1 } },
        })

        imported.push(assetId)
      } catch (err) {
        console.error(`Failed to import asset ${assetId}:`, err)
        errors.push({
          id: assetId,
          error: err instanceof Error ? err.message : 'Import failed',
        })
      }
    }

    return NextResponse.json({
      success: true,
      imported,
      errors,
    })
  } catch (error) {
    console.error('Ghost Flow import error:', error)
    return NextResponse.json({ error: 'Import failed' }, { status: 500 })
  }
}

