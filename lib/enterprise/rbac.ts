/**
 * Role-Based Access Control (RBAC) System
 * Fine-grained permissions for enterprise organizations
 */

import { prisma } from '@/lib/db/prisma'

export type Permission =
  // Agent management
  | 'agents.create'
  | 'agents.read'
  | 'agents.update'
  | 'agents.delete'
  | 'agents.approve'
  // Task management
  | 'tasks.create'
  | 'tasks.read'
  | 'tasks.update'
  | 'tasks.delete'
  | 'tasks.assign'
  // Policy management
  | 'policies.create'
  | 'policies.read'
  | 'policies.update'
  | 'policies.delete'
  | 'policies.activate'
  // Billing & payments
  | 'billing.read'
  | 'billing.approve'
  | 'billing.dispute'
  // Organization settings
  | 'org.settings.read'
  | 'org.settings.update'
  | 'org.users.invite'
  | 'org.users.remove'
  | 'org.roles.manage'
  // Audit & compliance
  | 'audit.read'
  | 'audit.export'
  // Admin
  | 'admin.all'

export interface Role {
  id: string
  name: string
  description: string
  permissions: Permission[]
  organizationId: string
}

/**
 * Default roles for organizations
 */
export const DEFAULT_ROLES: Omit<Role, 'id' | 'organizationId'>[] = [
  {
    name: 'Owner',
    description: 'Full access to all resources',
    permissions: ['admin.all'],
  },
  {
    name: 'Admin',
    description: 'Manage agents, tasks, policies, and users',
    permissions: [
      'agents.create',
      'agents.read',
      'agents.update',
      'agents.delete',
      'agents.approve',
      'tasks.create',
      'tasks.read',
      'tasks.update',
      'tasks.delete',
      'tasks.assign',
      'policies.create',
      'policies.read',
      'policies.update',
      'policies.delete',
      'policies.activate',
      'billing.read',
      'billing.approve',
      'org.settings.read',
      'org.settings.update',
      'org.users.invite',
      'org.users.remove',
      'audit.read',
      'audit.export',
    ],
  },
  {
    name: 'Manager',
    description: 'Create and manage tasks, view billing',
    permissions: [
      'agents.read',
      'tasks.create',
      'tasks.read',
      'tasks.update',
      'tasks.assign',
      'policies.read',
      'billing.read',
      'org.settings.read',
      'audit.read',
    ],
  },
  {
    name: 'Developer',
    description: 'Create agents and submit tasks',
    permissions: [
      'agents.create',
      'agents.read',
      'agents.update',
      'tasks.create',
      'tasks.read',
      'policies.read',
      'billing.read',
    ],
  },
  {
    name: 'Viewer',
    description: 'Read-only access',
    permissions: ['agents.read', 'tasks.read', 'policies.read', 'billing.read'],
  },
]

/**
 * Create default roles for organization
 */
export async function createDefaultRoles(organizationId: string): Promise<void> {
  try {
    for (const roleData of DEFAULT_ROLES) {
      await prisma.organization.update({
        where: { id: organizationId },
        data: {
          metadata: {
            roles: [
              ...((await prisma.organization.findUnique({
                where: { id: organizationId },
                select: { metadata: true },
              }))?.metadata as any)?.roles || [],
              {
                id: `${roleData.name.toLowerCase()}_${Date.now()}`,
                ...roleData,
                organizationId,
              },
            ],
          },
        },
      })
    }

    console.log(`[RBAC] Created default roles for organization ${organizationId}`)
  } catch (error) {
    console.error('Error creating default roles:', error)
  }
}

/**
 * Assign role to user
 */
export async function assignRole(
  userId: string,
  organizationId: string,
  roleName: string
): Promise<{ success: boolean; error?: string }> {
  try {
    await prisma.user.update({
      where: { id: userId },
      data: {
        role: roleName as any,
        organizationId,
      },
    })

    console.log(`[RBAC] Assigned role ${roleName} to user ${userId}`)

    return { success: true }
  } catch (error) {
    console.error('Error assigning role:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to assign role',
    }
  }
}

/**
 * Get user permissions
 */
export async function getUserPermissions(userId: string): Promise<Permission[]> {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        role: true,
        organizationId: true,
      },
    })

    if (!user || !user.role) return []

    // Check if user has admin.all permission
    if (user.role === 'ADMIN') {
      return ['admin.all']
    }

    // Get role definition
    const org = await prisma.organization.findUnique({
      where: { id: user.organizationId! },
      select: { metadata: true },
    })

    const metadata = (org?.metadata as any) || {}
    const roles: Role[] = metadata.roles || []

    const role = roles.find((r) => r.name === user.role)

    return role?.permissions || []
  } catch (error) {
    console.error('Error getting user permissions:', error)
    return []
  }
}

