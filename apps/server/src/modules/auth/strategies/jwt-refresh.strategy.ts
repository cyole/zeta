import { Injectable, UnauthorizedException } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { PassportStrategy } from '@nestjs/passport'
import { ExtractJwt, Strategy } from 'passport-jwt'
import { PrismaService } from '@/modules/prisma/prisma.service'

export interface JwtRefreshPayload {
  sub: string
  tokenId: string
  iat?: number
  exp?: number
}

@Injectable()
export class JwtRefreshStrategy extends PassportStrategy(
  Strategy,
  'jwt-refresh',
) {
  constructor(
    private configService: ConfigService,
    private prisma: PrismaService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromBodyField('refreshToken'),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('jwt.refreshSecret') || 'fallback-refresh-secret',
    })
  }

  async validate(payload: JwtRefreshPayload) {
    // Check if refresh token exists and is not revoked
    const refreshToken = await this.prisma.refreshToken.findUnique({
      where: { id: payload.tokenId },
      include: { user: true },
    })

    if (!refreshToken) {
      throw new UnauthorizedException('Invalid refresh token')
    }

    if (refreshToken.revoked) {
      throw new UnauthorizedException('Refresh token has been revoked')
    }

    if (refreshToken.expiresAt < new Date()) {
      throw new UnauthorizedException('Refresh token has expired')
    }

    if (refreshToken.user.status !== 'ACTIVE') {
      throw new UnauthorizedException('User account is not active')
    }

    return {
      id: refreshToken.user.id,
      email: refreshToken.user.email,
      tokenId: payload.tokenId,
    }
  }
}
