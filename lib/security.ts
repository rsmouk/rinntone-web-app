import { headers } from 'next/headers'

// Check for valid referer to prevent hotlinking
export async function isValidReferer(allowedHosts: string[] = []): Promise<boolean> {
  const headersList = await headers()
  const referer = headersList.get('referer')
  
  if (!referer) return false

  try {
    const url = new URL(referer)
    const host = url.hostname

    // Allow localhost in development
    if (process.env.NODE_ENV === 'development') {
      if (host === 'localhost' || host === '127.0.0.1') {
        return true
      }
    }

    // Check against allowed hosts
    const siteUrl = process.env.SITE_URL || ''
    if (siteUrl) {
      const siteHost = new URL(siteUrl).hostname
      if (host === siteHost) return true
    }

    return allowedHosts.includes(host)
  } catch {
    return false
  }
}

// Sanitize HTML to prevent XSS (basic)
export function sanitizeHtml(html: string): string {
  // Remove script tags
  let sanitized = html.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
  
  // Remove onclick and other event handlers
  sanitized = sanitized.replace(/\s*on\w+\s*=\s*["'][^"']*["']/gi, '')
  sanitized = sanitized.replace(/\s*on\w+\s*=\s*[^\s>]+/gi, '')

  // Remove javascript: URLs
  sanitized = sanitized.replace(/javascript:/gi, '')

  return sanitized
}

// Validate file type by checking magic bytes
export async function validateFileType(
  buffer: ArrayBuffer,
  expectedTypes: string[]
): Promise<{ valid: boolean; type: string | null }> {
  const bytes = new Uint8Array(buffer.slice(0, 12))

  // MP3 (ID3 tag or frame sync)
  if (
    (bytes[0] === 0x49 && bytes[1] === 0x44 && bytes[2] === 0x33) || // ID3
    (bytes[0] === 0xff && (bytes[1] & 0xe0) === 0xe0) // Frame sync
  ) {
    return { valid: expectedTypes.includes('mp3'), type: 'mp3' }
  }

  // M4A/M4R (ftyp box)
  if (
    bytes[4] === 0x66 &&
    bytes[5] === 0x74 &&
    bytes[6] === 0x79 &&
    bytes[7] === 0x70
  ) {
    return { valid: expectedTypes.includes('m4r') || expectedTypes.includes('m4a'), type: 'm4r' }
  }

  // OGG
  if (
    bytes[0] === 0x4f &&
    bytes[1] === 0x67 &&
    bytes[2] === 0x67 &&
    bytes[3] === 0x53
  ) {
    return { valid: expectedTypes.includes('ogg'), type: 'ogg' }
  }

  // WAV
  if (
    bytes[0] === 0x52 &&
    bytes[1] === 0x49 &&
    bytes[2] === 0x46 &&
    bytes[3] === 0x46
  ) {
    return { valid: expectedTypes.includes('wav'), type: 'wav' }
  }

  // JPEG
  if (bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) {
    return { valid: expectedTypes.includes('jpg') || expectedTypes.includes('jpeg'), type: 'jpg' }
  }

  // PNG
  if (
    bytes[0] === 0x89 &&
    bytes[1] === 0x50 &&
    bytes[2] === 0x4e &&
    bytes[3] === 0x47
  ) {
    return { valid: expectedTypes.includes('png'), type: 'png' }
  }

  // GIF
  if (bytes[0] === 0x47 && bytes[1] === 0x49 && bytes[2] === 0x46) {
    return { valid: expectedTypes.includes('gif'), type: 'gif' }
  }

  // WebP
  if (
    bytes[0] === 0x52 &&
    bytes[1] === 0x49 &&
    bytes[2] === 0x46 &&
    bytes[3] === 0x46 &&
    bytes[8] === 0x57 &&
    bytes[9] === 0x45 &&
    bytes[10] === 0x42 &&
    bytes[11] === 0x50
  ) {
    return { valid: expectedTypes.includes('webp'), type: 'webp' }
  }

  return { valid: false, type: null }
}

// Generate a simple token for download validation
export function generateDownloadToken(ringtoneId: string): string {
  const timestamp = Date.now()
  const data = `${ringtoneId}:${timestamp}:${process.env.NEXTAUTH_SECRET || 'secret'}`
  return Buffer.from(data).toString('base64')
}

// Validate download token
export function validateDownloadToken(token: string, maxAge: number = 300000): boolean {
  try {
    const decoded = Buffer.from(token, 'base64').toString()
    const parts = decoded.split(':')
    if (parts.length < 2) return false

    const timestamp = parseInt(parts[1])
    const now = Date.now()

    // Token should be less than maxAge old (default 5 minutes)
    return now - timestamp < maxAge
  } catch {
    return false
  }
}
