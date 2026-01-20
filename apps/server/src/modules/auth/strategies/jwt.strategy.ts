import type { ConfigService } from '@nestjs/config'
import type { PrismaService } from '@/modules/prisma/prisma.service'
import type { RedisService } from '@/modules/redis/redis.service'
import { Injectable, UnauthorizedException } from '@nestjs/common'
import { PassportStrategy } from '@nestjs/passport'
import { ExtractJwt, Strategy } from 'passport-jwt'

export interface JwtPayload {
  sub: string
  email: string
  iat?: number
  exp?: number
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(
    private configService: ConfigService,
    private prisma: PrismaService,
    private redis: RedisService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('jwt.secret') || 'fallback-secret',
      passReqToCallback: true,
    } as any)
  }

  async validate(req: Request, payload: JwtPayload) {
    // Get token from header
    const token = ExtractJwt.fromAuthHeaderAsBearerToken()(req as any)

    // Check if token is blacklisted
    if (token && (await this.redis.isTokenBlacklisted(token))) {
      throw new UnauthorizedException('Token has been revoked')
    }

    // Get user with roles and permissions
    const user = await this.prisma.user.findUnique({
      where: { id: payload.sub },
      include: {
        roles: {
          include: {
            role: {
              include: {
                permissions: {
                  include: {
                    permission: true,
                  },
                },
              },
            },
          },
        },
      },
    })

    if (!user) {
      throw new UnauthorizedException('User not found')
    }

    if (user.status !== 'ACTIVE') {
      throw new UnauthorizedException('User account is not active')
    }

    // Transform roles and permissions
    const roles = user.roles.map(ur => ({
      id: ur.role.id,
      name: ur.role.name,
      displayName: ur.role.displayName,
      permissions: ur.role.permissions.map(rp => ({
        id: rp.permission.id,
        name: rp.permission.name,
        displayName: rp.permission.displayName,
      })),
    }))

    return {
      id: user.id,
      email: user.email,
      name: user.name,
      avatar: user.avatar,
      status: user.status,
      emailVerified: user.emailVerified,
      roles,
    }
  }
}
