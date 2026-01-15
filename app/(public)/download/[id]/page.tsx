'use client'

import { useState, useEffect, use } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Card, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { AdBlock } from '@/components/ads/AdBlock'

interface RingtoneData {
  id: number
  numericId: string
  name: string
  filePath: string
}

export default function DownloadPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const router = useRouter()
  const [ringtone, setRingtone] = useState<RingtoneData | null>(null)
  const [countdown, setCountdown] = useState(5)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [downloadStarted, setDownloadStarted] = useState(false)

  useEffect(() => {
    const fetchRingtone = async () => {
      try {
        const res = await fetch(`/api/ringtones/${id}`)
        if (res.ok) {
          const data = await res.json()
          setRingtone(data.ringtone)
        } else {
          setError('Ringtone not found')
        }
      } catch (err) {
        setError('Failed to load ringtone')
      } finally {
        setIsLoading(false)
      }
    }

    fetchRingtone()
  }, [id])

  useEffect(() => {
    if (!ringtone || downloadStarted) return

    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer)
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [ringtone, downloadStarted])

  const handleDownload = () => {
    if (!ringtone) return

    setDownloadStarted(true)
    
    // Generate a simple token for validation
    const token = btoa(Date.now().toString())
    
    // Trigger download
    const downloadUrl = `/api/download/${ringtone.numericId}?token=${token}`
    
    // Create a hidden link and click it
    const link = document.createElement('a')
    link.href = downloadUrl
    link.download = ringtone.name
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  // Auto-download when countdown reaches 0
  useEffect(() => {
    if (countdown === 0 && ringtone && !downloadStarted) {
      handleDownload()
    }
  }, [countdown, ringtone, downloadStarted])

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-2xl mx-auto text-center">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mx-auto mb-4" />
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mx-auto" />
          </div>
        </div>
      </div>
    )
  }

  if (error || !ringtone) {
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-2xl mx-auto text-center">
          <Card>
            <CardContent className="py-12">
              <svg className="w-16 h-16 text-red-500 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                {error || 'Ringtone not found'}
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                The ringtone you're looking for doesn't exist or has been removed.
              </p>
              <Link href="/">
                <Button variant="primary">Go to Homepage</Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Downloading: {ringtone.name}
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Your download will start automatically
          </p>
        </div>

        {/* Main Download Card */}
        <Card className="mb-8">
          <CardContent className="py-12 text-center">
            {!downloadStarted ? (
              <>
                {/* Countdown Timer */}
                <div className="mb-8">
                  <div className="relative inline-flex items-center justify-center">
                    <svg className="w-32 h-32 transform -rotate-90">
                      <circle
                        cx="64"
                        cy="64"
                        r="56"
                        stroke="currentColor"
                        strokeWidth="8"
                        fill="none"
                        className="text-gray-200 dark:text-gray-700"
                      />
                      <circle
                        cx="64"
                        cy="64"
                        r="56"
                        stroke="currentColor"
                        strokeWidth="8"
                        fill="none"
                        strokeLinecap="round"
                        className="text-blue-600"
                        style={{
                          strokeDasharray: 352,
                          strokeDashoffset: 352 - (352 * (5 - countdown)) / 5,
                          transition: 'stroke-dashoffset 1s linear'
                        }}
                      />
                    </svg>
                    <span className="absolute text-4xl font-bold text-gray-900 dark:text-white countdown-pulse">
                      {countdown}
                    </span>
                  </div>
                </div>

                <p className="text-lg text-gray-600 dark:text-gray-400 mb-6">
                  Your download will start in <span className="font-bold text-blue-600">{countdown}</span> seconds
                </p>

                <Button
                  variant="primary"
                  size="lg"
                  onClick={handleDownload}
                >
                  <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                  Download Now
                </Button>
              </>
            ) : (
              <>
                <svg className="w-20 h-20 text-green-500 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                  Download Started!
                </h2>
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                  Your download should begin automatically. If not, click the button below.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Button variant="primary" onClick={handleDownload}>
                    Download Again
                  </Button>
                  <Link href={`/ringtone/${ringtone.numericId}`}>
                    <Button variant="outline">Back to Ringtone</Button>
                  </Link>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Advertisement */}
        <AdBlock placement="download-page" className="mb-8" />

        {/* Additional Info */}
        <Card>
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              How to set as ringtone:
            </h3>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-medium text-gray-900 dark:text-white mb-2 flex items-center gap-2">
                  <span className="text-2xl">📱</span> iPhone
                </h4>
                <ol className="text-sm text-gray-600 dark:text-gray-400 space-y-1 list-decimal list-inside">
                  <li>Download the M4R file</li>
                  <li>Connect to iTunes/Finder</li>
                  <li>Drag file to your device</li>
                  <li>Go to Settings → Sounds → Ringtone</li>
                </ol>
              </div>
              <div>
                <h4 className="font-medium text-gray-900 dark:text-white mb-2 flex items-center gap-2">
                  <span className="text-2xl">🤖</span> Android
                </h4>
                <ol className="text-sm text-gray-600 dark:text-gray-400 space-y-1 list-decimal list-inside">
                  <li>Download the MP3 file</li>
                  <li>Open Settings → Sound</li>
                  <li>Tap Phone ringtone</li>
                  <li>Select the downloaded file</li>
                </ol>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Back Link */}
        <div className="mt-8 text-center">
          <Link
            href="/"
            className="text-blue-600 dark:text-blue-400 hover:underline"
          >
            ← Browse more ringtones
          </Link>
        </div>
      </div>
    </div>
  )
}
