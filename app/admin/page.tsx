import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/db'
import { Card, CardContent, CardHeader } from '@/components/ui/Card'
import { formatNumber } from '@/lib/utils'

async function getDashboardStats() {
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const [
    totalRingtones,
    totalCategories,
    totalDownloads,
    todayDownloads,
    recentDownloads,
    topRingtones
  ] = await Promise.all([
    prisma.ringtone.count({ where: { isActive: true } }),
    prisma.category.count({ where: { isActive: true } }),
    prisma.downloadLog.count(),
    prisma.downloadLog.count({
      where: { downloadedAt: { gte: today } }
    }),
    prisma.downloadLog.findMany({
      take: 10,
      orderBy: { downloadedAt: 'desc' },
      include: {
        ringtone: { select: { name: true, numericId: true } }
      }
    }),
    prisma.ringtone.findMany({
      where: { isActive: true },
      orderBy: { downloadCount: 'desc' },
      take: 5,
      select: { id: true, numericId: true, name: true, downloadCount: true }
    })
  ])

  return {
    totalRingtones,
    totalCategories,
    totalDownloads,
    todayDownloads,
    recentDownloads,
    topRingtones
  }
}

export default async function AdminDashboardPage() {
  const session = await getServerSession(authOptions)
  
  if (!session) {
    redirect('/admin/login')
  }

  const stats = await getDashboardStats()

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
        Dashboard Overview
      </h1>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          title="Total Ringtones"
          value={formatNumber(stats.totalRingtones)}
          icon={
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
            </svg>
          }
          color="blue"
          href="/admin/ringtones"
        />
        <StatCard
          title="Categories"
          value={formatNumber(stats.totalCategories)}
          icon={
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
            </svg>
          }
          color="green"
          href="/admin/categories"
        />
        <StatCard
          title="Total Downloads"
          value={formatNumber(stats.totalDownloads)}
          icon={
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
          }
          color="purple"
          href="/admin/analytics"
        />
        <StatCard
          title="Today's Downloads"
          value={formatNumber(stats.todayDownloads)}
          icon={
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
            </svg>
          }
          color="orange"
          href="/admin/analytics"
        />
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Link href="/admin/ringtones/new">
          <Card hoverable className="h-full">
            <CardContent className="py-6 text-center">
              <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mx-auto mb-3">
                <svg className="w-6 h-6 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
              </div>
              <h3 className="font-semibold text-gray-900 dark:text-white">Add New Ringtone</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Upload a new ringtone</p>
            </CardContent>
          </Card>
        </Link>
        <Link href="/admin/categories/new">
          <Card hoverable className="h-full">
            <CardContent className="py-6 text-center">
              <div className="w-12 h-12 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mx-auto mb-3">
                <svg className="w-6 h-6 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
              </div>
              <h3 className="font-semibold text-gray-900 dark:text-white">Add Category</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Create a new category</p>
            </CardContent>
          </Card>
        </Link>
        <Link href="/admin/ads/new">
          <Card hoverable className="h-full">
            <CardContent className="py-6 text-center">
              <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900 rounded-full flex items-center justify-center mx-auto mb-3">
                <svg className="w-6 h-6 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
              </div>
              <h3 className="font-semibold text-gray-900 dark:text-white">Add Advertisement</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Create a new ad</p>
            </CardContent>
          </Card>
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Ringtones */}
        <Card>
          <CardHeader>
            <h2 className="font-semibold text-gray-900 dark:text-white">Top Ringtones</h2>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y divide-gray-200 dark:divide-gray-700">
              {stats.topRingtones.map((ringtone, index) => (
                <Link
                  key={ringtone.id}
                  href={`/admin/ringtones/${ringtone.id}`}
                  className="flex items-center gap-4 px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  <span className="w-6 h-6 flex items-center justify-center text-sm font-bold text-gray-400">
                    #{index + 1}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                      {ringtone.name}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      ID: {ringtone.numericId}
                    </p>
                  </div>
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    {formatNumber(ringtone.downloadCount)} downloads
                  </span>
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Recent Downloads */}
        <Card>
          <CardHeader>
            <h2 className="font-semibold text-gray-900 dark:text-white">Recent Downloads</h2>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y divide-gray-200 dark:divide-gray-700">
              {stats.recentDownloads.map((log) => (
                <div
                  key={log.id}
                  className="px-4 py-3"
                >
                  <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                    {log.ringtone.name}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {new Date(log.downloadedAt).toLocaleString()}
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

function StatCard({
  title,
  value,
  icon,
  color,
  href
}: {
  title: string
  value: string
  icon: React.ReactNode
  color: 'blue' | 'green' | 'purple' | 'orange'
  href: string
}) {
  const colors = {
    blue: 'bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400',
    green: 'bg-green-100 dark:bg-green-900 text-green-600 dark:text-green-400',
    purple: 'bg-purple-100 dark:bg-purple-900 text-purple-600 dark:text-purple-400',
    orange: 'bg-orange-100 dark:bg-orange-900 text-orange-600 dark:text-orange-400'
  }

  return (
    <Link href={href}>
      <Card hoverable className="h-full">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">{title}</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{value}</p>
            </div>
            <div className={`p-3 rounded-full ${colors[color]}`}>
              {icon}
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}
