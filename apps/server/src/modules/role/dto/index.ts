import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { IsOptional, IsString } from 'class-validator'

export class CreateRoleDto {
  @ApiProperty({ example: 'DEVELOPER' })
  @IsString()
  name: string

  @ApiProperty({ example: '开发人员' })
  @IsString()
  displayName: string

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  description?: string
}

export class UpdateRoleDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  displayName?: string

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  description?: string
}

export class UpdateRolePermissionsDto {
  @ApiProperty({ type: [String] })
  @IsString({ each: true })
  permissionIds: string[]
}
