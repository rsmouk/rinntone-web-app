import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/db'
import { uploadAudioFile, uploadThumbnail } from '@/lib/storage'
import { generateNumericId } from '@/lib/utils'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const formData = await request.formData()
    const name = formData.get('name') as string
    let numericId = formData.get('numericId') as string
    const description = formData.get('description') as string
    const categoryId = formData.get('categoryId') as string
    const tagIds = JSON.parse((formData.get('tagIds') as string) || '[]')
    const audioFile = formData.get('audio') as File
    const thumbnailFile = formData.get('thumbnail') as File | null

    if (!name || !audioFile) {
      return NextResponse.json(
        { error: 'Name and audio file are required' },
        { status: 400 }
      )
    }

    // Generate numeric ID if not provided
    if (!numericId) {
      numericId = generateNumericId()
    }

    // Check if numeric ID is unique
    const existing = await prisma.ringtone.findUnique({
      where: { numericId }
    })

    if (existing) {
      return NextResponse.json(
        { error: 'Numeric ID already exists' },
        { status: 400 }
      )
    }

    // Upload audio file
    const audioResult = await uploadAudioFile(audioFile)
    if (!audioResult.success) {
      return NextResponse.json(
        { error: audioResult.error },
        { status: 400 }
      )
    }

    // Upload thumbnail if provided
    let thumbnailPath: string | null = null
    if (thumbnailFile && thumbnailFile.size > 0) {
      const thumbResult = await uploadThumbnail(thumbnailFile)
      if (thumbResult.success) {
        thumbnailPath = thumbResult.path!
      }
    }

    // Create ringtone
    const ringtone = await prisma.ringtone.create({
      data: {
        name,
        numericId,
        description: description || null,
        filePath: audioResult.path!,
        fileSize: audioResult.size,
        thumbnailPath,
        categoryId: categoryId ? parseInt(categoryId) : null,
        tags: {
          create: tagIds.map((tagId: number) => ({
            tagId
          }))
        }
      }
    })

    return NextResponse.json({ success: true, ringtone })
  } catch (error) {
    console.error('Create ringtone error:', error)
    return NextResponse.json(
      { error: 'Failed to create ringtone' },
      { status: 500 }
    )
  }
}

export async function GET() {
  try {
    const ringtones = await prisma.ringtone.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        category: { select: { name: true } }
      }
    })

    return NextResponse.json({ ringtones })
  } catch (error) {
    console.error('Get ringtones error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch ringtones' },
      { status: 500 }
    )
  }
}
