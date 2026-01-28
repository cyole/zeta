import { ApiResponse } from '@zeta/shared'

/**
 * Standard API response builder
 */
export class ResponseBuilder {
  /**
   * Create a success response
   */
  static success<T>(data: T, message?: string): ApiResponse<T> {
    return {
      success: true,
      data,
      message,
      timestamp: new Date().toISOString(),
    }
  }

  /**
   * Create a success response with no data
   */
  static ok(message?: string): ApiResponse<undefined> {
    return {
      success: true,
      data: undefined,
      message,
      timestamp: new Date().toISOString(),
    }
  }

  /**
   * Create a created response (201)
   */
  static created<T>(data: T, message = '创建成功'): ApiResponse<T> {
    return {
      success: true,
      data,
      message,
      timestamp: new Date().toISOString(),
    }
  }

  /**
   * Create an updated response
   */
  static updated<T>(data: T, message = '更新成功'): ApiResponse<T> {
    return {
      success: true,
      data,
      message,
      timestamp: new Date().toISOString(),
    }
  }

  /**
   * Create a deleted response
   */
  static deleted(message = '删除成功'): ApiResponse<undefined> {
    return {
      success: true,
      data: undefined,
      message,
      timestamp: new Date().toISOString(),
    }
  }
}

/**
 * Re-export for convenience
 */
export const createSuccessResponse = ResponseBuilder.success
export const createCreatedResponse = ResponseBuilder.created
export const createUpdatedResponse = ResponseBuilder.updated
export const createDeletedResponse = ResponseBuilder.deleted