/**
 * Check if user has permission
 */
export async function hasPermission(
  userId: string,
  permission: Permission
): Promise<boolean> {
  try {
    const permissions = await getUserPermissions(userId)

    // Check for admin.all wildcard
    if (permissions.includes('admin.all')) return true

    // Check for specific permission
    return permissions.includes(permission)
  } catch (error) {
    console.error('Error checking permission:', error)
    return false
  }
}

/**
 * Require permission (throws error if not authorized)
 */
export async function requirePermission(
  userId: string,
  permission: Permission
): Promise<void> {
  const authorized = await hasPermission(userId, permission)

  if (!authorized) {
    throw new Error(`Unauthorized: missing permission ${permission}`)
  }
}

/**
 * Check multiple permissions (requires ALL)
 */
export async function hasAllPermissions(
  userId: string,
  permissions: Permission[]
): Promise<boolean> {
  const userPermissions = await getUserPermissions(userId)

  if (userPermissions.includes('admin.all')) return true

  return permissions.every((p) => userPermissions.includes(p))
}

/**
 * Check multiple permissions (requires ANY)
 */
export async function hasAnyPermission(
  userId: string,
  permissions: Permission[]
): Promise<boolean> {
  const userPermissions = await getUserPermissions(userId)

  if (userPermissions.includes('admin.all')) return true

  return permissions.some((p) => userPermissions.includes(p))
}

/**
 * Create custom role
 */
export async function createRole(
  organizationId: string,
  roleData: Omit<Role, 'id' | 'organizationId'>
): Promise<{ success: boolean; role?: Role; error?: string }> {
  try {
    const org = await prisma.organization.findUnique({
      where: { id: organizationId },
      select: { metadata: true },
    })

    const metadata = (org?.metadata as any) || {}
    const roles: Role[] = metadata.roles || []

    const newRole: Role = {
      id: `custom_${Date.now()}`,
      ...roleData,
      organizationId,
    }

    roles.push(newRole)

    await prisma.organization.update({
      where: { id: organizationId },
      data: {
        metadata: { ...metadata, roles },
      },
    })

    console.log(`[RBAC] Created role ${roleData.name} for organization ${organizationId}`)

    return { success: true, role: newRole }
  } catch (error) {
    console.error('Error creating role:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to create role',
    }
  }
}

/**
 * Update role permissions
 */
export async function updateRole(
  organizationId: string,
  roleId: string,
  updates: Partial<Omit<Role, 'id' | 'organizationId'>>
): Promise<{ success: boolean; error?: string }> {
  try {
    const org = await prisma.organization.findUnique({
      where: { id: organizationId },
      select: { metadata: true },
    })

    const metadata = (org?.metadata as any) || {}
    const roles: Role[] = metadata.roles || []

    const roleIndex = roles.findIndex((r) => r.id === roleId)

    if (roleIndex === -1) {
      return { success: false, error: 'Role not found' }
    }

    roles[roleIndex] = { ...roles[roleIndex], ...updates }

    await prisma.organization.update({
      where: { id: organizationId },
      data: {
        metadata: { ...metadata, roles },
      },
    })

    console.log(`[RBAC] Updated role ${roleId}`)

    return { success: true }
  } catch (error) {
    console.error('Error updating role:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to update role',
    }
  }
}

/**
 * Delete role
 */
export async function deleteRole(
  organizationId: string,
  roleId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const org = await prisma.organization.findUnique({
      where: { id: organizationId },
      select: { metadata: true },
    })

    const metadata = (org?.metadata as any) || {}
    const roles: Role[] = metadata.roles || []

    const filteredRoles = roles.filter((r) => r.id !== roleId)

    await prisma.organization.update({
      where: { id: organizationId },
      data: {
        metadata: { ...metadata, roles: filteredRoles },
      },
    })

    console.log(`[RBAC] Deleted role ${roleId}`)

    return { success: true }
  } catch (error) {
    console.error('Error deleting role:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to delete role',
    }
  }
}

/**
 * List roles for organization
 */
export async function listRoles(organizationId: string): Promise<Role[]> {
  try {
    const org = await prisma.organization.findUnique({
      where: { id: organizationId },
      select: { metadata: true },
    })

    const metadata = (org?.metadata as any) || {}
    return metadata.roles || []
  } catch (error) {
    console.error('Error listing roles:', error)
    return []
  }
}

/**
 * Get users by role
 */
export async function getUsersByRole(
  organizationId: string,
  roleName: string
): Promise<any[]> {
  try {
    return await prisma.user.findMany({
      where: {
        organizationId,
        role: roleName as any,
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true,
      },
    })
  } catch (error) {
    console.error('Error getting users by role:', error)
    return []
  }
}

