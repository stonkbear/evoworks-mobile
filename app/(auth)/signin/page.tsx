/**
 * Sign In Page
 * Evoworks Marketplace Authentication
 */

import Link from 'next/link'
import dynamic from 'next/dynamic'

const WaveBackground = dynamic(() => import('@/components/three/WaveBackground').then(mod => mod.WaveBackground), { ssr: false })

export default function SignInPage() {
  return (
    <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center px-4 relative overflow-hidden">
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

        {/* Sign In Card */}
        <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg p-8 shadow-xl">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-white mb-2">Welcome Back</h2>
            <p className="text-[#a3a3a3]">Sign in to your Evoworks account</p>
          </div>

          <form className="space-y-4">
            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-white mb-2">
                Email
              </label>
              <input
                type="email"
                id="email"
                className="w-full px-4 py-3 bg-[#0a0a0a] border border-[#2a2a2a] rounded-lg text-white placeholder-[#737373] focus:border-[#ff6b35] focus:ring-2 focus:ring-[#ff6b35]/20 outline-none transition-all"
                placeholder="you@company.com"
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
                className="w-full px-4 py-3 bg-[#0a0a0a] border border-[#2a2a2a] rounded-lg text-white placeholder-[#737373] focus:border-[#ff6b35] focus:ring-2 focus:ring-[#ff6b35]/20 outline-none transition-all"
                placeholder="••••••••"
              />
            </div>

            {/* Remember Me & Forgot Password */}
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  className="w-4 h-4 rounded border-[#2a2a2a] bg-[#0a0a0a] text-[#ff6b35] focus:ring-[#ff6b35] focus:ring-offset-0"
                />
                <span className="text-sm text-[#a3a3a3]">Remember me</span>
              </label>
              <Link href="/auth/forgot-password" className="text-sm text-[#ff6b35] hover:text-[#ff8555] transition-colors">
                Forgot password?
              </Link>
            </div>

            {/* Sign In Button */}
            <button
              type="submit"
              className="w-full px-6 py-3 bg-[#ff6b35] hover:bg-[#ff8555] text-[#0a0a0a] font-semibold rounded-lg transition-all shadow-lg hover:shadow-[#ff6b35]/50 hover:scale-[1.02] active:scale-[0.98]"
            >
              Sign In
            </button>

            {/* Divider */}
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-[#2a2a2a]"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-[#1a1a1a] text-[#737373]">Or continue with</span>
              </div>
            </div>

            {/* SSO Options */}
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                className="px-4 py-3 bg-[#2a2a2a] hover:bg-[#404040] border border-[#404040] text-white rounded-lg transition-all flex items-center justify-center gap-2"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z" />
                </svg>
                Google
              </button>
              <button
                type="button"
                className="px-4 py-3 bg-[#2a2a2a] hover:bg-[#404040] border border-[#404040] text-white rounded-lg transition-all flex items-center justify-center gap-2"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
                </svg>
                GitHub
              </button>
            </div>
          </form>

          {/* Sign Up Link */}
          <p className="mt-6 text-center text-sm text-[#a3a3a3]">
            Don't have an account?{' '}
            <Link href="/signup" className="text-[#ff6b35] hover:text-[#ff8555] font-medium transition-colors">
              Sign up
            </Link>
          </p>
        </div>

        {/* Enterprise SSO */}
        <div className="mt-6 text-center">
          <Link href="/enterprise/sso" className="text-sm text-[#737373] hover:text-[#a3a3a3] transition-colors">
            Enterprise SSO Login →
          </Link>
        </div>
      </div>
    </div>
  )
}

