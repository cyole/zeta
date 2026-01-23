import { ApiProperty } from '@nestjs/swagger'
import { IsOptional, IsString } from 'class-validator'

export class UploadDto {
  @ApiProperty({ description: '文件 URL' })
  url: string

  @ApiProperty({ description: '文件 Key', required: false })
  @IsString()
  @IsOptional()
  key?: string

  @ApiProperty({ description: '文件名', required: false })
  @IsString()
  @IsOptional()
  name?: string

  @ApiProperty({ description: '文件大小', required: false })
  @IsOptional()
  size?: number

  @ApiProperty({ description: '文件类型', required: false })
  @IsString()
  @IsOptional()
  type?: string
}
