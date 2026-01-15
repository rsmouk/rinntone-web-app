import { MetadataRoute } from 'next'
import prisma from '@/lib/db'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.SITE_URL || 'http://localhost:3000'

  // Static pages
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1
    },
    {
      url: `${baseUrl}/search`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.8
    },
    {
      url: `${baseUrl}/categories`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8
    }
  ]

  // Categories
  const categories = await prisma.category.findMany({
    where: { isActive: true },
    select: { slug: true, updatedAt: true }
  })

  const categoryPages: MetadataRoute.Sitemap = categories.map((category) => ({
    url: `${baseUrl}/category/${category.slug}`,
    lastModified: category.updatedAt,
    changeFrequency: 'weekly',
    priority: 0.7
  }))

  // Ringtones (limit to prevent huge sitemaps)
  const ringtones = await prisma.ringtone.findMany({
    where: { isActive: true },
    select: { numericId: true, updatedAt: true },
    orderBy: { downloadCount: 'desc' },
    take: 5000
  })

  const ringtonePages: MetadataRoute.Sitemap = ringtones.map((ringtone) => ({
    url: `${baseUrl}/ringtone/${ringtone.numericId}`,
    lastModified: ringtone.updatedAt,
    changeFrequency: 'monthly',
    priority: 0.6
  }))

  return [...staticPages, ...categoryPages, ...ringtonePages]
}
