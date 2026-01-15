import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { authOptions } from '@/lib/auth'
import { AdminSidebar } from '@/components/admin/AdminSidebar'
import { AdminHeader } from '@/components/admin/AdminHeader'

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await getServerSession(authOptions)

  // Allow access to login page
  // Middleware handles protection, but this adds server-side check
  
  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
      {session ? (
        <div className="flex">
          <AdminSidebar />
          <div className="flex-1 ml-64">
            <AdminHeader user={session.user} />
            <main className="p-6">
              {children}
            </main>
          </div>
        </div>
      ) : (
        children
      )}
    </div>
  )
}
