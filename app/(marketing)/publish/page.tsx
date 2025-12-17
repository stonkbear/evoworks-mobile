'use client'

/**
 * Publish Page
 * Multi-step form for Ghost Flow users to list their creations on Evoworks
 */

import { useState } from 'react'
import Link from 'next/link'

type ListingType = 'agent' | 'workflow' | 'swarm' | 'knowledge-pack' | 'template' | 'integration'
type PricingModel = 'free' | 'per-call' | 'subscription' | 'one-time'

interface FormData {
  // Step 1: Type selection
  type: ListingType | null
  // Step 2: Import or details
  importMethod: 'ghost-flow' | 'manual' | null
  ghostFlowId: string
  name: string
  shortDescription: string
  fullDescription: string
  category: string
  tags: string[]
  // Step 3: Technical
  models: string[]
  tools: string[]
  // Step 4: Pricing
  pricingModel: PricingModel
  priceAmount: number
  // Step 5: Preview
}

const typeConfig: Record<ListingType, { icon: string; label: string; color: string; description: string }> = {
  'agent': { 
    icon: '🤖', 
    label: 'AI Agent', 
    color: '#ff6b35',
    description: 'A single autonomous AI worker that performs specific tasks'
  },
  'workflow': { 
    icon: '⚡', 
    label: 'Workflow', 
    color: '#8b5cf6',
    description: 'Multi-step automation pipeline with triggers and actions'
  },
  'swarm': { 
    icon: '🐝', 
    label: 'Swarm', 
    color: '#f59e0b',
    description: 'Coordinated team of multiple agents working together'
  },
  'knowledge-pack': { 
    icon: '📚', 
    label: 'Knowledge Pack', 
    color: '#10b981',
    description: 'Curated RAG dataset for domain-specific knowledge'
  },
  'template': { 
    icon: '📋', 
    label: 'Template', 
    color: '#6366f1',
    description: 'Ready-to-customize starter for common use cases'
  },
  'integration': { 
    icon: '🔌', 
    label: 'Integration', 
    color: '#ec4899',
    description: 'Connect Ghost Flow with external services and APIs'
  },
}

const categories = [
  'Development', 'Research', 'Content', 'Sales', 'Marketing', 
  'Support', 'Legal', 'Healthcare', 'Finance', 'Productivity', 'E-commerce', 'Other'
]

const availableModels = [
  { id: 'gpt-4', label: 'GPT-4', color: '#10a37f' },
  { id: 'gpt-4-turbo', label: 'GPT-4 Turbo', color: '#10a37f' },
  { id: 'claude-3-opus', label: 'Claude 3 Opus', color: '#d97706' },
  { id: 'claude-3-sonnet', label: 'Claude 3 Sonnet', color: '#d97706' },
  { id: 'gemini-pro', label: 'Gemini Pro', color: '#4285f4' },
]

const availableTools = [
  { id: 'http', label: 'HTTP/API', icon: '🌐' },
  { id: 'filesystem', label: 'Filesystem', icon: '📁' },
  { id: 'database', label: 'Database', icon: '🗄️' },
  { id: 'git', label: 'Git', icon: '🔀' },
  { id: 'codegen', label: 'Code Generation', icon: '💻' },
  { id: 'email', label: 'Email', icon: '📧' },
  { id: 'slack', label: 'Slack', icon: '💬' },
  { id: 'notion', label: 'Notion', icon: '📝' },
]

// Mock Ghost Flow imports
const mockGhostFlowItems = [
  { id: 'gf_001', name: 'My Research Agent', type: 'agent' as ListingType, created: '2024-12-10' },
  { id: 'gf_002', name: 'Content Pipeline', type: 'workflow' as ListingType, created: '2024-12-08' },
  { id: 'gf_003', name: 'Code Review Team', type: 'swarm' as ListingType, created: '2024-12-05' },
  { id: 'gf_004', name: 'Sales Automation', type: 'workflow' as ListingType, created: '2024-12-01' },
]

