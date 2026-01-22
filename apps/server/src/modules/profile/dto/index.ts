import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import {
  IsBoolean,
  IsEnum,
  IsOptional,
  IsString,
  MinLength,
} from 'class-validator'

export enum EmailDigestFrequency {
  NONE = 'NONE',
  DAILY = 'DAILY',
  WEEKLY = 'WEEKLY',
}

export class ChangePasswordDto {
  @ApiProperty({ example: 'oldPassword123' })
  @IsString()
  @MinLength(1, { message: '请输入当前密码' })
  currentPassword: string

  @ApiProperty({ example: 'newPassword123' })
  @IsString()
  @MinLength(8, { message: '新密码至少8个字符' })
  newPassword: string

  @ApiProperty({ example: 'newPassword123' })
  @IsString()
  @MinLength(8, { message: '确认密码至少8个字符' })
  confirmPassword: string
}

export class UpdateNotificationPreferencesDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  emailEnabled?: boolean

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  emailOnLogin?: boolean

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  emailOnPasswordChange?: boolean

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  emailOnSecurityAlert?: boolean

  @ApiPropertyOptional({ enum: EmailDigestFrequency })
  @IsOptional()
  @IsEnum(EmailDigestFrequency)
  emailDigest?: EmailDigestFrequency

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  pushEnabled?: boolean

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  pushOnMention?: boolean

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  pushOnSystemUpdate?: boolean
}

export class UnlinkOAuthDto {
  @ApiProperty({ enum: ['GITHUB', 'DINGTALK'] })
  @IsString()
  provider: 'GITHUB' | 'DINGTALK'
}
