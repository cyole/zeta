import type { Request } from 'express'
import type { OAuthProvider } from '@prisma/client'
import type {
  ChangePasswordDto,
  UpdateNotificationPreferencesDto,
} from './dto'
import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common'
import { FileInterceptor } from '@nestjs/platform-express'
import { ApiBearerAuth, ApiConsumes, ApiOperation, ApiTags } from '@nestjs/swagger'
import { diskStorage } from 'multer'
import { extname } from 'node:path'
import { CurrentUser } from '@/common/decorators'
import { ProfileService } from './profile.service'

@ApiTags('个人资料')
@ApiBearerAuth()
@Controller('profile')
export class ProfileController {
  constructor(private profileService: ProfileService) {}

  @Patch('password')
  @ApiOperation({ summary: '修改密码' })
  async changePassword(
    @CurrentUser('id') userId: string,
    @Body() dto: ChangePasswordDto,
  ) {
    return this.profileService.changePassword(userId, dto)
  }

  @Post('avatar')
  @ApiOperation({ summary: '上传头像' })
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: './uploads/avatars',
        filename: (_req: Request, file: Express.Multer.File, cb: (error: Error | null, filename: string) => void) => {
          const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`
          const ext = extname(file.originalname)
          cb(null, `avatar-${uniqueSuffix}${ext}`)
        },
      }),
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
  async uploadAvatar(
    @CurrentUser('id') userId: string,
    @UploadedFile() file: Express.Multer.File,
  ) {
    const avatarUrl = `/uploads/avatars/${file.filename}`
    return this.profileService.uploadAvatar(userId, avatarUrl)
  }

  @Delete('oauth/:provider')
  @ApiOperation({ summary: '解绑第三方账号' })
  async unlinkOAuth(
    @CurrentUser('id') userId: string,
    @Param('provider') provider: OAuthProvider,
  ) {
    return this.profileService.unlinkOAuth(userId, provider)
  }

  @Get('notification-preferences')
  @ApiOperation({ summary: '获取通知偏好设置' })
  async getNotificationPreferences(@CurrentUser('id') userId: string) {
    return this.profileService.getNotificationPreferences(userId)
  }

  @Patch('notification-preferences')
  @ApiOperation({ summary: '更新通知偏好设置' })
  async updateNotificationPreferences(
    @CurrentUser('id') userId: string,
    @Body() dto: UpdateNotificationPreferencesDto,
  ) {
    return this.profileService.updateNotificationPreferences(userId, dto)
  }
}
