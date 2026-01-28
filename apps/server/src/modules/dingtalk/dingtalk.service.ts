import { Inject, Injectable, InternalServerErrorException, Logger, NotFoundException, UnauthorizedException } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { OAuthProvider } from '@prisma/client'
import { PrismaService } from '@/modules/prisma/prisma.service'

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

export interface DingTalkOAuthConfig {
  clientId: string
  redirectUri: string
  scope: string
  authUrl: string
}

@Injectable()
export class DingtalkService {
  private readonly logger = new Logger(DingtalkService.name)

  constructor(
    @Inject(PrismaService) private prisma: PrismaService,
    private configService: ConfigService,
  ) {}

  // ==================== DingTalk OAuth ====================

  getOAuthConfig(): DingTalkOAuthConfig {
    const clientId = this.configService.get('dingtalk.appKey')
    const redirectUri = this.configService.get('dingtalk.callbackUrl')
    return {
      clientId,
      redirectUri,
      scope: 'openid',
      authUrl: 'https://login.dingtalk.com/oauth2/auth',
    }
  }

  getTestConfig() {
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
   * 获取钉钉用户访问令牌
   */
  async getUserAccessToken(authCode: string): Promise<DingTalkTokenResponse> {
    const appKey = this.configService.get('dingtalk.appKey')
    const appSecret = this.configService.get('dingtalk.appSecret')

    if (!appKey || !appSecret) {
      throw new UnauthorizedException('钉钉配置未设置')
    }

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

    return tokenData
  }

  /**
   * 获取钉钉用户信息
   */
  async getUserInfo(accessToken: string): Promise<DingTalkUserInfoResponse> {
    const userResponse = await fetch('https://api.dingtalk.com/v1.0/contact/users/me', {
      headers: {
        'x-acs-dingtalk-access-token': accessToken,
      },
    })

    const userData: DingTalkUserInfoResponse = await userResponse.json()

    if (!userData.unionId) {
      throw new UnauthorizedException('无法获取钉钉用户信息')
    }

    return userData
  }

  /**
   * 刷新用户访问令牌
   */
  async refreshUserAccessToken(refreshToken: string): Promise<DingTalkTokenResponse> {
    const appKey = this.configService.get('dingtalk.appKey')
    const appSecret = this.configService.get('dingtalk.appSecret')

    if (!appKey || !appSecret) {
      throw new UnauthorizedException('钉钉配置未设置')
    }

    const response = await fetch('https://api.dingtalk.com/v1.0/oauth2/userAccessToken', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        clientId: appKey,
        clientSecret: appSecret,
        refreshToken,
        grantType: 'refresh_token',
      }),
    })

    if (!response.ok) {
      const errorText = await response.text()
      throw new UnauthorizedException(`刷新令牌失败: ${errorText}`)
    }

    return await response.json()
  }

  // ==================== Binding Status ====================

  async getBindingStatus(userId: string) {
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

  async getUserOAuthAccounts(userId: string) {
    return this.prisma.oAuthAccount.findMany({
      where: {
        userId,
        provider: OAuthProvider.DINGTALK,
      },
    })
  }

  // ==================== DingTalk User APIs (using bound accounts) ====================

  /**
   * 测试获取钉钉用户信息（使用已绑定的账号）
   */
  async testGetUserInfo(userId: string) {
    const oauthAccounts = await this.getUserOAuthAccounts(userId)

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
        const userData = await this.getUserInfo(account.accessToken)

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
  async testRefreshToken(userId: string) {
    const oauthAccounts = await this.getUserOAuthAccounts(userId)

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
        const tokenData = await this.refreshUserAccessToken(account.refreshToken)

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

  // ==================== DingTalk Organization APIs (Enterprise Internal) ====================

  /**
   * 获取企业内部应用的 access_token
   */
  private async getAppAccessToken(): Promise<string> {
    const appKey = this.configService.get('dingtalk.appKey')
    const appSecret = this.configService.get('dingtalk.appSecret')

    if (!appKey || !appSecret) {
      throw new UnauthorizedException('钉钉配置未设置')
    }

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

    if (!tokenResponse.ok) {
      throw new InternalServerErrorException('获取企业应用 access_token 失败，请检查 appKey/appSecret 配置')
    }

    const tokenData = await tokenResponse.json()
    return tokenData.accessToken
  }

  /**
   * 测试获取企业信息
   */
  async testGetOrganizationInfo(userId: string) {
    const oauthAccounts = await this.getUserOAuthAccounts(userId)

    if (oauthAccounts.length === 0) {
      throw new NotFoundException('当前账号未绑定钉钉，请先绑定钉钉账号')
    }

    let appAccessToken: string
    try {
      appAccessToken = await this.getAppAccessToken()
    }
    catch (error: any) {
      return {
        accounts: oauthAccounts.length,
        results: oauthAccounts.map(account => ({
          providerId: account.providerId,
          error: error.message || '获取企业应用 access_token 失败',
        })),
      }
    }

    const results = []

    for (const account of oauthAccounts) {
      try {
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
   */
  async testGetDepartments(userId: string) {
    const oauthAccounts = await this.getUserOAuthAccounts(userId)

    if (oauthAccounts.length === 0) {
      throw new NotFoundException('当前账号未绑定钉钉，请先绑定钉钉账号')
    }

    let appAccessToken: string
    try {
      appAccessToken = await this.getAppAccessToken()
    }
    catch (error: any) {
      return {
        accounts: oauthAccounts.length,
        results: oauthAccounts.map(account => ({
          providerId: account.providerId,
          error: error.message || '获取企业应用 access_token 失败',
        })),
      }
    }

    const results = []

    for (const account of oauthAccounts) {
      try {
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
   */
  async testGetSubDepartments(userId: string, parentDeptId?: string) {
    const oauthAccounts = await this.getUserOAuthAccounts(userId)

    if (oauthAccounts.length === 0) {
      throw new NotFoundException('当前账号未绑定钉钉，请先绑定钉钉账号')
    }

    let appAccessToken: string
    try {
      appAccessToken = await this.getAppAccessToken()
    }
    catch (error: any) {
      return {
        accounts: oauthAccounts.length,
        results: oauthAccounts.map(account => ({
          providerId: account.providerId,
          error: error.message || '获取企业应用 access_token 失败',
        })),
      }
    }

    const results = []

    for (const account of oauthAccounts) {
      try {
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
   */
  async testGetDepartmentUsers(userId: string, deptId?: string) {
    const oauthAccounts = await this.getUserOAuthAccounts(userId)

    if (oauthAccounts.length === 0) {
      throw new NotFoundException('当前账号未绑定钉钉，请先绑定钉钉账号')
    }

    let appAccessToken: string
    try {
      appAccessToken = await this.getAppAccessToken()
    }
    catch (error: any) {
      return {
        accounts: oauthAccounts.length,
        results: oauthAccounts.map(account => ({
          providerId: account.providerId,
          error: error.message || '获取企业应用 access_token 失败',
        })),
      }
    }

    const results = []

    for (const account of oauthAccounts) {
      try {
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
   */
  async testGetUserDetails(userId: string, userIdParam?: string) {
    const oauthAccounts = await this.getUserOAuthAccounts(userId)

    if (oauthAccounts.length === 0) {
      throw new NotFoundException('当前账号未绑定钉钉，请先绑定钉钉账号')
    }

    let appAccessToken: string
    try {
      appAccessToken = await this.getAppAccessToken()
    }
    catch (error: any) {
      return {
        accounts: oauthAccounts.length,
        results: oauthAccounts.map(account => ({
          providerId: account.providerId,
          error: error.message || '获取企业应用 access_token 失败',
        })),
      }
    }

    const results = []

    for (const account of oauthAccounts) {
      // 如果没有提供userId，使用unionId
      const targetUserId = userIdParam || account.providerId

      try {
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
   */
  async testGetAppVisibleScope(userId: string, agentId?: number) {
    const oauthAccounts = await this.getUserOAuthAccounts(userId)

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
