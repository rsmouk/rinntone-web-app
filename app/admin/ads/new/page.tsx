'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'

interface Placement {
  id: number
  name: string
  slug: string
}

export default function NewAdPage() {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [placements, setPlacements] = useState<Placement[]>([])
  const [formData, setFormData] = useState({
    name: '',
    adCode: '',
    placementId: '',
    isActive: true
  })
  const [error, setError] = useState('')

  useEffect(() => {
    const fetchPlacements = async () => {
      const res = await fetch('/api/admin/ads')
      if (res.ok) {
        const data = await res.json()
        setPlacements(data.placements || [])
      }
    }
    fetchPlacements()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!formData.name || !formData.adCode || !formData.placementId) {
      setError('Please fill in all required fields')
      return
    }

    setIsSubmitting(true)

    try {
      const res = await fetch('/api/admin/ads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      if (res.ok) {
        router.push('/admin/ads')
        router.refresh()
      } else {
        const result = await res.json()
        setError(result.error || 'Failed to create ad')
      }
    } catch (err) {
      setError('An error occurred')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
        Add New Advertisement
      </h1>

      <Card>
        <CardContent className="p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="p-3 rounded-lg bg-red-100 dark:bg-red-900/30 border border-red-300 dark:border-red-800 text-red-700 dark:text-red-400 text-sm">
                {error}
              </div>
            )}

            <Input
              label="Name *"
              name="name"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              placeholder="Enter ad name"
              required
            />

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Placement *
              </label>
              <select
                name="placementId"
                value={formData.placementId}
                onChange={(e) => setFormData(prev => ({ ...prev, placementId: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="">Select placement...</option>
                {placements.map((placement) => (
                  <option key={placement.id} value={placement.id}>
                    {placement.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Ad Code (HTML/JavaScript) *
              </label>
              <textarea
                name="adCode"
                value={formData.adCode}
                onChange={(e) => setFormData(prev => ({ ...prev, adCode: e.target.value }))}
                rows={8}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white font-mono text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="<div>Your ad code here...</div>"
                required
              />
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                Paste your ad code here. HTML and JavaScript are supported.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="isActive"
                checked={formData.isActive}
                onChange={(e) => setFormData(prev => ({ ...prev, isActive: e.target.checked }))}
                className="w-4 h-4 rounded border-gray-300 dark:border-gray-600 text-blue-600 focus:ring-blue-500"
              />
              <label htmlFor="isActive" className="text-sm text-gray-700 dark:text-gray-300">
                Active (display this ad on the site)
              </label>
            </div>

            <div className="flex gap-4">
              <Button
                type="submit"
                variant="primary"
                isLoading={isSubmitting}
              >
                Create Advertisement
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => router.back()}
              >
                Cancel
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