export default function PublishPage() {
  const [step, setStep] = useState(1)
  const [isConnected, setIsConnected] = useState(false)
  const [isConnecting, setIsConnecting] = useState(false)
  const [formData, setFormData] = useState<FormData>({
    type: null,
    importMethod: null,
    ghostFlowId: '',
    name: '',
    shortDescription: '',
    fullDescription: '',
    category: '',
    tags: [],
    models: [],
    tools: [],
    pricingModel: 'free',
    priceAmount: 0,
  })
  const [tagInput, setTagInput] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)

  const totalSteps = 5

  const updateForm = (updates: Partial<FormData>) => {
    setFormData(prev => ({ ...prev, ...updates }))
  }

  const handleConnect = async () => {
    setIsConnecting(true)
    // Simulate OAuth connection
    await new Promise(resolve => setTimeout(resolve, 1500))
    setIsConnecting(false)
    setIsConnected(true)
  }

  const handleAddTag = () => {
    if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
      updateForm({ tags: [...formData.tags, tagInput.trim()] })
      setTagInput('')
    }
  }

  const handleRemoveTag = (tag: string) => {
    updateForm({ tags: formData.tags.filter(t => t !== tag) })
  }

  const handleSubmit = async () => {
    setIsSubmitting(true)
    // Simulate submission
    await new Promise(resolve => setTimeout(resolve, 2000))
    setIsSubmitting(false)
    setIsSubmitted(true)
  }

  const canProceed = () => {
    switch (step) {
      case 1: return formData.type !== null
      case 2: return formData.name && formData.shortDescription && formData.category
      case 3: return formData.models.length > 0 || formData.type === 'integration'
      case 4: return true
      case 5: return true
      default: return false
    }
  }

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <div className="text-center max-w-md">
          <div className="w-20 h-20 bg-[#10b981]/20 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-10 h-10 text-[#10b981]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-white mb-3">Listing Submitted!</h1>
          <p className="text-[#737373] mb-8">
            Your {typeConfig[formData.type!]?.label.toLowerCase()} &quot;{formData.name}&quot; has been submitted for review. 
            We&apos;ll notify you once it&apos;s approved and live on the marketplace.
          </p>
          <div className="space-y-3">
            <Link
              href="/marketplace"
              className="block w-full px-6 py-3 bg-[#ff6b35] hover:bg-[#ff8555] text-[#0a0a0a] font-semibold rounded-xl transition-all"
            >
              View Marketplace
            </Link>
            <button
              onClick={() => {
                setIsSubmitted(false)
                setStep(1)
                setFormData({
                  type: null,
                  importMethod: null,
                  ghostFlowId: '',
                  name: '',
                  shortDescription: '',
                  fullDescription: '',
                  category: '',
                  tags: [],
                  models: [],
                  tools: [],
                  pricingModel: 'free',
                  priceAmount: 0,
                })
              }}
              className="block w-full px-6 py-3 bg-[#1f1f1f] hover:bg-[#252525] text-white font-medium rounded-xl transition-all"
            >
              Publish Another
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-[#0a0a0a]/90 backdrop-blur-xl border-b border-[#1a1a1a]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link href="/" className="flex items-center gap-2 group">
              <span className="text-2xl group-hover:scale-110 transition-transform">🦇</span>
              <span className="text-xl font-bold text-white">Evoworks</span>
            </Link>
            <Link href="/marketplace" className="text-[#737373] hover:text-white transition-colors text-sm">
              ← Back to Marketplace
            </Link>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Title */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Publish to Evoworks</h1>
          <p className="text-[#737373]">List your Ghost Flow creation and start earning</p>
        </div>

        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            {[1, 2, 3, 4, 5].map((s) => (
              <div key={s} className="flex items-center">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center font-bold transition-all ${
                    s < step
                      ? 'bg-[#ff6b35] text-[#0a0a0a]'
                      : s === step
                      ? 'bg-[#ff6b35]/20 text-[#ff6b35] border-2 border-[#ff6b35]'
                      : 'bg-[#1f1f1f] text-[#525252]'
                  }`}
                >
                  {s < step ? '✓' : s}
                </div>
                {s < 5 && (
                  <div
                    className={`w-16 sm:w-24 h-1 mx-2 rounded ${
                      s < step ? 'bg-[#ff6b35]' : 'bg-[#1f1f1f]'
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
          <div className="flex justify-between text-xs text-[#525252]">
            <span>Type</span>
            <span>Details</span>
            <span>Technical</span>
            <span>Pricing</span>
            <span>Preview</span>
          </div>
        </div>

        {/* Step Content */}
        <div className="bg-[#141414] border border-[#1f1f1f] rounded-2xl p-6 sm:p-8 min-h-[400px]">
          
          {/* Step 1: Type Selection */}
          {step === 1 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-bold text-white mb-2">What are you publishing?</h2>
                <p className="text-[#737373]">Select the type of Ghost Flow creation you want to list</p>
              </div>

              {/* Ghost Flow Connection */}
              {!isConnected && (
                <div className="bg-[#1f1f1f] rounded-xl p-6 text-center">
                  <div className="text-4xl mb-3">👻</div>
                  <h3 className="text-lg font-bold text-white mb-2">Connect Ghost Flow</h3>
                  <p className="text-[#737373] text-sm mb-4">
                    Connect your Ghost Flow account to import your creations directly
                  </p>
                  <button
                    onClick={handleConnect}
                    disabled={isConnecting}
                    className="px-6 py-3 bg-[#8b5cf6] hover:bg-[#7c3aed] disabled:opacity-50 text-white font-semibold rounded-xl transition-all flex items-center gap-2 mx-auto"
                  >
                    {isConnecting ? (
                      <>
                        <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                        </svg>
                        Connecting...
                      </>
                    ) : (
                      <>
                        <span>👻</span>
                        Connect Ghost Flow
                      </>
                    )}
                  </button>
                </div>
              )}

              {isConnected && (
                <div className="bg-[#10b981]/10 border border-[#10b981]/30 rounded-xl p-4 flex items-center gap-3">
                  <div className="w-10 h-10 bg-[#10b981]/20 rounded-full flex items-center justify-center">
                    <svg className="w-5 h-5 text-[#10b981]" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div>
                    <div className="font-medium text-white">Ghost Flow Connected</div>
                    <div className="text-xs text-[#10b981]">Signed in as user@example.com</div>
                  </div>
                </div>
              )}

              {/* Type Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {(Object.entries(typeConfig) as [ListingType, typeof typeConfig[ListingType]][]).map(([key, config]) => (
                  <button
                    key={key}
                    onClick={() => updateForm({ type: key })}
                    className={`p-4 rounded-xl border-2 transition-all text-left ${
                      formData.type === key
                        ? 'border-[#ff6b35] bg-[#ff6b35]/10'
                        : 'border-[#1f1f1f] hover:border-[#333] bg-[#1a1a1a]'
                    }`}
                  >
                    <div className="text-3xl mb-2">{config.icon}</div>
                    <div className="font-bold text-white text-sm">{config.label}</div>
                    <div className="text-xs text-[#525252] mt-1 line-clamp-2">{config.description}</div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Step 2: Details */}
          {step === 2 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-bold text-white mb-2">Listing Details</h2>
                <p className="text-[#737373]">Describe your {typeConfig[formData.type!]?.label.toLowerCase()}</p>
              </div>

              {/* Import from Ghost Flow */}
              {isConnected && formData.importMethod === null && (
                <div className="grid grid-cols-2 gap-4">
                  <button
                    onClick={() => updateForm({ importMethod: 'ghost-flow' })}
                    className="p-6 rounded-xl border-2 border-[#1f1f1f] hover:border-[#8b5cf6] bg-[#1a1a1a] transition-all text-left"
                  >
                    <div className="text-3xl mb-2">👻</div>
                    <div className="font-bold text-white">Import from Ghost Flow</div>
                    <div className="text-xs text-[#525252] mt-1">Auto-fill details from your existing creation</div>
                  </button>
                  <button
                    onClick={() => updateForm({ importMethod: 'manual' })}
                    className="p-6 rounded-xl border-2 border-[#1f1f1f] hover:border-[#ff6b35] bg-[#1a1a1a] transition-all text-left"
                  >
                    <div className="text-3xl mb-2">✏️</div>
                    <div className="font-bold text-white">Enter Manually</div>
                    <div className="text-xs text-[#525252] mt-1">Fill in all details yourself</div>
                  </button>
                </div>
              )}

              {/* Ghost Flow Import List */}
              {formData.importMethod === 'ghost-flow' && !formData.ghostFlowId && (
                <div className="space-y-3">
                  <h3 className="font-medium text-white">Select from your Ghost Flow creations:</h3>
                  {mockGhostFlowItems
                    .filter(item => item.type === formData.type)
                    .map(item => (
                      <button
                        key={item.id}
                        onClick={() => {
                          updateForm({
                            ghostFlowId: item.id,
                            name: item.name,
                            shortDescription: `Imported from Ghost Flow - ${item.name}`,
                          })
                        }}
                        className="w-full p-4 rounded-xl border border-[#1f1f1f] hover:border-[#8b5cf6] bg-[#1a1a1a] transition-all text-left flex items-center justify-between"
                      >
                        <div className="flex items-center gap-3">
                          <span className="text-2xl">{typeConfig[item.type].icon}</span>
                          <div>
                            <div className="font-medium text-white">{item.name}</div>
                            <div className="text-xs text-[#525252]">Created {item.created}</div>
                          </div>
                        </div>
                        <svg className="w-5 h-5 text-[#525252]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </button>
                    ))}
                  {mockGhostFlowItems.filter(item => item.type === formData.type).length === 0 && (
                    <div className="text-center py-8 text-[#525252]">
                      No {typeConfig[formData.type!]?.label.toLowerCase()}s found in your Ghost Flow account.
                      <button
                        onClick={() => updateForm({ importMethod: 'manual' })}
                        className="block mx-auto mt-2 text-[#ff6b35] hover:underline"
                      >
                        Enter details manually instead
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* Manual Form */}
              {(formData.importMethod === 'manual' || formData.ghostFlowId || !isConnected) && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-white mb-2">Name *</label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => updateForm({ name: e.target.value })}
                      placeholder={`My Amazing ${typeConfig[formData.type!]?.label}`}
                      className="w-full px-4 py-3 bg-[#1a1a1a] border border-[#252525] rounded-xl text-white placeholder-[#525252] focus:border-[#ff6b35] focus:ring-2 focus:ring-[#ff6b35]/20 outline-none transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-white mb-2">Short Description *</label>
                    <input
                      type="text"
                      value={formData.shortDescription}
                      onChange={(e) => updateForm({ shortDescription: e.target.value })}
                      placeholder="One line that sells your creation (max 120 chars)"
                      maxLength={120}
                      className="w-full px-4 py-3 bg-[#1a1a1a] border border-[#252525] rounded-xl text-white placeholder-[#525252] focus:border-[#ff6b35] focus:ring-2 focus:ring-[#ff6b35]/20 outline-none transition-all"
                    />
                    <div className="text-xs text-[#525252] mt-1 text-right">{formData.shortDescription.length}/120</div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-white mb-2">Full Description</label>
                    <textarea
                      value={formData.fullDescription}
                      onChange={(e) => updateForm({ fullDescription: e.target.value })}
                      placeholder="Detailed description of what your creation does, use cases, and features..."
                      rows={4}
                      className="w-full px-4 py-3 bg-[#1a1a1a] border border-[#252525] rounded-xl text-white placeholder-[#525252] focus:border-[#ff6b35] focus:ring-2 focus:ring-[#ff6b35]/20 outline-none transition-all resize-none"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-white mb-2">Category *</label>
                      <select
                        value={formData.category}
                        onChange={(e) => updateForm({ category: e.target.value })}
                        className="w-full px-4 py-3 bg-[#1a1a1a] border border-[#252525] rounded-xl text-white focus:border-[#ff6b35] outline-none cursor-pointer"
                      >
                        <option value="">Select category...</option>
                        {categories.map(cat => (
                          <option key={cat} value={cat.toLowerCase()}>{cat}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-white mb-2">Tags</label>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={tagInput}
                          onChange={(e) => setTagInput(e.target.value)}
                          onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
                          placeholder="Add tag..."
                          className="flex-1 px-4 py-3 bg-[#1a1a1a] border border-[#252525] rounded-xl text-white placeholder-[#525252] focus:border-[#ff6b35] outline-none transition-all"
                        />
                        <button
                          onClick={handleAddTag}
                          className="px-4 py-3 bg-[#252525] hover:bg-[#333] text-white rounded-xl transition-all"
                        >
                          +
                        </button>
                      </div>
                    </div>
                  </div>

                  {formData.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {formData.tags.map(tag => (
                        <span
                          key={tag}
                          className="px-3 py-1 bg-[#1f1f1f] text-[#a3a3a3] rounded-lg text-sm flex items-center gap-2"
                        >
                          #{tag}
                          <button
                            onClick={() => handleRemoveTag(tag)}
                            className="text-[#525252] hover:text-white"
                          >
                            ×
                          </button>
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Step 3: Technical */}
          {step === 3 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-bold text-white mb-2">Technical Configuration</h2>
                <p className="text-[#737373]">Select the models and tools your {typeConfig[formData.type!]?.label.toLowerCase()} uses</p>
              </div>

              {/* Models */}
              <div>
                <label className="block text-sm font-medium text-white mb-3">Supported AI Models *</label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {availableModels.map(model => (
                    <button
                      key={model.id}
                      onClick={() => {
                        const models = formData.models.includes(model.id)
                          ? formData.models.filter(m => m !== model.id)
                          : [...formData.models, model.id]
                        updateForm({ models })
                      }}
                      className={`p-3 rounded-xl border-2 transition-all flex items-center gap-2 ${
                        formData.models.includes(model.id)
                          ? 'border-[#ff6b35] bg-[#ff6b35]/10'
                          : 'border-[#1f1f1f] hover:border-[#333] bg-[#1a1a1a]'
                      }`}
                    >
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: model.color }}
                      />
                      <span className="text-sm text-white">{model.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Tools */}
              <div>
                <label className="block text-sm font-medium text-white mb-3">Available Tools</label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {availableTools.map(tool => (
                    <button
                      key={tool.id}
                      onClick={() => {
                        const tools = formData.tools.includes(tool.id)
                          ? formData.tools.filter(t => t !== tool.id)
                          : [...formData.tools, tool.id]
                        updateForm({ tools })
                      }}
                      className={`p-3 rounded-xl border-2 transition-all flex items-center gap-2 ${
                        formData.tools.includes(tool.id)
                          ? 'border-[#ff6b35] bg-[#ff6b35]/10'
                          : 'border-[#1f1f1f] hover:border-[#333] bg-[#1a1a1a]'
                      }`}
                    >
                      <span className="text-lg">{tool.icon}</span>
                      <span className="text-sm text-white">{tool.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Step 4: Pricing */}
          {step === 4 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-bold text-white mb-2">Set Your Pricing</h2>
                <p className="text-[#737373]">Choose how you want to monetize your creation</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {/* Free */}
                <button
                  onClick={() => updateForm({ pricingModel: 'free', priceAmount: 0 })}
                  className={`p-5 rounded-xl border-2 transition-all text-left ${
                    formData.pricingModel === 'free'
                      ? 'border-[#10b981] bg-[#10b981]/10'
                      : 'border-[#1f1f1f] hover:border-[#333] bg-[#1a1a1a]'
                  }`}
                >
                  <div className="text-2xl mb-2">🆓</div>
                  <div className="font-bold text-white">Free</div>
                  <div className="text-xs text-[#525252] mt-1">Open for everyone, no cost</div>
                </button>

                {/* Per-call */}
                <button
                  onClick={() => updateForm({ pricingModel: 'per-call', priceAmount: 5 })}
                  className={`p-5 rounded-xl border-2 transition-all text-left ${
                    formData.pricingModel === 'per-call'
                      ? 'border-[#ff6b35] bg-[#ff6b35]/10'
                      : 'border-[#1f1f1f] hover:border-[#333] bg-[#1a1a1a]'
                  }`}
                >
                  <div className="text-2xl mb-2">⚡</div>
                  <div className="font-bold text-white">Per-Call (x402)</div>
                  <div className="text-xs text-[#525252] mt-1">Micropayments per execution</div>
                </button>

                {/* Subscription */}
                <button
                  onClick={() => updateForm({ pricingModel: 'subscription', priceAmount: 29 })}
                  className={`p-5 rounded-xl border-2 transition-all text-left ${
                    formData.pricingModel === 'subscription'
                      ? 'border-[#8b5cf6] bg-[#8b5cf6]/10'
                      : 'border-[#1f1f1f] hover:border-[#333] bg-[#1a1a1a]'
                  }`}
                >
                  <div className="text-2xl mb-2">🔄</div>
                  <div className="font-bold text-white">Subscription</div>
                  <div className="text-xs text-[#525252] mt-1">Monthly recurring payment</div>
                </button>

                {/* One-time */}
                <button
                  onClick={() => updateForm({ pricingModel: 'one-time', priceAmount: 99 })}
                  className={`p-5 rounded-xl border-2 transition-all text-left ${
                    formData.pricingModel === 'one-time'
                      ? 'border-[#f59e0b] bg-[#f59e0b]/10'
                      : 'border-[#1f1f1f] hover:border-[#333] bg-[#1a1a1a]'
                  }`}
                >
                  <div className="text-2xl mb-2">💰</div>
                  <div className="font-bold text-white">One-Time</div>
                  <div className="text-xs text-[#525252] mt-1">Single purchase, lifetime access</div>
                </button>
              </div>

              {/* Price Input */}
              {formData.pricingModel !== 'free' && (
                <div className="bg-[#1a1a1a] rounded-xl p-6">
                  <label className="block text-sm font-medium text-white mb-3">
                    {formData.pricingModel === 'per-call' ? 'Price per call (in cents)' :
                     formData.pricingModel === 'subscription' ? 'Monthly price (USD)' :
                     'One-time price (USD)'}
                  </label>
                  <div className="flex items-center gap-3">
                    <span className="text-2xl text-[#525252]">
                      {formData.pricingModel === 'per-call' ? '¢' : '$'}
                    </span>
                    <input
                      type="number"
                      value={formData.priceAmount}
                      onChange={(e) => updateForm({ priceAmount: parseInt(e.target.value) || 0 })}
                      min={0}
                      className="w-32 px-4 py-3 bg-[#0a0a0a] border border-[#252525] rounded-xl text-white text-2xl font-bold focus:border-[#ff6b35] outline-none transition-all"
                    />
                    <span className="text-[#525252]">
                      {formData.pricingModel === 'per-call' ? 'per execution' :
                       formData.pricingModel === 'subscription' ? '/month' : 'once'}
                    </span>
                  </div>
                  {formData.pricingModel === 'per-call' && (
                    <p className="text-xs text-[#525252] mt-3">
                      💡 Using x402 micropayments. Users pay only for what they use.
                      <br />
                      Evoworks takes a 10% platform fee.
                    </p>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Step 5: Preview */}
          {step === 5 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-bold text-white mb-2">Preview Your Listing</h2>
                <p className="text-[#737373]">Review before publishing to the marketplace</p>
              </div>

              {/* Preview Card */}
              <div className="bg-[#1a1a1a] border border-[#252525] rounded-2xl overflow-hidden">
                <div
                  className="px-5 py-3 flex items-center justify-between"
                  style={{ backgroundColor: `${typeConfig[formData.type!].color}15` }}
                >
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{typeConfig[formData.type!].icon}</span>
                    <span className="text-sm font-medium" style={{ color: typeConfig[formData.type!].color }}>
                      {typeConfig[formData.type!].label}
                    </span>
                  </div>
                  <span className="text-xs text-[#525252]">Pending Review</span>
                </div>

                <div className="p-5">
                  <h3 className="text-xl font-bold text-white mb-1">{formData.name || 'Untitled'}</h3>
                  <p className="text-xs text-[#525252] mb-3">by You</p>
                  <p className="text-sm text-[#737373] mb-4">{formData.shortDescription || 'No description'}</p>

                  {/* Models */}
                  {formData.models.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mb-3">
                      {formData.models.map(modelId => {
                        const model = availableModels.find(m => m.id === modelId)
                        return model ? (
                          <span
                            key={modelId}
                            className="px-2 py-0.5 text-[10px] font-medium rounded-md"
                            style={{ backgroundColor: `${model.color}15`, color: model.color }}
                          >
                            {model.label}
                          </span>
                        ) : null
                      })}
                    </div>
                  )}

                  {/* Tools */}
                  {formData.tools.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mb-4">
                      {formData.tools.map(toolId => {
                        const tool = availableTools.find(t => t.id === toolId)
                        return tool ? (
                          <span
                            key={toolId}
                            className="px-2 py-0.5 text-[10px] font-medium rounded-md bg-[#252525] text-[#737373]"
                          >
                            {tool.icon} {tool.label}
                          </span>
                        ) : null
                      })}
                    </div>
                  )}

                  {/* Price */}
                  <div className="flex items-center justify-between pt-4 border-t border-[#252525]">
                    <div className="flex items-baseline gap-1">
                      <span className={`text-lg font-bold ${formData.pricingModel === 'free' ? 'text-[#10b981]' : 'text-white'}`}>
                        {formData.pricingModel === 'free' ? 'Free' :
                         formData.pricingModel === 'per-call' ? `$${(formData.priceAmount / 100).toFixed(2)}` :
                         `$${formData.priceAmount}`}
                      </span>
                      {formData.pricingModel !== 'free' && (
                        <span className="text-xs text-[#525252]">
                          {formData.pricingModel === 'per-call' ? '/call' :
                           formData.pricingModel === 'subscription' ? '/mo' : 'once'}
                        </span>
                      )}
                      {formData.pricingModel === 'per-call' && (
                        <span className="ml-2 px-1.5 py-0.5 text-[9px] font-medium bg-[#ff6b35]/10 text-[#ff6b35] rounded">
                          x402
                        </span>
                      )}
                    </div>
                    <span className="text-xs px-3 py-1.5 bg-[#252525] text-[#a3a3a3] rounded-lg">
                      {formData.category || 'Uncategorized'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Summary */}
              <div className="bg-[#1a1a1a] rounded-xl p-4 text-sm">
                <div className="grid grid-cols-2 gap-2 text-[#737373]">
                  <div>Type:</div>
                  <div className="text-white">{typeConfig[formData.type!].label}</div>
                  <div>Category:</div>
                  <div className="text-white">{formData.category || '-'}</div>
                  <div>Models:</div>
                  <div className="text-white">{formData.models.length} selected</div>
                  <div>Tools:</div>
                  <div className="text-white">{formData.tools.length} selected</div>
                  <div>Tags:</div>
                  <div className="text-white">{formData.tags.length > 0 ? formData.tags.join(', ') : '-'}</div>
                </div>
              </div>

              {/* Agreement */}
              <div className="bg-[#ff6b35]/10 border border-[#ff6b35]/20 rounded-xl p-4 text-sm text-[#a3a3a3]">
                By publishing, you agree to the Evoworks <a href="#" className="text-[#ff6b35] hover:underline">Terms of Service</a> and <a href="#" className="text-[#ff6b35] hover:underline">Publisher Guidelines</a>. Your listing will be reviewed before going live.
              </div>
            </div>
          )}
        </div>

        {/* Navigation Buttons */}
        <div className="flex items-center justify-between mt-6">
          <button
            onClick={() => setStep(Math.max(1, step - 1))}
            disabled={step === 1}
            className="px-6 py-3 bg-[#1f1f1f] hover:bg-[#252525] disabled:opacity-30 disabled:cursor-not-allowed text-white font-medium rounded-xl transition-all"
          >
            ← Back
          </button>

          {step < totalSteps ? (
            <button
              onClick={() => setStep(Math.min(totalSteps, step + 1))}
              disabled={!canProceed()}
              className="px-8 py-3 bg-[#ff6b35] hover:bg-[#ff8555] disabled:opacity-30 disabled:cursor-not-allowed text-[#0a0a0a] font-semibold rounded-xl transition-all"
            >
              Continue →
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="px-8 py-3 bg-[#10b981] hover:bg-[#059669] disabled:opacity-50 text-white font-semibold rounded-xl transition-all flex items-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Publishing...
                </>
              ) : (
                <>
                  🚀 Publish to Marketplace
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

