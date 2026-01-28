/**
 * API error response type
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
 * Type guard to check if data is an API error response
 */
export function isApiErrorResponse(data: unknown): data is ApiErrorResponse {
  return (
    typeof data === 'object'
    && data !== null
    && 'statusCode' in data
    && 'message' in data
    && 'error' in data
  )
}

/**
 * Default error response factory
 */
export function createDefaultErrorResponse(
  statusCode: number,
  message: string,
  error: string,
  path?: string,
): ApiErrorResponse {
  return {
    statusCode,
    message,
    error,
    timestamp: new Date().toISOString(),
    path: path || '',
  }
}
