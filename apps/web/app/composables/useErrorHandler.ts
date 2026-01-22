/**
 * API 错误响应类型
 */
export interface ApiErrorResponse {
  statusCode: number
  message: string
  error: string
  details?: string
  timestamp: string
  path: string
}

/**
 * 错误处理选项
 */
export interface ErrorHandlerOptions {
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
 * 根据 HTTP 状态码获取用户友好的错误标题
 */
function getErrorTitle(status: number, error?: string): string {
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

  // 401 特殊处理：根据具体错误信息判断
  if (status === 401) {
    if (error === 'Unauthorized') {
      return '账号或密码错误'
    }
  }

  // 409 特殊处理：根据具体错误信息判断
  if (status === 409) {
    return '该数据已存在'
  }

  return titles[status] || '请求失败'
}

/**
 * 获取用户友好的错误描述
 */
function getErrorDescription(response: ApiErrorResponse): string {
  // 优先使用 details 字段
  if (response.details) {
    return response.details
  }

  // 处理数组形式的 message（验证错误）
  if (Array.isArray(response.message)) {
    return response.message.join('\n')
  }

  // 使用 message 字段
  if (response.message && response.message !== '服务器内部错误') {
    return response.message
  }

  // 默认描述
  const defaultDescriptions: Record<number, string> = {
    400: '请检查输入的数据是否正确',
    401: '请重新登录',
    403: '您没有权限执行此操作',
    404: '请求的资源不存在',
    409: '数据已存在，请检查后重试',
    422: '请检查输入的数据格式',
    429: '请求过于频繁，请稍后重试',
    500: '服务器出现错误，请稍后重试',
    502: '网关错误，请稍后重试',
    503: '服务暂时不可用，请稍后重试',
  }

  return defaultDescriptions[response.statusCode] || '请稍后重试'
}

/**
 * 统一的错误处理 Composable
 * 提供全局异常捕获和统一的错误提示
 */
export function useErrorHandler() {
  const toast = useToast()

  /**
   * 处理 API 错误响应
   */
  const handleApiError = (
    response: Response,
    data: ApiErrorResponse,
    options: ErrorHandlerOptions = {},
  ): void => {
    const {
      showError = true,
      customTitle,
      customDescription,
      onError,
    } = options

    // 执行错误回调
    onError?.(data)

    // 显示错误提示
    if (showError) {
      const title = customTitle || getErrorTitle(data.statusCode, data.error)
      const description = customDescription || getErrorDescription(data)

      toast.add({
        title,
        description,
        color: 'error',
        icon: 'i-heroicons-exclamation-circle',
        duration: 5000,
      })
    }
  }

  /**
   * 处理网络错误或非 API 错误
   */
  const handleNetworkError = (
    error: Error,
    options: ErrorHandlerOptions = {},
  ): void => {
    const { showError = true, customTitle, customDescription } = options

    if (showError) {
      toast.add({
        title: customTitle || '网络错误',
        description: customDescription || error.message || '请检查网络连接后重试',
        color: 'error',
        icon: 'i-heroicons-exclamation-circle',
        duration: 5000,
      })
    }
  }

  /**
   * 显示登录过期提示（不调用 logout，由调用方处理）
   */
  const showUnauthorizedWarning = (): void => {
    toast.add({
      title: '登录已过期',
      description: '请重新登录',
      color: 'warning',
      icon: 'i-heroicons-exclamation-triangle',
      duration: 3000,
    })
  }

  /**
   * 显示成功提示
   */
  const showSuccess = (
    title: string,
    description?: string,
  ): void => {
    toast.add({
      title,
      description,
      color: 'success',
      icon: 'i-heroicons-check-circle',
      duration: 3000,
    })
  }

  /**
   * 显示信息提示
   */
  const showInfo = (
    title: string,
    description?: string,
  ): void => {
    toast.add({
      title,
      description,
      color: 'neutral',
      icon: 'i-heroicons-information-circle',
      duration: 3000,
    })
  }

  /**
   * 显示警告提示
   */
  const showWarning = (
    title: string,
    description?: string,
  ): void => {
    toast.add({
      title,
      description,
      color: 'warning',
      icon: 'i-heroicons-exclamation-triangle',
      duration: 4000,
    })
  }

  /**
   * 包装异步函数，自动处理错误
   */
  const withErrorHandling = async <T>(
    fn: () => Promise<T>,
    options: ErrorHandlerOptions = {},
  ): Promise<T | null> => {
    try {
      return await fn()
    }
    catch (error) {
      if (error instanceof Error) {
        handleNetworkError(error, options)
      }
      return null
    }
  }

  return {
    handleApiError,
    handleNetworkError,
    showUnauthorizedWarning,
    showSuccess,
    showInfo,
    showWarning,
    withErrorHandling,
  }
}
