'use client'

import { useEffect, useState, useRef } from 'react'
import { cn } from '@/lib/utils'

interface AdBlockProps {
  placement: 'header' | 'footer' | 'in-content' | 'download-page' | 'sidebar'
  className?: string
}

interface AdData {
  id: number
  name: string
  adCode: string
}

export function AdBlock({ placement, className }: AdBlockProps) {
  const [ad, setAd] = useState<AdData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const containerRef = useRef<HTMLDivElement>(null)
  const impressionTracked = useRef(false)

  useEffect(() => {
    const fetchAd = async () => {
      try {
        const res = await fetch(`/api/ads?placement=${placement}`)
        if (res.ok) {
          const data = await res.json()
          if (data.ad) {
            setAd(data.ad)
          }
        }
      } catch (error) {
        console.error('Error fetching ad:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchAd()
  }, [placement])

  useEffect(() => {
    if (ad && containerRef.current && !impressionTracked.current) {
      // Track impression when ad becomes visible
      const observer = new IntersectionObserver(
        async (entries) => {
          const [entry] = entries
          if (entry.isIntersecting && !impressionTracked.current) {
            impressionTracked.current = true
            try {
              await fetch('/api/ads/impression', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ adId: ad.id })
              })
            } catch (error) {
              console.error('Error tracking impression:', error)
            }
          }
        },
        { threshold: 0.5 }
      )

      observer.observe(containerRef.current)
      return () => observer.disconnect()
    }
  }, [ad])

  if (isLoading) {
    return (
      <div className={cn('animate-pulse bg-gray-200 dark:bg-gray-700 rounded-lg', className)}>
        <div className="h-24" />
      </div>
    )
  }

  if (!ad) {
    return null
  }

  return (
    <div
      ref={containerRef}
      className={cn(
        'ad-container bg-gray-50 dark:bg-gray-900 rounded-lg p-4 border border-gray-200 dark:border-gray-700',
        className
      )}
    >
      <div className="text-xs text-gray-400 mb-2 text-center">Advertisement</div>
      <div
        className="ad-content"
        dangerouslySetInnerHTML={{ __html: ad.adCode }}
      />
    </div>
  )
}

// Simple placeholder ad for testing
export function PlaceholderAd({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        'bg-gradient-to-r from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-700',
        'rounded-lg p-6 text-center border border-gray-200 dark:border-gray-700',
        className
      )}
    >
      <p className="text-xs text-gray-400 mb-2">Advertisement</p>
      <div className="h-20 flex items-center justify-center">
        <p className="text-gray-500 dark:text-gray-400">Your ad here</p>
      </div>
    </div>
  )
}
