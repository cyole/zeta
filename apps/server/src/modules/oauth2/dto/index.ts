import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import {
  IsOptional,
  IsString,
} from 'class-validator'

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
