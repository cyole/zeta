import type { ForgotPasswordDto, LoginDto, RegisterDto, ResendVerificationDto, ResetPasswordDto } from './dto'
import * as crypto from 'node:crypto'
import {
  BadRequestException,
  ConflictException,
  Injectable,
  InternalServerErrorException,
  UnauthorizedException,
} from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { JwtService } from '@nestjs/jwt'
import { OAuthProvider } from '@prisma/client'
import * as bcrypt from 'bcrypt'
import { DingtalkService } from '@/modules/dingtalk'
import { MailService } from '@/modules/mail/mail.service'
import { PrismaService } from '@/modules/prisma/prisma.service'
import { RedisService } from '@/modules/redis/redis.service'

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private configService: ConfigService,
    private redis: RedisService,
    private mailService: MailService,
    private dingtalkService: DingtalkService,
  ) {}

  async register(dto: RegisterDto) {
    // Check if email already exists
    const existingUser = await this.prisma.user.findUnique({
      where: { email: dto.email },
    })

    if (existingUser) {
      throw new ConflictException('该邮箱已被注册')
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(dto.password, 12)

    // Get default role (FRONTEND by default)
    const defaultRole = await this.prisma.role.findUnique({
      where: { name: 'FRONTEND' },
    })

    // Create user
    const user = await this.prisma.user.create({
      data: {
        email: dto.email,
        password: hashedPassword,
        name: dto.name,
        roles: defaultRole
          ? {
              create: {
                roleId: defaultRole.id,
              },
            }
          : undefined,
      },
      include: {
        roles: {
          include: {
            role: true,
          },
        },
      },
    })

    // Create verification token
    const verificationToken = crypto.randomBytes(32).toString('hex')
    await this.prisma.verificationToken.create({
      data: {
        token: verificationToken,
        type: 'EMAIL_VERIFICATION',
        userId: user.id,
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
      },
    })

    // Send verification email
    await this.mailService.sendVerificationEmail(
      user.email,
      user.name,
      verificationToken,
    )

    return {
      message: '注册成功，请查收邮箱完成验证',
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        emailVerified: user.emailVerified,
      },
    }
  }

  async login(dto: LoginDto, userAgent?: string, ipAddress?: string) {
    // Find user
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email },
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
      throw new UnauthorizedException('邮箱或密码错误')
    }

    if (!user.password) {
      throw new UnauthorizedException('此账号需要使用第三方登录')
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(dto.password, user.password)
    if (!isPasswordValid) {
      throw new UnauthorizedException('邮箱或密码错误')
    }

    // Check user status
    if (user.status !== 'ACTIVE') {
      throw new UnauthorizedException('账号已被禁用')
    }

    // Check email verification
    if (!user.emailVerified) {
      throw new UnauthorizedException('EMAIL_NOT_VERIFIED')
    }

    // Generate tokens
    const tokens = await this.generateTokens(user.id, user.email, userAgent, ipAddress)

    // Update last login time
    await this.prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
    })

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
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        avatar: user.avatar,
        status: user.status,
        emailVerified: user.emailVerified,
        roles,
      },
    }
  }

  async refreshTokens(
    userId: string,
    tokenId: string,
    userAgent?: string,
    ipAddress?: string,
  ) {
    // Revoke old refresh token
    await this.prisma.refreshToken.update({
      where: { id: tokenId },
      data: { revoked: true },
    })

    // Get user
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    })

    if (!user) {
      throw new UnauthorizedException('User not found')
    }

    // Generate new tokens
    return this.generateTokens(user.id, user.email, userAgent, ipAddress)
  }

  async logout(userId: string, accessToken: string, refreshToken?: string) {
    // Blacklist access token
    const decoded = this.jwtService.decode(accessToken) as { exp: number }
    if (decoded?.exp) {
      const ttl = decoded.exp - Math.floor(Date.now() / 1000)
      if (ttl > 0) {
        await this.redis.blacklistToken(accessToken, ttl)
      }
    }

    // Revoke all refresh tokens for user (or specific one if provided)
    if (refreshToken) {
      const decoded = this.jwtService.decode(refreshToken) as { tokenId: string }
      if (decoded?.tokenId) {
        await this.prisma.refreshToken.updateMany({
          where: { id: decoded.tokenId, userId },
          data: { revoked: true },
        })
      }
    }
    else {
      // Revoke all refresh tokens
      await this.prisma.refreshToken.updateMany({
        where: { userId, revoked: false },
        data: { revoked: true },
      })
    }

    return { message: '登出成功' }
  }

  async verifyEmail(token: string) {
    const verificationToken = await this.prisma.verificationToken.findUnique({
      where: { token },
      include: { user: true },
    })

    if (!verificationToken) {
      throw new BadRequestException('无效的验证令牌')
    }

    if (verificationToken.expiresAt < new Date()) {
      throw new BadRequestException('验证令牌已过期')
    }

    if (verificationToken.type !== 'EMAIL_VERIFICATION') {
      throw new BadRequestException('无效的验证令牌类型')
    }

    // Update user email verified status
    await this.prisma.user.update({
      where: { id: verificationToken.userId },
      data: { emailVerified: true },
    })

    // Delete verification token
    await this.prisma.verificationToken.delete({
      where: { id: verificationToken.id },
    })

    return { message: '邮箱验证成功' }
  }

  async resendVerificationEmail(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    })

    if (!user) {
      throw new BadRequestException('用户不存在')
    }

    if (user.emailVerified) {
      throw new BadRequestException('邮箱已验证')
    }

    // Delete existing verification tokens
    await this.prisma.verificationToken.deleteMany({
      where: { userId, type: 'EMAIL_VERIFICATION' },
    })

    // Create new verification token
    const verificationToken = crypto.randomBytes(32).toString('hex')
    await this.prisma.verificationToken.create({
      data: {
        token: verificationToken,
        type: 'EMAIL_VERIFICATION',
        userId: user.id,
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
      },
    })

    // Send verification email
    await this.mailService.sendVerificationEmail(
      user.email,
      user.name,
      verificationToken,
    )

    return { message: '验证邮件已发送' }
  }

  async resendVerificationEmailByEmail(dto: ResendVerificationDto) {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email },
    })

    if (!user) {
      // Don't reveal if email exists or not for security
      return { message: '如果该邮箱已注册，验证邮件已发送' }
    }

    if (user.emailVerified) {
      return { message: '邮箱已验证' }
    }

    // Delete existing verification tokens
    await this.prisma.verificationToken.deleteMany({
      where: { userId: user.id, type: 'EMAIL_VERIFICATION' },
    })

    // Create new verification token
    const verificationToken = crypto.randomBytes(32).toString('hex')
    await this.prisma.verificationToken.create({
      data: {
        token: verificationToken,
        type: 'EMAIL_VERIFICATION',
        userId: user.id,
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
      },
    })

    // Send verification email
    await this.mailService.sendVerificationEmail(
      user.email,
      user.name,
      verificationToken,
    )

    return { message: '验证邮件已发送' }
  }

  async getProfile(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
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
        oauthAccounts: {
          select: {
            provider: true,
            createdAt: true,
          },
        },
      },
    })

    if (!user) {
      throw new UnauthorizedException('User not found')
    }

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
      createdAt: user.createdAt,
      lastLoginAt: user.lastLoginAt,
      roles,
      oauthAccounts: user.oauthAccounts,
      hasPassword: !!user.password,
    }
  }

  async forgotPassword(dto: ForgotPasswordDto) {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email },
    })

    if (!user) {
      throw new BadRequestException('该邮箱尚未注册')
    }

    // 删除现有的密码重置令牌
    await this.prisma.verificationToken.deleteMany({
      where: { userId: user.id, type: 'PASSWORD_RESET' },
    })

    // 创建新的重置令牌
    const resetToken = crypto.randomBytes(32).toString('hex')
    await this.prisma.verificationToken.create({
      data: {
        token: resetToken,
        type: 'PASSWORD_RESET',
        userId: user.id,
        expiresAt: new Date(Date.now() + 60 * 60 * 1000), // 1 hour
      },
    })

    // 发送密码重置邮件
    await this.mailService.sendPasswordResetEmail(
      user.email,
      user.name,
      resetToken,
    )

    return { message: '密码重置邮件已发送' }
  }

  async resetPassword(dto: ResetPasswordDto) {
    console.log('[resetPassword] Received request with token:', `${dto.token?.substring(0, 10)}...`)

    const verificationToken = await this.prisma.verificationToken.findUnique({
      where: { token: dto.token },
      include: { user: true },
    })

    if (!verificationToken) {
      console.log('[resetPassword] Token not found')
      throw new BadRequestException('无效的重置令牌')
    }

    if (verificationToken.expiresAt < new Date()) {
      console.log('[resetPassword] Token expired')
      throw new BadRequestException('重置令牌已过期')
    }

    if (verificationToken.type !== 'PASSWORD_RESET') {
      console.log('[resetPassword] Invalid token type:', verificationToken.type)
      throw new BadRequestException('无效的重置令牌类型')
    }

    console.log('[resetPassword] Token valid for user:', verificationToken.user.email)

    // Hash新密码
    const hashedPassword = await bcrypt.hash(dto.password, 12)
    console.log('[resetPassword] Password hashed')

    // 更新用户密码
    await this.prisma.user.update({
      where: { id: verificationToken.userId },
      data: { password: hashedPassword },
    })
    console.log('[resetPassword] Password updated in database for user:', verificationToken.userId)

    // 删除重置令牌
    await this.prisma.verificationToken.delete({
      where: { id: verificationToken.id },
    })
    console.log('[resetPassword] Token deleted')

    return { message: '密码重置成功，请使用新密码登录' }
  }

  // ==================== GitHub OAuth ====================

  getGitHubConfig(redirectUri?: string) {
    const clientId = this.configService.get('github.clientId')
    const finalRedirectUri = redirectUri || this.configService.get('github.callbackUrl') || ''
    return {
      clientId,
      redirectUri: finalRedirectUri,
      scope: 'read:user user:email',
      authUrl: 'https://github.com/login/oauth/authorize',
    }
  }

  async handleGitHubCallback(code: string, userAgent?: string, ipAddress?: string, bindUserId?: string) {
    // Exchange code for access token
    const tokenResponse = await fetch('https://github.com/login/oauth/access_token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({
        client_id: this.configService.get('github.clientId'),
        client_secret: this.configService.get('github.clientSecret'),
        code,
      }),
    })

    const tokenData = await tokenResponse.json()

    if (tokenData.error) {
      throw new UnauthorizedException(`GitHub OAuth error: ${tokenData.error_description}`)
    }

    // Get user info
    const userResponse = await fetch('https://api.github.com/user', {
      headers: {
        Authorization: `Bearer ${tokenData.access_token}`,
        Accept: 'application/json',
      },
    })

    const githubUser = await userResponse.json()

    // Get user emails if not public
    let email = githubUser.email
    if (!email) {
      const emailsResponse = await fetch('https://api.github.com/user/emails', {
        headers: {
          Authorization: `Bearer ${tokenData.access_token}`,
          Accept: 'application/json',
        },
      })
      const emails = await emailsResponse.json()
      const primaryEmail = emails.find((e: any) => e.primary && e.verified)
      email = primaryEmail?.email
    }

    if (!email) {
      throw new UnauthorizedException('无法获取 GitHub 邮箱，请确保邮箱已验证')
    }

    return this.handleOAuthUser({
      provider: OAuthProvider.GITHUB,
      providerId: githubUser.id.toString(),
      email,
      name: githubUser.name || githubUser.login,
      avatar: githubUser.avatar_url,
      accessToken: tokenData.access_token,
      userAgent,
      ipAddress,
      bindUserId,
    })
  }

  // ==================== DingTalk OAuth ====================

  getDingTalkConfig(redirectUri?: string) {
    return this.dingtalkService.getOAuthConfig(redirectUri)
  }

  async handleDingTalkCallback(authCode: string, userAgent?: string, ipAddress?: string, bindUserId?: string) {
    const tokenData = await this.dingtalkService.getUserAccessToken(authCode)
    const dingtalkUser = await this.dingtalkService.getUserInfo(tokenData.accessToken)

    // DingTalk may not provide email, generate a placeholder
    const email = dingtalkUser.email || `${dingtalkUser.unionId}@dingtalk.placeholder`

    return this.handleOAuthUser({
      provider: OAuthProvider.DINGTALK,
      providerId: dingtalkUser.unionId,
      email,
      name: dingtalkUser.nick,
      avatar: dingtalkUser.avatarUrl,
      accessToken: tokenData.accessToken,
      refreshToken: tokenData.refreshToken,
      userAgent,
      ipAddress,
      bindUserId,
    })
  }

  // ==================== Common OAuth Handler ====================

  private async handleOAuthUser(data: {
    provider: OAuthProvider
    providerId: string
    email: string
    name: string
    avatar?: string
    accessToken?: string
    refreshToken?: string
    userAgent?: string
    ipAddress?: string
    bindUserId?: string
  }) {
    // Check if OAuth account exists
    const oauthAccount = await this.prisma.oAuthAccount.findUnique({
      where: {
        provider_providerId: {
          provider: data.provider,
          providerId: data.providerId,
        },
      },
      include: { user: true },
    })

    // Bind mode: Link OAuth account to existing logged-in user
    if (data.bindUserId) {
      // Verify the bind user exists
      const bindUser = await this.prisma.user.findUnique({
        where: { id: data.bindUserId },
      })
      if (!bindUser) {
        throw new InternalServerErrorException('用户不存在')
      }

      // Check if OAuth account is already linked to another user
      if (oauthAccount) {
        if (oauthAccount.userId === data.bindUserId) {
          // Already linked to current user
          return {
            bindSuccess: true,
            alreadyLinked: true,
            message: '该账号已绑定',
          }
        }
        throw new InternalServerErrorException(`该${data.provider === OAuthProvider.GITHUB ? 'GitHub' : '钉钉'}账号已绑定其他用户`)
      }

      // Create new OAuth account for current user
      await this.prisma.oAuthAccount.create({
        data: {
          provider: data.provider,
          providerId: data.providerId,
          userId: data.bindUserId,
          accessToken: data.accessToken,
          refreshToken: data.refreshToken,
        },
      })

      return {
        bindSuccess: true,
        alreadyLinked: false,
        message: '绑定成功',
      }
    }

    // Normal login flow
    let user

    if (oauthAccount) {
      // User exists, update OAuth tokens
      user = oauthAccount.user
      await this.prisma.oAuthAccount.update({
        where: { id: oauthAccount.id },
        data: {
          accessToken: data.accessToken,
          refreshToken: data.refreshToken,
        },
      })
    }
    else {
      // Check if user with email exists
      user = await this.prisma.user.findUnique({
        where: { email: data.email },
      })

      if (user) {
        // Link OAuth account to existing user
        await this.prisma.oAuthAccount.create({
          data: {
            provider: data.provider,
            providerId: data.providerId,
            userId: user.id,
            accessToken: data.accessToken,
            refreshToken: data.refreshToken,
          },
        })
      }
      else {
        // Create new user with OAuth account
        const defaultRole = await this.prisma.role.findUnique({
          where: { name: 'FRONTEND' },
        })

        user = await this.prisma.user.create({
          data: {
            email: data.email,
            name: data.name,
            avatar: data.avatar,
            emailVerified: true, // OAuth users are considered verified
            oauthAccounts: {
              create: {
                provider: data.provider,
                providerId: data.providerId,
                accessToken: data.accessToken,
                refreshToken: data.refreshToken,
              },
            },
            roles: defaultRole
              ? {
                  create: {
                    roleId: defaultRole.id,
                  },
                }
              : undefined,
          },
        })
      }
    }

    // Update last login
    await this.prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
    })

    // Generate tokens and return user info
    const tokens = await this.generateTokens(user.id, user.email, data.userAgent, data.ipAddress)

    // Get user with roles
    const userWithRoles = await this.prisma.user.findUnique({
      where: { id: user.id },
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

    const roles = userWithRoles!.roles.map(ur => ({
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
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      user: {
        id: userWithRoles!.id,
        email: userWithRoles!.email,
        name: userWithRoles!.name,
        avatar: userWithRoles!.avatar,
        status: userWithRoles!.status,
        emailVerified: userWithRoles!.emailVerified,
        roles,
      },
    }
  }

  private async generateTokens(
    userId: string,
    email: string,
    userAgent?: string,
    ipAddress?: string,
  ) {
    // Create refresh token record
    const refreshTokenRecord = await this.prisma.refreshToken.create({
      data: {
        token: crypto.randomBytes(32).toString('hex'),
        userId,
        userAgent,
        ipAddress,
        expiresAt: new Date(
          Date.now()
          + this.parseExpiration(
            this.configService.get('jwt.refreshExpiresIn', '7d'),
          ),
        ),
      },
    })

    // Generate access token
    const accessToken = this.jwtService.sign(
      { sub: userId, email },
      {
        secret: this.configService.get('jwt.secret'),
        expiresIn: this.configService.get('jwt.expiresIn', '15m'),
      },
    )

    // Generate refresh token
    const refreshToken = this.jwtService.sign(
      { sub: userId, tokenId: refreshTokenRecord.id },
      {
        secret: this.configService.get('jwt.refreshSecret'),
        expiresIn: this.configService.get('jwt.refreshExpiresIn', '7d'),
      },
    )

    return { accessToken, refreshToken }
  }

  private parseExpiration(expiration: string): number {
    const match = expiration.match(/^(\d+)([smhd])$/)
    if (!match) {
      return 7 * 24 * 60 * 60 * 1000 // Default 7 days
    }

    const value = Number.parseInt(match[1], 10)
    const unit = match[2]

    switch (unit) {
      case 's':
        return value * 1000
      case 'm':
        return value * 60 * 1000
      case 'h':
        return value * 60 * 60 * 1000
      case 'd':
        return value * 24 * 60 * 60 * 1000
      default:
        return 7 * 24 * 60 * 60 * 1000
    }
  }
}
