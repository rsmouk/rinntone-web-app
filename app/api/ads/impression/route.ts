import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/db'

export async function POST(request: NextRequest) {
  try {
    const { adId } = await request.json()

    if (!adId) {
      return NextResponse.json(
        { success: false, error: 'Ad ID is required' },
        { status: 400 }
      )
    }

    await prisma.advertisement.update({
      where: { id: adId },
      data: { impressions: { increment: 1 } }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Impression tracking error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to track impression' },
      { status: 500 }
    )
  }
}
