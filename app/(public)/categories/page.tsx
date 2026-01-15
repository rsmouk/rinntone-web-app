import Link from 'next/link'
import prisma from '@/lib/db'
import { Card, CardContent } from '@/components/ui/Card'
import { AdBlock } from '@/components/ads/AdBlock'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Browse Categories',
  description: 'Browse all ringtone categories. Find the perfect ringtone for your phone from our collection of pop, rock, electronic, notification sounds, and more.'
}

async function getCategories() {
  const categories = await prisma.category.findMany({
    where: { isActive: true, parentId: null },
    orderBy: { order: 'asc' },
    include: {
      _count: { select: { ringtones: true } },
      children: {
        where: { isActive: true },
        orderBy: { order: 'asc' },
        include: {
          _count: { select: { ringtones: true } }
        }
      }
    }
  })

  return categories
}

export default async function CategoriesPage() {
  const categories = await getCategories()

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Browse Categories
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Find the perfect ringtone from our collection of categories
        </p>
      </div>

      <AdBlock placement="header" className="mb-8 max-w-3xl mx-auto" />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {categories.map((category) => (
          <Card key={category.id} className="overflow-hidden">
            <Link href={`/category/${category.slug}`}>
              <CardContent className="p-6">
                <div className="flex items-center gap-4 mb-4">
                  <span className="text-4xl">{category.icon || '🎵'}</span>
                  <div>
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                      {category.name}
                    </h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {category._count.ringtones} ringtones
                    </p>
                  </div>
                </div>
                {category.description && (
                  <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">
                    {category.description}
                  </p>
                )}
              </CardContent>
            </Link>

            {/* Subcategories */}
            {category.children.length > 0 && (
              <div className="px-6 pb-4 pt-0">
                <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">
                  Subcategories
                </p>
                <div className="flex flex-wrap gap-2">
                  {category.children.map((child) => (
                    <Link
                      key={child.id}
                      href={`/category/${child.slug}`}
                      className="px-3 py-1 text-sm bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                    >
                      {child.icon || ''} {child.name}
                      <span className="ml-1 text-xs text-gray-500">
                        ({child._count.ringtones})
                      </span>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </Card>
        ))}
      </div>

      <AdBlock placement="in-content" className="mt-8" />
    </div>
  )
}
