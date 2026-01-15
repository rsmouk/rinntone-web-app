import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const placement = searchParams.get('placement')

    if (!placement) {
      return NextResponse.json(
        { success: false, error: 'Placement is required' },
        { status: 400 }
      )
    }

    const ad = await prisma.advertisement.findFirst({
      where: {
        isActive: true,
        placement: { slug: placement }
      },
      select: {
        id: true,
        name: true,
        adCode: true
      },
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json({
      success: true,
      ad
    })
  } catch (error) {
    console.error('Get ad error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch ad' },
      { status: 500 }
    )
  }
}
