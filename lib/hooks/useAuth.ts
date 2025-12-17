'use client'

/**
 * Auth Hook
 * Easy access to session data and auth utilities
 */

import { useSession, signIn, signOut } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useCallback } from 'react'

export interface User {
  id: string
  name?: string | null
  email?: string | null
  image?: string | null
  role?: string
}

export interface UseAuthResult {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  signIn: (provider?: string, callbackUrl?: string) => Promise<void>
  signOut: (callbackUrl?: string) => Promise<void>
  requireAuth: (callbackUrl?: string) => boolean
}

export function useAuth(): UseAuthResult {
  const { data: session, status } = useSession()
  const router = useRouter()

  const isLoading = status === 'loading'
  const isAuthenticated = status === 'authenticated'
  
  const user: User | null = session?.user ? {
    id: (session.user as { id?: string }).id || '',
    name: session.user.name,
    email: session.user.email,
    image: session.user.image,
    role: (session.user as { role?: string }).role,
  } : null

  const handleSignIn = useCallback(async (provider?: string, callbackUrl?: string) => {
    if (provider) {
      await signIn(provider, { callbackUrl: callbackUrl || '/dashboard' })
    } else {
      router.push(`/signin${callbackUrl ? `?callbackUrl=${encodeURIComponent(callbackUrl)}` : ''}`)
    }
  }, [router])

  const handleSignOut = useCallback(async (callbackUrl?: string) => {
    await signOut({ callbackUrl: callbackUrl || '/' })
  }, [])

  // Returns true if authenticated, redirects to signin if not
  const requireAuth = useCallback((callbackUrl?: string): boolean => {
    if (isLoading) return false
    
    if (!isAuthenticated) {
      router.push(`/signin${callbackUrl ? `?callbackUrl=${encodeURIComponent(callbackUrl)}` : ''}`)
      return false
    }
    
    return true
  }, [isLoading, isAuthenticated, router])

  return {
    user,
    isAuthenticated,
    isLoading,
    signIn: handleSignIn,
    signOut: handleSignOut,
    requireAuth,
  }
}

export default useAuth

