'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { formatNumber } from '@/lib/utils'

interface Tag {
  id: number
  name: string
  slug: string
  _count: { ringtones: number }
}

export default function TagsPage() {
  const router = useRouter()
  const [tags, setTags] = useState<Tag[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [newTagName, setNewTagName] = useState('')
  const [isAdding, setIsAdding] = useState(false)

  useEffect(() => {
    fetchTags()
  }, [])

  const fetchTags = async () => {
    setIsLoading(true)
    try {
      const res = await fetch('/api/admin/tags')
      if (res.ok) {
        const data = await res.json()
        setTags(data.tags || [])
      }
    } catch (error) {
      console.error('Error fetching tags:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleAddTag = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newTagName.trim()) return

    setIsAdding(true)
    try {
      const res = await fetch('/api/admin/tags', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newTagName.trim() })
      })

      if (res.ok) {
        setNewTagName('')
        fetchTags()
      } else {
        const data = await res.json()
        alert(data.error || 'Failed to add tag')
      }
    } catch (error) {
      alert('An error occurred')
    } finally {
      setIsAdding(false)
    }
  }

  const handleDeleteTag = async (id: number, name: string) => {
    if (!confirm(`Delete tag "${name}"? This will remove it from all ringtones.`)) {
      return
    }

    try {
      const res = await fetch(`/api/admin/tags/${id}`, { method: 'DELETE' })
      if (res.ok) {
        fetchTags()
      } else {
        alert('Failed to delete tag')
      }
    } catch (error) {
      alert('An error occurred')
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
    <div>
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Tags</h1>

      {/* Add Tag Form */}
      <Card className="mb-6">
        <CardContent className="py-4">
          <form onSubmit={handleAddTag} className="flex gap-4">
            <Input
              value={newTagName}
              onChange={(e) => setNewTagName(e.target.value)}
              placeholder="Enter new tag name..."
              className="flex-1"
            />
            <Button type="submit" variant="primary" isLoading={isAdding}>
              Add Tag
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Tags Grid */}
      <Card>
        <CardHeader>
          <h2 className="font-semibold text-gray-900 dark:text-white">
            All Tags ({tags.length})
          </h2>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-3">
            {tags.map((tag) => (
              <div
                key={tag.id}
                className="flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-700 rounded-full group"
              >
                <span className="text-gray-900 dark:text-white font-medium">
                  #{tag.name}
                </span>
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  ({formatNumber(tag._count.ringtones)})
                </span>
                <button
                  onClick={() => handleDeleteTag(tag.id, tag.name)}
                  className="ml-1 p-1 rounded-full hover:bg-red-100 dark:hover:bg-red-900 text-gray-400 hover:text-red-600 dark:hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
