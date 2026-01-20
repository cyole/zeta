import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class RegisterDto {
  @ApiProperty({ example: 'user@example.com' })
  @IsEmail({}, { message: '请输入有效的邮箱地址' })
  @IsNotEmpty({ message: '邮箱不能为空' })
  email: string;

  @ApiProperty({ example: 'password123' })
  @IsString()
  @MinLength(8, { message: '密码至少需要8个字符' })
  @IsNotEmpty({ message: '密码不能为空' })
  password: string;

  @ApiProperty({ example: '张三' })
  @IsString()
  @IsNotEmpty({ message: '姓名不能为空' })
  name: string;
}
