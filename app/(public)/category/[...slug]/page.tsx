import { notFound } from 'next/navigation'
import Link from 'next/link'
import prisma from '@/lib/db'
import { RingtoneCard, RingtoneGrid } from '@/components/ringtone/RingtoneCard'
import { AdBlock } from '@/components/ads/AdBlock'
import { Card, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import type { Metadata } from 'next'

interface CategoryPageProps {
  params: Promise<{ slug: string[] }>
  searchParams: Promise<{ page?: string; sort?: string }>
}

async function getCategoryData(slug: string, page: number, sort: string) {
  const category = await prisma.category.findUnique({
    where: { slug },
    include: {
      children: {
        where: { isActive: true },
        orderBy: { order: 'asc' }
      },
      parent: true,
      _count: { select: { ringtones: true } }
    }
  })

  if (!category || !category.isActive) return null

  const limit = 20
  const skip = (page - 1) * limit

  let orderBy: any = { createdAt: 'desc' }
  switch (sort) {
    case 'popular':
      orderBy = { downloadCount: 'desc' }
      break
    case 'name':
      orderBy = { name: 'asc' }
      break
  }

  const [ringtones, total] = await Promise.all([
    prisma.ringtone.findMany({
      where: { categoryId: category.id, isActive: true },
      orderBy,
      skip,
      take: limit,
      include: {
        category: { select: { name: true, slug: true } }
      }
    }),
    prisma.ringtone.count({
      where: { categoryId: category.id, isActive: true }
    })
  ])

  return {
    category,
    ringtones,
    total,
    page,
    totalPages: Math.ceil(total / limit)
  }
}

export async function generateMetadata({ params }: CategoryPageProps): Promise<Metadata> {
  const { slug } = await params
  const categorySlug = slug[slug.length - 1]
  
  const category = await prisma.category.findUnique({
    where: { slug: categorySlug }
  })

  if (!category) {
    return { title: 'Category Not Found' }
  }

  return {
    title: `${category.name} Ringtones`,
    description: category.description || `Download free ${category.name} ringtones for your mobile phone.`
  }
}

export default async function CategoryPage({ params, searchParams }: CategoryPageProps) {
  const { slug } = await params
  const { page: pageParam, sort: sortParam } = await searchParams
  
  const categorySlug = slug[slug.length - 1]
  const page = parseInt(pageParam || '1')
  const sort = sortParam || 'latest'

  const data = await getCategoryData(categorySlug, page, sort)

  if (!data) {
    notFound()
  }

  const { category, ringtones, total, totalPages } = data

  const buildUrl = (updates: { page?: number; sort?: string }) => {
    const params = new URLSearchParams()
    if (updates.sort && updates.sort !== 'latest') params.set('sort', updates.sort)
    if (updates.page && updates.page > 1) params.set('page', updates.page.toString())
    const qs = params.toString()
    return `/category/${categorySlug}${qs ? `?${qs}` : ''}`
  }

  return (
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
          <li>
            <Link href="/categories" className="hover:text-blue-600 dark:hover:text-blue-400">
              Categories
            </Link>
          </li>
          {category.parent && (
            <>
              <li>/</li>
              <li>
                <Link
                  href={`/category/${category.parent.slug}`}
                  className="hover:text-blue-600 dark:hover:text-blue-400"
                >
                  {category.parent.name}
                </Link>
              </li>
            </>
          )}
          <li>/</li>
          <li className="text-gray-900 dark:text-white">{category.name}</li>
        </ol>
      </nav>

      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-4 mb-4">
          <span className="text-4xl">{category.icon || '🎵'}</span>
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              {category.name} Ringtones
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              {total} {total === 1 ? 'ringtone' : 'ringtones'}
            </p>
          </div>
        </div>
        {category.description && (
          <p className="text-gray-600 dark:text-gray-400 max-w-3xl">
            {category.description}
          </p>
        )}
      </div>

      {/* Subcategories */}
      {category.children.length > 0 && (
        <div className="mb-8">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Subcategories
          </h2>
          <div className="flex flex-wrap gap-3">
            {category.children.map((child) => (
              <Link key={child.id} href={`/category/${child.slug}`}>
                <Card hoverable>
                  <CardContent className="px-4 py-2">
                    <span className="mr-2">{child.icon || '🎵'}</span>
                    {child.name}
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Header Ad */}
      <AdBlock placement="header" className="mb-8 max-w-3xl mx-auto" />

      {/* Sort Options */}
      <div className="flex items-center gap-4 mb-6">
        <span className="text-sm text-gray-600 dark:text-gray-400">Sort by:</span>
        <div className="flex gap-2">
          {[
            { value: 'latest', label: 'Latest' },
            { value: 'popular', label: 'Popular' },
            { value: 'name', label: 'Name' }
          ].map((option) => (
            <Link key={option.value} href={buildUrl({ sort: option.value })}>
              <Button
                variant={sort === option.value ? 'primary' : 'outline'}
                size="sm"
              >
                {option.label}
              </Button>
            </Link>
          ))}
        </div>
      </div>

      {/* Ringtones Grid */}
      {ringtones.length > 0 ? (
        <>
          <RingtoneGrid>
            {ringtones.map((ringtone) => (
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
          {totalPages > 1 && (
            <div className="mt-8 flex justify-center gap-2">
              {page > 1 && (
                <Link href={buildUrl({ page: page - 1, sort })}>
                  <Button variant="outline">← Previous</Button>
                </Link>
              )}
              
              <div className="flex items-center gap-2">
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  let pageNum: number
                  if (totalPages <= 5) {
                    pageNum = i + 1
                  } else if (page <= 3) {
                    pageNum = i + 1
                  } else if (page >= totalPages - 2) {
                    pageNum = totalPages - 4 + i
                  } else {
                    pageNum = page - 2 + i
                  }
                  
                  return (
                    <Link key={pageNum} href={buildUrl({ page: pageNum, sort })}>
                      <Button
                        variant={pageNum === page ? 'primary' : 'outline'}
                        size="sm"
                      >
                        {pageNum}
                      </Button>
                    </Link>
                  )
                })}
              </div>

              {page < totalPages && (
                <Link href={buildUrl({ page: page + 1, sort })}>
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
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
            </svg>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              No ringtones yet
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              Check back later for new ringtones in this category.
            </p>
          </CardContent>
        </Card>
      )}

      {/* In-Content Ad */}
      <AdBlock placement="in-content" className="mt-8" />
    </div>
  )
}
