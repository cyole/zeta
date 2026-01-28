import { ConflictException, NotFoundException } from '@nestjs/common'

/**
 * Common pagination params interface
 */
export interface PaginationParams {
  page?: number
  limit?: number
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
}

/**
 * Common search params interface
 */
export interface SearchParams extends PaginationParams {
  search?: string
}

/**
 * Paginated result interface
 */
export interface PaginatedResult<T> {
  items: T[]
  meta: {
    total: number
    page: number
    limit: number
    totalPages: number
  }
}

/**
 * Build pagination parameters for Prisma queries
 */
export function buildPaginationParams(params: PaginationParams): {
  skip?: number
  take?: number
  orderBy?: Record<string, 'asc' | 'desc'>
} {
  const page = Math.max(1, params.page || 1)
  const limit = Math.min(100, Math.max(1, params.limit || 20))
  const skip = (page - 1) * limit

  const orderBy: Record<string, 'asc' | 'desc'> = {}
  if (params.sortBy) {
    orderBy[params.sortBy] = params.sortOrder || 'desc'
  }

  return {
    skip,
    take: limit,
    ...(Object.keys(orderBy).length > 0 && { orderBy }),
  }
}

/**
 * Build search filter for Prisma queries (case-insensitive)
 * Returns a Prisma-compatible where clause for search
 */
export function buildSearchFilter(
  searchField: string | string[],
  search?: string,
): Record<string, unknown> | undefined {
  if (!search) {
    return undefined
  }

  const fields = Array.isArray(searchField) ? searchField : [searchField]

  return {
    OR: fields.map(field => ({
      [field]: {
        contains: search,
        mode: 'insensitive' as const,
      },
    })),
  }
}

/**
 * Create paginated result object
 */
export function createPaginatedResult<T>(
  items: T[],
  total: number,
  page: number,
  limit: number,
): PaginatedResult<T> {
  return {
    items,
    meta: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    },
  }
}

/**
 * Handle entity not found errors
 */
export function handleNotFound(entityName: string, id?: string): never {
  throw new NotFoundException(id ? `${entityName} (ID: ${id}) 不存在` : `${entityName} 不存在`)
}

/**
 * Handle entity already exists errors
 */
export function handleAlreadyExists(entityName: string): never {
  throw new ConflictException(`${entityName} 已存在`)
}

/**
 * Remove sensitive fields from user object
 */
export function excludeSensitiveFields<T extends Record<string, unknown>>(
  obj: T,
  fields: (keyof T)[],
): Omit<T, typeof fields[number]> {
  const result = { ...obj }
  for (const field of fields) {
    delete result[field]
  }
  return result as Omit<T, typeof fields[number]>
}

/**
 * Common password hashing helper (should be used in services)
 */
export interface PasswordHasher {
  hash: (password: string) => Promise<string>
  verify: (password: string, hash: string) => Promise<boolean>
}

/**
 * Transform Prisma date fields to ISO strings
 */
export function transformDates<T extends Record<string, unknown>>(
  obj: T,
  dateFields: (keyof T)[],
): T {
  const result = { ...obj }
  for (const field of dateFields) {
    const value = result[field]
    if (value instanceof Date) {
      (result as Record<keyof T, unknown>)[field] = value.toISOString() as T[keyof T]
    }
  }
  return result
}
