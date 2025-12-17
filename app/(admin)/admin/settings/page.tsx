'use client'

/**
 * Admin Platform Settings
 * Configure platform-wide settings
 */

import { useState } from 'react'

export default function AdminSettingsPage() {
  const [activeTab, setActiveTab] = useState<'general' | 'fees' | 'x402' | 'notifications' | 'api'>('general')

  const [settings, setSettings] = useState({
    // General
    platformName: 'Evoworks',
    platformDescription: 'AI Agent Marketplace powered by Ghost Flow',
    maintenanceMode: false,
    allowSignups: true,
    requireEmailVerification: true,
    
    // Fees
    platformFeePercent: 15,
    minimumPayout: 25,
    autoPayoutEnabled: true,
    autoPayoutThreshold: 100,
    
    // x402
    x402Enabled: true,
    x402MinAmount: 0.01,
    x402MaxAmount: 100,
    baseChainId: 8453,
    usdcContractAddress: '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913',
    
    // Notifications
    emailNotificationsEnabled: true,
    slackWebhookUrl: '',
    discordWebhookUrl: '',
    adminEmailRecipients: 'admin@evoworks.ai',
    
    // API
    rateLimit: 1000,
    apiKeyRotationDays: 90,
  })

  const handleSave = () => {
    alert('Settings saved successfully!')
  }

  const tabs = [
    { id: 'general', label: 'General', icon: '⚙️' },
    { id: 'fees', label: 'Fees & Payouts', icon: '💰' },
    { id: 'x402', label: 'x402 Payments', icon: '⚡' },
    { id: 'notifications', label: 'Notifications', icon: '🔔' },
    { id: 'api', label: 'API & Security', icon: '🔐' },
  ] as const

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white">Platform Settings</h1>
        <p className="text-[#737373] mt-1">Configure Evoworks platform settings</p>
      </div>

      <div className="flex gap-8">
        {/* Sidebar Tabs */}
        <div className="w-64 space-y-1">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-colors ${
                activeTab === tab.id
                  ? 'bg-[#ff6b35]/10 text-[#ff6b35]'
                  : 'text-[#a3a3a3] hover:bg-[#1f1f1f] hover:text-white'
              }`}
            >
              <span className="text-lg">{tab.icon}</span>
              <span className="font-medium">{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 bg-[#141414] border border-[#1f1f1f] rounded-xl p-6">
          {activeTab === 'general' && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-white">General Settings</h2>
              
              <div>
                <label className="block text-sm font-medium text-[#a3a3a3] mb-2">Platform Name</label>
                <input
                  type="text"
                  value={settings.platformName}
                  onChange={(e) => setSettings({ ...settings, platformName: e.target.value })}
                  className="w-full px-4 py-3 bg-[#0a0a0a] border border-[#1f1f1f] rounded-lg text-white focus:border-[#ff6b35] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[#a3a3a3] mb-2">Platform Description</label>
                <textarea
                  value={settings.platformDescription}
                  onChange={(e) => setSettings({ ...settings, platformDescription: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-3 bg-[#0a0a0a] border border-[#1f1f1f] rounded-lg text-white focus:border-[#ff6b35] focus:outline-none resize-none"
                />
              </div>

              <div className="space-y-4">
                <ToggleSetting
                  label="Maintenance Mode"
                  description="Disable access to the platform temporarily"
                  checked={settings.maintenanceMode}
                  onChange={(checked) => setSettings({ ...settings, maintenanceMode: checked })}
                  danger
                />
                <ToggleSetting
                  label="Allow New Signups"
                  description="Allow new users to create accounts"
                  checked={settings.allowSignups}
                  onChange={(checked) => setSettings({ ...settings, allowSignups: checked })}
                />
                <ToggleSetting
                  label="Require Email Verification"
                  description="Users must verify their email before accessing the platform"
                  checked={settings.requireEmailVerification}
                  onChange={(checked) => setSettings({ ...settings, requireEmailVerification: checked })}
                />
              </div>
            </div>
          )}

          {activeTab === 'fees' && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-white">Fees & Payouts</h2>

              <div>
                <label className="block text-sm font-medium text-[#a3a3a3] mb-2">Platform Fee (%)</label>
                <input
                  type="number"
                  value={settings.platformFeePercent}
                  onChange={(e) => setSettings({ ...settings, platformFeePercent: parseInt(e.target.value) })}
                  min={0}
                  max={50}
                  className="w-full px-4 py-3 bg-[#0a0a0a] border border-[#1f1f1f] rounded-lg text-white focus:border-[#ff6b35] focus:outline-none"
                />
                <p className="text-xs text-[#525252] mt-1">Fee taken from each transaction (currently {settings.platformFeePercent}%)</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-[#a3a3a3] mb-2">Minimum Payout ($)</label>
                <input
                  type="number"
                  value={settings.minimumPayout}
                  onChange={(e) => setSettings({ ...settings, minimumPayout: parseInt(e.target.value) })}
                  min={1}
                  className="w-full px-4 py-3 bg-[#0a0a0a] border border-[#1f1f1f] rounded-lg text-white focus:border-[#ff6b35] focus:outline-none"
                />
              </div>

              <div className="space-y-4">
                <ToggleSetting
                  label="Auto Payout"
                  description="Automatically process payouts when threshold is reached"
                  checked={settings.autoPayoutEnabled}
                  onChange={(checked) => setSettings({ ...settings, autoPayoutEnabled: checked })}
                />

                {settings.autoPayoutEnabled && (
                  <div>
                    <label className="block text-sm font-medium text-[#a3a3a3] mb-2">Auto Payout Threshold ($)</label>
                    <input
                      type="number"
                      value={settings.autoPayoutThreshold}
                      onChange={(e) => setSettings({ ...settings, autoPayoutThreshold: parseInt(e.target.value) })}
                      min={settings.minimumPayout}
                      className="w-full px-4 py-3 bg-[#0a0a0a] border border-[#1f1f1f] rounded-lg text-white focus:border-[#ff6b35] focus:outline-none"
                    />
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'x402' && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-white">x402 Micropayments</h2>

              <ToggleSetting
                label="x402 Payments Enabled"
                description="Allow per-call micropayments using x402 protocol"
                checked={settings.x402Enabled}
                onChange={(checked) => setSettings({ ...settings, x402Enabled: checked })}
              />

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-[#a3a3a3] mb-2">Min Amount ($)</label>
                  <input
                    type="number"
                    value={settings.x402MinAmount}
                    onChange={(e) => setSettings({ ...settings, x402MinAmount: parseFloat(e.target.value) })}
                    step="0.01"
                    className="w-full px-4 py-3 bg-[#0a0a0a] border border-[#1f1f1f] rounded-lg text-white focus:border-[#ff6b35] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#a3a3a3] mb-2">Max Amount ($)</label>
                  <input
                    type="number"
                    value={settings.x402MaxAmount}
                    onChange={(e) => setSettings({ ...settings, x402MaxAmount: parseFloat(e.target.value) })}
                    className="w-full px-4 py-3 bg-[#0a0a0a] border border-[#1f1f1f] rounded-lg text-white focus:border-[#ff6b35] focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-[#a3a3a3] mb-2">Base Chain ID</label>
                <input
                  type="number"
                  value={settings.baseChainId}
                  onChange={(e) => setSettings({ ...settings, baseChainId: parseInt(e.target.value) })}
                  className="w-full px-4 py-3 bg-[#0a0a0a] border border-[#1f1f1f] rounded-lg text-white focus:border-[#ff6b35] focus:outline-none"
                />
                <p className="text-xs text-[#525252] mt-1">8453 = Base Mainnet, 84531 = Base Goerli</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-[#a3a3a3] mb-2">USDC Contract Address</label>
                <input
                  type="text"
                  value={settings.usdcContractAddress}
                  onChange={(e) => setSettings({ ...settings, usdcContractAddress: e.target.value })}
                  className="w-full px-4 py-3 bg-[#0a0a0a] border border-[#1f1f1f] rounded-lg text-white font-mono focus:border-[#ff6b35] focus:outline-none"
                />
              </div>
            </div>
          )}

          {activeTab === 'notifications' && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-white">Notifications</h2>

              <ToggleSetting
                label="Email Notifications"
                description="Send email notifications for important events"
                checked={settings.emailNotificationsEnabled}
                onChange={(checked) => setSettings({ ...settings, emailNotificationsEnabled: checked })}
              />

              <div>
                <label className="block text-sm font-medium text-[#a3a3a3] mb-2">Admin Email Recipients</label>
                <input
                  type="text"
                  value={settings.adminEmailRecipients}
                  onChange={(e) => setSettings({ ...settings, adminEmailRecipients: e.target.value })}
                  placeholder="admin@example.com, team@example.com"
                  className="w-full px-4 py-3 bg-[#0a0a0a] border border-[#1f1f1f] rounded-lg text-white placeholder-[#525252] focus:border-[#ff6b35] focus:outline-none"
                />
                <p className="text-xs text-[#525252] mt-1">Comma-separated list of email addresses</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-[#a3a3a3] mb-2">Slack Webhook URL</label>
                <input
                  type="text"
                  value={settings.slackWebhookUrl}
                  onChange={(e) => setSettings({ ...settings, slackWebhookUrl: e.target.value })}
                  placeholder="https://hooks.slack.com/services/..."
                  className="w-full px-4 py-3 bg-[#0a0a0a] border border-[#1f1f1f] rounded-lg text-white placeholder-[#525252] focus:border-[#ff6b35] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[#a3a3a3] mb-2">Discord Webhook URL</label>
                <input
                  type="text"
                  value={settings.discordWebhookUrl}
                  onChange={(e) => setSettings({ ...settings, discordWebhookUrl: e.target.value })}
                  placeholder="https://discord.com/api/webhooks/..."
                  className="w-full px-4 py-3 bg-[#0a0a0a] border border-[#1f1f1f] rounded-lg text-white placeholder-[#525252] focus:border-[#ff6b35] focus:outline-none"
                />
              </div>
            </div>
          )}

          {activeTab === 'api' && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-white">API & Security</h2>

              <div>
                <label className="block text-sm font-medium text-[#a3a3a3] mb-2">Rate Limit (requests/hour)</label>
                <input
                  type="number"
                  value={settings.rateLimit}
                  onChange={(e) => setSettings({ ...settings, rateLimit: parseInt(e.target.value) })}
                  className="w-full px-4 py-3 bg-[#0a0a0a] border border-[#1f1f1f] rounded-lg text-white focus:border-[#ff6b35] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[#a3a3a3] mb-2">API Key Rotation (days)</label>
                <input
                  type="number"
                  value={settings.apiKeyRotationDays}
                  onChange={(e) => setSettings({ ...settings, apiKeyRotationDays: parseInt(e.target.value) })}
                  className="w-full px-4 py-3 bg-[#0a0a0a] border border-[#1f1f1f] rounded-lg text-white focus:border-[#ff6b35] focus:outline-none"
                />
                <p className="text-xs text-[#525252] mt-1">Force API key rotation after this many days (0 = disabled)</p>
              </div>

              <div className="pt-4 border-t border-[#1f1f1f]">
                <h3 className="text-lg font-medium text-white mb-4">Danger Zone</h3>
                <div className="space-y-3">
                  <button className="w-full px-4 py-3 bg-yellow-500/20 text-yellow-400 rounded-lg hover:bg-yellow-500/30 transition-colors text-left">
                    🔄 Clear All Caches
                  </button>
                  <button className="w-full px-4 py-3 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 transition-colors text-left">
                    🗑️ Purge Expired Sessions
                  </button>
                  <button className="w-full px-4 py-3 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 transition-colors text-left">
                    ⚠️ Reset Analytics Data
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Save Button */}
          <div className="mt-8 pt-6 border-t border-[#1f1f1f] flex justify-end">
            <button
              onClick={handleSave}
              className="px-6 py-3 bg-[#ff6b35] hover:bg-[#ff8555] text-[#0a0a0a] font-semibold rounded-lg transition-colors"
            >
              Save Changes
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

// Toggle Setting Component
function ToggleSetting({
  label,
  description,
  checked,
  onChange,
  danger,
}: {
  label: string
  description: string
  checked: boolean
  onChange: (checked: boolean) => void
  danger?: boolean
}) {
  return (
    <div className="flex items-center justify-between p-4 bg-[#0a0a0a] rounded-lg">
      <div>
        <div className={`font-medium ${danger && checked ? 'text-red-400' : 'text-white'}`}>{label}</div>
        <div className="text-sm text-[#525252]">{description}</div>
      </div>
      <button
        onClick={() => onChange(!checked)}
        className={`relative w-11 h-6 rounded-full transition-colors ${
          checked ? (danger ? 'bg-red-500' : 'bg-[#ff6b35]') : 'bg-[#1f1f1f]'
        }`}
      >
        <div
          className={`absolute w-4 h-4 rounded-full bg-white top-1 transition-transform ${
            checked ? 'translate-x-6' : 'translate-x-1'
          }`}
        />
      </button>
    </div>
  )
}

