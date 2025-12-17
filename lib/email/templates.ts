/**
 * Email Templates
 * HTML email templates for transactional emails
 */

const baseStyles = `
  body { 
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    background-color: #0a0a0a;
    color: #ffffff;
    margin: 0;
    padding: 0;
  }
  .container {
    max-width: 600px;
    margin: 0 auto;
    padding: 40px 20px;
  }
  .card {
    background: #111111;
    border: 1px solid #222222;
    border-radius: 16px;
    padding: 32px;
    margin: 20px 0;
  }
  .header {
    text-align: center;
    margin-bottom: 32px;
  }
  .logo {
    font-size: 32px;
    font-weight: bold;
    background: linear-gradient(135deg, #8b5cf6, #d946ef);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }
  h1 { color: #ffffff; font-size: 24px; margin: 0 0 16px 0; }
  h2 { color: #ffffff; font-size: 20px; margin: 0 0 12px 0; }
  p { color: #888888; line-height: 1.6; margin: 0 0 16px 0; }
  .highlight { color: #ffffff; }
  .amount { 
    font-size: 36px; 
    font-weight: bold; 
    color: #10b981;
    margin: 16px 0;
  }
  .button {
    display: inline-block;
    background: linear-gradient(135deg, #8b5cf6, #d946ef);
    color: #ffffff !important;
    text-decoration: none;
    padding: 14px 28px;
    border-radius: 8px;
    font-weight: 600;
    margin: 16px 0;
  }
  .stats {
    display: flex;
    gap: 16px;
    margin: 24px 0;
  }
  .stat {
    flex: 1;
    background: #0a0a0a;
    border-radius: 8px;
    padding: 16px;
    text-align: center;
  }
  .stat-value { font-size: 24px; font-weight: bold; color: #ffffff; }
  .stat-label { font-size: 12px; color: #666666; text-transform: uppercase; }
  .footer {
    text-align: center;
    color: #444444;
    font-size: 12px;
    margin-top: 32px;
  }
  .divider {
    border: none;
    border-top: 1px solid #222222;
    margin: 24px 0;
  }
  .listing-card {
    background: #0a0a0a;
    border-radius: 12px;
    padding: 16px;
    display: flex;
    gap: 16px;
    align-items: center;
    margin: 16px 0;
  }
  .listing-icon {
    width: 48px;
    height: 48px;
    border-radius: 8px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 24px;
  }
  .listing-info { flex: 1; }
  .listing-name { font-weight: 600; color: #ffffff; }
  .listing-meta { font-size: 14px; color: #666666; }
`

