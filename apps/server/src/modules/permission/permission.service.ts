import type { PrismaService } from '@/modules/prisma/prisma.service'
import { Injectable } from '@nestjs/common'

@Injectable()
export class PermissionService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return this.prisma.permission.findMany({
      orderBy: [{ module: 'asc' }, { name: 'asc' }],
    })
  }

  async findByModule() {
    const permissions = await this.prisma.permission.findMany({
      orderBy: [{ module: 'asc' }, { name: 'asc' }],
    })

    // Group by module
    const grouped = permissions.reduce(
      (acc, permission) => {
        if (!acc[permission.module]) {
          acc[permission.module] = []
        }
        acc[permission.module].push(permission)
        return acc
      },
      {} as Record<string, typeof permissions>,
    )

    return Object.entries(grouped).map(([module, permissions]) => ({
      module,
      permissions,
    }))
  }
}
