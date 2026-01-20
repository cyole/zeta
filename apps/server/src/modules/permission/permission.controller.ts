import { Controller, Get, UseGuards } from '@nestjs/common'
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger'
import { Permissions } from '@/common/decorators'
import { PermissionsGuard } from '@/common/guards'
import { PermissionService } from './permission.service'

@ApiTags('权限管理')
@ApiBearerAuth()
@Controller('permissions')
@UseGuards(PermissionsGuard)
export class PermissionController {
  constructor(private permissionService: PermissionService) {}

  @Get()
  @Permissions('permission:read')
  @ApiOperation({ summary: '获取权限列表' })
  async findAll() {
    return this.permissionService.findAll()
  }

  @Get('modules')
  @Permissions('permission:read')
  @ApiOperation({ summary: '按模块分组获取权限' })
  async findByModule() {
    return this.permissionService.findByModule()
  }
}
