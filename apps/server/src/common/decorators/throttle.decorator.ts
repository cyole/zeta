import { SetMetadata } from '@nestjs/common'

export const THROTTLE_METADATA = 'throttle:custom'
export const THROTTLE_SKIP = 'throttle:skip'

export interface ThrottleOptions {
  limit?: number
  ttl?: number // in seconds
}

/**
 * Throttle decorator for rate limiting
 * @param limit Maximum number of requests within TTL period
 * @param ttl Time to live in seconds (default: 60)
 */
export function Throttle(limit: number, ttl = 60) {
  return SetMetadata(THROTTLE_METADATA, { limit, ttl })
}

/**
 * Skip throttle decorator for routes that should bypass rate limiting
 */
export const SkipThrottle = () => SetMetadata(THROTTLE_SKIP, true)
