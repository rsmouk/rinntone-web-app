'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'

interface Setting {
  key: string
  value: string
}

export default function SettingsPage() {
  const [settings, setSettings] = useState<Record<string, string>>({
    site_name: '',
    site_description: '',
    download_timer: '5',
    items_per_page: '20',
    enable_ads: 'true'
  })
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  useEffect(() => {
    fetchSettings()
  }, [])

  const fetchSettings = async () => {
    setIsLoading(true)
    try {
      const res = await fetch('/api/admin/settings')
      if (res.ok) {
        const data = await res.json()
        const settingsMap: Record<string, string> = {}
        data.settings.forEach((s: Setting) => {
          settingsMap[s.key] = s.value
        })
        setSettings(prev => ({ ...prev, ...settingsMap }))
      }
    } catch (error) {
      console.error('Error fetching settings:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSaving(true)
    setMessage(null)

    try {
      const res = await fetch('/api/admin/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ settings })
      })

      if (res.ok) {
        setMessage({ type: 'success', text: 'Settings saved successfully!' })
      } else {
        setMessage({ type: 'error', text: 'Failed to save settings' })
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'An error occurred' })
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading) {
    return (
      <div className="animate-pulse space-y-4">
        <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-32" />
        <div className="h-64 bg-gray-200 dark:bg-gray-700 rounded-lg" />
      </div>
    )
  }

  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
        Site Settings
      </h1>

      <form onSubmit={handleSubmit}>
        {message && (
          <div className={`mb-6 p-3 rounded-lg ${
            message.type === 'success'
              ? 'bg-green-100 dark:bg-green-900/30 border border-green-300 dark:border-green-800 text-green-700 dark:text-green-400'
              : 'bg-red-100 dark:bg-red-900/30 border border-red-300 dark:border-red-800 text-red-700 dark:text-red-400'
          }`}>
            {message.text}
          </div>
        )}

        {/* General Settings */}
        <Card className="mb-6">
          <CardHeader>
            <h2 className="font-semibold text-gray-900 dark:text-white">General Settings</h2>
          </CardHeader>
          <CardContent className="space-y-4">
            <Input
              label="Site Name"
              value={settings.site_name}
              onChange={(e) => setSettings(prev => ({ ...prev, site_name: e.target.value }))}
              placeholder="RingtonePro"
            />
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Site Description
              </label>
              <textarea
                value={settings.site_description}
                onChange={(e) => setSettings(prev => ({ ...prev, site_description: e.target.value }))}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Download free ringtones for your phone"
              />
            </div>
          </CardContent>
        </Card>

        {/* Display Settings */}
        <Card className="mb-6">
          <CardHeader>
            <h2 className="font-semibold text-gray-900 dark:text-white">Display Settings</h2>
          </CardHeader>
          <CardContent className="space-y-4">
            <Input
              label="Items Per Page"
              type="number"
              value={settings.items_per_page}
              onChange={(e) => setSettings(prev => ({ ...prev, items_per_page: e.target.value }))}
              placeholder="20"
              helperText="Number of ringtones to show per page"
            />
            <Input
              label="Download Timer (seconds)"
              type="number"
              value={settings.download_timer}
              onChange={(e) => setSettings(prev => ({ ...prev, download_timer: e.target.value }))}
              placeholder="5"
              helperText="Countdown before download starts"
            />
          </CardContent>
        </Card>

        {/* Advertisement Settings */}
        <Card className="mb-6">
          <CardHeader>
            <h2 className="font-semibold text-gray-900 dark:text-white">Advertisement Settings</h2>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="enable_ads"
                checked={settings.enable_ads === 'true'}
                onChange={(e) => setSettings(prev => ({ 
                  ...prev, 
                  enable_ads: e.target.checked ? 'true' : 'false' 
                }))}
                className="w-4 h-4 rounded border-gray-300 dark:border-gray-600 text-blue-600 focus:ring-blue-500"
              />
              <label htmlFor="enable_ads" className="text-sm text-gray-700 dark:text-gray-300">
                Enable advertisements across the site
              </label>
            </div>
          </CardContent>
        </Card>

        <Button type="submit" variant="primary" isLoading={isSaving}>
          Save Settings
        </Button>
      </form>
    </div>
  )
}
