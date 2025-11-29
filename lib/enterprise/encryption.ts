/**
 * Customer-Managed Encryption Keys (CMEK)
 * Allow enterprises to control their own encryption keys
 */

import crypto from 'crypto'
import { prisma } from '@/lib/db/prisma'

export interface EncryptionKey {
  id: string
  organizationId: string
  name: string
  algorithm: 'AES-256-GCM' | 'RSA-4096'
  publicKey?: string
  createdAt: Date
  rotatedAt?: Date
  status: 'active' | 'rotating' | 'retired'
}

/**
 * Generate new encryption key for organization
 */
export async function generateEncryptionKey(
  organizationId: string,
  name: string,
  algorithm: 'AES-256-GCM' | 'RSA-4096' = 'AES-256-GCM'
): Promise<{
  success: boolean
  key?: EncryptionKey
  privateKey?: string
  error?: string
}> {
  try {
    let publicKey: string | undefined
    let privateKeyData: string | undefined

    if (algorithm === 'RSA-4096') {
      // Generate RSA key pair
      const { publicKey: pubKey, privateKey: privKey } = crypto.generateKeyPairSync('rsa', {
        modulusLength: 4096,
        publicKeyEncoding: {
          type: 'spki',
          format: 'pem',
        },
        privateKeyEncoding: {
          type: 'pkcs8',
          format: 'pem',
        },
      })

      publicKey = pubKey
      privateKeyData = privKey
    } else {
      // Generate AES key
      const key = crypto.randomBytes(32) // 256 bits
      privateKeyData = key.toString('base64')
      publicKey = undefined // AES is symmetric
    }

    // Store metadata in database (NOT the private key!)
    const keyId = crypto.randomUUID()

    await prisma.organization.update({
      where: { id: organizationId },
      data: {
        encryptionKeyId: keyId,
        metadata: {
          encryptionKeys: [
            ...((await prisma.organization.findUnique({
              where: { id: organizationId },
              select: { metadata: true },
            }))?.metadata as any)?.encryptionKeys || [],
            {
              id: keyId,
              organizationId,
              name,
              algorithm,
              publicKey,
              createdAt: new Date(),
              status: 'active',
            },
          ],
        },
      },
    })

    console.log(`[CMEK] Generated ${algorithm} key for organization ${organizationId}`)

    return {
      success: true,
      key: {
        id: keyId,
        organizationId,
        name,
        algorithm,
        publicKey,
        createdAt: new Date(),
        status: 'active',
      },
      privateKey: privateKeyData,
    }
  } catch (error) {
    console.error('Error generating encryption key:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to generate key',
    }
  }
}

/**
 * Import customer's encryption key
 */
export async function importEncryptionKey(
  organizationId: string,
  name: string,
  publicKey: string,
  algorithm: 'AES-256-GCM' | 'RSA-4096'
): Promise<{ success: boolean; keyId?: string; error?: string }> {
  try {
    // Validate public key format
    if (algorithm === 'RSA-4096' && !publicKey.includes('BEGIN PUBLIC KEY')) {
      return { success: false, error: 'Invalid RSA public key format' }
    }

    const keyId = crypto.randomUUID()

    await prisma.organization.update({
      where: { id: organizationId },
      data: {
        encryptionKeyId: keyId,
        metadata: {
          encryptionKeys: [
            ...((await prisma.organization.findUnique({
              where: { id: organizationId },
              select: { metadata: true },
            }))?.metadata as any)?.encryptionKeys || [],
            {
              id: keyId,
              organizationId,
              name,
              algorithm,
              publicKey,
              createdAt: new Date(),
              status: 'active',
              imported: true,
            },
          ],
        },
      },
    })

    console.log(`[CMEK] Imported customer key for organization ${organizationId}`)

    return { success: true, keyId }
  } catch (error) {
    console.error('Error importing encryption key:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to import key',
    }
  }
}

/**
 * Encrypt data with organization's key
 */
