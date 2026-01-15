import Link from 'next/link'
import prisma from '@/lib/db'
import { RingtoneCard, RingtoneGrid } from '@/components/ringtone/RingtoneCard'
import { AdBlock } from '@/components/ads/AdBlock'
import { Card, CardContent } from '@/components/ui/Card'

async function getHomeData() {
  const [categories, latestRingtones, popularRingtones] = await Promise.all([
    prisma.category.findMany({
      where: { isActive: true, parentId: null },
      orderBy: { order: 'asc' },
      take: 8,
      include: {
        _count: { select: { ringtones: true } }
      }
    }),
    prisma.ringtone.findMany({
      where: { isActive: true },
      orderBy: { createdAt: 'desc' },
      take: 10,
      include: {
        category: { select: { name: true, slug: true } }
      }
    }),
    prisma.ringtone.findMany({
      where: { isActive: true },
      orderBy: { downloadCount: 'desc' },
      take: 10,
      include: {
        category: { select: { name: true, slug: true } }
      }
    })
  ])

  return { categories, latestRingtones, popularRingtones }
}

export default async function HomePage() {
  const { categories, latestRingtones, popularRingtones } = await getHomeData()

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Hero Section */}
      <section className="text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
          Free Mobile Ringtones
        </h1>
        <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
          Download thousands of high-quality ringtones for your iPhone or Android device.
          Preview and download instantly!
        </p>
      </section>

      {/* Header Ad */}
      <AdBlock placement="header" className="mb-8 max-w-3xl mx-auto" />

      {/* Categories Section */}
      <section className="mb-12">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            Browse Categories
          </h2>
          <Link
            href="/categories"
            className="text-blue-600 dark:text-blue-400 hover:underline text-sm font-medium"
          >
            View All →
          </Link>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {categories.map((category) => (
            <Link key={category.id} href={`/category/${category.slug}`}>
              <Card hoverable className="h-full">
                <CardContent className="text-center py-6">
                  <span className="text-3xl mb-2 block">{category.icon || '🎵'}</span>
                  <h3 className="font-semibold text-gray-900 dark:text-white">
                    {category.name}
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    {category._count.ringtones} ringtones
                  </p>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </section>

      {/* In-Content Ad */}
      <AdBlock placement="in-content" className="mb-8 max-w-3xl mx-auto" />

      {/* Latest Ringtones */}
      <section className="mb-12">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            Latest Ringtones
          </h2>
          <Link
            href="/search?sort=latest"
            className="text-blue-600 dark:text-blue-400 hover:underline text-sm font-medium"
          >
            View All →
          </Link>
        </div>
        <RingtoneGrid>
          {latestRingtones.map((ringtone) => (
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
      </section>

      {/* Popular Ringtones */}
      <section className="mb-12">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            Most Popular
          </h2>
          <Link
            href="/search?sort=popular"
            className="text-blue-600 dark:text-blue-400 hover:underline text-sm font-medium"
          >
            View All →
          </Link>
        </div>
        <RingtoneGrid>
          {popularRingtones.map((ringtone) => (
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
      </section>
    </div>
  )
}
