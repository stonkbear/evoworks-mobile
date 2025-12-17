'use client'

/**
 * Sign Up Page
 * Evoworks Marketplace Registration
 */

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { signIn } from 'next-auth/react'
import Link from 'next/link'
import dynamic from 'next/dynamic'

const WaveBackground = dynamic(() => import('@/components/three/WaveBackground').then(mod => mod.WaveBackground), { ssr: false })

export default function SignUpPage() {
  const router = useRouter()
  
  const [accountType, setAccountType] = useState<'buyer' | 'seller'>('buyer')
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [agreedToTerms, setAgreedToTerms] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const [successMessage, setSuccessMessage] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setErrorMessage('')
    setSuccessMessage('')

    // Validation
    if (!agreedToTerms) {
      setErrorMessage('You must agree to the Terms of Service and Privacy Policy')
      setIsLoading(false)
      return
    }

    if (password.length < 8) {
      setErrorMessage('Password must be at least 8 characters')
      setIsLoading(false)
      return
    }

    try {
      // Create account
      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          password,
          name: `${firstName} ${lastName}`.trim() || undefined,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        setErrorMessage(data.error || 'Failed to create account')
        setIsLoading(false)
        return
      }

      setSuccessMessage('Account created! Signing you in...')

      // Auto sign in after successful registration
      const signInResult = await signIn('credentials', {
        email,
        password,
        redirect: false,
      })

      if (signInResult?.error) {
        // Account created but couldn't auto-login
        router.push('/signin?message=Account created. Please sign in.')
        return
      }

      // Redirect based on account type
      const redirectUrl = accountType === 'seller' ? '/dashboard/publisher' : '/dashboard'
      router.push(redirectUrl)
      router.refresh()
    } catch {
      setErrorMessage('Something went wrong. Please try again.')
      setIsLoading(false)
    }
  }

  const handleOAuthSignIn = async (provider: 'google' | 'github') => {
    setIsLoading(true)
    await signIn(provider, { 
      callbackUrl: accountType === 'seller' ? '/dashboard/publisher' : '/dashboard'
    })
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center px-4 py-12 relative overflow-hidden">
      {/* 3D Background */}
      <WaveBackground />
      
      {/* Background Evoworks Effect */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
          <div className="w-[800px] h-[800px] rounded-full border border-[#ff6b35]/10 animate-pulse" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full border border-[#ff6b35]/20 animate-pulse" style={{ animationDelay: '0.5s' }} />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] rounded-full border border-[#ff6b35]/30 animate-pulse" style={{ animationDelay: '1s' }} />
        </div>
      </div>

      <div className="w-full max-w-md relative z-10">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-3 group">
            <div className="text-5xl group-hover:scale-110 transition-transform">🦇</div>
            <div>
              <h1 className="text-3xl font-bold text-white">Evoworks</h1>
              <p className="text-sm text-[#a3a3a3]">Marketplace</p>
            </div>
          </Link>
        </div>

        {/* Sign Up Card */}
        <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg p-8 shadow-xl">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-white mb-2">Create Account</h2>
            <p className="text-[#a3a3a3]">Join the Evoworks Marketplace</p>
          </div>

          {/* Error Message */}
          {errorMessage && (
            <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
              <p className="text-red-400 text-sm">{errorMessage}</p>
            </div>
          )}

          {/* Success Message */}
          {successMessage && (
            <div className="mb-4 p-3 bg-green-500/10 border border-green-500/20 rounded-lg">
              <p className="text-green-400 text-sm">{successMessage}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Account Type */}
            <div>
              <label className="block text-sm font-medium text-white mb-3">I want to:</label>
              <div className="grid grid-cols-2 gap-3">
                <label className="relative cursor-pointer">
                  <input 
                    type="radio" 
                    name="accountType" 
                    value="buyer" 
                    checked={accountType === 'buyer'}
                    onChange={() => setAccountType('buyer')}
                    className="peer sr-only" 
                    disabled={isLoading}
                  />
                  <div className="px-4 py-3 bg-[#0a0a0a] border-2 border-[#2a2a2a] peer-checked:border-[#ff6b35] peer-checked:bg-[#ff6b35]/5 rounded-lg transition-all text-center">
                    <div className="text-2xl mb-1">🎯</div>
                    <div className="text-sm font-medium text-white">Use Agents</div>
                  </div>
                </label>
                <label className="relative cursor-pointer">
                  <input 
                    type="radio" 
                    name="accountType" 
                    value="seller" 
                    checked={accountType === 'seller'}
                    onChange={() => setAccountType('seller')}
                    className="peer sr-only"
                    disabled={isLoading}
                  />
                  <div className="px-4 py-3 bg-[#0a0a0a] border-2 border-[#2a2a2a] peer-checked:border-[#ff6b35] peer-checked:bg-[#ff6b35]/5 rounded-lg transition-all text-center">
                    <div className="text-2xl mb-1">🦇</div>
                    <div className="text-sm font-medium text-white">Publish</div>
                  </div>
                </label>
              </div>
            </div>

            {/* Name */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label htmlFor="firstName" className="block text-sm font-medium text-white mb-2">
                  First Name
                </label>
                <input
                  type="text"
                  id="firstName"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  className="w-full px-4 py-3 bg-[#0a0a0a] border border-[#2a2a2a] rounded-lg text-white placeholder-[#737373] focus:border-[#ff6b35] focus:ring-2 focus:ring-[#ff6b35]/20 outline-none transition-all"
                  placeholder="John"
                  disabled={isLoading}
                />
              </div>
              <div>
                <label htmlFor="lastName" className="block text-sm font-medium text-white mb-2">
                  Last Name
                </label>
                <input
                  type="text"
                  id="lastName"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  className="w-full px-4 py-3 bg-[#0a0a0a] border border-[#2a2a2a] rounded-lg text-white placeholder-[#737373] focus:border-[#ff6b35] focus:ring-2 focus:ring-[#ff6b35]/20 outline-none transition-all"
                  placeholder="Doe"
                  disabled={isLoading}
                />
              </div>
            </div>

            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-white mb-2">
                Email
              </label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 bg-[#0a0a0a] border border-[#2a2a2a] rounded-lg text-white placeholder-[#737373] focus:border-[#ff6b35] focus:ring-2 focus:ring-[#ff6b35]/20 outline-none transition-all"
                placeholder="you@company.com"
                required
                disabled={isLoading}
              />
            </div>

            {/* Password */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-white mb-2">
                Password
              </label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 bg-[#0a0a0a] border border-[#2a2a2a] rounded-lg text-white placeholder-[#737373] focus:border-[#ff6b35] focus:ring-2 focus:ring-[#ff6b35]/20 outline-none transition-all"
                placeholder="••••••••"
                required
                minLength={8}
                disabled={isLoading}
              />
              <p className="mt-1 text-xs text-[#737373]">Must be at least 8 characters</p>
            </div>

            {/* Terms */}
            <label className="flex items-start gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={agreedToTerms}
                onChange={(e) => setAgreedToTerms(e.target.checked)}
                className="mt-1 w-4 h-4 rounded border-[#2a2a2a] bg-[#0a0a0a] text-[#ff6b35] focus:ring-[#ff6b35] focus:ring-offset-0"
                disabled={isLoading}
              />
              <span className="text-sm text-[#a3a3a3]">
                I agree to the{' '}
                <Link href="/terms" className="text-[#ff6b35] hover:text-[#ff8555]">
                  Terms of Service
                </Link>{' '}
                and{' '}
                <Link href="/privacy" className="text-[#ff6b35] hover:text-[#ff8555]">
                  Privacy Policy
                </Link>
              </span>
            </label>

            {/* Sign Up Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full px-6 py-3 bg-[#ff6b35] hover:bg-[#ff8555] disabled:bg-[#ff6b35]/50 disabled:cursor-not-allowed text-[#0a0a0a] font-semibold rounded-lg transition-all shadow-lg hover:shadow-[#ff6b35]/50 hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Creating account...
                </>
              ) : (
                'Create Account'
              )}
            </button>

            {/* Divider */}
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-[#2a2a2a]"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-[#1a1a1a] text-[#737373]">Or sign up with</span>
              </div>
            </div>

            {/* SSO Options */}
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => handleOAuthSignIn('google')}
                disabled={isLoading}
                className="px-4 py-3 bg-[#2a2a2a] hover:bg-[#404040] disabled:opacity-50 disabled:cursor-not-allowed border border-[#404040] text-white rounded-lg transition-all flex items-center justify-center gap-2"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z" />
                </svg>
                Google
              </button>
              <button
                type="button"
                onClick={() => handleOAuthSignIn('github')}
                disabled={isLoading}
                className="px-4 py-3 bg-[#2a2a2a] hover:bg-[#404040] disabled:opacity-50 disabled:cursor-not-allowed border border-[#404040] text-white rounded-lg transition-all flex items-center justify-center gap-2"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
                </svg>
                GitHub
              </button>
            </div>
          </form>

          {/* Sign In Link */}
          <p className="mt-6 text-center text-sm text-[#a3a3a3]">
            Already have an account?{' '}
            <Link href="/signin" className="text-[#ff6b35] hover:text-[#ff8555] font-medium transition-colors">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
