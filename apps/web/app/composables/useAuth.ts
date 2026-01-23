import type { LoginRequest, RegisterRequest, User } from '@zeta/shared'
import type { ApiErrorResponse } from './useErrorHandler'

interface AuthApiOptions extends RequestInit {
  /** 是否显示错误提示，默认为 true */
  showError?: boolean
  /** 自定义错误标题 */
  customTitle?: string
  /** 自定义错误描述 */
  customDescription?: string
  /** 错误发生时的回调 */
  onError?: (error: ApiErrorResponse) => void
}

/**
 * 判断是否为错误响应
 */
function isApiErrorResponse(data: unknown): data is ApiErrorResponse {
  return (
    typeof data === 'object'
    && data !== null
    && 'statusCode' in data
    && 'message' in data
    && 'error' in data
  )
}

/**
 * 认证相关的 Composable
 * 处理登录、注册、登出等认证操作
 */
export function useAuth() {
  const config = useRuntimeConfig()
  const router = useRouter()
  const { handleApiError } = useErrorHandler()

  // State
  const user = useState<User | null>('auth:user', () => null)
  const isLoading = useState<boolean>('auth:loading', () => true)

  // Cookies
  const getAccessTokenCookie = () => useCookie('zeta_access_token', {
    maxAge: 60 * 15, // 15 minutes
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
  })

  const getRefreshTokenCookie = (rememberMe = true) => useCookie('zeta_refresh_token', {
    maxAge: rememberMe ? 60 * 60 * 24 * 7 : undefined, // 7 days if remember me, session cookie otherwise
    expires: rememberMe ? undefined : new Date(0), // Session cookie if not remember me
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
  })

  let accessToken = getAccessTokenCookie()
  let refreshToken = getRefreshTokenCookie()

  // Computed
  const isAuthenticated = computed(() => !!user.value)

  /**
   * API helper
   */
  const api = async <T>(
    path: string,
    options: AuthApiOptions = {},
  ): Promise<T> => {
    const {
      showError = true,
      customTitle,
      customDescription,
      onError,
      ...fetchOptions
    } = options

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(fetchOptions.headers as Record<string, string>),
    }

    if (accessToken.value) {
      headers.Authorization = `Bearer ${accessToken.value}`
    }

    const response = await fetch(`${config.public.apiBase}${path}`, {
      ...fetchOptions,
      headers,
    })

    // 解析响应数据
    let data: unknown
    try {
      data = await response.json()
    }
    catch {
      if (!response.ok && showError) {
        handleApiError(response, {
          statusCode: response.status,
          message: '响应解析失败',
          error: 'Parse Error',
          timestamp: new Date().toISOString(),
          path,
        }, { showError, customTitle, customDescription, onError })
      }
      throw new Error('响应解析失败')
    }

    // 处理错误响应
    if (!response.ok) {
      const errorResponse = isApiErrorResponse(data)
        ? data
        : {
            statusCode: response.status,
            message: '请求失败',
            error: 'Error',
            timestamp: new Date().toISOString(),
            path,
          }

      handleApiError(response, errorResponse, {
        showError,
        customTitle,
        customDescription,
        onError,
      })

      throw new Error(errorResponse.message)
    }

    return (data as { data: T }).data
  }

  // Actions
  const login = async (credentials: LoginRequest, rememberMe = true) => {
    const result = await api<{
      accessToken: string
      refreshToken: string
      user: User
    }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    })

    // Re-initialize cookies with correct rememberMe setting
    accessToken = getAccessTokenCookie()
    refreshToken = getRefreshTokenCookie(rememberMe)

    accessToken.value = result.accessToken
    refreshToken.value = result.refreshToken
    user.value = result.user

    return result
  }

  const register = async (data: RegisterRequest) => {
    const result = await api<{ message: string, user: User }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    })

    return result
  }

  const logout = async () => {
    try {
      await api('/auth/logout', {
        method: 'POST',
        body: JSON.stringify({ refreshToken: refreshToken.value }),
        showError: false,
      })
    }
    catch {
      // Ignore logout errors
    }
    finally {
      accessToken.value = null
      refreshToken.value = null
      user.value = null
      router.push('/auth/login')
    }
  }

  const refreshTokens = async () => {
    if (!refreshToken.value) {
      throw new Error('No refresh token')
    }

    const result = await api<{
      accessToken: string
      refreshToken: string
    }>('/auth/refresh', {
      method: 'POST',
      body: JSON.stringify({ refreshToken: refreshToken.value }),
      showError: false,
    })

    accessToken.value = result.accessToken
    refreshToken.value = result.refreshToken

    return result
  }

  const fetchUser = async () => {
    if (!accessToken.value) {
      isLoading.value = false
      return null
    }

    try {
      const userData = await api<User>('/auth/me', { showError: false })
      user.value = userData
      return userData
    }
    catch {
      // Try to refresh token
      try {
        await refreshTokens()
        const userData = await api<User>('/auth/me', { showError: false })
        user.value = userData
        return userData
      }
      catch {
        // Clear tokens if refresh fails
        accessToken.value = null
        refreshToken.value = null
        user.value = null
        return null
      }
    }
    finally {
      isLoading.value = false
    }
  }

  const setTokens = (tokens: { accessToken: string, refreshToken: string }) => {
    accessToken.value = tokens.accessToken
    refreshToken.value = tokens.refreshToken
  }

  const forgotPassword = async (email: string) => {
    const result = await api<{ message: string }>('/auth/forgot-password', {
      method: 'POST',
      body: JSON.stringify({ email }),
    })
    return result
  }

  const resetPassword = async (token: string, password: string) => {
    const result = await api<{ message: string }>('/auth/reset-password', {
      method: 'POST',
      body: JSON.stringify({ token, password }),
    })
    return result
  }

  return {
    user: readonly(user),
    isAuthenticated,
    isLoading: readonly(isLoading),
    accessToken: readonly(accessToken),
    login,
    register,
    logout,
    refreshTokens,
    fetchUser,
    setTokens,
    forgotPassword,
    resetPassword,
  }
}
