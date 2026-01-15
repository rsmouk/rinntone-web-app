'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/Button'

interface DeleteRingtoneButtonProps {
  id: number
  name: string
}

export function DeleteRingtoneButton({ id, name }: DeleteRingtoneButtonProps) {
  const router = useRouter()
  const [isDeleting, setIsDeleting] = useState(false)

  const handleDelete = async () => {
    if (!confirm(`Are you sure you want to delete "${name}"? This action cannot be undone.`)) {
      return
    }

    setIsDeleting(true)
    try {
      const res = await fetch(`/api/admin/ringtones/${id}`, {
        method: 'DELETE'
      })

      if (res.ok) {
        router.refresh()
      } else {
        alert('Failed to delete ringtone')
      }
    } catch (error) {
      alert('An error occurred')
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <Button
      variant="danger"
      size="sm"
      onClick={handleDelete}
      isLoading={isDeleting}
    >
      Delete
    </Button>
  )
}
