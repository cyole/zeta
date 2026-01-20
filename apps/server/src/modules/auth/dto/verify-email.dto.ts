import { ApiProperty } from '@nestjs/swagger'
import { IsNotEmpty, IsString } from 'class-validator'

export class VerifyEmailDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty({ message: '验证令牌不能为空' })
  token: string
}
