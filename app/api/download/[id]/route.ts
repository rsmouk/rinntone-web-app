import { NextRequest, NextResponse } from 'next/server'
import { readFile } from 'fs/promises'
import path from 'path'
import prisma from '@/lib/db'
import { getClientIp } from '@/lib/utils'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    
    // Validate the download token from query params
    const token = request.nextUrl.searchParams.get('token')
    if (!token) {
      return NextResponse.json(
        { success: false, error: 'Invalid download request' },
        { status: 403 }
      )
    }

    // Find ringtone
    const ringtone = await prisma.ringtone.findFirst({
      where: {
        OR: [
          { numericId: id },
          { id: parseInt(id) || 0 }
        ],
        isActive: true
      }
    })

    if (!ringtone) {
      return NextResponse.json(
        { success: false, error: 'Ringtone not found' },
        { status: 404 }
      )
    }

    // Get file path
    const filePath = path.join(process.cwd(), ringtone.filePath.replace(/^\//, ''))
    
    try {
      const fileBuffer = await readFile(filePath)
      
      // Log download
      const ip = getClientIp(request)
      const userAgent = request.headers.get('user-agent')

      await Promise.all([
        prisma.downloadLog.create({
          data: {
            ringtoneId: ringtone.id,
            ipAddress: ip,
            userAgent: userAgent,
            referer: request.headers.get('referer')
          }
        }),
        prisma.ringtone.update({
          where: { id: ringtone.id },
          data: { downloadCount: { increment: 1 } }
        })
      ])

      // Determine content type
      const ext = path.extname(ringtone.filePath).toLowerCase()
      let contentType = 'audio/mpeg'
      if (ext === '.m4r') contentType = 'audio/m4a'
      else if (ext === '.ogg') contentType = 'audio/ogg'
      else if (ext === '.wav') contentType = 'audio/wav'

      // Create filename
      const filename = `${ringtone.name.replace(/[^a-zA-Z0-9]/g, '_')}${ext}`

      return new NextResponse(fileBuffer, {
        headers: {
          'Content-Type': contentType,
          'Content-Disposition': `attachment; filename="${filename}"`,
          'Content-Length': fileBuffer.length.toString(),
          'Cache-Control': 'no-store'
        }
      })
    } catch (fileError) {
      console.error('File read error:', fileError)
      return NextResponse.json(
        { success: false, error: 'File not found' },
        { status: 404 }
      )
    }
  } catch (error) {
    console.error('Download error:', error)
    return NextResponse.json(
      { success: false, error: 'Download failed' },
      { status: 500 }
    )
  }
}
