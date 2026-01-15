import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/db'

export async function GET() {
  try {
    const [ads, placements] = await Promise.all([
      prisma.advertisement.findMany({
        orderBy: { createdAt: 'desc' },
        include: {
          placement: true
        }
      }),
      prisma.adPlacement.findMany({
        orderBy: { id: 'asc' }
      })
    ])

    return NextResponse.json({ ads, placements })
  } catch (error) {
    console.error('Get ads error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch ads' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { name, adCode, placementId, isActive } = body

    if (!name || !adCode || !placementId) {
      return NextResponse.json(
        { error: 'Name, ad code, and placement are required' },
        { status: 400 }
      )
    }

    const ad = await prisma.advertisement.create({
      data: {
        name,
        adCode,
        placementId: parseInt(placementId),
        isActive: isActive !== false
      }
    })

    return NextResponse.json({ success: true, ad })
  } catch (error) {
    console.error('Create ad error:', error)
    return NextResponse.json(
      { error: 'Failed to create ad' },
      { status: 500 }
    )
  }
}
