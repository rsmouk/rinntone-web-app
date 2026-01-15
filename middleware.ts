import { withAuth } from 'next-auth/middleware'
import { NextResponse } from 'next/server'

export default withAuth(
  function middleware(req) {
    // Allow access to public pages
    return NextResponse.next()
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        // Protect admin routes
        if (req.nextUrl.pathname.startsWith('/admin')) {
          // Allow login page without auth
          if (req.nextUrl.pathname === '/admin/login') {
            return true
          }
          return !!token
        }
        return true
      }
    }
  }
)

export const config = {
  matcher: ['/admin/:path*']
}
