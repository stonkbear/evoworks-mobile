/**
 * Auction Notifications - Notify participants of auction events
 * Email notifications for winners, losers, and buyers
 */

import { prisma } from '@/lib/db/prisma'

export interface NotificationRecipient {
  email: string
  name: string
  role: 'buyer' | 'winner' | 'loser'
}

/**
 * Notify winner of auction
 */
export async function notifyWinner(
  taskId: string,
  winnerId: string,
  winningPrice: number
): Promise<void> {
  try {
    const [task, agent] = await Promise.all([
      prisma.task.findUnique({
        where: { id: taskId },
        include: {
          buyer: true,
        },
      }),
      prisma.agent.findUnique({
        where: { id: winnerId },
        include: {
          owner: true,
        },
      }),
    ])

    if (!task || !agent) {
      console.error('Task or agent not found for notification')
      return
    }

    // In production, send actual email via Resend/SendGrid
    const email = {
      to: agent.owner.email,
      subject: `🎉 You won the auction for "${task.title}"`,
      body: `
Congratulations ${agent.owner.name || 'Agent Creator'}!

Your agent "${agent.name}" won the auction for the task: "${task.title}"

Winning Price: $${winningPrice} ${task.currency}
Buyer: ${task.buyer.name}

You can now begin working on this task. Please deliver by the SLA deadline to maintain your reputation score.

View Task Details: ${process.env.NEXTAUTH_URL}/tasks/${taskId}

Best regards,
Echo Marketplace Team
      `,
    }

    console.log(`[Notification] Winner email sent to ${agent.owner.email}`)

    // TODO: Integrate with actual email service
    // await sendEmail(email)
  } catch (error) {
    console.error('Error notifying winner:', error)
  }
}

/**
 * Notify losers of auction
 */
export async function notifyLosers(taskId: string, winnerId: string): Promise<void> {
  try {
    const task = await prisma.task.findUnique({
      where: { id: taskId },
      include: {
        bids: {
          where: {
            agentId: { not: winnerId },
            status: 'LOST',
          },
          include: {
            agent: {
              include: {
                owner: true,
              },
            },
          },
        },
      },
    })

    if (!task) return

    for (const bid of task.bids) {
      const email = {
        to: bid.agent.owner.email,
        subject: `Auction Update: "${task.title}"`,
        body: `
Hello ${bid.agent.owner.name || 'Agent Creator'},

Thank you for bidding on "${task.title}". Unfortunately, your agent "${bid.agent.name}" was not selected for this task.

Your bid: $${bid.amount} ${task.currency}
Winning bid: (not disclosed)

Don't worry! There are plenty of other opportunities available on Echo Marketplace.

Browse Available Tasks: ${process.env.NEXTAUTH_URL}/tasks

Best regards,
Echo Marketplace Team
        `,
      }

      console.log(`[Notification] Loser email sent to ${bid.agent.owner.email}`)

      // TODO: Integrate with actual email service
      // await sendEmail(email)
    }
  } catch (error) {
    console.error('Error notifying losers:', error)
  }
}

/**
 * Notify buyer of auction completion
 */
export async function notifyBuyer(
  taskId: string,
  winnerId: string,
  winningPrice: number
): Promise<void> {
  try {
    const [task, agent] = await Promise.all([
      prisma.task.findUnique({
        where: { id: taskId },
        include: {
          buyer: true,
        },
      }),
      prisma.agent.findUnique({
        where: { id: winnerId },
      }),
    ])

    if (!task || !agent) return

    const email = {
      to: task.buyer.email,
      subject: `Your task "${task.title}" has been assigned`,
      body: `
Hello ${task.buyer.name || 'Buyer'},

Great news! Your task "${task.title}" has been assigned to a qualified agent.

Agent: ${agent.name}
Final Price: $${winningPrice} ${task.currency}
Number of Bids: ${task.bids?.length || 0}

The agent will begin working on your task shortly. You'll receive notifications when:
- Work begins
- Work is completed
- Payment is processed

Track Progress: ${process.env.NEXTAUTH_URL}/tasks/${taskId}

Best regards,
Echo Marketplace Team
      `,
    }

    console.log(`[Notification] Buyer email sent to ${task.buyer.email}`)

    // TODO: Integrate with actual email service
    // await sendEmail(email)
  } catch (error) {
    console.error('Error notifying buyer:', error)
  }
}

/**
 * Notify all participants (wrapper function)
 */
export async function notifyAllParticipants(
  taskId: string,
  winnerId: string,
  winningPrice: number
): Promise<void> {
  await Promise.all([
    notifyWinner(taskId, winnerId, winningPrice),
    notifyLosers(taskId, winnerId),
    notifyBuyer(taskId, winnerId, winningPrice),
  ])

  console.log(`[Notification] All participants notified for task ${taskId}`)
}

/**
 * Notify about auction closing soon
 */
export async function notifyAuctionClosingSoon(taskId: string): Promise<void> {
  try {
    const task = await prisma.task.findUnique({
      where: { id: taskId },
      include: {
        buyer: true,
      },
    })

    if (!task || !task.auctionEndsAt) return

    const timeRemaining = task.auctionEndsAt.getTime() - Date.now()
    const hoursRemaining = Math.floor(timeRemaining / (1000 * 60 * 60))

    // Get eligible agents who haven't bid yet
    const allAgents = await prisma.agent.findMany({
      where: { status: 'ACTIVE' },
      include: {
        owner: true,
        bids: {
          where: { taskId },
        },
      },
    })

    const nonBidders = allAgents.filter((a) => a.bids.length === 0)

    for (const agent of nonBidders.slice(0, 50)) {
      // Limit to 50
      const email = {
        to: agent.owner.email,
        subject: `⏰ Auction closing in ${hoursRemaining} hours: "${task.title}"`,
        body: `
Hello ${agent.owner.name || 'Agent Creator'},

Don't miss out! An auction is closing soon that your agent might be eligible for.

Task: "${task.title}"
Budget: $${task.maxBudget} ${task.currency}
Closes: ${hoursRemaining} hours

Your agent "${agent.name}" hasn't submitted a bid yet. Submit now before it's too late!

View Task & Bid: ${process.env.NEXTAUTH_URL}/tasks/${taskId}

Best regards,
Echo Marketplace Team
        `,
      }

      console.log(`[Notification] Reminder sent to ${agent.owner.email}`)

      // TODO: Integrate with actual email service
      // await sendEmail(email)
    }
  } catch (error) {
    console.error('Error notifying auction closing:', error)
  }
}

/**
 * Send email (placeholder for actual implementation)
 */
async function sendEmail(email: {
  to: string
  subject: string
  body: string
}): Promise<void> {
  // In production, integrate with Resend, SendGrid, or similar
  // Example with Resend:
  // import { Resend } from 'resend'
  // const resend = new Resend(process.env.RESEND_API_KEY)
  // await resend.emails.send({
  //   from: 'Echo Marketplace <noreply@echomarketplace.io>',
  //   to: email.to,
  //   subject: email.subject,
  //   text: email.body,
  // })

  console.log(`[Email] Would send to ${email.to}: ${email.subject}`)
}

