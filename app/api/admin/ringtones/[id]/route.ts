import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/db'
import { deleteFile, uploadAudioFile, uploadThumbnail } from '@/lib/storage'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    const ringtone = await prisma.ringtone.findUnique({
      where: { id: parseInt(id) },
      include: {
        category: true,
        tags: { include: { tag: true } }
      }
    })

    if (!ringtone) {
      return NextResponse.json({ error: 'Ringtone not found' }, { status: 404 })
    }

    return NextResponse.json({ ringtone })
  } catch (error) {
    console.error('Get ringtone error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch ringtone' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    const formData = await request.formData()
    
    const name = formData.get('name') as string
    const description = formData.get('description') as string
    const categoryId = formData.get('categoryId') as string
    const tagIds = JSON.parse((formData.get('tagIds') as string) || '[]')
    const isActive = formData.get('isActive') === 'true'
    const audioFile = formData.get('audio') as File | null
    const thumbnailFile = formData.get('thumbnail') as File | null

    const existingRingtone = await prisma.ringtone.findUnique({
      where: { id: parseInt(id) }
    })

    if (!existingRingtone) {
      return NextResponse.json({ error: 'Ringtone not found' }, { status: 404 })
    }

    const updateData: any = {
      name,
      description: description || null,
      categoryId: categoryId ? parseInt(categoryId) : null,
      isActive
    }

    // Upload new audio if provided
    if (audioFile && audioFile.size > 0) {
      const audioResult = await uploadAudioFile(audioFile)
      if (audioResult.success) {
        // Delete old file
        await deleteFile(existingRingtone.filePath)
        updateData.filePath = audioResult.path
        updateData.fileSize = audioResult.size
      }
    }

    // Upload new thumbnail if provided
    if (thumbnailFile && thumbnailFile.size > 0) {
      const thumbResult = await uploadThumbnail(thumbnailFile)
      if (thumbResult.success) {
        // Delete old thumbnail
        if (existingRingtone.thumbnailPath) {
          await deleteFile(existingRingtone.thumbnailPath)
        }
        updateData.thumbnailPath = thumbResult.path
      }
    }

    // Update tags
    await prisma.ringtoneTag.deleteMany({
      where: { ringtoneId: parseInt(id) }
    })

    const ringtone = await prisma.ringtone.update({
      where: { id: parseInt(id) },
      data: {
        ...updateData,
        tags: {
          create: tagIds.map((tagId: number) => ({ tagId }))
        }
      }
    })

    return NextResponse.json({ success: true, ringtone })
  } catch (error) {
    console.error('Update ringtone error:', error)
    return NextResponse.json(
      { error: 'Failed to update ringtone' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    const ringtone = await prisma.ringtone.findUnique({
      where: { id: parseInt(id) }
    })

    if (!ringtone) {
      return NextResponse.json({ error: 'Ringtone not found' }, { status: 404 })
    }

    // Delete files
    await deleteFile(ringtone.filePath)
    if (ringtone.thumbnailPath) {
      await deleteFile(ringtone.thumbnailPath)
    }

    // Delete from database
    await prisma.ringtone.delete({
      where: { id: parseInt(id) }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Delete ringtone error:', error)
    return NextResponse.json(
      { error: 'Failed to delete ringtone' },
      { status: 500 }
    )
  }
}
