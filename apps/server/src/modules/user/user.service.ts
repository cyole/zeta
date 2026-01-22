import type {
  BatchAssignRolesDto,
  BatchDeleteUsersDto,
  CreateUserDto,
  UpdateUserDto,
  UpdateUserRolesDto,
  UserQueryDto,
} from './dto'
import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common'
import * as bcrypt from 'bcrypt'
import { PrismaService } from '@/modules/prisma/prisma.service'

@Injectable()
export class UserService {
  constructor(private prisma: PrismaService) {}

  async findAll(query: UserQueryDto) {
    const {
      search,
      status,
      roleIds,
      createdFrom,
      createdTo,
      sortBy = 'createdAt',
      sortOrder = 'desc',
      page = 1,
      limit = 20,
    } = query
    const skip = (page - 1) * limit

    const where: any = {}

    if (search) {
      where.OR = [
        { email: { contains: search, mode: 'insensitive' } },
        { name: { contains: search, mode: 'insensitive' } },
      ]
    }

    if (status) {
      where.status = status
    }

    // Filter by role IDs
    if (roleIds && roleIds.length > 0) {
      where.roles = {
        some: {
          roleId: { in: roleIds },
        },
      }
    }

    // Filter by date range
    if (createdFrom || createdTo) {
      where.createdAt = {}
      if (createdFrom) {
        where.createdAt.gte = new Date(createdFrom)
      }
      if (createdTo) {
        where.createdAt.lte = new Date(createdTo)
      }
    }

    // Build orderBy
    const orderBy: any = {}
    const allowedSortFields = ['createdAt', 'email', 'name', 'status', 'lastLoginAt']
    if (allowedSortFields.includes(sortBy)) {
      orderBy[sortBy] = sortOrder
    }
    else {
      orderBy.createdAt = 'desc'
    }

    const [items, total] = await Promise.all([
      this.prisma.user.findMany({
        where,
        skip,
        take: limit,
        orderBy,
        include: {
          roles: {
            include: {
              role: true,
            },
          },
        },
      }),
      this.prisma.user.count({ where }),
    ])

    return {
      items: items.map(user => ({
        ...user,
        password: undefined,
        roles: user.roles.map(ur => ur.role),
      })),
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    }
  }

  async findOne(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      include: {
        roles: {
          include: {
            role: {
              include: {
                permissions: {
                  include: {
                    permission: true,
                  },
                },
              },
            },
          },
        },
        oauthAccounts: {
          select: {
            provider: true,
            createdAt: true,
          },
        },
      },
    })

    if (!user) {
      throw new NotFoundException('用户不存在')
    }

    return {
      ...user,
      password: undefined,
      roles: user.roles.map(ur => ({
        ...ur.role,
        permissions: ur.role.permissions.map(rp => rp.permission),
      })),
    }
  }

  async create(dto: CreateUserDto) {
    const existingUser = await this.prisma.user.findUnique({
      where: { email: dto.email },
    })

    if (existingUser) {
      throw new ConflictException('该邮箱已被注册')
    }

    const hashedPassword = await bcrypt.hash(dto.password, 12)

    const user = await this.prisma.user.create({
      data: {
        email: dto.email,
        password: hashedPassword,
        name: dto.name,
        avatar: dto.avatar,
        emailVerified: true, // Admin created users are verified
      },
    })

    return { ...user, password: undefined }
  }

  async update(id: string, dto: UpdateUserDto) {
    const user = await this.prisma.user.findUnique({ where: { id } })

    if (!user) {
      throw new NotFoundException('用户不存在')
    }

    const updated = await this.prisma.user.update({
      where: { id },
      data: dto,
    })

    return { ...updated, password: undefined }
  }

  async updateRoles(id: string, dto: UpdateUserRolesDto) {
    const user = await this.prisma.user.findUnique({ where: { id } })

    if (!user) {
      throw new NotFoundException('用户不存在')
    }

    // Delete existing roles
    await this.prisma.userRole.deleteMany({
      where: { userId: id },
    })

    // Add new roles
    await this.prisma.userRole.createMany({
      data: dto.roleIds.map(roleId => ({
        userId: id,
        roleId,
      })),
    })

    return this.findOne(id)
  }

  async delete(id: string) {
    const user = await this.prisma.user.findUnique({ where: { id } })

    if (!user) {
      throw new NotFoundException('用户不存在')
    }

    await this.prisma.user.delete({ where: { id } })

    return { message: '用户已删除' }
  }

  async batchDelete(dto: BatchDeleteUsersDto) {
    const { userIds } = dto

    const result = await this.prisma.user.deleteMany({
      where: { id: { in: userIds } },
    })

    return {
      message: `成功删除 ${result.count} 个用户`,
      count: result.count,
    }
  }

  async batchAssignRoles(dto: BatchAssignRolesDto) {
    const { userIds, roleIds } = dto

    // Use transaction to ensure atomicity
    await this.prisma.$transaction(async (tx) => {
      // Delete existing roles for all users
      await tx.userRole.deleteMany({
        where: { userId: { in: userIds } },
      })

      // Create new role assignments
      const assignments = userIds.flatMap(userId =>
        roleIds.map(roleId => ({ userId, roleId })),
      )

      await tx.userRole.createMany({
        data: assignments,
        skipDuplicates: true,
      })
    })

    return {
      message: `成功为 ${userIds.length} 个用户分配 ${roleIds.length} 个角色`,
      userCount: userIds.length,
      roleCount: roleIds.length,
    }
  }
}
