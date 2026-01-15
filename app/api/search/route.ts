import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const query = searchParams.get('q') || ''
    const category = searchParams.get('category')
    const tag = searchParams.get('tag')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const sort = searchParams.get('sort') || 'latest'

    const skip = (page - 1) * limit

    // Build where clause
    const where: any = {
      isActive: true
    }

    if (query) {
      // Check if query is a numeric ID
      if (/^\d+$/.test(query)) {
        where.numericId = query
      } else {
        where.OR = [
          { name: { contains: query } },
          { description: { contains: query } },
          { tags: { some: { tag: { name: { contains: query } } } } }
        ]
      }
    }

    if (category) {
      where.category = { slug: category }
    }

    if (tag) {
      where.tags = { some: { tag: { slug: tag } } }
    }

    // Build order by clause
    let orderBy: any = { createdAt: 'desc' }
    switch (sort) {
      case 'popular':
        orderBy = { downloadCount: 'desc' }
        break
      case 'name':
        orderBy = { name: 'asc' }
        break
      case 'oldest':
        orderBy = { createdAt: 'asc' }
        break
    }

    // Execute queries
    const [ringtones, total] = await Promise.all([
      prisma.ringtone.findMany({
        where,
        orderBy,
        skip,
        take: limit,
        include: {
          category: { select: { name: true, slug: true } },
          tags: { include: { tag: true } }
        }
      }),
      prisma.ringtone.count({ where })
    ])

    return NextResponse.json({
      success: true,
      data: {
        ringtones: ringtones.map(r => ({
          ...r,
          categoryName: r.category?.name,
          categorySlug: r.category?.slug,
          tags: r.tags.map(t => t.tag)
        })),
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit)
        }
      }
    })
  } catch (error) {
    console.error('Search error:', error)
    return NextResponse.json(
      { success: false, error: 'Search failed' },
      { status: 500 }
    )
  }
}
