import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.SITE_URL || 'http://localhost:3000'

  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/admin/',
          '/api/',
          '/uploads/ringtones/',
          '/download/'
        ]
      }
    ],
    sitemap: `${baseUrl}/sitemap.xml`
  }
}
