interface RateLimitConfig {
  interval: number // Time window in milliseconds
  maxRequests: number // Max requests per interval
}

interface RateLimitEntry {
  count: number
  resetTime: number
}

// Simple in-memory rate limiter (for production, use Redis)
const rateLimitStore = new Map<string, RateLimitEntry>()

export function rateLimit(
  identifier: string,
  config: RateLimitConfig = { interval: 60000, maxRequests: 30 }
): { success: boolean; remaining: number; reset: number } {
  const now = Date.now()
  const entry = rateLimitStore.get(identifier)

  // Clean up old entries periodically
  if (rateLimitStore.size > 10000) {
    for (const [key, value] of rateLimitStore.entries()) {
      if (value.resetTime < now) {
        rateLimitStore.delete(key)
      }
    }
  }

  if (!entry || entry.resetTime < now) {
    // Create new entry
    rateLimitStore.set(identifier, {
      count: 1,
      resetTime: now + config.interval
    })
    return {
      success: true,
      remaining: config.maxRequests - 1,
      reset: now + config.interval
    }
  }

  if (entry.count >= config.maxRequests) {
    return {
      success: false,
      remaining: 0,
      reset: entry.resetTime
    }
  }

  // Increment count
  entry.count++
  return {
    success: true,
    remaining: config.maxRequests - entry.count,
    reset: entry.resetTime
  }
}

// Rate limit for downloads (more strict)
export function downloadRateLimit(ip: string): boolean {
  const result = rateLimit(`download:${ip}`, {
    interval: 60000, // 1 minute
    maxRequests: 10 // 10 downloads per minute
  })
  return result.success
}

// Rate limit for API requests
export function apiRateLimit(ip: string): boolean {
  const result = rateLimit(`api:${ip}`, {
    interval: 60000, // 1 minute
    maxRequests: 60 // 60 requests per minute
  })
  return result.success
}

// Rate limit for search autocomplete
export function searchRateLimit(ip: string): boolean {
  const result = rateLimit(`search:${ip}`, {
    interval: 60000, // 1 minute
    maxRequests: 100 // 100 searches per minute
  })
  return result.success
}
