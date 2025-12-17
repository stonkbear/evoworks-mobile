'use client'

/**
 * Auth Provider
 * Wraps app with NextAuth SessionProvider
 */

import { SessionProvider } from 'next-auth/react'
import type { Session } from 'next-auth'

interface AuthProviderProps {
  children: React.ReactNode
  session?: Session | null
}

export function AuthProvider({ children, session }: AuthProviderProps) {
  return (
    <SessionProvider session={session}>
      {children}
    </SessionProvider>
  )
}

export default AuthProvider

