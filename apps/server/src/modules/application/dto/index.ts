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
  @IsUrl({ require_tld: false }, { message: '首页必须是有效的 URL' })
  homepage?: string

  @ApiProperty({
    example: ['https://example.com/callback'],
    description: '回调地址列表，最多 5 个',
  })
  @IsArray()
  @IsString({ each: true })
  @IsUrl({ require_tld: false }, { each: true, message: '每个回调地址必须是有效的 URL' })
  @ArrayMinSize(1, { message: '至少需要一个回调地址' })
  @ArrayMaxSize(5, { message: '最多支持 5 个回调地址' })
  redirectUris: string[]

  @ApiPropertyOptional({ example: 'https://example.com/logo.png', description: '应用 Logo URL' })
  @IsOptional()
  @IsUrl({ require_tld: false }, { message: 'Logo 必须是有效的 URL' })
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
  @IsUrl({ require_tld: false }, { message: '首页必须是有效的 URL' })
  homepage?: string

  @ApiPropertyOptional({ example: ['https://example.com/callback'] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  @IsUrl({ require_tld: false }, { each: true, message: '每个回调地址必须是有效的 URL' })
  @ArrayMinSize(1, { message: '至少需要一个回调地址' })
  @ArrayMaxSize(5, { message: '最多支持 5 个回调地址' })
  redirectUris?: string[]

  @ApiPropertyOptional({ example: 'https://example.com/logo.png' })
  @IsOptional()
  @IsUrl({ require_tld: false }, { message: 'Logo 必须是有效的 URL' })
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
