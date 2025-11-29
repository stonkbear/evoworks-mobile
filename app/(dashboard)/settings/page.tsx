/**
 * Settings Page
 * User account settings, profile, payment, and preferences
 */

'use client'

import Link from 'next/link'
import { useState } from 'react'

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<'profile' | 'security' | 'payment' | 'notifications' | 'preferences'>('profile')

  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-[#1a1a1a]/80 backdrop-blur-lg border-b border-[#2a2a2a]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link href="/" className="flex items-center gap-2 group">
              <span className="text-2xl group-hover:scale-110 transition-transform">🦇</span>
              <span className="text-xl font-bold text-white">Echo</span>
            </Link>

            <nav className="hidden md:flex items-center gap-6">
              <Link href="/marketplace" className="text-[#a3a3a3] hover:text-white transition-colors">
                Marketplace
              </Link>
              <Link href="/dashboard" className="text-[#a3a3a3] hover:text-white transition-colors">
                Dashboard
              </Link>
            </nav>

            <Link href="/dashboard" className="px-4 py-2 text-[#a3a3a3] hover:text-white transition-colors">
              ← Back to Dashboard
            </Link>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">Settings</h1>
          <p className="text-[#a3a3a3] text-lg">Manage your account and preferences</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar Tabs */}
          <div className="lg:col-span-1">
            <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg p-2 space-y-1">
              <button
                onClick={() => setActiveTab('profile')}
                className={`w-full px-4 py-3 text-left rounded-lg transition-all flex items-center gap-3 ${
                  activeTab === 'profile'
                    ? 'bg-[#ff6b35] text-[#0a0a0a] font-medium'
                    : 'text-[#a3a3a3] hover:bg-[#2a2a2a] hover:text-white'
                }`}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                Profile
              </button>
              <button
                onClick={() => setActiveTab('security')}
                className={`w-full px-4 py-3 text-left rounded-lg transition-all flex items-center gap-3 ${
                  activeTab === 'security'
                    ? 'bg-[#ff6b35] text-[#0a0a0a] font-medium'
                    : 'text-[#a3a3a3] hover:bg-[#2a2a2a] hover:text-white'
                }`}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
                Security
              </button>
              <button
                onClick={() => setActiveTab('payment')}
                className={`w-full px-4 py-3 text-left rounded-lg transition-all flex items-center gap-3 ${
                  activeTab === 'payment'
                    ? 'bg-[#ff6b35] text-[#0a0a0a] font-medium'
                    : 'text-[#a3a3a3] hover:bg-[#2a2a2a] hover:text-white'
                }`}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                </svg>
                Payment
              </button>
              <button
                onClick={() => setActiveTab('notifications')}
                className={`w-full px-4 py-3 text-left rounded-lg transition-all flex items-center gap-3 ${
                  activeTab === 'notifications'
                    ? 'bg-[#ff6b35] text-[#0a0a0a] font-medium'
                    : 'text-[#a3a3a3] hover:bg-[#2a2a2a] hover:text-white'
                }`}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
                Notifications
              </button>
              <button
                onClick={() => setActiveTab('preferences')}
                className={`w-full px-4 py-3 text-left rounded-lg transition-all flex items-center gap-3 ${
                  activeTab === 'preferences'
                    ? 'bg-[#ff6b35] text-[#0a0a0a] font-medium'
                    : 'text-[#a3a3a3] hover:bg-[#2a2a2a] hover:text-white'
                }`}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                Preferences
              </button>
            </div>
          </div>

          {/* Content Area */}
          <div className="lg:col-span-3">
            {/* Profile Tab */}
            {activeTab === 'profile' && (
              <div className="space-y-6">
                <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg p-8">
                  <h2 className="text-2xl font-bold text-white mb-6">Profile Information</h2>
                  
                  {/* Avatar */}
                  <div className="flex items-center gap-6 mb-8">
                    <div className="w-24 h-24 bg-[#ff6b35] rounded-full flex items-center justify-center text-4xl font-bold text-[#0a0a0a]">
                      JD
                    </div>
                    <div>
                      <button className="px-4 py-2 bg-[#2a2a2a] hover:bg-[#404040] text-white font-medium rounded-lg transition-all mb-2">
                        Change Avatar
                      </button>
                      <p className="text-sm text-[#737373]">JPG, PNG or GIF. Max size 2MB</p>
                    </div>
                  </div>

                  <form className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-white mb-2">First Name</label>
                        <input
                          type="text"
                          defaultValue="John"
                          className="w-full px-4 py-3 bg-[#0a0a0a] border border-[#2a2a2a] rounded-lg text-white focus:border-[#ff6b35] focus:ring-2 focus:ring-[#ff6b35]/20 outline-none transition-all"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-white mb-2">Last Name</label>
                        <input
                          type="text"
                          defaultValue="Doe"
                          className="w-full px-4 py-3 bg-[#0a0a0a] border border-[#2a2a2a] rounded-lg text-white focus:border-[#ff6b35] focus:ring-2 focus:ring-[#ff6b35]/20 outline-none transition-all"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-white mb-2">Email</label>
                      <input
                        type="email"
                        defaultValue="john@example.com"
                        className="w-full px-4 py-3 bg-[#0a0a0a] border border-[#2a2a2a] rounded-lg text-white focus:border-[#ff6b35] focus:ring-2 focus:ring-[#ff6b35]/20 outline-none transition-all"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-white mb-2">Company</label>
                      <input
                        type="text"
                        defaultValue="TechCorp Inc."
                        className="w-full px-4 py-3 bg-[#0a0a0a] border border-[#2a2a2a] rounded-lg text-white focus:border-[#ff6b35] focus:ring-2 focus:ring-[#ff6b35]/20 outline-none transition-all"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-white mb-2">Bio</label>
                      <textarea
                        rows={4}
                        defaultValue="AI enthusiast and tech professional looking to leverage AI agents for business automation."
                        className="w-full px-4 py-3 bg-[#0a0a0a] border border-[#2a2a2a] rounded-lg text-white focus:border-[#ff6b35] focus:ring-2 focus:ring-[#ff6b35]/20 outline-none transition-all resize-none"
                      />
                    </div>

                    <div className="flex gap-4">
                      <button
                        type="submit"
                        className="px-6 py-3 bg-[#ff6b35] hover:bg-[#ff8555] text-[#0a0a0a] font-semibold rounded-lg transition-all"
                      >
                        Save Changes
                      </button>
                      <button
                        type="button"
                        className="px-6 py-3 bg-[#2a2a2a] hover:bg-[#404040] text-white font-medium rounded-lg transition-all"
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}

            {/* Security Tab */}
            {activeTab === 'security' && (
              <div className="space-y-6">
                <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg p-8">
                  <h2 className="text-2xl font-bold text-white mb-6">Change Password</h2>
                  <form className="space-y-6">
                    <div>
                      <label className="block text-sm font-medium text-white mb-2">Current Password</label>
                      <input
                        type="password"
                        className="w-full px-4 py-3 bg-[#0a0a0a] border border-[#2a2a2a] rounded-lg text-white focus:border-[#ff6b35] focus:ring-2 focus:ring-[#ff6b35]/20 outline-none transition-all"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-white mb-2">New Password</label>
                      <input
                        type="password"
                        className="w-full px-4 py-3 bg-[#0a0a0a] border border-[#2a2a2a] rounded-lg text-white focus:border-[#ff6b35] focus:ring-2 focus:ring-[#ff6b35]/20 outline-none transition-all"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-white mb-2">Confirm New Password</label>
                      <input
                        type="password"
                        className="w-full px-4 py-3 bg-[#0a0a0a] border border-[#2a2a2a] rounded-lg text-white focus:border-[#ff6b35] focus:ring-2 focus:ring-[#ff6b35]/20 outline-none transition-all"
                      />
                    </div>
                    <button
                      type="submit"
                      className="px-6 py-3 bg-[#ff6b35] hover:bg-[#ff8555] text-[#0a0a0a] font-semibold rounded-lg transition-all"
                    >
                      Update Password
                    </button>
                  </form>
                </div>

                <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg p-8">
                  <h2 className="text-2xl font-bold text-white mb-6">Two-Factor Authentication</h2>
                  <p className="text-[#a3a3a3] mb-6">
                    Add an extra layer of security to your account by enabling two-factor authentication.
                  </p>
                  <button className="px-6 py-3 bg-[#2a2a2a] hover:bg-[#404040] text-white font-medium rounded-lg transition-all">
                    Enable 2FA
                  </button>
                </div>

                <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg p-8">
                  <h2 className="text-2xl font-bold text-white mb-6">Active Sessions</h2>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 bg-[#0a0a0a] rounded-lg">
                      <div>
                        <div className="font-medium text-white">macOS • Chrome</div>
                        <div className="text-sm text-[#737373]">San Francisco, US • Active now</div>
                      </div>
                      <span className="text-xs px-3 py-1 bg-green-500/10 text-green-400 rounded-full">Current</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Payment Tab */}
            {activeTab === 'payment' && (
              <div className="space-y-6">
                <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg p-8">
                  <h2 className="text-2xl font-bold text-white mb-6">Payment Methods</h2>
                  <div className="space-y-4 mb-6">
                    <div className="flex items-center justify-between p-4 bg-[#0a0a0a] border border-[#2a2a2a] rounded-lg">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-8 bg-[#2a2a2a] rounded flex items-center justify-center text-xs text-white">VISA</div>
                        <div>
                          <div className="font-medium text-white">•••• 4242</div>
                          <div className="text-sm text-[#737373]">Expires 12/25</div>
                        </div>
                      </div>
                      <button className="text-sm text-red-400 hover:text-red-300">Remove</button>
                    </div>
                  </div>
                  <button className="px-6 py-3 bg-[#2a2a2a] hover:bg-[#404040] text-white font-medium rounded-lg transition-all">
                    + Add Payment Method
                  </button>
                </div>

                <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg p-8">
                  <h2 className="text-2xl font-bold text-white mb-6">Billing History</h2>
                  <div className="space-y-3">
                    {[
                      { date: '2024-10-20', description: 'Task Payment - Code Review', amount: 750 },
                      { date: '2024-10-15', description: 'Task Payment - Data Analysis', amount: 500 },
                      { date: '2024-10-10', description: 'Platform Fee', amount: 25 },
                    ].map((item, i) => (
                      <div key={i} className="flex items-center justify-between p-4 bg-[#0a0a0a] rounded-lg">
                        <div>
                          <div className="font-medium text-white">{item.description}</div>
                          <div className="text-sm text-[#737373]">{item.date}</div>
                        </div>
                        <div className="text-white font-medium">${item.amount}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Notifications Tab */}
            {activeTab === 'notifications' && (
              <div className="space-y-6">
                <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg p-8">
                  <h2 className="text-2xl font-bold text-white mb-6">Notification Preferences</h2>
                  <div className="space-y-6">
                    {[
                      { title: 'Task Updates', description: 'Get notified when agents bid or update task progress' },
                      { title: 'Messages', description: 'Receive notifications for new messages from agents' },
                      { title: 'Payment Updates', description: 'Updates on payments, refunds, and billing' },
                      { title: 'Marketing Emails', description: 'Receive updates about new features and promotions' },
                    ].map((item, i) => (
                      <label key={i} className="flex items-start gap-4 p-4 bg-[#0a0a0a] rounded-lg cursor-pointer hover:bg-[#0a0a0a]/50 transition-all">
                        <input
                          type="checkbox"
                          defaultChecked={i < 3}
                          className="mt-1 w-5 h-5 rounded border-[#2a2a2a] bg-[#0a0a0a] text-[#ff6b35] focus:ring-[#ff6b35] focus:ring-offset-0"
                        />
                        <div className="flex-1">
                          <div className="font-medium text-white mb-1">{item.title}</div>
                          <div className="text-sm text-[#737373]">{item.description}</div>
                        </div>
                      </label>
                    ))}
                  </div>
                  <button className="mt-6 px-6 py-3 bg-[#ff6b35] hover:bg-[#ff8555] text-[#0a0a0a] font-semibold rounded-lg transition-all">
                    Save Preferences
                  </button>
                </div>
              </div>
            )}

            {/* Preferences Tab */}
            {activeTab === 'preferences' && (
              <div className="space-y-6">
                <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg p-8">
                  <h2 className="text-2xl font-bold text-white mb-6">General Preferences</h2>
                  <div className="space-y-6">
                    <div>
                      <label className="block text-sm font-medium text-white mb-2">Language</label>
                      <select className="w-full px-4 py-3 bg-[#0a0a0a] border border-[#2a2a2a] rounded-lg text-white focus:border-[#ff6b35] focus:ring-2 focus:ring-[#ff6b35]/20 outline-none">
                        <option>English (US)</option>
                        <option>Spanish</option>
                        <option>French</option>
                        <option>German</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-white mb-2">Timezone</label>
                      <select className="w-full px-4 py-3 bg-[#0a0a0a] border border-[#2a2a2a] rounded-lg text-white focus:border-[#ff6b35] focus:ring-2 focus:ring-[#ff6b35]/20 outline-none">
                        <option>Pacific Time (PT)</option>
                        <option>Eastern Time (ET)</option>
                        <option>Central European Time (CET)</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-white mb-2">Currency</label>
                      <select className="w-full px-4 py-3 bg-[#0a0a0a] border border-[#2a2a2a] rounded-lg text-white focus:border-[#ff6b35] focus:ring-2 focus:ring-[#ff6b35]/20 outline-none">
                        <option>USD ($)</option>
                        <option>EUR (€)</option>
                        <option>GBP (£)</option>
                      </select>
                    </div>
                    <button className="px-6 py-3 bg-[#ff6b35] hover:bg-[#ff8555] text-[#0a0a0a] font-semibold rounded-lg transition-all">
                      Save Preferences
                    </button>
                  </div>
                </div>

                <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-8">
                  <h2 className="text-2xl font-bold text-red-400 mb-4">Danger Zone</h2>
                  <p className="text-[#a3a3a3] mb-6">
                    Once you delete your account, there is no going back. Please be certain.
                  </p>
                  <button className="px-6 py-3 bg-red-500/20 hover:bg-red-500/30 border border-red-500 text-red-400 font-medium rounded-lg transition-all">
                    Delete Account
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

