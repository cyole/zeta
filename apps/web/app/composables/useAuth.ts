import type { LoginRequest, RegisterRequest, User } from '@zeta/shared'

interface AuthApiOptions extends RequestInit {
  showError?: boolean
}

function getErrorTitle(status: number): string {
  const titles: Record<number, string> = {
    400: '请求参数错误',
    401: '账号或密码错误',
    403: '权限不足',
    404: '资源不存在',
    409: '该邮箱已被注册',
    422: '数据验证失败',
    429: '请求过于频繁，请稍后重试',
    500: '服务器错误',
  }
  return titles[status] || '请求失败'
}

export function useAuth() {
  const config = useRuntimeConfig()
  const router = useRouter()
  const toast = useToast()

  // State
  const user = useState<User | null>('auth:user', () => null)
  const isLoading = useState<boolean>('auth:loading', () => true)

  // Cookies
  const accessToken = useCookie('zeta_access_token', {
    maxAge: 60 * 15, // 15 minutes
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
  })

  const refreshToken = useCookie('zeta_refresh_token', {
    maxAge: 60 * 60 * 24 * 7, // 7 days
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
  })

  // Computed
  const isAuthenticated = computed(() => !!user.value)

  // API helper
  const api = async <T>(
    path: string,
    options: AuthApiOptions = {},
  ): Promise<T> => {
    const { showError = true, ...fetchOptions } = options
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

    const data = await response.json()

    if (!response.ok) {
      const message = Array.isArray(data.message)
        ? data.message.join('\n')
        : data.message || '请求失败'

      if (showError) {
        toast.add({
          title: getErrorTitle(response.status),
          description: message,
          color: 'error',
        })
      }

      throw new Error(message)
    }

    return data.data
  }

  // Actions
  const login = async (credentials: LoginRequest) => {
    const result = await api<{
      accessToken: string
      refreshToken: string
      user: User
    }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    })

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
  }
}
