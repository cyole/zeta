import type {
  ArgumentsHost,
  ExceptionFilter,
} from '@nestjs/common'
import type { Request, Response } from 'express'
import {
  Catch,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common'

// Prisma known error codes
const PRISMA_ERROR_CODES: Record<string, { status: number, message: string }> = {
  P2002: { status: HttpStatus.CONFLICT, message: '数据已存在，请检查后重试' },
  P2025: { status: HttpStatus.NOT_FOUND, message: '记录不存在' },
  P2003: { status: HttpStatus.BAD_REQUEST, message: '关联数据不存在' },
  P2014: { status: HttpStatus.BAD_REQUEST, message: '关联数据冲突' },
  P2006: { status: HttpStatus.BAD_REQUEST, message: '数据格式错误' },
  P2011: { status: HttpStatus.BAD_REQUEST, message: '必填字段缺失' },
  P2018: { status: HttpStatus.BAD_REQUEST, message: '关联数据未找到' },
}

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name)

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp()
    const response = ctx.getResponse<Response>()
    const request = ctx.getRequest<Request>()

    let status = HttpStatus.INTERNAL_SERVER_ERROR
    let message = '服务器内部错误'
    let error = 'Internal Server Error'
    let details: string | undefined

    // Handle NestJS HttpException
    if (exception instanceof HttpException) {
      status = exception.getStatus()
      const exceptionResponse = exception.getResponse()

      if (typeof exceptionResponse === 'string') {
        message = exceptionResponse
      }
      else if (typeof exceptionResponse === 'object') {
        const responseObj = exceptionResponse as Record<string, unknown>
        error = (responseObj.error as string) || error

        // Handle validation errors
        const responseMessage = responseObj.message
        if (Array.isArray(responseMessage)) {
          message = '数据验证失败'
          details = responseMessage.join('; ')
        }
        else if (typeof responseMessage === 'string') {
          message = responseMessage
        }
      }
    }
    // Handle Prisma errors
    else if (this.isPrismaError(exception)) {
      const prismaError = exception as { code: string, meta?: { target?: string[] } }
      const errorInfo = PRISMA_ERROR_CODES[prismaError.code]

      if (errorInfo) {
        status = errorInfo.status
        message = errorInfo.message
        error = this.getErrorNameFromStatus(status)

        // Add field name to details if available
        if (prismaError.meta?.target) {
          const fields = Array.isArray(prismaError.meta.target)
            ? prismaError.meta.target.join(', ')
            : prismaError.meta.target
          details = `字段: ${fields}`
        }
      }
      else {
        status = HttpStatus.INTERNAL_SERVER_ERROR
        message = '数据库操作失败'
        error = 'Database Error'
      }

      this.logger.error(
        `Prisma error [${prismaError.code}]: ${message}`,
        exception instanceof Error ? exception.stack : undefined,
      )
    }
    // Handle generic Error
    else if (exception instanceof Error) {
      message = exception.message
      this.logger.error(
        `Unhandled exception: ${exception.message}`,
        exception.stack,
      )
    }

    const errorResponse = {
      statusCode: status,
      message,
      error,
      details,
      timestamp: new Date().toISOString(),
      path: request.url,
    }

    // Log 4xx and 5xx errors
    if (status >= 400) {
      this.logger.warn(
        `${request.method} ${request.url} -> ${status} : ${message}`,
      )
    }

    response.status(status).json(errorResponse)
  }

  private isPrismaError(exception: unknown): exception is { code: string, meta?: { target?: string[] } } {
    return (
      typeof exception === 'object'
      && exception !== null
      && 'code' in exception
      && typeof (exception as { code: unknown }).code === 'string'
      && (exception as { code: string }).code.startsWith('P')
    )
  }

  private getErrorNameFromStatus(status: number): string {
    const errorNames: Record<number, string> = {
      400: 'Bad Request',
      401: 'Unauthorized',
      403: 'Forbidden',
      404: 'Not Found',
      409: 'Conflict',
      422: 'Unprocessable Entity',
      429: 'Too Many Requests',
      500: 'Internal Server Error',
      502: 'Bad Gateway',
      503: 'Service Unavailable',
    }
    return errorNames[status] || 'Error'
  }
}
