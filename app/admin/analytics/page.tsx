'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader } from '@/components/ui/Card'
import { formatNumber } from '@/lib/utils'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar
} from 'recharts'

interface AnalyticsData {
  stats: {
    totalDownloads: number
    todayDownloads: number
    weeklyDownloads: number
    monthlyDownloads: number
    totalViews: number
    totalImpressions: number
  }
  dailyStats: Array<{
    date: string
    downloads: number
    views: number
  }>
  topRingtones: Array<{
    id: number
    name: string
    downloadCount: number
  }>
  topAds: Array<{
    id: number
    name: string
    impressions: number
    placement: string
  }>
}

export default function AnalyticsPage() {
  const [data, setData] = useState<AnalyticsData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [dateRange, setDateRange] = useState('7') // days

  useEffect(() => {
    const fetchAnalytics = async () => {
      setIsLoading(true)
      try {
        const res = await fetch(`/api/admin/analytics?days=${dateRange}`)
        if (res.ok) {
          const result = await res.json()
          setData(result)
        }
      } catch (error) {
        console.error('Error fetching analytics:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchAnalytics()
  }, [dateRange])

  if (isLoading) {
    return (
      <div className="animate-pulse space-y-6">
        <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-48" />
        <div className="grid grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-24 bg-gray-200 dark:bg-gray-700 rounded-lg" />
          ))}
        </div>
        <div className="h-80 bg-gray-200 dark:bg-gray-700 rounded-lg" />
      </div>
    )
  }

  if (!data) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 dark:text-gray-400">Failed to load analytics</p>
      </div>
    )
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Analytics</h1>
        <select
          value={dateRange}
          onChange={(e) => setDateRange(e.target.value)}
          className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
        >
          <option value="7">Last 7 days</option>
          <option value="30">Last 30 days</option>
          <option value="90">Last 90 days</option>
        </select>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
        <StatCard
          title="Total Downloads"
          value={formatNumber(data.stats.totalDownloads)}
          color="blue"
        />
        <StatCard
          title="Today's Downloads"
          value={formatNumber(data.stats.todayDownloads)}
          color="green"
        />
        <StatCard
          title="Weekly Downloads"
          value={formatNumber(data.stats.weeklyDownloads)}
          color="purple"
        />
        <StatCard
          title="Ad Impressions"
          value={formatNumber(data.stats.totalImpressions)}
          color="orange"
        />
      </div>

      {/* Downloads Chart */}
      <Card className="mb-8">
        <CardHeader>
          <h2 className="font-semibold text-gray-900 dark:text-white">Downloads Over Time</h2>
        </CardHeader>
        <CardContent>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data.dailyStats}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis 
                  dataKey="date" 
                  stroke="#9CA3AF"
                  fontSize={12}
                  tickFormatter={(value) => {
                    const date = new Date(value)
                    return `${date.getMonth() + 1}/${date.getDate()}`
                  }}
                />
                <YAxis stroke="#9CA3AF" fontSize={12} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1F2937',
                    border: 'none',
                    borderRadius: '8px',
                    color: '#F9FAFB'
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="downloads"
                  stroke="#3B82F6"
                  strokeWidth={2}
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Ringtones */}
        <Card>
          <CardHeader>
            <h2 className="font-semibold text-gray-900 dark:text-white">Top Downloaded Ringtones</h2>
          </CardHeader>
          <CardContent className="p-0">
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={data.topRingtones.slice(0, 10)}
                  layout="vertical"
                  margin={{ left: 20, right: 20 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis type="number" stroke="#9CA3AF" fontSize={12} />
                  <YAxis
                    dataKey="name"
                    type="category"
                    stroke="#9CA3AF"
                    fontSize={11}
                    width={100}
                    tick={{ fill: '#9CA3AF' }}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#1F2937',
                      border: 'none',
                      borderRadius: '8px',
                      color: '#F9FAFB'
                    }}
                  />
                  <Bar dataKey="downloadCount" fill="#3B82F6" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Top Ads */}
        <Card>
          <CardHeader>
            <h2 className="font-semibold text-gray-900 dark:text-white">Ad Performance</h2>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y divide-gray-200 dark:divide-gray-700">
              {data.topAds.map((ad, index) => (
                <div key={ad.id} className="px-4 py-3 flex items-center justify-between">
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">{ad.name}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{ad.placement}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-gray-900 dark:text-white">
                      {formatNumber(ad.impressions)}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">impressions</p>
                  </div>
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
  color
}: {
  title: string
  value: string
  color: 'blue' | 'green' | 'purple' | 'orange'
}) {
  const colors = {
    blue: 'bg-blue-100 dark:bg-blue-900/50 border-blue-200 dark:border-blue-800',
    green: 'bg-green-100 dark:bg-green-900/50 border-green-200 dark:border-green-800',
    purple: 'bg-purple-100 dark:bg-purple-900/50 border-purple-200 dark:border-purple-800',
    orange: 'bg-orange-100 dark:bg-orange-900/50 border-orange-200 dark:border-orange-800'
  }

  return (
    <Card className={`border ${colors[color]}`}>
      <CardContent className="py-4">
        <p className="text-sm text-gray-600 dark:text-gray-400">{title}</p>
        <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{value}</p>
      </CardContent>
    </Card>
  )
}
