import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import { ThemeProvider } from '@/components/providers/ThemeProvider'
import { SessionProvider } from '@/components/providers/SessionProvider'
import './globals.css'

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
})

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
})

export const metadata: Metadata = {
  title: {
    default: 'RingtonePro - Free Mobile Ringtones Download',
    template: '%s | RingtonePro'
  },
  description: 'Download free high-quality ringtones for your mobile phone. Browse thousands of ringtones for iPhone and Android. MP3 and M4R formats available.',
  keywords: ['ringtones', 'free ringtones', 'mobile ringtones', 'iPhone ringtones', 'Android ringtones', 'download ringtones', 'mp3 ringtones'],
  authors: [{ name: 'RingtonePro' }],
  creator: 'RingtonePro',
  openGraph: {
    type: 'website',
    locale: 'en_US',
    siteName: 'RingtonePro',
    title: 'RingtonePro - Free Mobile Ringtones Download',
    description: 'Download free high-quality ringtones for your mobile phone.'
  },
  twitter: {
    card: 'summary_large_image',
    title: 'RingtonePro - Free Mobile Ringtones Download',
    description: 'Download free high-quality ringtones for your mobile phone.'
  },
  robots: {
    index: true,
    follow: true
  }
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-white dark:bg-gray-950 text-gray-900 dark:text-gray-100`}
      >
        <SessionProvider>
          <ThemeProvider>
            {children}
          </ThemeProvider>
        </SessionProvider>
      </body>
    </html>
  )
}
