import { z } from 'zod'

/**
 * Shared Zod validation schemas for forms
 */

// Error messages
export const ValidationMessages = {
  email: '请输入有效的邮箱地址',
  emailRequired: '邮箱不能为空',
  password: '密码至少需要 8 个字符',
  passwordRequired: '请输入密码',
  name: '请输入姓名',
  nameRequired: '姓名不能为空',
  passwordMismatch: '两次输入的密码不一致',
  currentPasswordRequired: '请输入当前密码',
  newPasswordRequired: '请输入新密码',
} as const

// Base validators
export const emailValidator = z.string(ValidationMessages.emailRequired).email(ValidationMessages.email)

export const passwordValidator = z
  .string(ValidationMessages.passwordRequired)
  .min(8, ValidationMessages.password)

export const nameValidator = z.string(ValidationMessages.nameRequired).min(1, ValidationMessages.name)

export function requiredStringValidator(fieldName: string) {
  return z.string().min(1, `请输入${fieldName}`)
}

// Complete schemas
export const loginSchema = z.object({
  email: emailValidator,
  password: z.string().min(1, '请输入密码'),
})

export const registerSchema = z.object({
  name: nameValidator,
  email: emailValidator,
  password: passwordValidator,
  confirmPassword: z.string(),
}).refine(data => data.password === data.confirmPassword, {
  message: ValidationMessages.passwordMismatch,
  path: ['confirmPassword'],
})

export const emailSchema = z.object({
  email: emailValidator,
})

export const passwordSchema = z.object({
  password: passwordValidator,
})

export const resetPasswordSchema = z.object({
  password: passwordValidator,
  confirmPassword: z.string(),
}).refine(data => data.password === data.confirmPassword, {
  message: ValidationMessages.passwordMismatch,
  path: ['confirmPassword'],
})

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, ValidationMessages.currentPasswordRequired),
  newPassword: passwordValidator,
  confirmPassword: z.string(),
}).refine(data => data.newPassword === data.confirmPassword, {
  message: ValidationMessages.passwordMismatch,
  path: ['confirmPassword'],
})

export const profileBasicInfoSchema = z.object({
  name: nameValidator,
  email: emailValidator,
})

// Type exports
export type LoginFormData = z.infer<typeof loginSchema>
export type RegisterFormData = z.infer<typeof registerSchema>
export type EmailFormData = z.infer<typeof emailSchema>
export type PasswordFormData = z.infer<typeof passwordSchema>
export type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>
export type ChangePasswordFormData = z.infer<typeof changePasswordSchema>
export type ProfileBasicInfoFormData = z.infer<typeof profileBasicInfoSchema>
