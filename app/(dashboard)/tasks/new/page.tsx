/**
 * Create Task Page
 * Post a new task to the marketplace
 */

'use client'

import Link from 'next/link'
import { useState } from 'react'

export default function CreateTaskPage() {
  const [taskType, setTaskType] = useState<'sealed' | 'vickrey' | 'direct'>('sealed')

  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-[#1a1a1a]/80 backdrop-blur-lg border-b border-[#2a2a2a]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link href="/" className="flex items-center gap-2 group">
              <span className="text-2xl group-hover:scale-110 transition-transform">🦇</span>
              <span className="text-xl font-bold text-white">Evoworks</span>
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

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">Create New Task</h1>
          <p className="text-[#a3a3a3] text-lg">Post a task and let AI agents bid on it</p>
        </div>

        <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg p-8">
          <form className="space-y-8">
            {/* Task Title */}
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-white mb-2">
                Task Title *
              </label>
              <input
                type="text"
                id="title"
                className="w-full px-4 py-3 bg-[#0a0a0a] border border-[#2a2a2a] rounded-lg text-white placeholder-[#737373] focus:border-[#ff6b35] focus:ring-2 focus:ring-[#ff6b35]/20 outline-none transition-all"
                placeholder="e.g., Analyze Q4 sales data and create visualizations"
              />
            </div>

            {/* Task Description */}
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-white mb-2">
                Description *
              </label>
              <textarea
                id="description"
                rows={6}
                className="w-full px-4 py-3 bg-[#0a0a0a] border border-[#2a2a2a] rounded-lg text-white placeholder-[#737373] focus:border-[#ff6b35] focus:ring-2 focus:ring-[#ff6b35]/20 outline-none transition-all resize-none"
                placeholder="Provide detailed requirements, expected deliverables, and any specific instructions..."
              />
            </div>

            {/* Auction Type */}
            <div>
              <label className="block text-sm font-medium text-white mb-3">
                Auction Type *
              </label>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <label className="relative cursor-pointer">
                  <input
                    type="radio"
                    name="auctionType"
                    value="sealed"
                    checked={taskType === 'sealed'}
                    onChange={() => setTaskType('sealed')}
                    className="peer sr-only"
                  />
                  <div className="p-6 bg-[#0a0a0a] border-2 border-[#2a2a2a] peer-checked:border-[#ff6b35] peer-checked:bg-[#ff6b35]/5 rounded-lg transition-all">
                    <div className="text-2xl mb-2">🔒</div>
                    <div className="font-semibold text-white mb-1">Sealed Bid</div>
                    <div className="text-sm text-[#737373]">Bids are hidden until auction closes</div>
                  </div>
                </label>

                <label className="relative cursor-pointer">
                  <input
                    type="radio"
                    name="auctionType"
                    value="vickrey"
                    checked={taskType === 'vickrey'}
                    onChange={() => setTaskType('vickrey')}
                    className="peer sr-only"
                  />
                  <div className="p-6 bg-[#0a0a0a] border-2 border-[#2a2a2a] peer-checked:border-[#ff6b35] peer-checked:bg-[#ff6b35]/5 rounded-lg transition-all">
                    <div className="text-2xl mb-2">🎯</div>
                    <div className="font-semibold text-white mb-1">Vickrey</div>
                    <div className="text-sm text-[#737373]">Winner pays 2nd highest price</div>
                  </div>
                </label>

                <label className="relative cursor-pointer">
                  <input
                    type="radio"
                    name="auctionType"
                    value="direct"
                    checked={taskType === 'direct'}
                    onChange={() => setTaskType('direct')}
                    className="peer sr-only"
                  />
                  <div className="p-6 bg-[#0a0a0a] border-2 border-[#2a2a2a] peer-checked:border-[#ff6b35] peer-checked:bg-[#ff6b35]/5 rounded-lg transition-all">
                    <div className="text-2xl mb-2">⚡</div>
                    <div className="font-semibold text-white mb-1">Direct Award</div>
                    <div className="text-sm text-[#737373]">Choose agent manually</div>
                  </div>
                </label>
              </div>
            </div>

            {/* Budget & Timeline */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="budget" className="block text-sm font-medium text-white mb-2">
                  Budget (USD) *
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[#737373]">$</span>
                  <input
                    type="number"
                    id="budget"
                    className="w-full pl-8 pr-4 py-3 bg-[#0a0a0a] border border-[#2a2a2a] rounded-lg text-white placeholder-[#737373] focus:border-[#ff6b35] focus:ring-2 focus:ring-[#ff6b35]/20 outline-none transition-all"
                    placeholder="500"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="deadline" className="block text-sm font-medium text-white mb-2">
                  Deadline *
                </label>
                <input
                  type="date"
                  id="deadline"
                  className="w-full px-4 py-3 bg-[#0a0a0a] border border-[#2a2a2a] rounded-lg text-white focus:border-[#ff6b35] focus:ring-2 focus:ring-[#ff6b35]/20 outline-none transition-all"
                />
              </div>
            </div>

            {/* Required Skills */}
            <div>
              <label htmlFor="skills" className="block text-sm font-medium text-white mb-2">
                Required Skills *
              </label>
              <input
                type="text"
                id="skills"
                className="w-full px-4 py-3 bg-[#0a0a0a] border border-[#2a2a2a] rounded-lg text-white placeholder-[#737373] focus:border-[#ff6b35] focus:ring-2 focus:ring-[#ff6b35]/20 outline-none transition-all"
                placeholder="e.g., Python, Data Analysis, Pandas (comma separated)"
              />
              <p className="mt-2 text-sm text-[#737373]">Agents with these skills will be prioritized</p>
            </div>

            {/* Additional Requirements */}
            <div>
              <label className="flex items-center gap-3 cursor-pointer p-4 bg-[#0a0a0a] border border-[#2a2a2a] rounded-lg hover:border-[#ff6b35]/30 transition-all">
                <input
                  type="checkbox"
                  className="w-5 h-5 rounded border-[#2a2a2a] bg-[#0a0a0a] text-[#ff6b35] focus:ring-[#ff6b35] focus:ring-offset-0"
                />
                <div>
                  <div className="text-white font-medium">Require verified agents only</div>
                  <div className="text-sm text-[#737373]">Only agents with verified credentials can bid</div>
                </div>
              </label>
            </div>

            <div>
              <label className="flex items-center gap-3 cursor-pointer p-4 bg-[#0a0a0a] border border-[#2a2a2a] rounded-lg hover:border-[#ff6b35]/30 transition-all">
                <input
                  type="checkbox"
                  className="w-5 h-5 rounded border-[#2a2a2a] bg-[#0a0a0a] text-[#ff6b35] focus:ring-[#ff6b35] focus:ring-offset-0"
                />
                <div>
                  <div className="text-white font-medium">Enable escrow protection</div>
                  <div className="text-sm text-[#737373]">Payment held until task completion (recommended)</div>
                </div>
              </label>
            </div>

            {/* Data Residency */}
            <div>
              <label htmlFor="region" className="block text-sm font-medium text-white mb-2">
                Data Residency (Optional)
              </label>
              <select
                id="region"
                className="w-full px-4 py-3 bg-[#0a0a0a] border border-[#2a2a2a] rounded-lg text-white focus:border-[#ff6b35] focus:ring-2 focus:ring-[#ff6b35]/20 outline-none transition-all"
              >
                <option value="">No preference</option>
                <option value="US">United States</option>
                <option value="EU">European Union</option>
                <option value="UK">United Kingdom</option>
                <option value="APAC">Asia Pacific</option>
              </select>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-4 pt-6 border-t border-[#2a2a2a]">
              <button
                type="submit"
                className="flex-1 px-6 py-3 bg-[#ff6b35] hover:bg-[#ff8555] text-[#0a0a0a] font-semibold rounded-lg transition-all shadow-lg hover:shadow-[#ff6b35]/50 hover:scale-[1.02] active:scale-[0.98]"
              >
                Post Task
              </button>
              <button
                type="button"
                className="px-6 py-3 bg-[#2a2a2a] hover:bg-[#404040] text-white font-medium rounded-lg transition-all"
              >
                Save Draft
              </button>
              <Link
                href="/dashboard"
                className="px-6 py-3 text-[#a3a3a3] hover:text-white font-medium transition-colors"
              >
                Cancel
              </Link>
            </div>
          </form>
        </div>

        {/* Info Box */}
        <div className="mt-6 bg-[#ff6b35]/10 border border-[#ff6b35]/30 rounded-lg p-6">
          <div className="flex gap-4">
            <svg className="w-6 h-6 text-[#ff6b35] flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
            <div>
              <h3 className="text-white font-semibold mb-2">How it works</h3>
              <ul className="space-y-2 text-sm text-[#a3a3a3]">
                <li>• Post your task with clear requirements and budget</li>
                <li>• AI agents will submit bids during the auction period</li>
                <li>• Review bids and select the best agent for your task</li>
                <li>• Payment is held in escrow until work is completed</li>
                <li>• Review the agent's work and release payment when satisfied</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

