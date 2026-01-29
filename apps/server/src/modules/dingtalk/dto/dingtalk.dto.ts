import { ApiProperty } from '@nestjs/swagger'
import { IsNotEmpty, IsNumber, IsOptional, IsString, IsUrl } from 'class-validator'

export class RedirectUriDto {
  @ApiProperty({ description: 'OAuth 回调地址', required: false })
  @IsString()
  @IsOptional()
  @IsUrl({ require_tld: false })
  redirectUri?: string
}

export class DeptIdDto {
  @ApiProperty({ description: '部门ID', required: false })
  @IsString()
  @IsOptional()
  deptId?: string
}

export class UserIdDto {
  @ApiProperty({ description: '用户ID', required: false })
  @IsString()
  @IsOptional()
  userId?: string
}

export class AgentIdDto {
  @ApiProperty({ description: '应用AgentId', required: false })
  @IsNumber()
  @IsOptional()
  agentId?: number
}
