import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { UserStatus } from '@prisma/client'
import { Type } from 'class-transformer'
import {
  ArrayMinSize,
  IsArray,
  IsDateString,
  IsEnum,
  IsInt,
  IsOptional,
  IsPositive,
  IsString,
  Max,
} from 'class-validator'
import { EmailField, NameField, StrongPasswordField } from '@/common/dto/base.dto'

export class CreateUserDto {
  @EmailField()
  email!: string

  @StrongPasswordField()
  password!: string

  @NameField()
  name!: string

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  avatar?: string
}

export class UpdateUserDto {
  @ApiPropertyOptional({ example: '张三' })
  @IsOptional()
  @IsString()
  name?: string

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  avatar?: string

  @ApiPropertyOptional({ enum: UserStatus })
  @IsOptional()
  @IsEnum(UserStatus)
  status?: UserStatus
}

export class UpdateUserRolesDto {
  @ApiProperty({ type: [String] })
  @IsString({ each: true })
  roleIds: string[]
}

export class UserQueryDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  search?: string

  @ApiPropertyOptional({ enum: UserStatus })
  @IsOptional()
  @IsEnum(UserStatus)
  status?: UserStatus

  @ApiPropertyOptional({ type: [String], description: '按角色ID筛选' })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  roleIds?: string[]

  @ApiPropertyOptional({ description: '创建时间起始' })
  @IsOptional()
  @IsDateString()
  createdFrom?: string

  @ApiPropertyOptional({ description: '创建时间结束' })
  @IsOptional()
  @IsDateString()
  createdTo?: string

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
  @IsInt()
  @IsPositive()
  page?: number = 1

  @ApiPropertyOptional({ default: 20 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @IsPositive()
  @Max(100)
  limit?: number = 20
}

export class BatchDeleteUsersDto {
  @ApiProperty({ type: [String], description: '要删除的用户ID列表' })
  @IsArray()
  @IsString({ each: true })
  @ArrayMinSize(1)
  userIds: string[]
}

export class BatchAssignRolesDto {
  @ApiProperty({ type: [String], description: '要分配角色的用户ID列表' })
  @IsArray()
  @IsString({ each: true })
  @ArrayMinSize(1)
  userIds: string[]

  @ApiProperty({ type: [String], description: '要分配的角色ID列表' })
  @IsArray()
  @IsString({ each: true })
  roleIds: string[]
}
