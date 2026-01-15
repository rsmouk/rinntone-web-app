import Link from 'next/link'
import { AdBlock, PlaceholderAd } from '@/components/ads/AdBlock'

export function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="bg-gray-100 dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 mt-auto">
      {/* Ad Section */}
      <div className="container mx-auto px-4 py-6">
        <AdBlock placement="footer" className="max-w-3xl mx-auto" />
      </div>

      {/* Footer Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M18 3a1 1 0 00-1.196-.98l-10 2A1 1 0 006 5v9.114A4.369 4.369 0 005 14c-1.657 0-3 .895-3 2s1.343 2 3 2 3-.895 3-2V7.82l8-1.6v5.894A4.37 4.37 0 0015 12c-1.657 0-3 .895-3 2s1.343 2 3 2 3-.895 3-2V3z" />
                </svg>
              </div>
              <span className="text-lg font-bold text-gray-900 dark:text-white">
                RingtonePro
              </span>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Download free high-quality ringtones for your mobile phone. iPhone and Android compatible.
            </p>
          </div>

          {/* Categories */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-4 uppercase tracking-wider">
              Categories
            </h3>
            <ul className="space-y-2">
              <FooterLink href="/category/pop">Pop</FooterLink>
              <FooterLink href="/category/rock">Rock</FooterLink>
              <FooterLink href="/category/electronic">Electronic</FooterLink>
              <FooterLink href="/category/classical">Classical</FooterLink>
            </ul>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-4 uppercase tracking-wider">
              Quick Links
            </h3>
            <ul className="space-y-2">
              <FooterLink href="/">Home</FooterLink>
              <FooterLink href="/search">Browse All</FooterLink>
              <FooterLink href="/category/notification">Notifications</FooterLink>
              <FooterLink href="/category/alarm">Alarms</FooterLink>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-4 uppercase tracking-wider">
              Legal
            </h3>
            <ul className="space-y-2">
              <FooterLink href="/privacy">Privacy Policy</FooterLink>
              <FooterLink href="/terms">Terms of Service</FooterLink>
              <FooterLink href="/dmca">DMCA</FooterLink>
              <FooterLink href="/contact">Contact Us</FooterLink>
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-gray-200 dark:border-gray-800">
        <div className="container mx-auto px-4 py-4">
          <p className="text-center text-sm text-gray-500 dark:text-gray-400">
            &copy; {currentYear} RingtonePro. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  )
}

function FooterLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <li>
      <Link
        href={href}
        className="text-sm text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
      >
        {children}
      </Link>
    </li>
  )
}
