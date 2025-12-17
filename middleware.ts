/**
 * Next.js Middleware
 * Route protection and authentication using NextAuth
 */

import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { auth } from '@/lib/auth'

// Routes that require authentication
const protectedPaths = [
  '/dashboard',
  '/publish',
  '/settings',
]

// Routes that require admin role
const adminPaths = [
  '/admin',
]

// Routes only for unauthenticated users
const authPaths = [
  '/signin',
  '/signup',
]

export default auth((req) => {
  const { nextUrl } = req
  const isLoggedIn = !!req.auth
  const path = nextUrl.pathname
  const userRole = req.auth?.user?.role

  // Check if path is protected
  const isProtectedPath = protectedPaths.some(p => path.startsWith(p))
  const isAdminPath = adminPaths.some(p => path.startsWith(p))
  const isAuthPath = authPaths.some(p => path.startsWith(p))

  // Protect admin routes - require ADMIN role
  if (isAdminPath) {
    if (!isLoggedIn) {
      const signInUrl = new URL('/signin', nextUrl.origin)
      signInUrl.searchParams.set('callbackUrl', path)
      return NextResponse.redirect(signInUrl)
    }
    if (userRole !== 'ADMIN') {
      // Redirect non-admins to marketplace
      return NextResponse.redirect(new URL('/marketplace', nextUrl.origin))
    }
  }

  // Redirect unauthenticated users from protected routes
  if (isProtectedPath && !isLoggedIn) {
    const signInUrl = new URL('/signin', nextUrl.origin)
    signInUrl.searchParams.set('callbackUrl', path)
    return NextResponse.redirect(signInUrl)
  }

  // Redirect authenticated users from auth routes
  if (isAuthPath && isLoggedIn) {
    return NextResponse.redirect(new URL('/dashboard', nextUrl.origin))
  }

  return NextResponse.next()
})

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files
     * - api routes
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$|api).*)',
  ],
}
