import type { CreateRoleDto, UpdateRoleDto, UpdateRolePermissionsDto } from './dto'
import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common'
import { PrismaService } from '@/modules/prisma/prisma.service'

@Injectable()
export class RoleService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    const roles = await this.prisma.role.findMany({
      orderBy: { createdAt: 'asc' },
      include: {
        permissions: {
          include: {
            permission: true,
          },
        },
        _count: {
          select: { users: true },
        },
      },
    })

    return roles.map(role => ({
      ...role,
      permissions: role.permissions.map(rp => rp.permission),
      userCount: role._count.users,
    }))
  }

  async findOne(id: string) {
    const role = await this.prisma.role.findUnique({
      where: { id },
      include: {
        permissions: {
          include: {
            permission: true,
          },
        },
        users: {
          include: {
            user: {
              select: {
                id: true,
                email: true,
                name: true,
                avatar: true,
              },
            },
          },
        },
      },
    })

    if (!role) {
      throw new NotFoundException('角色不存在')
    }

    return {
      ...role,
      permissions: role.permissions.map(rp => rp.permission),
      users: role.users.map(ur => ur.user),
    }
  }

  async create(dto: CreateRoleDto) {
    const existing = await this.prisma.role.findUnique({
      where: { name: dto.name },
    })

    if (existing) {
      throw new ConflictException('角色名称已存在')
    }

    // Validate displayName is not empty
    const displayName = dto.displayName?.trim()
    if (!displayName) {
      throw new BadRequestException('显示名称不能为空')
    }

    const newRole = await this.prisma.role.create({
      data: {
        name: dto.name,
        displayName,
        description: dto.description,
      },
    })

    return newRole
  }

  async update(id: string, dto: UpdateRoleDto) {
    console.log('[SERVICE UPDATE] Input dto:', dto)
    console.log('[SERVICE UPDATE] dto.displayName:', dto.displayName)
    console.log('[SERVICE UPDATE] dto.description:', dto.description)

    const role = await this.prisma.role.findUnique({ where: { id } })

    if (!role) {
      throw new NotFoundException('角色不存在')
    }

    // Note: System role check is handled at controller level by SuperAdminGuard
    // SuperAdmin can modify system roles, other users cannot access this endpoint for system roles

    const updateData: Record<string, unknown> = {}
    if (dto.displayName !== undefined)
      updateData.displayName = dto.displayName
    if (dto.description !== undefined)
      updateData.description = dto.description

    console.log('[SERVICE UPDATE] Final updateData:', updateData)

    return this.prisma.role.update({
      where: { id },
      data: updateData,
    })
  }

  async updatePermissions(id: string, dto: UpdateRolePermissionsDto) {
    const role = await this.prisma.role.findUnique({ where: { id } })

    if (!role) {
      throw new NotFoundException('角色不存在')
    }

    // Note: System role check is handled at controller level by SuperAdminGuard
    // SuperAdmin can modify system roles, other users cannot access this endpoint for system roles

    // Delete existing permissions
    await this.prisma.rolePermission.deleteMany({
      where: { roleId: id },
    })

    // Add new permissions
    await this.prisma.rolePermission.createMany({
      data: dto.permissionIds.map(permissionId => ({
        roleId: id,
        permissionId,
      })),
    })

    return this.findOne(id)
  }

  async delete(id: string) {
    const role = await this.prisma.role.findUnique({
      where: { id },
      include: { _count: { select: { users: true } } },
    })

    if (!role) {
      throw new NotFoundException('角色不存在')
    }

    // System roles cannot be deleted, even by SuperAdmin
    if (role.isSystem) {
      throw new BadRequestException('系统角色不能删除')
    }

    if (role._count.users > 0) {
      throw new BadRequestException('该角色下还有用户，不能删除')
    }

    await this.prisma.role.delete({ where: { id } })

    return { message: '角色已删除' }
  }
}
