import type { ApiErrorResponse } from './useErrorHandler'

interface RequestOptions extends RequestInit {
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
    typeof data === 'object' &&
    data !== null &&
    'statusCode' in data &&
    'message' in data &&
    'error' in data
  )
}

/**
 * 统一的 API 请求 Composable
 * 提供类型安全的 API 请求方法，自动处理 token 刷新和错误提示
 */
export function useApi() {
  const config = useRuntimeConfig()
  const { handleApiError, showUnauthorizedWarning } = useErrorHandler()
  const { accessToken, refreshTokens, logout } = useAuth()

  /**
   * 处理 401 未授权错误
   */
  const handleUnauthorized = async (): Promise<void> => {
    showUnauthorizedWarning()
    try {
      await logout()
    }
    catch {
      // Ignore logout errors
    }
  }

  /**
   * 核心请求方法
   */
  const request = async <T>(
    path: string,
    options: RequestOptions = {},
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

    let response = await fetch(`${config.public.apiBase}${path}`, {
      ...fetchOptions,
      headers,
    })

    // 401 错误时尝试刷新 token
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
        await handleUnauthorized()
        throw new Error('登录已过期')
      }
    }

    // 解析响应数据
    let data: unknown
    try {
      data = await response.json()
    }
    catch {
      // JSON 解析失败
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

      // 401 错误特殊处理
      if (response.status === 401) {
        await handleUnauthorized()
        throw new Error('登录已过期')
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

  /**
   * GET 请求
   */
  const get = <T>(path: string, options?: RequestOptions) =>
    request<T>(path, { ...options, method: 'GET' })

  /**
   * POST 请求
   */
  const post = <T>(path: string, body?: unknown, options?: RequestOptions) =>
    request<T>(path, {
      ...options,
      method: 'POST',
      body: body ? JSON.stringify(body) : undefined,
    })

  /**
   * PATCH 请求
   */
  const patch = <T>(path: string, body?: unknown, options?: RequestOptions) =>
    request<T>(path, {
      ...options,
      method: 'PATCH',
      body: body ? JSON.stringify(body) : undefined,
    })

  /**
   * PUT 请求
   */
  const put = <T>(path: string, body?: unknown, options?: RequestOptions) =>
    request<T>(path, {
      ...options,
      method: 'PUT',
      body: body ? JSON.stringify(body) : undefined,
    })

  /**
   * DELETE 请求
   */
  const del = <T>(path: string, options?: RequestOptions) =>
    request<T>(path, { ...options, method: 'DELETE' })

  /**
   * 文件上传请求
   */
  const upload = async <T>(
    path: string,
    formData: FormData,
    options?: Omit<RequestOptions, 'body'>,
  ): Promise<T> => {
    const {
      showError = true,
      customTitle,
      customDescription,
      onError,
      ...fetchOptions
    } = options || {}

    const headers: Record<string, string> = {}

    if (accessToken.value) {
      headers.Authorization = `Bearer ${accessToken.value}`
    }

    let response = await fetch(`${config.public.apiBase}${path}`, {
      ...fetchOptions,
      method: 'POST',
      headers,
      body: formData,
    })

    // 401 错误时尝试刷新 token
    if (response.status === 401 && accessToken.value) {
      try {
        await refreshTokens()
        headers.Authorization = `Bearer ${accessToken.value}`
        response = await fetch(`${config.public.apiBase}${path}`, {
          ...fetchOptions,
          method: 'POST',
          headers,
          body: formData,
        })
      }
      catch {
        await handleUnauthorized()
        throw new Error('登录已过期')
      }
    }

    // 解析响应数据
    let data: unknown
    try {
      data = await response.json()
    }
    catch {
      if (!response.ok && showError) {
        handleApiError(response, {
          statusCode: response.status,
          message: '上传失败',
          error: 'Upload Error',
          timestamp: new Date().toISOString(),
          path,
        }, { showError, customTitle, customDescription, onError })
      }
      throw new Error('上传失败')
    }

    // 处理错误响应
    if (!response.ok) {
      const errorResponse = isApiErrorResponse(data)
        ? data
        : {
            statusCode: response.status,
            message: '上传失败',
            error: 'Upload Error',
            timestamp: new Date().toISOString(),
            path,
          }

      // 401 错误特殊处理
      if (response.status === 401) {
        await handleUnauthorized()
        throw new Error('登录已过期')
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

  return { request, get, post, patch, put, del, upload }
}
