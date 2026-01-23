import type {
  CanActivate,
  ExecutionContext,
} from '@nestjs/common'
import {
  Injectable,
  Logger,
} from '@nestjs/common'
import { Reflector } from '@nestjs/core'
import { RedisService } from '@/modules/redis/redis.service'
import { THROTTLE_METADATA, THROTTLE_SKIP } from '../decorators/throttle.decorator'

@Injectable()
export class ThrottlerGuard implements CanActivate {
  private readonly logger = new Logger(ThrottlerGuard.name)

  // Default throttle options (can be overridden by decorator)
  private readonly defaultLimit = 100
  private readonly defaultTtl = 60 // seconds

  constructor(
    private readonly reflector: Reflector,
    private readonly redis: RedisService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    // Check if should skip
    const skip = this.reflector.get<boolean>(THROTTLE_SKIP, context.getHandler())
      || this.reflector.get<boolean>(THROTTLE_SKIP, context.getClass())
    if (skip) {
      return true
    }

    // Get custom throttle options from decorator
    const customOptions = this.reflector.get<{ limit: number, ttl: number }>(
      THROTTLE_METADATA,
      context.getHandler(),
    )
    || this.reflector.get<{ limit: number, ttl: number }>(
      THROTTLE_METADATA,
      context.getClass(),
    )

    const limit = customOptions?.limit ?? this.defaultLimit
    const ttl = customOptions?.ttl ?? this.defaultTtl

    const request = context.switchToHttp().getRequest()
    const tracker = this.getTracker(request)
    const key = `throttle:${tracker}`

    try {
      const current = await this.redis.incr(key)

      if (current === 1) {
        // First request, set expiry
        await this.redis.expire(key, ttl)
      }

      if (current > limit) {
        const ttlLeft = await this.redis.ttl(key)
        this.logger.warn(`Rate limit exceeded for ${tracker} (${current}/${limit} requests)`)
        // Set custom header for rate limit info
        request.res?.setHeader('X-RateLimit-Limit', limit.toString())
        request.res?.setHeader('X-RateLimit-Remaining', '0')
        request.res?.setHeader('X-RateLimit-Reset', ttlLeft.toString())
        return false
      }

      // Set rate limit headers
      const ttlLeft = await this.redis.ttl(key)
      request.res?.setHeader('X-RateLimit-Limit', limit.toString())
      request.res?.setHeader('X-RateLimit-Remaining', (limit - current).toString())
      request.res?.setHeader('X-RateLimit-Reset', ttlLeft.toString())

      return true
    }
    catch (error) {
      this.logger.error('Throttler error:', error)
      // On error, allow the request (fail open)
      return true
    }
  }

  protected getTracker(req: Record<string, unknown>): string {
    // Track by IP address and user ID if available
    const userId = (req.user as any)?.id
    const ip = req.ip || (req.socket as any)?.remoteAddress || 'unknown'
    return userId ? `user:${userId}` : `ip:${ip}`
  }
}
