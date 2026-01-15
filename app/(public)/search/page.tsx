import { Suspense } from 'react'
import Link from 'next/link'
import prisma from '@/lib/db'
import { RingtoneCard, RingtoneGrid } from '@/components/ringtone/RingtoneCard'
import { AdBlock } from '@/components/ads/AdBlock'
import { Card, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'

interface SearchPageProps {
  searchParams: Promise<{
    q?: string
    category?: string
    tag?: string
    page?: string
    sort?: string
  }>
}

async function getSearchResults(searchParams: Awaited<SearchPageProps['searchParams']>) {
  const query = searchParams.q || ''
  const category = searchParams.category
  const tag = searchParams.tag
  const page = parseInt(searchParams.page || '1')
  const sort = searchParams.sort || 'latest'
  const limit = 20

  const skip = (page - 1) * limit

  // Build where clause
  const where: any = { isActive: true }

  if (query) {
    if (/^\d+$/.test(query)) {
      where.numericId = query
    } else {
      where.OR = [
        { name: { contains: query } },
        { description: { contains: query } }
      ]
    }
  }

  if (category) {
    where.category = { slug: category }
  }

  if (tag) {
    where.tags = { some: { tag: { slug: tag } } }
  }

  // Build order by clause
  let orderBy: any = { createdAt: 'desc' }
  switch (sort) {
    case 'popular':
      orderBy = { downloadCount: 'desc' }
      break
    case 'name':
      orderBy = { name: 'asc' }
      break
    case 'oldest':
      orderBy = { createdAt: 'asc' }
      break
  }

  const [ringtones, total, categories, tags] = await Promise.all([
    prisma.ringtone.findMany({
      where,
      orderBy,
      skip,
      take: limit,
      include: {
        category: { select: { name: true, slug: true } }
      }
    }),
    prisma.ringtone.count({ where }),
    prisma.category.findMany({
      where: { isActive: true },
      orderBy: { order: 'asc' },
      select: { name: true, slug: true }
    }),
    prisma.tag.findMany({
      take: 20,
      orderBy: { name: 'asc' },
      select: { name: true, slug: true }
    })
  ])

  return {
    ringtones,
    total,
    page,
    totalPages: Math.ceil(total / limit),
    categories,
    tags,
    query,
    currentCategory: category,
    currentTag: tag,
    currentSort: sort
  }
}

export async function generateMetadata({ searchParams }: SearchPageProps) {
  const params = await searchParams
  const query = params.q

  return {
    title: query ? `Search: ${query}` : 'Browse Ringtones',
    description: query
      ? `Search results for "${query}" - Download free ringtones`
      : 'Browse and download free ringtones for your mobile phone'
  }
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const params = await searchParams
  const data = await getSearchResults(params)

  const buildUrl = (updates: Record<string, string | undefined>) => {
    const currentParams = new URLSearchParams()
    if (data.query) currentParams.set('q', data.query)
    if (data.currentCategory) currentParams.set('category', data.currentCategory)
    if (data.currentTag) currentParams.set('tag', data.currentTag)
    if (data.currentSort !== 'latest') currentParams.set('sort', data.currentSort)

    Object.entries(updates).forEach(([key, value]) => {
      if (value === undefined) {
        currentParams.delete(key)
      } else {
        currentParams.set(key, value)
      }
    })

    // Reset page when changing filters
    if (!updates.page) currentParams.delete('page')

    const qs = currentParams.toString()
    return `/search${qs ? `?${qs}` : ''}`
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          {data.query ? `Search: "${data.query}"` : 'Browse Ringtones'}
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          {data.total} {data.total === 1 ? 'result' : 'results'} found
        </p>
      </div>

      {/* Header Ad */}
      <AdBlock placement="header" className="mb-8 max-w-3xl mx-auto" />

      <div className="grid lg:grid-cols-4 gap-8">
        {/* Sidebar Filters */}
        <div className="lg:col-span-1">
          <Card className="sticky top-24">
            <CardContent className="p-4">
              {/* Sort */}
              <div className="mb-6">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-3">Sort By</h3>
                <div className="space-y-2">
                  {[
                    { value: 'latest', label: 'Latest' },
                    { value: 'popular', label: 'Most Popular' },
                    { value: 'name', label: 'Name (A-Z)' },
                    { value: 'oldest', label: 'Oldest' }
                  ].map((option) => (
                    <Link
                      key={option.value}
                      href={buildUrl({ sort: option.value === 'latest' ? undefined : option.value })}
                      className={`block px-3 py-2 rounded-lg text-sm transition-colors ${
                        data.currentSort === option.value
                          ? 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300'
                          : 'hover:bg-gray-100 dark:hover:bg-gray-700'
                      }`}
                    >
                      {option.label}
                    </Link>
                  ))}
                </div>
              </div>

              {/* Categories */}
              <div className="mb-6">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-3">Categories</h3>
                <div className="space-y-1 max-h-48 overflow-y-auto">
                  <Link
                    href={buildUrl({ category: undefined })}
                    className={`block px-3 py-2 rounded-lg text-sm transition-colors ${
                      !data.currentCategory
                        ? 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300'
                        : 'hover:bg-gray-100 dark:hover:bg-gray-700'
                    }`}
                  >
                    All Categories
                  </Link>
                  {data.categories.map((cat) => (
                    <Link
                      key={cat.slug}
                      href={buildUrl({ category: cat.slug })}
                      className={`block px-3 py-2 rounded-lg text-sm transition-colors ${
                        data.currentCategory === cat.slug
                          ? 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300'
                          : 'hover:bg-gray-100 dark:hover:bg-gray-700'
                      }`}
                    >
                      {cat.name}
                    </Link>
                  ))}
                </div>
              </div>

              {/* Tags */}
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-3">Popular Tags</h3>
                <div className="flex flex-wrap gap-2">
                  {data.tags.map((tag) => (
                    <Link
                      key={tag.slug}
                      href={buildUrl({ tag: data.currentTag === tag.slug ? undefined : tag.slug })}
                      className={`px-2 py-1 text-xs rounded-full transition-colors ${
                        data.currentTag === tag.slug
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600'
                      }`}
                    >
                      #{tag.name}
                    </Link>
                  ))}
                </div>
              </div>

              {/* Clear Filters */}
              {(data.currentCategory || data.currentTag || data.currentSort !== 'latest') && (
                <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
                  <Link href={data.query ? `/search?q=${data.query}` : '/search'}>
                    <Button variant="outline" size="sm" className="w-full">
                      Clear Filters
                    </Button>
                  </Link>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Results */}
        <div className="lg:col-span-3">
          {data.ringtones.length > 0 ? (
            <>
              <RingtoneGrid>
                {data.ringtones.map((ringtone) => (
                  <RingtoneCard
                    key={ringtone.id}
                    id={ringtone.id}
                    numericId={ringtone.numericId}
                    name={ringtone.name}
                    thumbnailPath={ringtone.thumbnailPath}
                    filePath={ringtone.filePath}
                    duration={ringtone.duration || 0}
                    downloadCount={ringtone.downloadCount}
                    categoryName={ringtone.category?.name}
                  />
                ))}
              </RingtoneGrid>

              {/* Pagination */}
              {data.totalPages > 1 && (
                <div className="mt-8 flex justify-center gap-2">
                  {data.page > 1 && (
                    <Link href={buildUrl({ page: (data.page - 1).toString() })}>
                      <Button variant="outline">← Previous</Button>
                    </Link>
                  )}
                  
                  <div className="flex items-center gap-2">
                    {Array.from({ length: Math.min(5, data.totalPages) }, (_, i) => {
                      let pageNum: number
                      if (data.totalPages <= 5) {
                        pageNum = i + 1
                      } else if (data.page <= 3) {
                        pageNum = i + 1
                      } else if (data.page >= data.totalPages - 2) {
                        pageNum = data.totalPages - 4 + i
                      } else {
                        pageNum = data.page - 2 + i
                      }
                      
                      return (
                        <Link key={pageNum} href={buildUrl({ page: pageNum.toString() })}>
                          <Button
                            variant={pageNum === data.page ? 'primary' : 'outline'}
                            size="sm"
                          >
                            {pageNum}
                          </Button>
                        </Link>
                      )
                    })}
                  </div>

                  {data.page < data.totalPages && (
                    <Link href={buildUrl({ page: (data.page + 1).toString() })}>
                      <Button variant="outline">Next →</Button>
                    </Link>
                  )}
                </div>
              )}
            </>
          ) : (
            <Card>
              <CardContent className="py-12 text-center">
                <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                  No ringtones found
                </h2>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  Try adjusting your search or filters
                </p>
                <Link href="/search">
                  <Button variant="primary">Browse All</Button>
                </Link>
              </CardContent>
            </Card>
          )}

          {/* In-Content Ad */}
          <AdBlock placement="in-content" className="mt-8" />
        </div>
      </div>
    </div>
  )
}
