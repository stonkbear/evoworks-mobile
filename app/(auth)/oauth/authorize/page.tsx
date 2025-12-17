'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'

const SCOPE_DESCRIPTIONS: Record<string, string> = {
  'read:profile': 'View your publisher profile and basic information',
  'write:listings': 'Create, update, and manage marketplace listings on your behalf',
  'read:analytics': 'Access analytics and statistics for your listings',
}

export default function OAuthAuthorizePage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const searchParams = useSearchParams()
  
  const [isAuthorizing, setIsAuthorizing] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const clientId = searchParams.get('client_id')
  const redirectUri = searchParams.get('redirect_uri')
  const responseType = searchParams.get('response_type')
  const scope = searchParams.get('scope')
  const state = searchParams.get('state')

  const scopes = scope?.split(' ') || []

  // Validate request
  useEffect(() => {
    if (!clientId || !redirectUri || responseType !== 'code') {
      setError('Invalid OAuth request parameters')
    }
  }, [clientId, redirectUri, responseType])

  // Redirect to sign in if not authenticated
  useEffect(() => {
    if (status === 'unauthenticated') {
      const currentUrl = window.location.href
      router.push(`/signin?callbackUrl=${encodeURIComponent(currentUrl)}`)
    }
  }, [status, router])

  const handleAuthorize = async () => {
    if (!session?.user?.id) return
    
    setIsAuthorizing(true)
    setError(null)

    try {
      // Generate authorization code
      const response = await fetch('/api/oauth/authorize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          clientId,
          redirectUri,
          scope,
          state,
          userId: session.user.id,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Authorization failed')
      }

      // Redirect back to Ghost Flow with code
      const callbackUrl = new URL(redirectUri!)
      callbackUrl.searchParams.set('code', data.code)
      if (state) callbackUrl.searchParams.set('state', state)
      
      window.location.href = callbackUrl.toString()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Authorization failed')
      setIsAuthorizing(false)
    }
  }

  const handleDeny = () => {
    const callbackUrl = new URL(redirectUri!)
    callbackUrl.searchParams.set('error', 'access_denied')
    if (state) callbackUrl.searchParams.set('state', state)
    window.location.href = callbackUrl.toString()
  }

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-2 border-violet-500 border-t-transparent rounded-full" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center p-4">
        <div className="bg-[#111] border border-red-500/30 rounded-2xl p-8 max-w-md w-full text-center">
          <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h1 className="text-xl font-bold text-white mb-2">Authorization Error</h1>
          <p className="text-[#888] mb-6">{error}</p>
          <Link
            href="/"
            className="inline-block px-6 py-3 bg-[#222] hover:bg-[#333] text-white rounded-lg transition-colors"
          >
            Return Home
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center p-4">
      {/* Background gradient */}
      <div className="fixed inset-0 bg-gradient-to-br from-violet-600/10 via-transparent to-fuchsia-600/10 pointer-events-none" />
      
      <div className="relative bg-[#111] border border-[#222] rounded-2xl p-8 max-w-md w-full">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-4 mb-6">
            {/* Ghost Flow Logo */}
            <div className="w-14 h-14 bg-gradient-to-br from-violet-500 to-fuchsia-500 rounded-xl flex items-center justify-center">
              <span className="text-2xl">👻</span>
            </div>
            
            {/* Arrow */}
            <svg className="w-6 h-6 text-[#444]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
            
            {/* Evoworks Logo */}
            <div className="w-14 h-14 bg-gradient-to-br from-emerald-500 to-cyan-500 rounded-xl flex items-center justify-center">
              <span className="text-2xl">🦇</span>
            </div>
          </div>
          
          <h1 className="text-2xl font-bold text-white mb-2">Authorize Ghost Flow</h1>
          <p className="text-[#888]">
            <span className="text-white font-medium">Ghost Flow</span> wants to access your Evoworks account
          </p>
        </div>

        {/* User Info */}
        {session?.user && (
          <div className="bg-[#0a0a0a] border border-[#1a1a1a] rounded-xl p-4 mb-6 flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-violet-500 to-fuchsia-500 rounded-full flex items-center justify-center text-white font-bold">
              {session.user.name?.[0] || session.user.email?.[0] || '?'}
            </div>
            <div>
              <div className="text-white font-medium">{session.user.name || 'User'}</div>
              <div className="text-[#666] text-sm">{session.user.email}</div>
            </div>
          </div>
        )}

        {/* Permissions */}
        <div className="mb-6">
          <h3 className="text-sm font-medium text-[#888] uppercase tracking-wider mb-3">
            This will allow Ghost Flow to:
          </h3>
          <div className="space-y-2">
            {scopes.map((s) => (
              <div key={s} className="flex items-start gap-3 p-3 bg-[#0a0a0a] rounded-lg">
                <svg className="w-5 h-5 text-emerald-400 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span className="text-[#ccc] text-sm">
                  {SCOPE_DESCRIPTIONS[s] || s}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="space-y-3">
          <button
            onClick={handleAuthorize}
            disabled={isAuthorizing}
            className="w-full px-6 py-4 bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-500 hover:to-fuchsia-500 text-white font-semibold rounded-xl transition-all disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {isAuthorizing ? (
              <>
                <svg className="animate-spin w-5 h-5" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Authorizing...
              </>
            ) : (
              'Authorize Ghost Flow'
            )}
          </button>
          
          <button
            onClick={handleDeny}
            disabled={isAuthorizing}
            className="w-full px-6 py-3 bg-transparent hover:bg-[#1a1a1a] text-[#888] hover:text-white font-medium rounded-xl transition-all border border-[#222]"
          >
            Deny
          </button>
        </div>

        {/* Footer */}
        <p className="text-[#555] text-xs text-center mt-6">
          By authorizing, you agree to share the above information with Ghost Flow.
          You can revoke access anytime from your{' '}
          <Link href="/settings/integrations" className="text-violet-400 hover:text-violet-300">
            settings
          </Link>.
        </p>
      </div>
    </div>
  )
}

