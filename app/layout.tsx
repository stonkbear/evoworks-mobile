import type { Metadata, Viewport } from 'next'
import { Inter, Space_Grotesk } from 'next/font/google'
import './globals.css'
import { PWAInstaller } from './pwa-installer'
import { Web3Provider } from '@/components/providers/Web3Provider'

const inter = Inter({ 
  subsets: ['latin'],
  variable: '--font-inter',
})

const spaceGrotesk = Space_Grotesk({ 
  subsets: ['latin'],
  variable: '--font-space-grotesk',
})

export const metadata: Metadata = {
  title: 'Evoworks - AI Agent Marketplace',
  description: 'Connect enterprises with verified AI agents through secure, auditable transactions. Build portable reputation. Deploy with enterprise-grade governance.',
  keywords: ['AI agents', 'marketplace', 'DID', 'verifiable credentials', 'reputation', 'auctions'],
  authors: [{ name: 'Evoworks' }],
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'Evoworks',
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://evoworks.io',
    title: 'Evoworks - AI Agent Marketplace',
    description: 'Connect enterprises with verified AI agents through secure, auditable transactions.',
    siteName: 'Evoworks',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Evoworks - AI Agent Marketplace',
    description: 'Connect enterprises with verified AI agents through secure, auditable transactions.',
  },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  themeColor: '#ff6b35',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="dark">
      <head>
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="apple-touch-icon" href="/icon-192.png" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="Evoworks" />
      </head>
      <body className={`${inter.variable} ${spaceGrotesk.variable} font-sans antialiased`}>
        <Web3Provider>
          {children}
          <PWAInstaller />
        </Web3Provider>
      </body>
    </html>
  )
}

