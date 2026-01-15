import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const days = parseInt(request.nextUrl.searchParams.get('days') || '7')

    const startDate = new Date()
    startDate.setDate(startDate.getDate() - days)
    startDate.setHours(0, 0, 0, 0)

    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const weekAgo = new Date()
    weekAgo.setDate(weekAgo.getDate() - 7)

    const monthAgo = new Date()
    monthAgo.setMonth(monthAgo.getMonth() - 1)

    // Get stats
    const [
      totalDownloads,
      todayDownloads,
      weeklyDownloads,
      monthlyDownloads,
      totalViews,
      totalImpressions,
      downloadsByDay,
      topRingtones,
      topAds
    ] = await Promise.all([
      prisma.downloadLog.count(),
      prisma.downloadLog.count({
        where: { downloadedAt: { gte: today } }
      }),
      prisma.downloadLog.count({
        where: { downloadedAt: { gte: weekAgo } }
      }),
      prisma.downloadLog.count({
        where: { downloadedAt: { gte: monthAgo } }
      }),
      prisma.pageView.count(),
      prisma.advertisement.aggregate({
        _sum: { impressions: true }
      }),
      prisma.$queryRaw`
        SELECT DATE(downloaded_at) as date, COUNT(*) as count
        FROM download_logs
        WHERE downloaded_at >= ${startDate}
        GROUP BY DATE(downloaded_at)
        ORDER BY date ASC
      ` as Promise<Array<{ date: Date; count: bigint }>>,
      prisma.ringtone.findMany({
        where: { isActive: true },
        orderBy: { downloadCount: 'desc' },
        take: 10,
        select: { id: true, name: true, downloadCount: true }
      }),
      prisma.advertisement.findMany({
        orderBy: { impressions: 'desc' },
        take: 10,
        include: { placement: { select: { name: true } } }
      })
    ])

    // Generate daily stats array
    const dailyStatsMap = new Map<string, { downloads: number; views: number }>()
    
    // Initialize all days
    for (let i = 0; i < days; i++) {
      const date = new Date(startDate)
      date.setDate(date.getDate() + i)
      const dateStr = date.toISOString().split('T')[0]
      dailyStatsMap.set(dateStr, { downloads: 0, views: 0 })
    }

    // Fill in download counts
    downloadsByDay.forEach((row) => {
      const dateStr = new Date(row.date).toISOString().split('T')[0]
      const existing = dailyStatsMap.get(dateStr)
      if (existing) {
        existing.downloads = Number(row.count)
      }
    })

    const dailyStats = Array.from(dailyStatsMap.entries()).map(([date, stats]) => ({
      date,
      downloads: stats.downloads,
      views: stats.views
    }))

    return NextResponse.json({
      stats: {
        totalDownloads,
        todayDownloads,
        weeklyDownloads,
        monthlyDownloads,
        totalViews,
        totalImpressions: totalImpressions._sum.impressions || 0
      },
      dailyStats,
      topRingtones,
      topAds: topAds.map(ad => ({
        id: ad.id,
        name: ad.name,
        impressions: ad.impressions,
        placement: ad.placement.name
      }))
    })
  } catch (error) {
    console.error('Analytics error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch analytics' },
      { status: 500 }
    )
  }
}
