import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const query = searchParams.get('q') || ''

    if (query.length < 2) {
      return NextResponse.json({ results: [], exactMatch: null })
    }

    // Check for exact numeric ID match
    let exactMatch = null
    if (/^\d+$/.test(query)) {
      exactMatch = await prisma.ringtone.findUnique({
        where: { numericId: query },
        select: {
          id: true,
          numericId: true,
          name: true,
          category: { select: { name: true } }
        }
      })
    }

    // Get autocomplete results
    const results = await prisma.ringtone.findMany({
      where: {
        isActive: true,
        OR: [
          { name: { contains: query } },
          { numericId: { startsWith: query } }
        ]
      },
      take: 8,
      select: {
        id: true,
        numericId: true,
        name: true,
        category: { select: { name: true } }
      },
      orderBy: { downloadCount: 'desc' }
    })

    return NextResponse.json({
      results: results.map(r => ({
        id: r.id,
        numericId: r.numericId,
        name: r.name,
        categoryName: r.category?.name
      })),
      exactMatch: exactMatch ? {
        id: exactMatch.id,
        numericId: exactMatch.numericId,
        name: exactMatch.name,
        categoryName: exactMatch.category?.name
      } : null
    })
  } catch (error) {
    console.error('Autocomplete error:', error)
    return NextResponse.json(
      { results: [], exactMatch: null },
      { status: 500 }
    )
  }
}