export async function encryptData(
  organizationId: string,
  data: string
): Promise<{
  success: boolean
  encrypted?: string
  iv?: string
  error?: string
}> {
  try {
    const org = await prisma.organization.findUnique({
      where: { id: organizationId },
      select: {
        encryptionKeyId: true,
        metadata: true,
      },
    })

    if (!org || !org.encryptionKeyId) {
      return { success: false, error: 'No encryption key configured' }
    }

    const metadata = (org.metadata as any) || {}
    const keys: any[] = metadata.encryptionKeys || []
    const key = keys.find((k) => k.id === org.encryptionKeyId && k.status === 'active')

    if (!key) {
      return { success: false, error: 'Active encryption key not found' }
    }

    // In production, retrieve actual key from secure key management service (KMS)
    // This is a mock implementation
    if (key.algorithm === 'AES-256-GCM') {
      const algorithm = 'aes-256-gcm'
      const iv = crypto.randomBytes(16)
      
      // Mock key for demonstration (in production, fetch from KMS)
      const encryptionKey = crypto.randomBytes(32)
      
      const cipher = crypto.createCipheriv(algorithm, encryptionKey, iv)
      let encrypted = cipher.update(data, 'utf8', 'hex')
      encrypted += cipher.final('hex')
      
      const authTag = cipher.getAuthTag()

      return {
        success: true,
        encrypted: encrypted + ':' + authTag.toString('hex'),
        iv: iv.toString('hex'),
      }
    } else {
      // RSA encryption
      const encrypted = crypto.publicEncrypt(
        {
          key: key.publicKey,
          padding: crypto.constants.RSA_PKCS1_OAEP_PADDING,
        },
        Buffer.from(data)
      )

      return {
        success: true,
        encrypted: encrypted.toString('base64'),
      }
    }
  } catch (error) {
    console.error('Error encrypting data:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Encryption failed',
    }
  }
}

/**
 * Rotate encryption key
 */
export async function rotateEncryptionKey(
  organizationId: string,
  oldKeyId: string
): Promise<{
  success: boolean
  newKeyId?: string
  error?: string
}> {
  try {
    const org = await prisma.organization.findUnique({
      where: { id: organizationId },
      select: { metadata: true },
    })

    const metadata = (org?.metadata as any) || {}
    const keys: any[] = metadata.encryptionKeys || []

    const oldKeyIndex = keys.findIndex((k) => k.id === oldKeyId)

    if (oldKeyIndex === -1) {
      return { success: false, error: 'Key not found' }
    }

    const oldKey = keys[oldKeyIndex]

    // Mark old key as rotating
    keys[oldKeyIndex].status = 'rotating'

    // Generate new key
    const result = await generateEncryptionKey(
      organizationId,
      `${oldKey.name} (rotated)`,
      oldKey.algorithm
    )

    if (!result.success || !result.key) {
      return { success: false, error: result.error }
    }

    // Mark old key as retired
    keys[oldKeyIndex].status = 'retired'
    keys[oldKeyIndex].retiredAt = new Date()

    await prisma.organization.update({
      where: { id: organizationId },
      data: {
        metadata: { ...metadata, encryptionKeys: keys },
      },
    })

    console.log(`[CMEK] Rotated key ${oldKeyId} to ${result.key.id}`)

    return { success: true, newKeyId: result.key.id }
  } catch (error) {
    console.error('Error rotating key:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Key rotation failed',
    }
  }
}

/**
 * List encryption keys for organization
 */
export async function listEncryptionKeys(
  organizationId: string
): Promise<EncryptionKey[]> {
  try {
    const org = await prisma.organization.findUnique({
      where: { id: organizationId },
      select: { metadata: true },
    })

    const metadata = (org?.metadata as any) || {}
    return metadata.encryptionKeys || []
  } catch (error) {
    console.error('Error listing encryption keys:', error)
    return []
  }
}

/**
 * Revoke encryption key
 */
export async function revokeEncryptionKey(
  organizationId: string,
  keyId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const org = await prisma.organization.findUnique({
      where: { id: organizationId },
      select: { metadata: true },
    })

    const metadata = (org?.metadata as any) || {}
    const keys: any[] = metadata.encryptionKeys || []

    const keyIndex = keys.findIndex((k) => k.id === keyId)

    if (keyIndex === -1) {
      return { success: false, error: 'Key not found' }
    }

    keys[keyIndex].status = 'retired'
    keys[keyIndex].revokedAt = new Date()

    await prisma.organization.update({
      where: { id: organizationId },
      data: {
        metadata: { ...metadata, encryptionKeys: keys },
      },
    })

    console.log(`[CMEK] Revoked key ${keyId}`)

    return { success: true }
  } catch (error) {
    console.error('Error revoking key:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Key revocation failed',
    }
  }
}

