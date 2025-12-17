/**
 * NextAuth Configuration
 * Evoworks Marketplace Authentication
 */

import type { NextAuthConfig } from 'next-auth'
import Credentials from 'next-auth/providers/credentials'
import Google from 'next-auth/providers/google'
import GitHub from 'next-auth/providers/github'
import bcrypt from 'bcryptjs'
import prisma from '@/lib/prisma'

export const authConfig: NextAuthConfig = {
  providers: [
    // Google OAuth
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    
    // GitHub OAuth
    GitHub({
      clientId: process.env.GITHUB_CLIENT_ID!,
      clientSecret: process.env.GITHUB_CLIENT_SECRET!,
    }),
    
    // Email/Password Credentials
    Credentials({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error('Email and password required')
        }

        const email = credentials.email as string
        const password = credentials.password as string

        // Find user by email
        const user = await prisma.user.findUnique({
          where: { email },
        })

        if (!user || !user.passwordHash) {
          throw new Error('Invalid credentials')
        }

        // Verify password
        const isValid = await bcrypt.compare(password, user.passwordHash)
        
        if (!isValid) {
          throw new Error('Invalid credentials')
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
        }
      },
    }),
  ],
  
  pages: {
    signIn: '/signin',
    signOut: '/signout',
    error: '/auth/error',
    newUser: '/onboarding',
  },
  
  callbacks: {
    // Control access to routes
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user
      const isOnDashboard = nextUrl.pathname.startsWith('/dashboard')
      const isOnPublish = nextUrl.pathname.startsWith('/publish')
      
      if (isOnDashboard || isOnPublish) {
        if (isLoggedIn) return true
        return false // Redirect to login
      }
      
      return true
    },
    
    // Add custom fields to JWT token
    async jwt({ token, user, account }) {
      if (user) {
        token.id = user.id
        token.role = (user as { role?: string }).role || 'BUYER'
      }
      
      // Handle OAuth account linking
      if (account?.provider && account.provider !== 'credentials') {
        // Check if user exists, if not create one
        const existingUser = await prisma.user.findUnique({
          where: { email: token.email! },
        })
        
        if (!existingUser) {
          const newUser = await prisma.user.create({
            data: {
              email: token.email!,
              name: token.name,
              role: 'BUYER',
              emailVerified: new Date(),
            },
          })
          token.id = newUser.id
          token.role = newUser.role
        } else {
          token.id = existingUser.id
          token.role = existingUser.role
        }
      }
      
      return token
    },
    
    // Make session data available on client
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string
        session.user.role = token.role as string
      }
      return session
    },
  },
  
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  
  trustHost: true,
}

export default authConfig

