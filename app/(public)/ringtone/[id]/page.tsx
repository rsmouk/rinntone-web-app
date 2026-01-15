import { notFound } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import type { Metadata } from 'next'
import prisma from '@/lib/db'
import { AudioPlayer } from '@/components/player/AudioPlayer'
import { Button } from '@/components/ui/Button'
import { Card, CardContent } from '@/components/ui/Card'
import { AdBlock } from '@/components/ads/AdBlock'
import { RingtoneCard, RingtoneGrid } from '@/components/ringtone/RingtoneCard'
import { formatNumber, formatDuration, formatDate, formatFileSize } from '@/lib/utils'

interface PageProps {
  params: Promise<{ id: string }>
}

async function getRingtone(id: string) {
  const ringtone = await prisma.ringtone.findFirst({
    where: {
      OR: [
        { numericId: id },
        { id: parseInt(id) || 0 }
      ],
      isActive: true
    },
    include: {
      category: true,
      tags: { include: { tag: true } }
    }
  })

  if (!ringtone) return null

  // Increment view count
  await prisma.ringtone.update({
    where: { id: ringtone.id },
    data: { viewCount: { increment: 1 } }
  })

  // Get related ringtones
  const related = await prisma.ringtone.findMany({
    where: {
      isActive: true,
      id: { not: ringtone.id },
      categoryId: ringtone.categoryId
    },
    take: 5,
    orderBy: { downloadCount: 'desc' },
    include: {
      category: { select: { name: true } }
    }
  })

  return { ringtone, related }
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params
  const data = await getRingtone(id)
  
  if (!data) {
    return { title: 'Ringtone Not Found' }
  }

  const { ringtone } = data

  return {
    title: `${ringtone.name} - Download Free Ringtone`,
    description: ringtone.description || `Download ${ringtone.name} ringtone for free. High quality MP3 and M4R formats for iPhone and Android.`,
    keywords: [
      ringtone.name,
      'ringtone',
      'download',
      ringtone.category?.name || '',
      ...data.ringtone.tags.map(t => t.tag.name)
    ].filter(Boolean),
    openGraph: {
      title: `${ringtone.name} - Free Ringtone Download`,
      description: ringtone.description || `Download ${ringtone.name} ringtone for free.`,
      type: 'music.song',
      images: ringtone.thumbnailPath ? [ringtone.thumbnailPath] : undefined
    }
  }
}

