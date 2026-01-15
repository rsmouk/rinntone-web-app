import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/db'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const ringtone = await prisma.ringtone.findFirst({
      where: {
        OR: [
          { numericId: id },
          { id: parseInt(id) || 0 }
        ],
        isActive: true
      },
      include: {
        category: { select: { id: true, name: true, slug: true } },
        tags: { include: { tag: true } }
      }
    })

    if (!ringtone) {
      return NextResponse.json(
        { success: false, error: 'Ringtone not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      ringtone: {
        ...ringtone,
        categoryName: ringtone.category?.name,
        tags: ringtone.tags.map(t => t.tag)
      }
    })
  } catch (error) {
    console.error('Get ringtone error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch ringtone' },
      { status: 500 }
    )
  }
}
