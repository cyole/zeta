/**
 * OAuth 应用管理 API
 */
export interface Application {
  id: string
  clientId: string
  name: string
  description?: string
  homepage?: string
  redirectUris: string[]
  logo?: string
  scopes: string[]
  isActive: boolean
  userId: string
  createdAt: string
  updatedAt: string
  _count?: {
    userGrants: number
  }
}

export interface CreateApplicationDto {
  name: string
  description?: string
  homepage?: string
  redirectUris: string[]
  logo?: string
}

export interface UpdateApplicationDto {
  name?: string
  description?: string
  homepage?: string
  redirectUris: string[]
  logo?: string
  isActive?: boolean
}

export interface ApplicationListResponse {
  data: Application[]
  meta: {
    total: number
    page: number
    limit: number
    totalPages: number
  }
}

export interface UserGrant {
  id: string
  application: {
    id: string
    name: string
    logo?: string
    homepage?: string
  }
  authorizedAt: string
}

export interface TokenResponse {
  accessToken: string
  refreshToken: string
  expiresIn: number
  tokenType: string
}

export function useApplication() {
  const { get, post, patch, del } = useApi()

  /**
   * 获取我的应用列表
   */
  const getMyApplications = async (params: { page?: number, limit?: number, sortBy?: string, sortOrder?: 'asc' | 'desc' } = {}) => {
    const queryParams = new URLSearchParams()
    if (params.page)
      queryParams.append('page', params.page.toString())
    if (params.limit)
      queryParams.append('limit', params.limit.toString())
    if (params.sortBy)
      queryParams.append('sortBy', params.sortBy)
    if (params.sortOrder)
      queryParams.append('sortOrder', params.sortOrder)

    const query = queryParams.toString()
    return get<ApplicationListResponse>(`/applications${query ? `?${query}` : ''}`)
  }

  /**
   * 获取应用详情
   */
  const getApplication = async (id: string) => {
    return get<Application>(`/applications/${id}`)
  }

  /**
   * 创建应用
   */
  const createApplication = async (dto: CreateApplicationDto) => {
    return post<Application>('/applications', dto)
  }

  /**
   * 更新应用
   */
  const updateApplication = async (id: string, dto: UpdateApplicationDto) => {
    return patch<Application>(`/applications/${id}`, dto)
  }

  /**
   * 重新生成 Client Secret
   */
  const regenerateSecret = async (id: string) => {
    return post<{ clientSecret: string }>(`/applications/${id}/regenerate-secret`, {})
  }

  /**
   * 删除应用
   */
  const deleteApplication = async (id: string) => {
    return del<{ message: string }>(`/applications/${id}`)
  }

  /**
   * 获取授权页面信息
   */
  const getAuthorizeInfo = async (params: { clientId: string, redirectUri: string, responseType: string, state?: string }) => {
    const queryParams = new URLSearchParams()
    queryParams.append('clientId', params.clientId)
    queryParams.append('redirectUri', params.redirectUri)
    queryParams.append('responseType', params.responseType)
    if (params.state)
      queryParams.append('state', params.state)

    return get<{
      application: {
        id: string
        name: string
        logo?: string
        homepage?: string
      }
      redirectUri: string
      state?: string
      clientId: string
    }>(`/oauth/authorize?${queryParams.toString()}`)
  }

  /**
   * 确认授权
   */
  const authorize = async (dto: { clientId: string, redirectUri: string, state?: string }) => {
    return post<{ redirectUrl: string, application: { name: string, logo?: string } }>('/oauth/authorize', dto)
  }

  /**
   * 授权码换 Token
   */
  const exchangeToken = async (dto: { code: string, clientId: string, clientSecret: string, redirectUri: string, grantType: string }) => {
    const config = useRuntimeConfig()
    const response = await fetch(`${config.public.apiBase}/oauth/token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(dto),
    })
    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.message || 'Token exchange failed')
    }
    return response.json() as Promise<TokenResponse>
  }

  /**
   * 刷新 Token
   */
  const refreshToken = async (dto: { refreshToken: string, clientId: string, clientSecret: string, grantType: string }) => {
    const config = useRuntimeConfig()
    const response = await fetch(`${config.public.apiBase}/oauth/token/refresh`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(dto),
    })
    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.message || 'Token refresh failed')
    }
    return response.json() as Promise<TokenResponse>
  }

  /**
   * 获取用户的授权列表
   */
  const getUserGrants = async () => {
    return get<UserGrant[]>('/user/grants')
  }

  /**
   * 撤销授权
   */
  const revokeGrant = async (applicationId: string) => {
    return del<{ message: string }>(`/user/grants?applicationId=${applicationId}`)
  }

  return {
    getMyApplications,
    getApplication,
    createApplication,
    updateApplication,
    regenerateSecret,
    deleteApplication,
    getAuthorizeInfo,
    authorize,
    exchangeToken,
    refreshToken,
    getUserGrants,
    revokeGrant,
  }
}
