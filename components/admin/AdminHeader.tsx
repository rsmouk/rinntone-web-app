'use client'

import { signOut } from 'next-auth/react'
import { ThemeToggle } from '@/components/ui/ThemeToggle'
import { Button } from '@/components/ui/Button'

interface AdminHeaderProps {
  user: {
    name?: string | null
    email: string
  }
}

export function AdminHeader({ user }: AdminHeaderProps) {
  return (
    <header className="h-16 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 flex items-center justify-between">
      <div>
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
          Admin Dashboard
        </h2>
      </div>

      <div className="flex items-center gap-4">
        <ThemeToggle />
        
        <div className="flex items-center gap-3">
          <div className="text-right">
            <p className="text-sm font-medium text-gray-900 dark:text-white">
              {user.name || 'Admin'}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {user.email}
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => signOut({ callbackUrl: '/admin/login' })}
          >
            Sign Out
          </Button>
        </div>
      </div>
    </header>
  )
}
