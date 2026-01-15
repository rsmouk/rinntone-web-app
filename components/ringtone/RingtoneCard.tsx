'use client'

import Link from 'next/link'
import Image from 'next/image'
import { AudioPlayer } from '@/components/player/AudioPlayer'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { formatNumber, formatDuration } from '@/lib/utils'

interface RingtoneCardProps {
  id: number
  numericId: string
  name: string
  thumbnailPath?: string | null
  filePath: string
  duration?: number
  downloadCount: number
  categoryName?: string
}

export function RingtoneCard({
  id,
  numericId,
  name,
  thumbnailPath,
  filePath,
  duration,
  downloadCount,
  categoryName
}: RingtoneCardProps) {
  return (
    <Card hoverable className="group">
      <div className="relative aspect-square bg-gradient-to-br from-blue-100 to-blue-200 dark:from-blue-900 dark:to-blue-800">
        {thumbnailPath ? (
          <Image
            src={thumbnailPath}
            alt={name}
            fill
            className="object-cover"
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <svg className="w-16 h-16 text-blue-400 dark:text-blue-300 opacity-50" fill="currentColor" viewBox="0 0 20 20">
              <path d="M18 3a1 1 0 00-1.196-.98l-10 2A1 1 0 006 5v9.114A4.369 4.369 0 005 14c-1.657 0-3 .895-3 2s1.343 2 3 2 3-.895 3-2V7.82l8-1.6v5.894A4.37 4.37 0 0015 12c-1.657 0-3 .895-3 2s1.343 2 3 2 3-.895 3-2V3z" />
            </svg>
          </div>
        )}
        
        {/* Play Button Overlay */}
        <div className="absolute inset-0 flex items-center justify-center bg-black/0 group-hover:bg-black/30 transition-colors">
          <AudioPlayer src={filePath} compact className="opacity-0 group-hover:opacity-100 transition-opacity" />
        </div>
      </div>

      <div className="p-4">
        <Link href={`/ringtone/${numericId}`}>
          <h3 className="font-semibold text-gray-900 dark:text-white truncate hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
            {name}
          </h3>
        </Link>

        <div className="flex items-center gap-2 mt-1 text-sm text-gray-500 dark:text-gray-400">
          {categoryName && (
            <>
              <span>{categoryName}</span>
              <span>•</span>
            </>
          )}
          {duration && duration > 0 && (
            <>
              <span>{formatDuration(duration)}</span>
              <span>•</span>
            </>
          )}
          <span>{formatNumber(downloadCount)} downloads</span>
        </div>

        <div className="mt-3 flex items-center gap-2">
          <AudioPlayer src={filePath} compact />
          <Link href={`/download/${numericId}`} className="flex-1">
            <Button variant="primary" size="sm" className="w-full">
              <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
              Download
            </Button>
          </Link>
        </div>
      </div>
    </Card>
  )
}

// Grid component for ringtone listings
export function RingtoneGrid({ children }: { children: React.ReactNode }) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6">
      {children}
    </div>
  )
}
