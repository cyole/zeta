import type { OAuthProvider } from '@prisma/client'
import type {
  ChangePasswordDto,
  UpdateNotificationPreferencesDto,
} from './dto'
import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common'
import * as bcrypt from 'bcrypt'
import { PrismaService } from '@/modules/prisma/prisma.service'
import { QiniuService } from '@/modules/qiniu/qiniu.service'

@Injectable()
export class ProfileService {
  constructor(
    private prisma: PrismaService,
    private qiniuService: QiniuService,
  ) {}

  async changePassword(userId: string, dto: ChangePasswordDto) {
    // Validate passwords match
    if (dto.newPassword !== dto.confirmPassword) {
      throw new BadRequestException('新密码与确认密码不匹配')
    }

    // Get user with password
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    })

    if (!user) {
      throw new NotFoundException('用户不存在')
    }

    if (!user.password) {
      throw new BadRequestException('您使用第三方登录，请先设置密码')
    }

    // Verify current password
    const isValid = await bcrypt.compare(dto.currentPassword, user.password)
    if (!isValid) {
      throw new BadRequestException('当前密码错误')
    }

    // Hash and update
    const hashedPassword = await bcrypt.hash(dto.newPassword, 12)
    await this.prisma.user.update({
      where: { id: userId },
      data: { password: hashedPassword },
    })

    return { message: '密码修改成功' }
  }

  async uploadAvatar(userId: string, file: Express.Multer.File) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    })

    if (!user) {
      throw new NotFoundException('用户不存在')
    }

    // Upload to Qiniu
    const uploadResult = await this.qiniuService.uploadFile(file, {
      folder: 'avatars',
    })

    // Delete old avatar from Qiniu if exists
    if (user.avatar) {
      try {
        const oldKey = this.extractKeyFromUrl(user.avatar)
        if (oldKey) {
          await this.qiniuService.deleteFile(oldKey)
        }
      }
      catch {
        // Ignore delete errors
      }
    }

    // Update user avatar
    const updated = await this.prisma.user.update({
      where: { id: userId },
      data: { avatar: uploadResult.url },
    })

    return { ...updated, password: undefined }
  }

  private extractKeyFromUrl(url: string): string | null {
    try {
      // Extract key from URL like: https://domain.com/zeta/avatars/xxx.jpg
      const urlObj = new URL(url)
      const pathParts = urlObj.pathname.split('/')
      // Remove first empty part, find 'zeta' or 'avatars' or 'images'
      const keyIndex = pathParts.findIndex(p => p === 'zeta' || p === 'avatars' || p === 'images')
      if (keyIndex !== -1) {
        return pathParts.slice(keyIndex).join('/')
      }
      return urlObj.pathname.substring(1)
    }
    catch {
      // If it's a relative path like /uploads/avatars/xxx.jpg
      if (url.startsWith('/uploads/')) {
        return url.substring('/uploads/'.length)
      }
      return null
    }
  }

  async unlinkOAuth(userId: string, provider: OAuthProvider) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { oauthAccounts: true },
    })

    if (!user) {
      throw new NotFoundException('用户不存在')
    }

    // Check if this provider is linked
    const account = user.oauthAccounts.find(a => a.provider === provider)
    if (!account) {
      throw new BadRequestException('该账号未关联')
    }

    // Ensure user has password or another OAuth method
    if (!user.password && user.oauthAccounts.length <= 1) {
      throw new BadRequestException('无法解绑唯一的登录方式，请先设置密码')
    }

    await this.prisma.oAuthAccount.delete({
      where: { id: account.id },
    })

    return { message: '解绑成功' }
  }

  async getNotificationPreferences(userId: string) {
    let prefs = await this.prisma.userNotificationPreferences.findUnique({
      where: { userId },
    })

    if (!prefs) {
      // Create default preferences
      prefs = await this.prisma.userNotificationPreferences.create({
        data: { userId },
      })
    }

    return prefs
  }

  async updateNotificationPreferences(
    userId: string,
    dto: UpdateNotificationPreferencesDto,
  ) {
    return this.prisma.userNotificationPreferences.upsert({
      where: { userId },
      update: dto,
      create: { userId, ...dto },
    })
  }
}
