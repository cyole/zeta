import { randomBytes } from 'node:crypto'
import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common'
import { PrismaService } from '@/modules/prisma/prisma.service'
import { AuthorizeDto, RefreshClientTokenDto, TokenDto } from './dto'

@Injectable()
export class OAuth2Service {
  constructor(private prisma: PrismaService) {}

  /**
   * 根据 Client ID 获取应用（用于 OAuth）
   */
  async findByClientId(clientId: string) {
    const application = await this.prisma.application.findUnique({
      where: { clientId },
    })

    if (!application) {
      throw new NotFoundException('应用不存在')
    }

    return application
  }

  /**
   * 验证回调地址
   */
  validateRedirectUri(redirectUris: string[], redirectUri: string): boolean {
    return redirectUris.includes(redirectUri)
  }

  /**
   * 生成授权码
   */
  generateAuthorizationCode(): string {
    return randomBytes(24).toString('hex')
  }

  /**
   * 生成 Access Token
   */
  generateAccessToken(): string {
    return randomBytes(32).toString('hex')
  }

  /**
   * 生成 Refresh Token
   */
  generateRefreshToken(): string {
    return randomBytes(32).toString('hex')
  }

  /**
   * 获取授权页面信息
   */
  async getAuthorizePage(clientId: string, redirectUri: string) {
    const application = await this.findByClientId(clientId)

    if (!application.isActive) {
      throw new BadRequestException('应用已被禁用')
    }

    if (!this.validateRedirectUri(application.redirectUris as string[], redirectUri)) {
      throw new BadRequestException('无效的回调地址')
    }

    return {
      application: {
        id: application.id,
        name: application.name,
        logo: application.logo,
        homepage: application.homepage,
      },
      redirectUri,
    }
  }

  /**
   * 创建授权码
   */
  async createAuthorizationCode(userId: string, dto: AuthorizeDto) {
    const application = await this.findByClientId(dto.clientId)

    if (!application.isActive) {
      throw new BadRequestException('应用已被禁用')
    }

    // 验证回调地址
    if (!this.validateRedirectUri(application.redirectUris as string[], dto.redirectUri)) {
      throw new BadRequestException('无效的回调地址')
    }

    // 生成授权码，有效期 10 分钟
    const code = this.generateAuthorizationCode()
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000)

    await this.prisma.oAuthAuthorizationCode.create({
      data: {
        code,
        redirectUri: dto.redirectUri,
        expiresAt,
        applicationId: application.id,
        userId,
      },
    })

