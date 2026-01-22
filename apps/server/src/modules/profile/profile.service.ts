import type {
  ChangePasswordDto,
  UpdateNotificationPreferencesDto,
} from './dto'
import type { OAuthProvider } from '@prisma/client'
import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common'
import * as bcrypt from 'bcrypt'
import { PrismaService } from '@/modules/prisma/prisma.service'

@Injectable()
export class ProfileService {
  constructor(private prisma: PrismaService) {}

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

  async uploadAvatar(userId: string, avatarUrl: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    })

    if (!user) {
      throw new NotFoundException('用户不存在')
    }

    const updated = await this.prisma.user.update({
      where: { id: userId },
      data: { avatar: avatarUrl },
    })

    return { ...updated, password: undefined }
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
