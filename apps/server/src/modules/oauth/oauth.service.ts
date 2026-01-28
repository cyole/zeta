import * as crypto from 'node:crypto'
import { Injectable, InternalServerErrorException, Logger, NotFoundException, UnauthorizedException } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { JwtService } from '@nestjs/jwt'
import { OAuthProvider } from '@prisma/client'
import { PrismaService } from '@/modules/prisma/prisma.service'

interface GitHubUser {
  id: number
  login: string
  email: string | null
  name: string | null
  avatar_url: string
}

interface DingTalkUser {
  nick: string
  unionId: string
  openId: string
  email?: string
  avatarUrl?: string
}

interface DingTalkTokenResponse {
  accessToken: string
  refreshToken: string
  expiresIn: number
}

interface DingTalkUserInfoResponse {
  nick: string
  unionId: string
  openId: string
  email?: string
  avatarUrl?: string
  stateCode?: string
  mobile?: string
  orgCode?: string
}

@Injectable()
export class OAuthService {
  private readonly logger = new Logger(OAuthService.name)

  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private configService: ConfigService,
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
    const clientId = this.configService.get('dingtalk.appKey')
    const redirectUri = this.configService.get('dingtalk.callbackUrl')
    return {
      clientId,
      redirectUri,
      scope: 'openid',
      authUrl: 'https://login.dingtalk.com/oauth2/auth',
    }
  }

  async handleDingTalkCallback(authCode: string, userAgent?: string, ipAddress?: string, bindUserId?: string) {
    const appKey = this.configService.get('dingtalk.appKey')
    const appSecret = this.configService.get('dingtalk.appSecret')

    // Get access token
    const tokenResponse = await fetch('https://api.dingtalk.com/v1.0/oauth2/userAccessToken', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        clientId: appKey,
        clientSecret: appSecret,
        code: authCode,
        grantType: 'authorization_code',
      }),
    })

    const tokenData = await tokenResponse.json()

    if (!tokenData.accessToken) {
      this.logger.error('DingTalk token error', tokenData)
      throw new UnauthorizedException('钉钉授权失败')
    }

    // Get user info
    const userResponse = await fetch('https://api.dingtalk.com/v1.0/contact/users/me', {
      headers: {
        'x-acs-dingtalk-access-token': tokenData.accessToken,
      },
    })

    const dingtalkUser: DingTalkUser = await userResponse.json()

    if (!dingtalkUser.unionId) {
      throw new UnauthorizedException('无法获取钉钉用户信息')
    }

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

  // ==================== DingTalk Test APIs ====================

  /**
   * 获取钉钉测试配置信息（不包含敏感信息）
   */
  getDingTalkTestConfig() {
    const appKey = this.configService.get('dingtalk.appKey')
    const callbackUrl = this.configService.get('dingtalk.callbackUrl')

    return {
      appKey: appKey ? `${appKey.slice(0, 8)}...` : null,
      callbackUrl,
      scope: 'openid',
      authUrl: 'https://login.dingtalk.com/oauth2/auth',
      tokenUrl: 'https://api.dingtalk.com/v1.0/oauth2/userAccessToken',
      userInfoUrl: 'https://api.dingtalk.com/v1.0/contact/users/me',
      isConfigured: !!(appKey && this.configService.get('dingtalk.appSecret')),
    }
  }

  /**
   * 获取当前用户钉钉绑定状态
   */
  async getDingTalkBindingStatus(userId: string) {
    const oauthAccount = await this.prisma.oAuthAccount.findFirst({
      where: {
        userId,
        provider: OAuthProvider.DINGTALK,
      },
    })

    if (!oauthAccount) {
      return {
        isBound: false,
        message: '当前账号未绑定钉钉',
      }
    }

    return {
      isBound: true,
      providerId: oauthAccount.providerId,
      hasAccessToken: !!oauthAccount.accessToken,
      hasRefreshToken: !!oauthAccount.refreshToken,
      createdAt: oauthAccount.createdAt,
      updatedAt: oauthAccount.updatedAt,
    }
  }

  /**
   * 测试获取钉钉用户信息（使用已绑定的账号）
   */
  async testDingTalkUserInfo(userId: string) {
    // 查找用户的钉钉OAuth账号
    const oauthAccounts = await this.prisma.oAuthAccount.findMany({
      where: {
        userId,
        provider: OAuthProvider.DINGTALK,
      },
    })

    if (oauthAccounts.length === 0) {
      throw new NotFoundException('当前账号未绑定钉钉，请先绑定钉钉账号')
    }

    const results = []

    for (const account of oauthAccounts) {
      if (!account.accessToken) {
        results.push({
          providerId: account.providerId,
          error: '无有效的访问令牌',
        })
        continue
      }

      try {
        const response = await fetch('https://api.dingtalk.com/v1.0/contact/users/me', {
          headers: {
            'x-acs-dingtalk-access-token': account.accessToken,
          },
        })

        if (!response.ok) {
          const errorText = await response.text()
          results.push({
            providerId: account.providerId,
            error: `API请求失败: ${response.status}`,
            details: errorText,
          })
          continue
        }

        const userData: DingTalkUserInfoResponse = await response.json()

        results.push({
          providerId: account.providerId,
          success: true,
          data: {
            nick: userData.nick,
            unionId: userData.unionId,
            openId: userData.openId,
            email: userData.email,
            avatarUrl: userData.avatarUrl,
            stateCode: userData.stateCode,
            mobile: userData.mobile,
            orgCode: userData.orgCode,
          },
        })
      }
      catch (error: any) {
        results.push({
          providerId: account.providerId,
          error: error.message || '请求失败',
        })
      }
    }

    return {
      accounts: oauthAccounts.length,
      results,
    }
  }

  /**
   * 测试刷新钉钉访问令牌
   */
  async testDingTalkRefreshToken(userId: string) {
    const appKey = this.configService.get('dingtalk.appKey')
    const appSecret = this.configService.get('dingtalk.appSecret')

    if (!appKey || !appSecret) {
      throw new UnauthorizedException('钉钉配置未设置')
    }

    // 查找用户的钉钉OAuth账号
    const oauthAccounts = await this.prisma.oAuthAccount.findMany({
      where: {
        userId,
        provider: OAuthProvider.DINGTALK,
      },
    })

    if (oauthAccounts.length === 0) {
      throw new NotFoundException('当前账号未绑定钉钉，请先绑定钉钉账号')
    }

    const results = []

    for (const account of oauthAccounts) {
      if (!account.refreshToken) {
        results.push({
          providerId: account.providerId,
          error: '无有效的刷新令牌',
        })
        continue
      }

      try {
        const response = await fetch('https://api.dingtalk.com/v1.0/oauth2/userAccessToken', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            clientId: appKey,
            clientSecret: appSecret,
            refreshToken: account.refreshToken,
            grantType: 'refresh_token',
          }),
        })

        if (!response.ok) {
          const errorText = await response.text()
          results.push({
            providerId: account.providerId,
            error: `刷新令牌失败: ${response.status}`,
            details: errorText,
          })
          continue
        }

        const tokenData: DingTalkTokenResponse = await response.json()

        // 更新数据库中的令牌
        await this.prisma.oAuthAccount.update({
          where: { id: account.id },
          data: {
            accessToken: tokenData.accessToken,
            refreshToken: tokenData.refreshToken || account.refreshToken,
          },
        })

        results.push({
          providerId: account.providerId,
          success: true,
          data: {
            accessToken: `${tokenData.accessToken.slice(0, 16)}...`,
            expiresIn: tokenData.expiresIn,
            hasRefreshToken: !!tokenData.refreshToken,
          },
        })
      }
      catch (error: any) {
        results.push({
          providerId: account.providerId,
          error: error.message || '请求失败',
        })
      }
    }

    return {
      accounts: oauthAccounts.length,
      results,
    }
  }

  /**
   * 测试获取企业信息
   * 注意: 需要使用企业内部应用的 access_token，而不是用户的 OAuth token
   */
  async testGetOrganizationInfo(userId: string) {
    const appKey = this.configService.get('dingtalk.appKey')
    const appSecret = this.configService.get('dingtalk.appSecret')

    if (!appKey || !appSecret) {
      throw new UnauthorizedException('钉钉配置未设置')
    }

    const oauthAccounts = await this.prisma.oAuthAccount.findMany({
      where: {
        userId,
        provider: OAuthProvider.DINGTALK,
      },
    })

    if (oauthAccounts.length === 0) {
      throw new NotFoundException('当前账号未绑定钉钉，请先绑定钉钉账号')
    }

    // 获取企业内部应用的 access_token
    let appAccessToken: string | null = null
    try {
      const tokenResponse = await fetch('https://api.dingtalk.com/v1.0/oauth2/accessToken', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          appKey,
          appSecret,
        }),
      })

      if (tokenResponse.ok) {
        const tokenData = await tokenResponse.json()
        appAccessToken = tokenData.accessToken
      }
      else {
        return {
          accounts: oauthAccounts.length,
          results: oauthAccounts.map(account => ({
            providerId: account.providerId,
            error: '获取企业应用 access_token 失败，请检查 appKey/appSecret 配置',
          })),
        }
      }
    }
    catch (error: any) {
      return {
        accounts: oauthAccounts.length,
        results: oauthAccounts.map(account => ({
          providerId: account.providerId,
          error: `获取应用 token 失败: ${error.message}`,
        })),
      }
    }

    const results = []

    for (const account of oauthAccounts) {
      try {
        // 使用旧版 API 获取企业信息
        const response = await fetch(`https://oapi.dingtalk.com/topapi/v2/department/get?access_token=${appAccessToken}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            dept_id: 1, // 根部门 ID
            language: 'zh_CN',
          }),
        })

        if (!response.ok) {
          const errorText = await response.text()
          results.push({
            providerId: account.providerId,
            error: `API请求失败: ${response.status}`,
            details: errorText,
          })
          continue
        }

        const orgData: any = await response.json()

        if (orgData.errcode !== 0) {
          results.push({
            providerId: account.providerId,
            error: `钉钉 API 错误: ${orgData.errmsg || '未知错误'}`,
            details: orgData,
          })
          continue
        }

        results.push({
          providerId: account.providerId,
          success: true,
          data: orgData.result,
        })
      }
      catch (error: any) {
        results.push({
          providerId: account.providerId,
          error: error.message || '请求失败',
        })
      }
    }

    return {
      accounts: oauthAccounts.length,
      results,
    }
  }

  /**
   * 测试获取部门列表
   * 使用旧版 API: POST https://oapi.dingtalk.com/topapi/v2/department/listsub
   * 获取根部门的子部门列表来获取所有顶层部门
   */
  async testGetDepartments(userId: string) {
    const appKey = this.configService.get('dingtalk.appKey')
    const appSecret = this.configService.get('dingtalk.appSecret')

    if (!appKey || !appSecret) {
      throw new UnauthorizedException('钉钉配置未设置')
    }

    const oauthAccounts = await this.prisma.oAuthAccount.findMany({
      where: {
        userId,
        provider: OAuthProvider.DINGTALK,
      },
    })

    if (oauthAccounts.length === 0) {
      throw new NotFoundException('当前账号未绑定钉钉，请先绑定钉钉账号')
    }

    // 获取企业内部应用的 access_token
    let appAccessToken: string | null = null
    try {
      const tokenResponse = await fetch('https://api.dingtalk.com/v1.0/oauth2/accessToken', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          appKey,
          appSecret,
        }),
      })

      if (tokenResponse.ok) {
        const tokenData = await tokenResponse.json()
        appAccessToken = tokenData.accessToken
      }
      else {
        return {
          accounts: oauthAccounts.length,
          results: oauthAccounts.map(account => ({
            providerId: account.providerId,
            error: '获取企业应用 access_token 失败',
          })),
        }
      }
    }
    catch (error: any) {
      return {
        accounts: oauthAccounts.length,
        results: oauthAccounts.map(account => ({
          providerId: account.providerId,
          error: `获取应用 token 失败: ${error.message}`,
        })),
      }
    }

    const results = []

    for (const account of oauthAccounts) {
      try {
        // 使用旧版 API 获取根部门下的所有子部门列表
        const response = await fetch(`https://oapi.dingtalk.com/topapi/v2/department/listsub?access_token=${appAccessToken}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            dept_id: 1, // 根部门 ID
            language: 'zh_CN',
          }),
        })

        if (!response.ok) {
          const errorText = await response.text()
          results.push({
            providerId: account.providerId,
            error: `API请求失败: ${response.status}`,
            details: errorText,
          })
          continue
        }

        const deptData: any = await response.json()

        if (deptData.errcode !== 0) {
          results.push({
            providerId: account.providerId,
            error: `钉钉 API 错误: ${deptData.errmsg || '未知错误'}`,
            details: deptData,
          })
          continue
        }

        results.push({
          providerId: account.providerId,
          success: true,
          data: {
            totalCount: deptData.result?.length || 0,
            departments: deptData.result || [],
          },
        })
      }
      catch (error: any) {
        results.push({
          providerId: account.providerId,
          error: error.message || '请求失败',
        })
      }
    }

    return {
      accounts: oauthAccounts.length,
      results,
    }
  }

  /**
   * 测试获取子部门列表
   * 使用旧版 API: POST https://oapi.dingtalk.com/topapi/v2/department/listsub
   */
  async testGetSubDepartments(userId: string, parentDeptId?: string) {
    const appKey = this.configService.get('dingtalk.appKey')
    const appSecret = this.configService.get('dingtalk.appSecret')

    if (!appKey || !appSecret) {
      throw new UnauthorizedException('钉钉配置未设置')
    }

    const oauthAccounts = await this.prisma.oAuthAccount.findMany({
      where: {
        userId,
        provider: OAuthProvider.DINGTALK,
      },
    })

    if (oauthAccounts.length === 0) {
      throw new NotFoundException('当前账号未绑定钉钉，请先绑定钉钉账号')
    }

    // 获取企业内部应用的 access_token
    let appAccessToken: string | null = null
    try {
      const tokenResponse = await fetch('https://api.dingtalk.com/v1.0/oauth2/accessToken', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          appKey,
          appSecret,
        }),
      })

      if (tokenResponse.ok) {
        const tokenData = await tokenResponse.json()
        appAccessToken = tokenData.accessToken
      }
      else {
        return {
          accounts: oauthAccounts.length,
          results: oauthAccounts.map(account => ({
            providerId: account.providerId,
            error: '获取企业应用 access_token 失败',
          })),
        }
      }
    }
    catch (error: any) {
      return {
        accounts: oauthAccounts.length,
        results: oauthAccounts.map(account => ({
          providerId: account.providerId,
          error: `获取应用 token 失败: ${error.message}`,
        })),
      }
    }

    const results = []

    for (const account of oauthAccounts) {
      try {
        // 使用旧版 API 获取子部门列表
        const response = await fetch(`https://oapi.dingtalk.com/topapi/v2/department/listsub?access_token=${appAccessToken}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            dept_id: Number(parentDeptId) || 1,
            language: 'zh_CN',
          }),
        })

        if (!response.ok) {
          const errorText = await response.text()
          results.push({
            providerId: account.providerId,
            error: `API请求失败: ${response.status}`,
            details: errorText,
          })
          continue
        }

        const subDeptData: any = await response.json()

        if (subDeptData.errcode !== 0) {
          results.push({
            providerId: account.providerId,
            error: `钉钉 API 错误: ${subDeptData.errmsg || '未知错误'}`,
            details: subDeptData,
          })
          continue
        }

        results.push({
          providerId: account.providerId,
          success: true,
          data: subDeptData.result,
        })
      }
      catch (error: any) {
        results.push({
          providerId: account.providerId,
          error: error.message || '请求失败',
        })
      }
    }

    return {
      accounts: oauthAccounts.length,
      results,
    }
  }

  /**
   * 测试获取部门用户
   * 使用旧版 API: POST https://oapi.dingtalk.com/topapi/v2/user/list
   */
  async testGetDepartmentUsers(userId: string, deptId?: string) {
    const appKey = this.configService.get('dingtalk.appKey')
    const appSecret = this.configService.get('dingtalk.appSecret')

    if (!appKey || !appSecret) {
      throw new UnauthorizedException('钉钉配置未设置')
    }

    const oauthAccounts = await this.prisma.oAuthAccount.findMany({
      where: {
        userId,
        provider: OAuthProvider.DINGTALK,
      },
    })

    if (oauthAccounts.length === 0) {
      throw new NotFoundException('当前账号未绑定钉钉，请先绑定钉钉账号')
    }

    // 获取企业内部应用的 access_token
    let appAccessToken: string | null = null
    try {
      const tokenResponse = await fetch('https://api.dingtalk.com/v1.0/oauth2/accessToken', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          appKey,
          appSecret,
        }),
      })

      if (tokenResponse.ok) {
        const tokenData = await tokenResponse.json()
        appAccessToken = tokenData.accessToken
      }
      else {
        return {
          accounts: oauthAccounts.length,
          results: oauthAccounts.map(account => ({
            providerId: account.providerId,
            error: '获取企业应用 access_token 失败',
          })),
        }
      }
    }
    catch (error: any) {
      return {
        accounts: oauthAccounts.length,
        results: oauthAccounts.map(account => ({
          providerId: account.providerId,
          error: `获取应用 token 失败: ${error.message}`,
        })),
      }
    }

    const results = []

    for (const account of oauthAccounts) {
      try {
        // 使用旧版 API 获取部门用户列表（分页）
        const response = await fetch(`https://oapi.dingtalk.com/topapi/v2/user/list?access_token=${appAccessToken}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            dept_id: Number(deptId) || 1,
            cursor: 0,
            size: 50,
            language: 'zh_CN',
          }),
        })

        if (!response.ok) {
          const errorText = await response.text()
          results.push({
            providerId: account.providerId,
            error: `API请求失败: ${response.status}`,
            details: errorText,
          })
          continue
        }

        const usersData: any = await response.json()

        if (usersData.errcode !== 0) {
          results.push({
            providerId: account.providerId,
            error: `钉钉 API 错误: ${usersData.errmsg || '未知错误'}`,
            details: usersData,
          })
          continue
        }

        results.push({
          providerId: account.providerId,
          success: true,
          data: usersData.result,
        })
      }
      catch (error: any) {
        results.push({
          providerId: account.providerId,
          error: error.message || '请求失败',
        })
      }
    }

    return {
      accounts: oauthAccounts.length,
      results,
    }
  }

  /**
   * 测试根据userId获取用户详细信息
   * 使用旧版 API: POST https://oapi.dingtalk.com/topapi/v2/user/get
   */
  async testGetUserDetails(userId: string, userIdParam?: string) {
    const appKey = this.configService.get('dingtalk.appKey')
    const appSecret = this.configService.get('dingtalk.appSecret')

    if (!appKey || !appSecret) {
      throw new UnauthorizedException('钉钉配置未设置')
    }

    const oauthAccounts = await this.prisma.oAuthAccount.findMany({
      where: {
        userId,
        provider: OAuthProvider.DINGTALK,
      },
    })

    if (oauthAccounts.length === 0) {
      throw new NotFoundException('当前账号未绑定钉钉，请先绑定钉钉账号')
    }

    // 获取企业内部应用的 access_token
    let appAccessToken: string | null = null
    try {
      const tokenResponse = await fetch('https://api.dingtalk.com/v1.0/oauth2/accessToken', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          appKey,
          appSecret,
        }),
      })

      if (tokenResponse.ok) {
        const tokenData = await tokenResponse.json()
        appAccessToken = tokenData.accessToken
      }
      else {
        return {
          accounts: oauthAccounts.length,
          results: oauthAccounts.map(account => ({
            providerId: account.providerId,
            error: '获取企业应用 access_token 失败',
          })),
        }
      }
    }
    catch (error: any) {
      return {
        accounts: oauthAccounts.length,
        results: oauthAccounts.map(account => ({
          providerId: account.providerId,
          error: `获取应用 token 失败: ${error.message}`,
        })),
      }
    }

    const results = []

    for (const account of oauthAccounts) {
      // 如果没有提供userId，使用unionId
      const targetUserId = userIdParam || account.providerId

      try {
        // 使用旧版 API 获取用户详情
        const response = await fetch(`https://oapi.dingtalk.com/topapi/v2/user/get?access_token=${appAccessToken}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            userid: targetUserId,
            language: 'zh_CN',
          }),
        })

        if (!response.ok) {
          const errorText = await response.text()
          results.push({
            providerId: account.providerId,
            error: `API请求失败: ${response.status}`,
            details: errorText,
          })
          continue
        }

        const userData: any = await response.json()

        if (userData.errcode !== 0) {
          results.push({
            providerId: account.providerId,
            error: `钉钉 API 错误: ${userData.errmsg || '未知错误'}`,
            details: userData,
          })
          continue
        }

        results.push({
          providerId: account.providerId,
          success: true,
          data: userData.result,
        })
      }
      catch (error: any) {
        results.push({
          providerId: account.providerId,
          error: error.message || '请求失败',
        })
      }
    }

    return {
      accounts: oauthAccounts.length,
      results,
    }
  }

  /**
   * 测试获取企业内部应用的可见范围
   * 注意: 需要应用的 agentId (数字)，不是 appKey
   */
  async testGetAppVisibleScope(userId: string, agentId?: number) {
    const oauthAccounts = await this.prisma.oAuthAccount.findMany({
      where: {
        userId,
        provider: OAuthProvider.DINGTALK,
      },
    })

    if (oauthAccounts.length === 0) {
      throw new NotFoundException('当前账号未绑定钉钉，请先绑定钉钉账号')
    }

    // 如果没有提供 agentId，尝试从配置中获取
    const targetAgentId = agentId || Number(this.configService.get('dingtalk.appAgentId'))
    if (!targetAgentId) {
      throw new UnauthorizedException('未配置钉钉应用的 AgentId，请在环境变量中设置 DINGTALK_APP_AGENT_ID')
    }

    const results = []

    for (const account of oauthAccounts) {
      if (!account.accessToken) {
        results.push({
          providerId: account.providerId,
          error: '无有效的访问令牌',
        })
        continue
      }

      try {
        const response = await fetch(`https://api.dingtalk.com/v1.0/microApp/apps/${targetAgentId}/scopes`, {
          headers: {
            'x-acs-dingtalk-access-token': account.accessToken,
          },
        })

        if (!response.ok) {
          const errorText = await response.text()
          results.push({
            providerId: account.providerId,
            error: `API请求失败: ${response.status}`,
            details: errorText,
          })
          continue
        }

        const scopeData: any = await response.json()

        results.push({
          providerId: account.providerId,
          success: true,
          data: scopeData,
        })
      }
      catch (error: any) {
        results.push({
          providerId: account.providerId,
          error: error.message || '请求失败',
        })
      }
    }

    return {
      accounts: oauthAccounts.length,
      results,
    }
  }
}
