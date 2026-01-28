import { applyDecorators } from '@nestjs/common'
import { ApiProperty } from '@nestjs/swagger'
import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator'

/**
 * Validation error messages (Chinese)
 */
export const ValidationMessages = {
  email: '请输入有效的邮箱地址',
  emailRequired: '邮箱不能为空',
  password: '密码至少需要8个字符',
  passwordRequired: '密码不能为空',
  nameRequired: '姓名不能为空',
  stringRequired: '该字段不能为空',
} as const

/**
 * Email field decorator - reuse email validation
 */
export function EmailField() {
  return applyDecorators(
    ApiProperty({ example: 'user@example.com' }),
    IsEmail({}, { message: ValidationMessages.email }),
    IsNotEmpty({ message: ValidationMessages.emailRequired }),
  )
}

/**
 * Password field decorator - basic password validation
 */
export function PasswordField() {
  return applyDecorators(
    ApiProperty({ example: 'password123' }),
    IsString(),
    IsNotEmpty({ message: ValidationMessages.passwordRequired }),
  )
}

/**
 * Strong password field decorator - with min length validation
 */
export function StrongPasswordField() {
  return applyDecorators(
    ApiProperty({ example: 'password123', minLength: 8 }),
    IsString(),
    MinLength(8, { message: ValidationMessages.password }),
    IsNotEmpty({ message: ValidationMessages.passwordRequired }),
  )
}

/**
 * Name field decorator
 */
export function NameField() {
  return applyDecorators(
    ApiProperty({ example: '张三' }),
    IsString(),
    IsNotEmpty({ message: ValidationMessages.nameRequired }),
  )
}

/**
 * Base class for DTOs with email field
 */
export abstract class EmailDto {
  @EmailField()
  email!: string
}

/**
 * Base class for DTOs with password field
 */
export abstract class PasswordDto {
  @PasswordField()
  password!: string
}

/**
 * Base class for DTOs with strong password field (min 8 chars)
 */
export abstract class StrongPasswordDto {
  @StrongPasswordField()
  password!: string
}

/**
 * Base class for DTOs with name field
 */
export abstract class NameDto {
  @NameField()
  name!: string
}