    return { code, application }
  }

  /**
   * 验证授权码并交换 Token
   */
  async exchangeToken(dto: TokenDto) {
    // 查找授权码
    const authCode = await this.prisma.oAuthAuthorizationCode.findUnique({
      where: { code: dto.code },
      include: {
        application: true,
        user: true,
      },
    })

    if (!authCode) {
      throw new BadRequestException('无效的授权码')
    }

    // 检查是否过期
    if (authCode.expiresAt < new Date()) {
      await this.prisma.oAuthAuthorizationCode.delete({
        where: { id: authCode.id },
      })
      throw new BadRequestException('授权码已过期')
    }

    // 验证 client_id 和 client_secret
    if (authCode.application.clientId !== dto.clientId) {
      throw new BadRequestException('客户端 ID 不匹配')
    }

    if (authCode.application.clientSecret !== dto.clientSecret) {
      throw new BadRequestException('客户端密钥不匹配')
    }

    // 验证回调地址
    if (authCode.redirectUri !== dto.redirectUri) {
      throw new BadRequestException('回调地址不匹配')
    }

    // 检查应用是否启用
    if (!authCode.application.isActive) {
      throw new BadRequestException('应用已被禁用')
    }

    // 生成 token
    const accessToken = this.generateAccessToken()
    const refreshToken = this.generateRefreshToken()

    const accessTokenExpiresAt = new Date(Date.now() + 60 * 60 * 1000) // 1 小时
    const refreshTokenExpiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 天

    // 使用事务
    await this.prisma.$transaction(async (tx) => {
      // 删除授权码（一次性使用）
      await tx.oAuthAuthorizationCode.delete({
        where: { id: authCode.id },
      })

      // 撤销旧的 refresh token
      await tx.oAuthRefreshToken.updateMany({
        where: {
          applicationId: authCode.applicationId,
          userId: authCode.userId,
          revoked: false,
        },
        data: {
          revoked: true,
        },
      })

      // 创建 access token
      await tx.oAuthAccessToken.create({
        data: {
          token: accessToken,
          expiresAt: accessTokenExpiresAt,
          applicationId: authCode.applicationId,
          userId: authCode.userId,
        },
      })

      // 创建 refresh token
      await tx.oAuthRefreshToken.create({
        data: {
          token: refreshToken,
          expiresAt: refreshTokenExpiresAt,
          applicationId: authCode.applicationId,
          userId: authCode.userId,
        },
      })

      // 创建或更新授权记录
      await tx.userApplicationGrant.upsert({
        where: {
          applicationId_userId: {
            applicationId: authCode.applicationId,
            userId: authCode.userId,
          },
        },
        create: {
          applicationId: authCode.applicationId,
          userId: authCode.userId,
        },
        update: {},
      })
    })

    return {
      accessToken,
      refreshToken,
      expiresIn: 3600, // 1 小时
      tokenType: 'Bearer',
    }
  }

  /**
   * 刷新 Token
   */
  async refreshToken(dto: RefreshClientTokenDto) {
    // 查找 refresh token
    const refreshTokenRecord = await this.prisma.oAuthRefreshToken.findUnique({
      where: { token: dto.refreshToken },
      include: {
        application: true,
        user: true,
      },
    })

    if (!refreshTokenRecord) {
      throw new BadRequestException('无效的刷新令牌')
    }

    // 检查是否被撤销
    if (refreshTokenRecord.revoked) {
      throw new BadRequestException('刷新令牌已被撤销')
    }

    // 检查是否过期
    if (refreshTokenRecord.expiresAt < new Date()) {
      throw new BadRequestException('刷新令牌已过期')
    }

    // 验证 client_id 和 client_secret
    if (refreshTokenRecord.application.clientId !== dto.clientId) {
      throw new BadRequestException('客户端 ID 不匹配')
    }

    if (refreshTokenRecord.application.clientSecret !== dto.clientSecret) {
      throw new BadRequestException('客户端密钥不匹配')
    }

    // 检查应用是否启用
    if (!refreshTokenRecord.application.isActive) {
      throw new BadRequestException('应用已被禁用')
    }

    // 生成新 token
    const accessToken = this.generateAccessToken()
    const newRefreshToken = this.generateRefreshToken()

    const accessTokenExpiresAt = new Date(Date.now() + 60 * 60 * 1000) // 1 小时
    const refreshTokenExpiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 天

    // 使用事务
    await this.prisma.$transaction(async (tx) => {
      // 撤销旧的 refresh token
      await tx.oAuthRefreshToken.update({
        where: { id: refreshTokenRecord.id },
        data: { revoked: true },
      })

      // 创建新的 access token
      await tx.oAuthAccessToken.create({
        data: {
          token: accessToken,
          expiresAt: accessTokenExpiresAt,
          applicationId: refreshTokenRecord.applicationId,
          userId: refreshTokenRecord.userId,
        },
      })

      // 创建新的 refresh token
      await tx.oAuthRefreshToken.create({
        data: {
          token: newRefreshToken,
          expiresAt: refreshTokenExpiresAt,
          applicationId: refreshTokenRecord.applicationId,
          userId: refreshTokenRecord.userId,
        },
      })
    })

    return {
      accessToken,
      refreshToken: newRefreshToken,
      expiresIn: 3600,
      tokenType: 'Bearer',
    }
  }

  /**
   * 根据 Access Token 获取用户信息
   */
  async getUserByAccessToken(accessToken: string) {
    const tokenRecord = await this.prisma.oAuthAccessToken.findUnique({
      where: { token: accessToken },
      include: {
        user: true,
        application: true,
      },
    })

    if (!tokenRecord) {
      throw new BadRequestException('无效的访问令牌')
    }

    // 检查是否过期
    if (tokenRecord.expiresAt < new Date()) {
      throw new BadRequestException('访问令牌已过期')
    }

    return {
      user: tokenRecord.user,
      application: {
        id: tokenRecord.application.id,
        name: tokenRecord.application.name,
        logo: tokenRecord.application.logo,
      },
    }
  }
}
