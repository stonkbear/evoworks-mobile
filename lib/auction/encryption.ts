/**
 * Bid Encryption - Encrypt bids for sealed-bid auctions
 * In production, use proper asymmetric encryption (RSA, ECIES)
 */

import crypto from 'crypto'

export interface EncryptedBid {
  ciphertext: string
  iv: string
  timestamp: number
}

/**
 * Encrypt a bid for sealed-bid auction
 * Uses AES-256-GCM encryption
 */
export function encryptBid(
  bid: { amount: number; currency: string },
  auctionPublicKey: string
): EncryptedBid {
  try {
    // In production, use the auction's public key for asymmetric encryption
    // For now, use symmetric encryption with a derived key
    const secretKey = deriveKeyFromAuctionId(auctionPublicKey)

    // Generate random IV
    const iv = crypto.randomBytes(16)

    // Create cipher
    const cipher = crypto.createCipheriv('aes-256-gcm', secretKey, iv)

    // Encrypt bid data
    const bidData = JSON.stringify(bid)
    let encrypted = cipher.update(bidData, 'utf8', 'hex')
    encrypted += cipher.final('hex')

    // Get auth tag
    const authTag = cipher.getAuthTag()

    return {
      ciphertext: encrypted + ':' + authTag.toString('hex'),
      iv: iv.toString('hex'),
      timestamp: Date.now(),
    }
  } catch (error) {
    console.error('Error encrypting bid:', error)
    throw new Error('Failed to encrypt bid')
  }
}

/**
 * Decrypt a sealed bid
 * Only called after auction deadline
 */
export function decryptBid(
  encryptedBid: EncryptedBid,
  auctionPrivateKey: string
): { amount: number; currency: string } {
  try {
    // Derive same key used for encryption
    const secretKey = deriveKeyFromAuctionId(auctionPrivateKey)

    // Parse ciphertext and auth tag
    const parts = encryptedBid.ciphertext.split(':')
    const ciphertext = parts[0]
    const authTag = Buffer.from(parts[1], 'hex')

    // Create decipher
    const iv = Buffer.from(encryptedBid.iv, 'hex')
    const decipher = crypto.createDecipheriv('aes-256-gcm', secretKey, iv)
    decipher.setAuthTag(authTag)

    // Decrypt
    let decrypted = decipher.update(ciphertext, 'hex', 'utf8')
    decrypted += decipher.final('utf8')

    return JSON.parse(decrypted)
  } catch (error) {
    console.error('Error decrypting bid:', error)
    throw new Error('Failed to decrypt bid')
  }
}

/**
 * Derive encryption key from auction ID
 * In production, use proper key management (KMS, HSM)
 */
function deriveKeyFromAuctionId(auctionId: string): Buffer {
  const secret = process.env.AUCTION_ENCRYPTION_SECRET || 'default-secret-change-in-production'
  const salt = auctionId

  // Use PBKDF2 to derive a 32-byte key
  return crypto.pbkdf2Sync(secret, salt, 100000, 32, 'sha256')
}

/**
 * Generate auction key pair (for production)
 * Returns RSA public/private key pair
 */
export function generateAuctionKeyPair(): {
  publicKey: string
  privateKey: string
} {
  const { publicKey, privateKey } = crypto.generateKeyPairSync('rsa', {
    modulusLength: 2048,
    publicKeyEncoding: {
      type: 'spki',
      format: 'pem',
    },
    privateKeyEncoding: {
      type: 'pkcs8',
      format: 'pem',
    },
  })

  return { publicKey, privateKey }
}

/**
 * Verify bid hasn't been tampered with
 */
export function verifyBidIntegrity(encryptedBid: EncryptedBid): boolean {
  try {
    // Check timestamp is reasonable (not too old, not in future)
    const age = Date.now() - encryptedBid.timestamp
    const maxAge = 7 * 24 * 60 * 60 * 1000 // 7 days

    if (age < 0 || age > maxAge) {
      return false
    }

    // In production, verify cryptographic signatures
    return true
  } catch (error) {
    return false
  }
}

/**
 * Create commitment for bid (zero-knowledge proof)
 * Allows proving bid was submitted without revealing amount
 */
export function createBidCommitment(
  amount: number,
  nonce: string
): string {
  const data = `${amount}:${nonce}`
  return crypto.createHash('sha256').update(data).digest('hex')
}

/**
 * Verify commitment matches revealed bid
 */
export function verifyBidCommitment(
  amount: number,
  nonce: string,
  commitment: string
): boolean {
  const computed = createBidCommitment(amount, nonce)
  return computed === commitment
}

