import { ApiProperty } from '@nestjs/swagger'
import { IsNotEmpty, IsString, MinLength } from 'class-validator'

export class ResetPasswordDto {
  @ApiProperty({ description: '重置令牌' })
  @IsString()
  @IsNotEmpty({ message: '重置令牌不能为空' })
  token: string

  @ApiProperty({ example: 'newPassword123', description: '新密码' })
  @IsString()
  @IsNotEmpty({ message: '新密码不能为空' })
  @MinLength(6, { message: '密码长度至少为6位' })
  password: string
}
