import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db/prisma'
import { closeAuction } from '@/lib/auction/manager'
import { notifyAllParticipants } from '@/lib/auction/notifications'
import { TaskStatus } from '@prisma/client'

/**
 * GET /api/cron/auction-close
 * Auto-close expired auctions (run every minute)
 */
export async function GET() {
  try {
    console.log('[Cron] Checking for expired auctions...')

    // Find auctions that should be closed
    const expiredTasks = await prisma.task.findMany({
      where: {
        status: TaskStatus.OPEN,
        auctionEndsAt: {
          lte: new Date(),
        },
      },
      take: 10, // Process 10 at a time
    })

    if (expiredTasks.length === 0) {
      console.log('[Cron] No expired auctions found')
      return NextResponse.json({
        success: true,
        message: 'No expired auctions',
        processed: 0,
      })
    }

    console.log(`[Cron] Found ${expiredTasks.length} expired auctions`)

    const results = []

    for (const task of expiredTasks) {
      try {
        const result = await closeAuction(task.id)

        if (result.success && result.winnerId && result.winningBid) {
          // Notify participants
          await notifyAllParticipants(task.id, result.winnerId, result.winningBid)

          results.push({
            taskId: task.id,
            success: true,
            winnerId: result.winnerId,
          })
        } else {
          results.push({
            taskId: task.id,
            success: false,
            error: result.error,
          })
        }
      } catch (error) {
        console.error(`[Cron] Error closing auction ${task.id}:`, error)
        results.push({
          taskId: task.id,
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error',
        })
      }
    }

    console.log(`[Cron] Auction close job completed. Processed ${results.length} auctions`)

    return NextResponse.json({
      success: true,
      message: `Processed ${results.length} expired auctions`,
      processed: results.length,
      results,
    })
  } catch (error) {
    console.error('[Cron] Error in auction close job:', error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}

