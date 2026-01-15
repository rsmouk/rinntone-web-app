import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  // Enable experimental features for file uploads
  experimental: {
    serverActions: {
      bodySizeLimit: '10mb'
    }
  },
  
  // Image optimization settings
  images: {
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'localhost'
      }
    ],
    unoptimized: false
  },

  // Security headers
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY'
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff'
          },
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin'
          }
        ]
      },
      {
        // Prevent hotlinking of audio files
        source: '/uploads/ringtones/:path*',
        headers: [
          {
            key: 'X-Robots-Tag',
            value: 'noindex'
          }
        ]
      }
    ]
  },

  // Rewrites for cleaner URLs
  async rewrites() {
    return [
      {
        source: '/r/:id',
        destination: '/ringtone/:id'
      },
      {
        source: '/c/:slug*',
        destination: '/category/:slug*'
      }
    ]
  }
}

export default nextConfig
