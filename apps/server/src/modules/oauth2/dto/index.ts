import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import {
  IsOptional,
  IsString,
} from 'class-validator'

/**
 * OAuth 2.0 标准使用 snake_case 参数名
 * 为了符合 OAuth 2.0 规范 (RFC 6749)，这里使用 snake_case
 */
export class AuthorizeQueryDto {
  @ApiProperty({ example: 'abc123', description: '客户端 ID' })
  @IsString()
  client_id: string

  @ApiProperty({ example: 'https://example.com/callback', description: '回调地址' })
  @IsString()
  redirect_uri: string

  @ApiProperty({ example: 'code', description: '响应类型，固定为 code' })
  @IsString()
  response_type: string

  @ApiPropertyOptional({ example: 'random-state', description: '状态码，防止 CSRF 攻击' })
  @IsOptional()
  @IsString()
  state?: string

  // 用于服务端的 camelCase 访问（兼容性）
  get clientId(): string {
    return this.client_id
  }

  get redirectUri(): string {
    return this.redirect_uri
  }

  get responseType(): string {
    return this.response_type
  }
}

export class AuthorizeDto {
  @ApiProperty({ example: 'abc123' })
  @IsString()
  clientId: string

  @ApiProperty({ example: 'https://example.com/callback' })
  @IsString()
  redirectUri: string

  @ApiPropertyOptional({ example: 'random-state' })
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

export class RefreshClientTokenDto {
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
