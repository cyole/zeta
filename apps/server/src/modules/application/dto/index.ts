import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { Type } from 'class-transformer'
import {
  ArrayMaxSize,
  ArrayMinSize,
  IsArray,
  IsBoolean,
  IsOptional,
  IsString,
  IsUrl,
  MaxLength,
  MinLength,
} from 'class-validator'

export class CreateApplicationDto {
  @ApiProperty({ example: 'My App', description: '应用名称' })
  @IsString()
  @MinLength(2)
  @MaxLength(50)
  name: string

  @ApiPropertyOptional({ example: 'My application description', description: '应用描述' })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  description?: string

  @ApiPropertyOptional({ example: 'https://example.com', description: '应用首页' })
  @IsOptional()
  @IsUrl({}, { message: '首页必须是有效的 URL' })
  homepage?: string

  @ApiProperty({
    example: ['https://example.com/callback'],
    description: '回调地址列表，最多 5 个',
  })
  @IsArray()
  @IsString({ each: true })
  @IsUrl({}, { each: true, message: '每个回调地址必须是有效的 URL' })
  @ArrayMinSize(1, { message: '至少需要一个回调地址' })
  @ArrayMaxSize(5, { message: '最多支持 5 个回调地址' })
  redirectUris: string[]

  @ApiPropertyOptional({ example: 'https://example.com/logo.png', description: '应用 Logo URL' })
  @IsOptional()
  @IsUrl({}, { message: 'Logo 必须是有效的 URL' })
  logo?: string
}

export class UpdateApplicationDto {
  @ApiPropertyOptional({ example: 'My App' })
  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(50)
  name?: string

  @ApiPropertyOptional({ example: 'My application description' })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  description?: string

  @ApiPropertyOptional({ example: 'https://example.com' })
  @IsOptional()
  @IsUrl({}, { message: '首页必须是有效的 URL' })
  homepage?: string

  @ApiPropertyOptional({ example: ['https://example.com/callback'] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  @IsUrl({}, { each: true, message: '每个回调地址必须是有效的 URL' })
  @ArrayMinSize(1, { message: '至少需要一个回调地址' })
  @ArrayMaxSize(5, { message: '最多支持 5 个回调地址' })
  redirectUris?: string[]

  @ApiPropertyOptional({ example: 'https://example.com/logo.png' })
  @IsOptional()
  @IsUrl({}, { message: 'Logo 必须是有效的 URL' })
  logo?: string

  @ApiPropertyOptional({ example: true, description: '是否启用' })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean
}

export class ApplicationQueryDto {
  @ApiPropertyOptional({ default: 'createdAt', description: '排序字段' })
  @IsOptional()
  @IsString()
  sortBy?: string = 'createdAt'

  @ApiPropertyOptional({ enum: ['asc', 'desc'], default: 'desc' })
  @IsOptional()
  @IsString()
  sortOrder?: 'asc' | 'desc' = 'desc'

  @ApiPropertyOptional({ default: 1 })
  @IsOptional()
  @Type(() => Number)
  page?: number = 1

  @ApiPropertyOptional({ default: 20 })
  @IsOptional()
  @Type(() => Number)
  limit?: number = 20
}

// OAuth 授权相关 DTO
export class AuthorizeQueryDto {
  @ApiProperty({ example: 'abc123', description: '客户端 ID' })
  @IsString()
  clientId: string

  @ApiProperty({ example: 'https://example.com/callback', description: '回调地址' })
  @IsString()
  redirectUri: string

  @ApiProperty({ example: 'code', description: '响应类型，固定为 code' })
  @IsString()
  responseType: string

  @ApiPropertyOptional({ example: 'random-state', description: '状态码，防止 CSRF 攻击' })
  @IsOptional()
  @IsString()
  state?: string
}

export class AuthorizeDto {
  @ApiProperty({ example: 'abc123' })
  @IsString()
  clientId: string

  @ApiProperty({ example: 'https://example.com/callback' })
  @IsString()
  redirectUri: string

  @ApiProperty({ example: 'random-state' })
  @IsOptional()
  @IsString()
  state?: string
}

export class TokenDto {
  @ApiProperty({ example: 'AUTH_CODE', description: '授权码' })
  @IsString()
  code: string

  @ApiProperty({ example: 'abc123', description: '客户端 ID' })
  @IsString()
  clientId: string

  @ApiProperty({ example: 'client_secret_value', description: '客户端密钥' })
  @IsString()
  clientSecret: string

  @ApiProperty({ example: 'https://example.com/callback', description: '回调地址' })
  @IsString()
  redirectUri: string

  @ApiProperty({ example: 'authorization_code', description: '授权类型' })
  @IsString()
  grantType: string
}

export class RefreshTokenDto {
  @ApiProperty({ example: 'REFRESH_TOKEN', description: '刷新令牌' })
  @IsString()
  refreshToken: string

  @ApiProperty({ example: 'abc123', description: '客户端 ID' })
  @IsString()
  clientId: string

  @ApiProperty({ example: 'client_secret_value', description: '客户端密钥' })
  @IsString()
  clientSecret: string

  @ApiProperty({ example: 'refresh_token', description: '授权类型' })
  @IsString()
  grantType: string
}

export class RevokeGrantDto {
  @ApiProperty({ example: 'app-id', description: '应用 ID' })
  @IsString()
  applicationId: string
}
