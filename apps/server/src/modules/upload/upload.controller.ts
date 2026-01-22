import type { Request } from 'express'
import {
  Body,
  Controller,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common'
import { FileInterceptor } from '@nestjs/platform-express'
import { ApiBearerAuth, ApiConsumes, ApiOperation, ApiTags } from '@nestjs/swagger'
import { memoryStorage } from 'multer'
import { extname } from 'node:path'
import { QiniuService } from '@/modules/qiniu/qiniu.service'
import type { UploadDto } from './dto'

@ApiTags('文件上传')
@ApiBearerAuth()
@Controller('upload')
export class UploadController {
  constructor(private qiniuService: QiniuService) {}

  @Post('image')
  @ApiOperation({ summary: '上传图片' })
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: memoryStorage(),
      fileFilter: (_req: Request, file: Express.Multer.File, cb: (error: Error | null, acceptFile: boolean) => void) => {
        if (!file.mimetype.match(/\/(jpg|jpeg|png|gif|webp)$/)) {
          cb(new Error('只支持图片文件'), false)
          return
        }
        cb(null, true)
      },
      limits: {
        fileSize: 10 * 1024 * 1024, // 10MB
      },
    }),
  )
  async uploadImage(@UploadedFile() file: Express.Multer.File): Promise<UploadDto> {
    return this.qiniuService.uploadFile(file, {
      folder: 'images',
    })
  }

  @Post('image/base64')
  @ApiOperation({ summary: '上传 Base64 图片' })
  async uploadBase64Image(
    @Body() body: { data: string; folder?: string },
  ): Promise<UploadDto> {
    return this.qiniuService.uploadBase64(body.data, {
      folder: body.folder || 'images',
    })
  }

  @Post('avatar')
  @ApiOperation({ summary: '上传头像' })
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: memoryStorage(),
      fileFilter: (_req: Request, file: Express.Multer.File, cb: (error: Error | null, acceptFile: boolean) => void) => {
        if (!file.mimetype.match(/\/(jpg|jpeg|png|gif|webp)$/)) {
          cb(new Error('只支持图片文件'), false)
          return
        }
        cb(null, true)
      },
      limits: {
        fileSize: 5 * 1024 * 1024, // 5MB
      },
    }),
  )
  async uploadAvatar(@UploadedFile() file: Express.Multer.File): Promise<UploadDto> {
    return this.qiniuService.uploadFile(file, {
      folder: 'avatars',
    })
  }
}
