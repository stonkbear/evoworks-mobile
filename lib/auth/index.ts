/**
 * NextAuth Instance
 * Export auth handlers and utilities
 */

import NextAuth from 'next-auth'
import { authConfig } from './config'

export const {
  handlers: { GET, POST },
  auth,
  signIn,
  signOut,
} = NextAuth(authConfig)

// Re-export config for middleware
export { authConfig }

