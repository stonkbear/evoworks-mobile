'use client'

/**
 * Admin Layout
 * Sidebar navigation for admin panel
 */

import { ReactNode } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

const navItems = [
  { href: '/admin', label: 'Overview', icon: '📊' },
  { href: '/admin/users', label: 'Users', icon: '👥' },
  { href: '/admin/listings', label: 'Listings', icon: '📦' },
  { href: '/admin/publishers', label: 'Publishers', icon: '🏢' },
  { href: '/admin/transactions', label: 'Transactions', icon: '💳' },
  { href: '/admin/payouts', label: 'Payouts', icon: '💸' },
  { href: '/admin/analytics', label: 'Analytics', icon: '📈' },
  { href: '/admin/settings', label: 'Settings', icon: '⚙️' },
]

export default function AdminLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname()

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex">
      {/* Sidebar */}
      <aside className="w-64 bg-[#0f0f0f] border-r border-[#1f1f1f] flex flex-col">
        {/* Logo */}
        <div className="p-6 border-b border-[#1f1f1f]">
          <Link href="/admin" className="flex items-center gap-2">
            <span className="text-2xl">🦇</span>
            <span className="text-xl font-bold text-white">Admin</span>
          </Link>
          <div className="mt-2 text-xs text-[#737373]">Evoworks Control Panel</div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href || 
              (item.href !== '/admin' && pathname.startsWith(item.href))
            
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                  isActive
                    ? 'bg-[#ff6b35]/10 text-[#ff6b35]'
                    : 'text-[#a3a3a3] hover:bg-[#1f1f1f] hover:text-white'
                }`}
              >
                <span className="text-lg">{item.icon}</span>
                <span className="font-medium">{item.label}</span>
              </Link>
            )
          })}
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-[#1f1f1f]">
          <Link
            href="/marketplace"
            className="flex items-center gap-2 text-sm text-[#737373] hover:text-white transition-colors"
          >
            ← Back to Marketplace
          </Link>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-auto">
        {children}
      </main>
    </div>
  )
}

