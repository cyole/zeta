import { ApiProperty } from '@nestjs/swagger'
import { IsNumber, IsOptional, IsString } from 'class-validator'

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