function wrapTemplate(content: string): string {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>${baseStyles}</style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="logo">🦇 Evoworks</div>
    </div>
    ${content}
    <div class="footer">
      <p>© ${new Date().getFullYear()} Evoworks. All rights reserved.</p>
      <p>You're receiving this because you have an account on Evoworks.</p>
    </div>
  </div>
</body>
</html>
`
}

// ============================================================================
// PURCHASE EMAILS
// ============================================================================

export function purchaseConfirmation(data: {
  buyerName: string
  listingName: string
  listingType: string
  amount: number
  transactionId: string
  publisherName: string
  dashboardUrl: string
}): { subject: string; html: string } {
  return {
    subject: `✅ Purchase confirmed: ${data.listingName}`,
    html: wrapTemplate(`
      <div class="card">
        <h1>Purchase Confirmed! 🎉</h1>
        <p>Hey ${data.buyerName},</p>
        <p>Your purchase was successful. You now have access to:</p>
        
        <div class="listing-card">
          <div class="listing-icon" style="background: linear-gradient(135deg, #8b5cf6, #d946ef);">
            ${data.listingType === 'AGENT' ? '🤖' : data.listingType === 'WORKFLOW' ? '⚡' : '🐝'}
          </div>
          <div class="listing-info">
            <div class="listing-name">${data.listingName}</div>
            <div class="listing-meta">by ${data.publisherName}</div>
          </div>
        </div>
        
        <hr class="divider">
        
        <table style="width: 100%; color: #888;">
          <tr>
            <td>Amount paid</td>
            <td style="text-align: right; color: #fff;">$${data.amount.toFixed(2)}</td>
          </tr>
          <tr>
            <td>Transaction ID</td>
            <td style="text-align: right; color: #666; font-family: monospace; font-size: 12px;">${data.transactionId}</td>
          </tr>
        </table>
        
        <div style="text-align: center; margin-top: 24px;">
          <a href="${data.dashboardUrl}" class="button">View in Dashboard</a>
        </div>
      </div>
    `),
  }
}

export function saleNotification(data: {
  publisherName: string
  listingName: string
  buyerName: string
  amount: number
  platformFee: number
  netAmount: number
  totalRevenue: number
  dashboardUrl: string
}): { subject: string; html: string } {
  return {
    subject: `💰 New sale: ${data.listingName} (+$${data.netAmount.toFixed(2)})`,
    html: wrapTemplate(`
      <div class="card">
        <h1>You made a sale! 💰</h1>
        <p>Hey ${data.publisherName},</p>
        <p>Great news! Someone just purchased your listing.</p>
        
        <div class="amount">+$${data.netAmount.toFixed(2)}</div>
        
        <div class="listing-card">
          <div class="listing-info">
            <div class="listing-name">${data.listingName}</div>
            <div class="listing-meta">Purchased by ${data.buyerName}</div>
          </div>
        </div>
        
        <hr class="divider">
        
        <table style="width: 100%; color: #888;">
          <tr>
            <td>Sale amount</td>
            <td style="text-align: right; color: #fff;">$${data.amount.toFixed(2)}</td>
          </tr>
          <tr>
            <td>Platform fee (10%)</td>
            <td style="text-align: right; color: #ef4444;">-$${data.platformFee.toFixed(2)}</td>
          </tr>
          <tr>
            <td><strong>Your earnings</strong></td>
            <td style="text-align: right; color: #10b981; font-weight: bold;">$${data.netAmount.toFixed(2)}</td>
          </tr>
        </table>
        
        <hr class="divider">
        
        <p style="text-align: center; color: #666;">
          Total lifetime revenue: <span class="highlight">$${data.totalRevenue.toFixed(2)}</span>
        </p>
        
        <div style="text-align: center;">
          <a href="${data.dashboardUrl}" class="button">View Dashboard</a>
        </div>
      </div>
    `),
  }
}

// ============================================================================
// PAYOUT EMAILS
// ============================================================================

export function payoutInitiated(data: {
  publisherName: string
  amount: number
  method: string
  destination: string
  estimatedArrival: string
  dashboardUrl: string
}): { subject: string; html: string } {
  return {
    subject: `🏦 Payout initiated: $${data.amount.toFixed(2)}`,
    html: wrapTemplate(`
      <div class="card">
        <h1>Payout on the way! 🚀</h1>
        <p>Hey ${data.publisherName},</p>
        <p>We've initiated your payout. Here are the details:</p>
        
        <div class="amount">$${data.amount.toFixed(2)}</div>
        
        <hr class="divider">
        
        <table style="width: 100%; color: #888;">
          <tr>
            <td>Method</td>
            <td style="text-align: right; color: #fff;">${data.method}</td>
          </tr>
          <tr>
            <td>Destination</td>
            <td style="text-align: right; color: #fff; font-family: monospace; font-size: 12px;">${data.destination}</td>
          </tr>
          <tr>
            <td>Estimated arrival</td>
            <td style="text-align: right; color: #fff;">${data.estimatedArrival}</td>
          </tr>
        </table>
        
        <div style="text-align: center; margin-top: 24px;">
          <a href="${data.dashboardUrl}" class="button">Track Payout</a>
        </div>
      </div>
    `),
  }
}

export function payoutCompleted(data: {
  publisherName: string
  amount: number
  method: string
  txHash?: string
  dashboardUrl: string
}): { subject: string; html: string } {
  return {
    subject: `✅ Payout complete: $${data.amount.toFixed(2)}`,
    html: wrapTemplate(`
      <div class="card">
        <h1>Payout Complete! ✅</h1>
        <p>Hey ${data.publisherName},</p>
        <p>Your payout has been successfully processed.</p>
        
        <div class="amount">$${data.amount.toFixed(2)}</div>
        
        ${data.txHash ? `
          <p style="text-align: center;">
            <a href="https://basescan.org/tx/${data.txHash}" style="color: #8b5cf6;">
              View transaction on BaseScan →
            </a>
          </p>
        ` : ''}
        
        <div style="text-align: center; margin-top: 24px;">
          <a href="${data.dashboardUrl}" class="button">View Dashboard</a>
        </div>
      </div>
    `),
  }
}

// ============================================================================
// LISTING EMAILS
// ============================================================================

export function listingApproved(data: {
  publisherName: string
  listingName: string
  listingUrl: string
  dashboardUrl: string
}): { subject: string; html: string } {
  return {
    subject: `🎉 Your listing is live: ${data.listingName}`,
    html: wrapTemplate(`
      <div class="card">
        <h1>Your Listing is Live! 🎉</h1>
        <p>Hey ${data.publisherName},</p>
        <p>Great news! Your listing has been approved and is now live on the Evoworks marketplace.</p>
        
        <div class="listing-card">
          <div class="listing-info">
            <div class="listing-name">${data.listingName}</div>
            <div class="listing-meta">Now available to millions of users</div>
          </div>
        </div>
        
        <div style="text-align: center;">
          <a href="${data.listingUrl}" class="button">View Listing</a>
        </div>
        
        <hr class="divider">
        
        <p style="color: #666; font-size: 14px;">
          💡 <strong>Tips to boost visibility:</strong><br>
          • Share on social media<br>
          • Add screenshots and a demo video<br>
          • Respond to reviews promptly
        </p>
      </div>
    `),
  }
}

export function listingRejected(data: {
  publisherName: string
  listingName: string
  reason: string
  dashboardUrl: string
}): { subject: string; html: string } {
  return {
    subject: `Action required: ${data.listingName}`,
    html: wrapTemplate(`
      <div class="card">
        <h1>Listing Needs Changes</h1>
        <p>Hey ${data.publisherName},</p>
        <p>We reviewed your listing and it needs some updates before it can go live.</p>
        
        <div class="listing-card" style="border: 1px solid #ef4444;">
          <div class="listing-info">
            <div class="listing-name">${data.listingName}</div>
          </div>
        </div>
        
        <div style="background: #1a0a0a; border: 1px solid #ef4444; border-radius: 8px; padding: 16px; margin: 16px 0;">
          <p style="color: #ef4444; margin: 0;"><strong>Reason:</strong></p>
          <p style="color: #fca5a5; margin: 8px 0 0 0;">${data.reason}</p>
        </div>
        
        <div style="text-align: center;">
          <a href="${data.dashboardUrl}" class="button">Edit Listing</a>
        </div>
      </div>
    `),
  }
}

// ============================================================================
// REVIEW EMAILS
// ============================================================================

export function newReview(data: {
  publisherName: string
  listingName: string
  reviewerName: string
  rating: number
  content: string
  listingUrl: string
}): { subject: string; html: string } {
  const stars = '⭐'.repeat(data.rating) + '☆'.repeat(5 - data.rating)
  
  return {
    subject: `New ${data.rating}-star review on ${data.listingName}`,
    html: wrapTemplate(`
      <div class="card">
        <h1>New Review! ${data.rating >= 4 ? '🌟' : '📝'}</h1>
        <p>Hey ${data.publisherName},</p>
        <p>${data.reviewerName} left a review on your listing.</p>
        
        <div class="listing-card">
          <div class="listing-info">
            <div class="listing-name">${data.listingName}</div>
            <div style="font-size: 20px; margin: 8px 0;">${stars}</div>
            <p style="color: #888; margin: 8px 0 0 0; font-style: italic;">"${data.content}"</p>
            <p style="color: #666; font-size: 12px; margin: 8px 0 0 0;">— ${data.reviewerName}</p>
          </div>
        </div>
        
        <div style="text-align: center;">
          <a href="${data.listingUrl}" class="button">View & Respond</a>
        </div>
      </div>
    `),
  }
}

// ============================================================================
// WEEKLY DIGEST
// ============================================================================

export function weeklyDigest(data: {
  publisherName: string
  weeklyRevenue: number
  weeklyInstalls: number
  weeklyViews: number
  topListing: string
  topListingRevenue: number
  dashboardUrl: string
}): { subject: string; html: string } {
  return {
    subject: `📊 Your weekly stats: $${data.weeklyRevenue.toFixed(2)} earned`,
    html: wrapTemplate(`
      <div class="card">
        <h1>Weekly Recap 📊</h1>
        <p>Hey ${data.publisherName}, here's how you did this week:</p>
        
        <div class="amount">$${data.weeklyRevenue.toFixed(2)}</div>
        <p style="text-align: center; color: #666;">earned this week</p>
        
        <table style="width: 100%; margin: 24px 0;">
          <tr>
            <td style="text-align: center; padding: 16px; background: #0a0a0a; border-radius: 8px;">
              <div style="font-size: 24px; font-weight: bold; color: #fff;">${data.weeklyViews.toLocaleString()}</div>
              <div style="font-size: 12px; color: #666; text-transform: uppercase;">Views</div>
            </td>
            <td style="width: 12px;"></td>
            <td style="text-align: center; padding: 16px; background: #0a0a0a; border-radius: 8px;">
              <div style="font-size: 24px; font-weight: bold; color: #fff;">${data.weeklyInstalls.toLocaleString()}</div>
              <div style="font-size: 12px; color: #666; text-transform: uppercase;">Installs</div>
            </td>
          </tr>
        </table>
        
        ${data.topListing ? `
          <hr class="divider">
          <p style="color: #666;">🏆 <strong>Top performer:</strong></p>
          <div class="listing-card">
            <div class="listing-info">
              <div class="listing-name">${data.topListing}</div>
              <div class="listing-meta">$${data.topListingRevenue.toFixed(2)} this week</div>
            </div>
          </div>
        ` : ''}
        
        <div style="text-align: center;">
          <a href="${data.dashboardUrl}" class="button">View Full Analytics</a>
        </div>
      </div>
    `),
  }
}

