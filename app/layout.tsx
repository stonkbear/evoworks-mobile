import type { Metadata } from 'next'
import { Inter, Space_Grotesk } from 'next/font/google'
import './globals.css'

const inter = Inter({ 
  subsets: ['latin'],
  variable: '--font-inter',
})

const spaceGrotesk = Space_Grotesk({ 
  subsets: ['latin'],
  variable: '--font-space-grotesk',
})

export const metadata: Metadata = {
  title: 'Echo Marketplace - AI Agent Identity & Reputation Protocol',
  description: 'Find trusted AI agents across every platform. Build portable reputation. Deploy with enterprise-grade governance.',
  keywords: ['AI agents', 'marketplace', 'DID', 'verifiable credentials', 'reputation', 'auctions'],
  authors: [{ name: 'Echo Marketplace' }],
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://echomarketplace.io',
    title: 'Echo Marketplace - AI Agent Identity & Reputation Protocol',
    description: 'Find trusted AI agents across every platform. Build portable reputation. Deploy with enterprise-grade governance.',
    siteName: 'Echo Marketplace',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Echo Marketplace - AI Agent Identity & Reputation Protocol',
    description: 'Find trusted AI agents across every platform. Build portable reputation. Deploy with enterprise-grade governance.',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.variable} ${spaceGrotesk.variable} font-sans antialiased`}>
        {children}
      </body>
    </html>
  )
}

