import type { ApiErrorResponse } from '@zeta/shared'

/**
 * Form submission options
 */
export interface FormSubmitOptions<T = unknown> {
  /** The async function to execute */
  fn: () => Promise<T>
  /** Success message to show on completion */
  successMessage?: string
  /** Success description to show on completion */
  successDescription?: string
  /** Whether to show error toasts, default true */
  showError?: boolean
  /** Callback on success */
  onSuccess?: (data: T) => void | Promise<void>
  /** Callback on error */
  onError?: (error: ApiErrorResponse) => void
  /** Callback on completion (success or error) */
  onFinally?: () => void
}

/**
 * Composable for handling form submissions with loading states and error handling
 *
 * @example
 * ```ts
 * const { submit, loading } = useFormSubmit()
 *
 * async function handleSubmit() {
 *   await submit({
 *     fn: () => api.post('/endpoint', formData),
 *     successMessage: '保存成功',
 *     onSuccess: (data) => {
 *       router.push('/success')
 *     }
 *   })
 * }
 * ```
 */
export function useFormSubmit() {
  const loading = ref(false)
  const { handleApiError, showSuccess } = useErrorHandler()

  /**
   * Submit a form with automatic loading state and error handling
   */
  const submit = async <T = unknown>(options: FormSubmitOptions<T>): Promise<T | null> => {
    const {
      fn,
      successMessage,
      successDescription,
      showError = true,
      onSuccess,
      onError,
      onFinally,
    } = options

    loading.value = true

    try {
      const result = await fn()

      // Show success message if provided
      if (successMessage) {
        showSuccess(successMessage, successDescription)
      }

      // Call success callback
      await onSuccess?.(result)

      return result
    }
    catch (error) {
      // Handle error responses
      if (error && typeof error === 'object') {
        const apiError = error as ApiErrorResponse
        if ('statusCode' in apiError && 'message' in apiError) {
          handleApiError(new Response(), apiError, { showError })
          onError?.(apiError)
          return null
        }
      }

      // Handle generic errors
      if (showError) {
        handleApiError(new Response(), {
          statusCode: 500,
          message: error instanceof Error ? error.message : '操作失败',
          error: 'Error',
          timestamp: new Date().toISOString(),
          path: '',
        }, { showError })
      }

      onError?.({
        statusCode: 500,
        message: error instanceof Error ? error.message : '操作失败',
        error: 'Error',
        timestamp: new Date().toISOString(),
        path: '',
      })

      return null
    }
    finally {
      loading.value = false
      onFinally?.()
    }
  }

  return {
    submit,
    loading: readonly(loading),
  }
}

/**
 * Composable for handling form submissions with optimistic updates
 * Automatically reverts on error
 */
export function useFormSubmitOptimistic() {
  const loading = ref(false)
  const { handleApiError, showSuccess } = useErrorHandler()

  /**
   * Submit with optimistic update
   */
  const submit = async <T = unknown>(
    options: FormSubmitOptions<T> & {
      /** Optimistic update to apply immediately */
      optimisticUpdate?: () => void
      /** Revert function if submission fails */
      revertUpdate?: () => void
    },
  ): Promise<T | null> => {
    const {
      fn,
      successMessage,
      successDescription,
      showError = true,
      onSuccess,
      onError,
      onFinally,
      optimisticUpdate,
      revertUpdate,
    } = options

    loading.value = true

    // Apply optimistic update
    optimisticUpdate?.()

    try {
      const result = await fn()

      if (successMessage) {
        showSuccess(successMessage, successDescription)
      }

      await onSuccess?.(result)

      return result
    }
    catch (error) {
      // Revert optimistic update
      revertUpdate?.()

      if (error && typeof error === 'object') {
        const apiError = error as ApiErrorResponse
        if ('statusCode' in apiError && 'message' in apiError) {
          handleApiError(new Response(), apiError, { showError })
          onError?.(apiError)
          return null
        }
      }

      if (showError) {
        handleApiError(new Response(), {
          statusCode: 500,
          message: error instanceof Error ? error.message : '操作失败',
          error: 'Error',
          timestamp: new Date().toISOString(),
          path: '',
        }, { showError })
      }

      onError?.({
        statusCode: 500,
        message: error instanceof Error ? error.message : '操作失败',
        error: 'Error',
        timestamp: new Date().toISOString(),
        path: '',
      })

      return null
    }
    finally {
      loading.value = false
      onFinally?.()
    }
  }

  return {
    submit,
    loading: readonly(loading),
  }
}
