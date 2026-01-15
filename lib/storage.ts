import { writeFile, mkdir, unlink, access, stat } from 'fs/promises'
import path from 'path'
import { v4 as uuidv4 } from 'uuid'
import { sanitizeFilename, getFileExtension, isValidAudioFile, isValidImageFile } from './utils'

const UPLOAD_DIR = path.join(process.cwd(), 'uploads')
const RINGTONES_DIR = path.join(UPLOAD_DIR, 'ringtones')
const THUMBNAILS_DIR = path.join(UPLOAD_DIR, 'thumbnails')

// Max file sizes in bytes
const MAX_AUDIO_SIZE = 10 * 1024 * 1024 // 10MB
const MAX_IMAGE_SIZE = 5 * 1024 * 1024 // 5MB

export interface UploadResult {
  success: boolean
  path?: string
  error?: string
  size?: number
}

async function ensureDir(dir: string): Promise<void> {
  try {
    await access(dir)
  } catch {
    await mkdir(dir, { recursive: true })
  }
}

export async function uploadAudioFile(file: File): Promise<UploadResult> {
  try {
    if (!isValidAudioFile(file.name)) {
      return { success: false, error: 'Invalid audio file type. Allowed: mp3, m4r, ogg, wav, aac' }
    }

    if (file.size > MAX_AUDIO_SIZE) {
      return { success: false, error: 'File too large. Maximum size is 10MB' }
    }

    await ensureDir(RINGTONES_DIR)

    const ext = getFileExtension(file.name)
    const uniqueName = `${uuidv4()}.${ext}`
    const filePath = path.join(RINGTONES_DIR, uniqueName)

    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    await writeFile(filePath, buffer)

    return {
      success: true,
      path: `/uploads/ringtones/${uniqueName}`,
      size: file.size
    }
  } catch (error) {
    console.error('Audio upload error:', error)
    return { success: false, error: 'Failed to upload audio file' }
  }
}

export async function uploadThumbnail(file: File): Promise<UploadResult> {
  try {
    if (!isValidImageFile(file.name)) {
      return { success: false, error: 'Invalid image file type. Allowed: jpg, jpeg, png, gif, webp' }
    }

    if (file.size > MAX_IMAGE_SIZE) {
      return { success: false, error: 'File too large. Maximum size is 5MB' }
    }

    await ensureDir(THUMBNAILS_DIR)

    const ext = getFileExtension(file.name)
    const uniqueName = `${uuidv4()}.${ext}`
    const filePath = path.join(THUMBNAILS_DIR, uniqueName)

    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    await writeFile(filePath, buffer)

    return {
      success: true,
      path: `/uploads/thumbnails/${uniqueName}`,
      size: file.size
    }
  } catch (error) {
    console.error('Thumbnail upload error:', error)
    return { success: false, error: 'Failed to upload thumbnail' }
  }
}

export async function deleteFile(filePath: string): Promise<boolean> {
  try {
    const fullPath = path.join(process.cwd(), filePath.replace(/^\//, ''))
    await unlink(fullPath)
    return true
  } catch (error) {
    console.error('Delete file error:', error)
    return false
  }
}

export async function fileExists(filePath: string): Promise<boolean> {
  try {
    const fullPath = path.join(process.cwd(), filePath.replace(/^\//, ''))
    await access(fullPath)
    return true
  } catch {
    return false
  }
}

export async function getFileStats(filePath: string): Promise<{ size: number } | null> {
  try {
    const fullPath = path.join(process.cwd(), filePath.replace(/^\//, ''))
    const stats = await stat(fullPath)
    return { size: stats.size }
  } catch {
    return null
  }
}

export function getAbsolutePath(relativePath: string): string {
  return path.join(process.cwd(), relativePath.replace(/^\//, ''))
}

export { UPLOAD_DIR, RINGTONES_DIR, THUMBNAILS_DIR }
