import Link from 'next/link'
import prisma from '@/lib/db'
import { Card, CardContent, CardHeader } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { formatNumber, formatDate } from '@/lib/utils'
import { ToggleAdButton, DeleteAdButton } from '@/components/admin/AdButtons'

async function getAds() {
  const [ads, placements] = await Promise.all([
    prisma.advertisement.findMany({
      orderBy: { createdAt: 'desc' },
      include: { placement: true }
    }),
    prisma.adPlacement.findMany({
      orderBy: { id: 'asc' }
    })
  ])

  return { ads, placements }
}

export default async function AdsPage() {
  const { ads, placements } = await getAds()

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Advertisements</h1>
          <p className="text-gray-500 dark:text-gray-400">{ads.length} total ads</p>
        </div>
        <Link href="/admin/ads/new">
          <Button variant="primary">
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Add Advertisement
          </Button>
        </Link>
      </div>

      {/* Placements Overview */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
        {placements.map((placement) => {
          const activeAds = ads.filter(ad => ad.placementId === placement.id && ad.isActive)
          return (
            <Card key={placement.id}>
              <CardContent className="py-4 text-center">
                <p className="text-sm font-medium text-gray-900 dark:text-white">{placement.name}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  {activeAds.length} active
                </p>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Ads Table */}
      <Card>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-800">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Name
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Placement
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Impressions
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Created
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {ads.map((ad) => (
                <tr key={ad.id} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                  <td className="px-4 py-4">
                    <p className="font-medium text-gray-900 dark:text-white">{ad.name}</p>
                  </td>
                  <td className="px-4 py-4 text-sm text-gray-500 dark:text-gray-400">
                    {ad.placement.name}
                  </td>
                  <td className="px-4 py-4 text-sm text-gray-500 dark:text-gray-400">
                    {formatNumber(ad.impressions)}
                  </td>
                  <td className="px-4 py-4">
                    <ToggleAdButton id={ad.id} isActive={ad.isActive} />
                  </td>
                  <td className="px-4 py-4 text-sm text-gray-500 dark:text-gray-400">
                    {formatDate(ad.createdAt)}
                  </td>
                  <td className="px-4 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Link href={`/admin/ads/${ad.id}`}>
                        <Button variant="outline" size="sm">Edit</Button>
                      </Link>
                      <DeleteAdButton id={ad.id} name={ad.name} />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  )
}
