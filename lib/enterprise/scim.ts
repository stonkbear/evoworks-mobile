/**
 * SCIM 2.0 Provisioning for Enterprise User Management
 * Supports automated user/group sync from identity providers
 */

import { prisma } from '@/lib/db/prisma'
import crypto from 'crypto'

export interface SCIMUser {
  id?: string
  userName: string
  name?: {
    givenName?: string
    familyName?: string
  }
  emails: { value: string; primary?: boolean }[]
  active: boolean
  groups?: string[]
}

export interface SCIMGroup {
  id?: string
  displayName: string
  members?: { value: string; display?: string }[]
}

/**
 * Create or update user via SCIM
 */
export async function provisionUser(
  organizationId: string,
  userData: SCIMUser
): Promise<{
  success: boolean
  user?: any
  error?: string
}> {
  try {
    const email = userData.emails.find((e) => e.primary)?.value || userData.emails[0]?.value

    if (!email) {
      return { success: false, error: 'No email provided' }
    }

    // Check if user exists
    let user = await prisma.user.findUnique({
      where: { email },
    })

    if (user) {
      // Update existing user
      user = await prisma.user.update({
        where: { id: user.id },
        data: {
          name: userData.name
            ? `${userData.name.givenName || ''} ${userData.name.familyName || ''}`.trim()
            : undefined,
          scimId: userData.id,
          scimActive: userData.active,
        },
      })

      console.log(`[SCIM] Updated user ${email}`)
    } else {
      // Create new user
      user = await prisma.user.create({
        data: {
          email,
          name: userData.name
            ? `${userData.name.givenName || ''} ${userData.name.familyName || ''}`.trim()
            : email.split('@')[0],
          scimId: userData.id,
          scimActive: userData.active,
          organizationId,
        },
      })

      console.log(`[SCIM] Provisioned user ${email}`)
    }

    // Handle group memberships
    if (userData.groups && userData.groups.length > 0) {
      await syncUserGroups(user.id, organizationId, userData.groups)
    }

    return { success: true, user }
  } catch (error) {
    console.error('Error provisioning user:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to provision user',
    }
  }
}

/**
 * Deprovision user via SCIM
 */
export async function deprovisionUser(
  organizationId: string,
  scimId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const user = await prisma.user.findFirst({
      where: {
        scimId,
        organizationId,
      },
    })

    if (!user) {
      return { success: false, error: 'User not found' }
    }

    // Mark as inactive instead of deleting
    await prisma.user.update({
      where: { id: user.id },
      data: {
        scimActive: false,
      },
    })

    console.log(`[SCIM] Deprovisioned user ${user.email}`)

    return { success: true }
  } catch (error) {
    console.error('Error deprovisioning user:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to deprovision user',
    }
  }
}

/**
 * Get user by SCIM ID
 */
export async function getSCIMUser(
  organizationId: string,
  scimId: string
): Promise<SCIMUser | null> {
  try {
    const user = await prisma.user.findFirst({
      where: {
        scimId,
        organizationId,
      },
    })

    if (!user) return null

    const [firstName, ...lastNameParts] = (user.name || '').split(' ')

    return {
      id: user.scimId || user.id,
      userName: user.email,
      name: {
        givenName: firstName,
        familyName: lastNameParts.join(' '),
      },
      emails: [{ value: user.email, primary: true }],
      active: user.scimActive ?? true,
    }
  } catch (error) {
    console.error('Error getting SCIM user:', error)
    return null
  }
}

/**
 * List users for organization
 */
export async function listSCIMUsers(
  organizationId: string,
  startIndex: number = 1,
  count: number = 100
): Promise<{
  totalResults: number
  itemsPerPage: number
  startIndex: number
  Resources: SCIMUser[]
}> {
  try {
    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where: { organizationId },
        skip: startIndex - 1,
        take: count,
      }),
      prisma.user.count({
        where: { organizationId },
      }),
    ])

    const Resources = users.map((user) => {
      const [firstName, ...lastNameParts] = (user.name || '').split(' ')

      return {
        id: user.scimId || user.id,
        userName: user.email,
        name: {
          givenName: firstName,
          familyName: lastNameParts.join(' '),
        },
        emails: [{ value: user.email, primary: true }],
        active: user.scimActive ?? true,
      }
    })

    return {
      totalResults: total,
      itemsPerPage: count,
      startIndex,
      Resources,
    }
  } catch (error) {
    console.error('Error listing SCIM users:', error)
    return {
      totalResults: 0,
      itemsPerPage: count,
      startIndex,
      Resources: [],
    }
  }
}

/**
 * Provision group via SCIM
 */
export async function provisionGroup(
  organizationId: string,
  groupData: SCIMGroup
): Promise<{
  success: boolean
  group?: any
  error?: string
}> {
  try {
    // Store group in organization metadata
    // In production, you might want a separate groups table
    const org = await prisma.organization.findUnique({
      where: { id: organizationId },
      select: { metadata: true },
    })

    const metadata = (org?.metadata as any) || {}
    const groups = metadata.scimGroups || []

    const existingIndex = groups.findIndex((g: any) => g.id === groupData.id)

    if (existingIndex >= 0) {
      // Update existing group
      groups[existingIndex] = groupData
    } else {
      // Add new group
      groups.push({
        ...groupData,
        id: groupData.id || crypto.randomUUID(),
      })
    }

    await prisma.organization.update({
      where: { id: organizationId },
      data: {
        metadata: { ...metadata, scimGroups: groups },
      },
    })

    console.log(`[SCIM] Provisioned group ${groupData.displayName}`)

    return { success: true, group: groupData }
  } catch (error) {
    console.error('Error provisioning group:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to provision group',
    }
  }
}

/**
 * Sync user group memberships
 */
async function syncUserGroups(
  userId: string,
  organizationId: string,
  groups: string[]
): Promise<void> {
  try {
    // Store group memberships in user metadata
    await prisma.user.update({
      where: { id: userId },
      data: {
        metadata: { groups },
      },
    })

    console.log(`[SCIM] Synced groups for user ${userId}`)
  } catch (error) {
    console.error('Error syncing user groups:', error)
  }
}

/**
 * Generate SCIM bearer token for organization
 */
export async function generateSCIMToken(
  organizationId: string
): Promise<{ token: string }> {
  const token = `scim_${crypto.randomBytes(32).toString('hex')}`

  // Store hashed token
  const hashedToken = crypto.createHash('sha256').update(token).digest('hex')

  await prisma.organization.update({
    where: { id: organizationId },
    data: {
      scimToken: hashedToken,
      scimTokenCreatedAt: new Date(),
    },
  })

  console.log(`[SCIM] Generated token for organization ${organizationId}`)

  return { token }
}

/**
 * Verify SCIM bearer token
 */
export async function verifySCIMToken(
  token: string
): Promise<{ valid: boolean; organizationId?: string }> {
  try {
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex')

    const org = await prisma.organization.findFirst({
      where: { scimToken: hashedToken },
      select: { id: true },
    })

    if (!org) {
      return { valid: false }
    }

    return { valid: true, organizationId: org.id }
  } catch (error) {
    console.error('Error verifying SCIM token:', error)
    return { valid: false }
  }
}

