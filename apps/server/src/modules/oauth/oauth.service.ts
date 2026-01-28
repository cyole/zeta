import * as crypto from 'node:crypto'
import { Injectable, InternalServerErrorException, UnauthorizedException } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { JwtService } from '@nestjs/jwt'
import { OAuthProvider } from '@prisma/client'
import { DingtalkService } from '@/modules/dingtalk'
import { PrismaService } from '@/modules/prisma/prisma.service'

interface GitHubUser {
  id: number
  login: string
  email: string | null
  name: string | null
  avatar_url: string
}

@Injectable()
export class OAuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private configService: ConfigService,
    private dingtalkService: DingtalkService,
  ) {}

  // ==================== GitHub OAuth ====================

  getGitHubConfig() {
    const clientId = this.configService.get('github.clientId')
    const redirectUri = this.configService.get('github.callbackUrl')
    return {
      clientId,
      redirectUri,
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

    const githubUser: GitHubUser = await userResponse.json()

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

  getDingTalkConfig() {
    return this.dingtalkService.getOAuthConfig()
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

    // Generate tokens
    return this.generateTokens(user.id, user.email, data.userAgent, data.ipAddress)
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
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
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

    // Get user with roles
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
      },
    })

    const roles = user!.roles.map(ur => ({
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
      accessToken,
      refreshToken,
      user: {
        id: user!.id,
        email: user!.email,
        name: user!.name,
        avatar: user!.avatar,
        status: user!.status,
        emailVerified: user!.emailVerified,
        roles,
      },
    }
  }
}