export default async function RingtonePage({ params }: PageProps) {
  const { id } = await params
  const data = await getRingtone(id)

  if (!data) {
    notFound()
  }

  const { ringtone, related } = data
  const tags = ringtone.tags.map(t => t.tag)

  // Generate JSON-LD structured data
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'MusicRecording',
    name: ringtone.name,
    description: ringtone.description,
    duration: ringtone.duration ? `PT${ringtone.duration}S` : undefined,
    datePublished: ringtone.createdAt.toISOString(),
    interactionStatistic: {
      '@type': 'InteractionCounter',
      interactionType: 'https://schema.org/DownloadAction',
      userInteractionCount: ringtone.downloadCount
    }
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      
      <div className="container mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <nav className="mb-6 text-sm">
          <ol className="flex items-center gap-2 text-gray-500 dark:text-gray-400">
            <li>
              <Link href="/" className="hover:text-blue-600 dark:hover:text-blue-400">
                Home
              </Link>
            </li>
            <li>/</li>
            {ringtone.category && (
              <>
                <li>
                  <Link
                    href={`/category/${ringtone.category.slug}`}
                    className="hover:text-blue-600 dark:hover:text-blue-400"
                  >
                    {ringtone.category.name}
                  </Link>
                </li>
                <li>/</li>
              </>
            )}
            <li className="text-gray-900 dark:text-white truncate">{ringtone.name}</li>
          </ol>
        </nav>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            <Card>
              <CardContent className="p-6">
                <div className="flex flex-col md:flex-row gap-6">
                  {/* Thumbnail */}
                  <div className="w-full md:w-48 flex-shrink-0">
                    <div className="aspect-square relative bg-gradient-to-br from-blue-100 to-blue-200 dark:from-blue-900 dark:to-blue-800 rounded-lg overflow-hidden">
                      {ringtone.thumbnailPath ? (
                        <Image
                          src={ringtone.thumbnailPath}
                          alt={ringtone.name}
                          fill
                          className="object-cover"
                          priority
                        />
                      ) : (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <svg className="w-20 h-20 text-blue-400 dark:text-blue-300 opacity-50" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M18 3a1 1 0 00-1.196-.98l-10 2A1 1 0 006 5v9.114A4.369 4.369 0 005 14c-1.657 0-3 .895-3 2s1.343 2 3 2 3-.895 3-2V7.82l8-1.6v5.894A4.37 4.37 0 0015 12c-1.657 0-3 .895-3 2s1.343 2 3 2 3-.895 3-2V3z" />
                          </svg>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Info */}
                  <div className="flex-1">
                    <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-2">
                      {ringtone.name}
                    </h1>
                    
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                      ID: {ringtone.numericId}
                    </p>

                    {ringtone.description && (
                      <p className="text-gray-600 dark:text-gray-300 mb-4">
                        {ringtone.description}
                      </p>
                    )}

                    {/* Stats */}
                    <div className="flex flex-wrap gap-4 text-sm text-gray-500 dark:text-gray-400 mb-4">
                      {ringtone.duration && ringtone.duration > 0 && (
                        <span className="flex items-center gap-1">
                          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                          </svg>
                          {formatDuration(ringtone.duration)}
                        </span>
                      )}
                      {ringtone.fileSize && ringtone.fileSize > 0 && (
                        <span>{formatFileSize(ringtone.fileSize)}</span>
                      )}
                      <span>{formatNumber(ringtone.downloadCount)} downloads</span>
                      <span>{formatDate(ringtone.createdAt)}</span>
                    </div>

                    {/* Category */}
                    {ringtone.category && (
                      <div className="mb-4">
                        <span className="text-sm text-gray-500 dark:text-gray-400">Category: </span>
                        <Link
                          href={`/category/${ringtone.category.slug}`}
                          className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
                        >
                          {ringtone.category.name}
                        </Link>
                      </div>
                    )}

                    {/* Tags */}
                    {tags.length > 0 && (
                      <div className="flex flex-wrap gap-2 mb-4">
                        {tags.map((tag) => (
                          <Link
                            key={tag.id}
                            href={`/search?tag=${tag.slug}`}
                            className="px-3 py-1 text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                          >
                            #{tag.name}
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Audio Player */}
                <div className="mt-6">
                  <AudioPlayer
                    src={ringtone.filePath}
                    title={`Preview: ${ringtone.name}`}
                  />
                </div>

                {/* Download Button */}
                <div className="mt-6">
                  <Link href={`/download/${ringtone.numericId}`}>
                    <Button variant="primary" size="lg" className="w-full md:w-auto">
                      <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
                      </svg>
                      Download Ringtone
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>

            {/* In-Content Ad */}
            <AdBlock placement="in-content" className="mt-6" />
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            {/* Sidebar Ad */}
            <AdBlock placement="sidebar" className="mb-6" />

            {/* Related Ringtones */}
            {related.length > 0 && (
              <Card>
                <CardContent className="p-4">
                  <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
                    Related Ringtones
                  </h2>
                  <div className="space-y-3">
                    {related.map((item) => (
                      <Link
                        key={item.id}
                        href={`/ringtone/${item.numericId}`}
                        className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                      >
                        <div className="w-12 h-12 flex-shrink-0 bg-gradient-to-br from-blue-100 to-blue-200 dark:from-blue-900 dark:to-blue-800 rounded-lg flex items-center justify-center">
                          <svg className="w-6 h-6 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M18 3a1 1 0 00-1.196-.98l-10 2A1 1 0 006 5v9.114A4.369 4.369 0 005 14c-1.657 0-3 .895-3 2s1.343 2 3 2 3-.895 3-2V7.82l8-1.6v5.894A4.37 4.37 0 0015 12c-1.657 0-3 .895-3 2s1.343 2 3 2 3-.895 3-2V3z" />
                          </svg>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                            {item.name}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            {formatNumber(item.downloadCount)} downloads
                          </p>
                        </div>
                      </Link>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </>
  )
}
