interface RequestOptions extends RequestInit {
  /** 是否显示错误提示，默认为 true */
  showError?: boolean
}

function getErrorTitle(status: number): string {
  const titles: Record<number, string> = {
    400: '请求参数错误',
    401: '身份验证失败',
    403: '权限不足',
    404: '资源不存在',
    409: '数据冲突',
    422: '数据验证失败',
    429: '请求过于频繁',
    500: '服务器错误',
    502: '网关错误',
    503: '服务不可用',
  }
  return titles[status] || '请求失败'
}

export function useApi() {
  const config = useRuntimeConfig()
  const toast = useToast()
  const { accessToken, refreshTokens, logout } = useAuth()

  const request = async <T>(
    path: string,
    options: RequestOptions = {},
  ): Promise<T> => {
    const { showError = true, ...fetchOptions } = options
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(fetchOptions.headers as Record<string, string>),
    }

    if (accessToken.value) {
      headers.Authorization = `Bearer ${accessToken.value}`
    }

    let response = await fetch(`${config.public.apiBase}${path}`, {
      ...fetchOptions,
      headers,
    })

    // Try to refresh token if unauthorized
    if (response.status === 401 && accessToken.value) {
      try {
        await refreshTokens()
        headers.Authorization = `Bearer ${accessToken.value}`
        response = await fetch(`${config.public.apiBase}${path}`, {
          ...fetchOptions,
          headers,
        })
      }
      catch {
        await logout()
        if (showError) {
          toast.add({
            title: '登录已过期',
            description: '请重新登录',
            color: 'error',
          })
        }
        throw new Error('登录已过期')
      }
    }

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

  const get = <T>(path: string, options?: RequestOptions) =>
    request<T>(path, { ...options })

  const post = <T>(path: string, body?: unknown, options?: RequestOptions) =>
    request<T>(path, {
      ...options,
      method: 'POST',
      body: body ? JSON.stringify(body) : undefined,
    })

  const patch = <T>(path: string, body?: unknown, options?: RequestOptions) =>
    request<T>(path, {
      ...options,
      method: 'PATCH',
      body: body ? JSON.stringify(body) : undefined,
    })

  const del = <T>(path: string, options?: RequestOptions) =>
    request<T>(path, {
      ...options,
      method: 'DELETE',
    })

  return { request, get, post, patch, del }
}
