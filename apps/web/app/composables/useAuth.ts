import type { LoginRequest, RegisterRequest, User } from '@zeta/shared'

interface _AuthState {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
}

export function useAuth() {
  const config = useRuntimeConfig()
  const router = useRouter()

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
    options: RequestInit = {},
  ): Promise<T> => {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string>),
    }

    if (accessToken.value) {
      headers.Authorization = `Bearer ${accessToken.value}`
    }

    const response = await fetch(`${config.public.apiBase}${path}`, {
      ...options,
      headers,
    })

    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.message || 'Request failed')
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
      const userData = await api<User>('/auth/me')
      user.value = userData
      return userData
    }
    catch {
      // Try to refresh token
      try {
        await refreshTokens()
        const userData = await api<User>('/auth/me')
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
