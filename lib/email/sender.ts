/**
 * Email Sender Service
 * Handles sending transactional emails
 */

import * as templates from './templates'

interface EmailConfig {
  to: string
  subject: string
  html: string
}

// Email sending function (supports multiple providers)
async function sendEmail(config: EmailConfig): Promise<boolean> {
  const provider = process.env.EMAIL_PROVIDER || 'console'

  try {
    switch (provider) {
      case 'resend':
        return await sendViaResend(config)
      case 'sendgrid':
        return await sendViaSendGrid(config)
      case 'smtp':
        return await sendViaSMTP(config)
      default:
        // Console logging for development
        console.log('📧 Email would be sent:')
        console.log(`   To: ${config.to}`)
        console.log(`   Subject: ${config.subject}`)
        console.log(`   Preview: ${config.html.slice(0, 100)}...`)
        return true
    }
  } catch (error) {
    console.error('Failed to send email:', error)
    return false
  }
}

// Resend provider
async function sendViaResend(config: EmailConfig): Promise<boolean> {
  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: process.env.EMAIL_FROM || 'Evoworks <noreply@evoworks.ai>',
      to: config.to,
      subject: config.subject,
      html: config.html,
    }),
  })

  return response.ok
}

// SendGrid provider
async function sendViaSendGrid(config: EmailConfig): Promise<boolean> {
  const response = await fetch('https://api.sendgrid.com/v3/mail/send', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.SENDGRID_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      personalizations: [{ to: [{ email: config.to }] }],
      from: { email: process.env.EMAIL_FROM || 'noreply@evoworks.ai' },
      subject: config.subject,
      content: [{ type: 'text/html', value: config.html }],
    }),
  })

  return response.ok
}

// SMTP provider (using nodemailer-style fetch)
async function sendViaSMTP(config: EmailConfig): Promise<boolean> {
  // For SMTP, you'd typically use nodemailer
  // This is a placeholder - in production, use nodemailer
  console.log('SMTP sending not implemented - use nodemailer')
  return false
}

// ============================================================================
// PUBLIC EMAIL FUNCTIONS
// ============================================================================

export async function sendPurchaseConfirmation(
  buyerEmail: string,
  data: Parameters<typeof templates.purchaseConfirmation>[0]
): Promise<boolean> {
  const { subject, html } = templates.purchaseConfirmation(data)
  return sendEmail({ to: buyerEmail, subject, html })
}

export async function sendSaleNotification(
  publisherEmail: string,
  data: Parameters<typeof templates.saleNotification>[0]
): Promise<boolean> {
  const { subject, html } = templates.saleNotification(data)
  return sendEmail({ to: publisherEmail, subject, html })
}

export async function sendPayoutInitiated(
  publisherEmail: string,
  data: Parameters<typeof templates.payoutInitiated>[0]
): Promise<boolean> {
  const { subject, html } = templates.payoutInitiated(data)
  return sendEmail({ to: publisherEmail, subject, html })
}

export async function sendPayoutCompleted(
  publisherEmail: string,
  data: Parameters<typeof templates.payoutCompleted>[0]
): Promise<boolean> {
  const { subject, html } = templates.payoutCompleted(data)
  return sendEmail({ to: publisherEmail, subject, html })
}

export async function sendListingApproved(
  publisherEmail: string,
  data: Parameters<typeof templates.listingApproved>[0]
): Promise<boolean> {
  const { subject, html } = templates.listingApproved(data)
  return sendEmail({ to: publisherEmail, subject, html })
}

export async function sendListingRejected(
  publisherEmail: string,
  data: Parameters<typeof templates.listingRejected>[0]
): Promise<boolean> {
  const { subject, html } = templates.listingRejected(data)
  return sendEmail({ to: publisherEmail, subject, html })
}

export async function sendNewReview(
  publisherEmail: string,
  data: Parameters<typeof templates.newReview>[0]
): Promise<boolean> {
  const { subject, html } = templates.newReview(data)
  return sendEmail({ to: publisherEmail, subject, html })
}

export async function sendWeeklyDigest(
  publisherEmail: string,
  data: Parameters<typeof templates.weeklyDigest>[0]
): Promise<boolean> {
  const { subject, html } = templates.weeklyDigest(data)
  return sendEmail({ to: publisherEmail, subject, html })
}

