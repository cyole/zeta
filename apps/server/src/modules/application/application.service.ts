import { randomBytes } from 'node:crypto'
import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common'
import { PrismaService } from '@/modules/prisma/prisma.service'
import { ApplicationQueryDto, CreateApplicationDto, UpdateApplicationDto } from './dto'

@Injectable()
export class ApplicationService {
  constructor(private prisma: PrismaService) {}

  /**
   * 生成 Client ID
   */
  generateClientId(): string {
    return randomBytes(16).toString('hex')
  }

  /**
   * 生成 Client Secret
   */
  generateClientSecret(): string {
    return randomBytes(32).toString('hex')
  }

  /**
   * 创建应用
   */
  async create(userId: string, dto: CreateApplicationDto) {
    const clientId = this.generateClientId()
    const clientSecret = this.generateClientSecret()

    const application = await this.prisma.application.create({
      data: {
        clientId,
        clientSecret,
        name: dto.name,
        description: dto.description,
        homepage: dto.homepage,
        redirectUris: dto.redirectUris,
        logo: dto.logo,
        userId,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar: true,
          },
        },
      },
    })

    return {
      ...application,
      clientSecret, // 仅返回一次
    }
  }

  /**
   * 获取我的应用列表
   */
  async findMyApplications(userId: string, query: ApplicationQueryDto) {
    const { sortBy = 'createdAt', sortOrder = 'desc', page = 1, limit = 20 } = query

    const skip = (page - 1) * limit

    const [total, applications] = await Promise.all([
      this.prisma.application.count({ where: { userId } }),
      this.prisma.application.findMany({
        where: { userId },
        skip,
        take: limit,
        orderBy: { [sortBy]: sortOrder },
        include: {
          _count: {
            select: {
              userGrants: true,
            },
          },
        },
      }),
    ])

    // 不返回 clientSecret
    const sanitizedApplications = applications.map(({ clientSecret, ...app }) => app)

    return {
      data: sanitizedApplications,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    }
  }

  /**
   * 获取应用详情
   */
  async findOne(id: string, userId: string) {
    const application = await this.prisma.application.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar: true,
          },
        },
        _count: {
          select: {
            userGrants: true,
          },
        },
      },
    })

    if (!application) {
      throw new NotFoundException('应用不存在')
    }

    if (application.userId !== userId) {
      throw new ForbiddenException('无权访问此应用')
    }

    const { clientSecret, ...result } = application
    return result
  }

  /**
   * 更新应用
   */
  async update(id: string, userId: string, dto: UpdateApplicationDto) {
    const application = await this.prisma.application.findUnique({
      where: { id },
    })

    if (!application) {
      throw new NotFoundException('应用不存在')
    }

    if (application.userId !== userId) {
      throw new ForbiddenException('无权修改此应用')
    }

    // 只更新提供的字段，避免将 undefined 设置为 null
    const updateData: Record<string, unknown> = {}
    if (dto.name !== undefined)
      updateData.name = dto.name
    if (dto.description !== undefined)
      updateData.description = dto.description
    if (dto.homepage !== undefined)
      updateData.homepage = dto.homepage
    if (dto.redirectUris !== undefined)
      updateData.redirectUris = dto.redirectUris
    if (dto.logo !== undefined)
      updateData.logo = dto.logo
    if (dto.isActive !== undefined)
      updateData.isActive = dto.isActive

    const updated = await this.prisma.application.update({
      where: { id },
      data: updateData,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar: true,
          },
        },
        _count: {
          select: {
            userGrants: true,
          },
        },
      },
    })

    const { clientSecret, ...result } = updated
    return result
  }

  /**
   * 重新生成 Client Secret
   */
  async regenerateSecret(id: string, userId: string) {
    const application = await this.prisma.application.findUnique({
      where: { id },
    })

    if (!application) {
      throw new NotFoundException('应用不存在')
    }

    if (application.userId !== userId) {
      throw new ForbiddenException('无权修改此应用')
    }

    const newSecret = this.generateClientSecret()

    await this.prisma.application.update({
      where: { id },
      data: {
        clientSecret: newSecret,
      },
    })

    return { clientSecret: newSecret }
  }

  /**
   * 删除应用
   */
  async delete(id: string, userId: string) {
    const application = await this.prisma.application.findUnique({
      where: { id },
    })

    if (!application) {
      throw new NotFoundException('应用不存在')
    }

    if (application.userId !== userId) {
      throw new ForbiddenException('无权删除此应用')
    }

    await this.prisma.application.delete({
      where: { id },
    })

    return { message: '删除成功' }
  }
}
