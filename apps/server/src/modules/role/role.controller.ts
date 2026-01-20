import type { CreateRoleDto, UpdateRoleDto, UpdateRolePermissionsDto } from './dto'
import type { RoleService } from './role.service'
import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common'
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger'
import { Permissions } from '@/common/decorators'
import { PermissionsGuard } from '@/common/guards'

@ApiTags('角色管理')
@ApiBearerAuth()
@Controller('roles')
@UseGuards(PermissionsGuard)
export class RoleController {
  constructor(private roleService: RoleService) {}

  @Get()
  @Permissions('role:read')
  @ApiOperation({ summary: '获取角色列表' })
  async findAll() {
    return this.roleService.findAll()
  }

  @Get(':id')
  @Permissions('role:read')
  @ApiOperation({ summary: '获取角色详情' })
  async findOne(@Param('id') id: string) {
    return this.roleService.findOne(id)
  }

  @Post()
  @Permissions('role:create')
  @ApiOperation({ summary: '创建角色' })
  async create(@Body() dto: CreateRoleDto) {
    return this.roleService.create(dto)
  }

  @Patch(':id')
  @Permissions('role:update')
  @ApiOperation({ summary: '更新角色' })
  async update(@Param('id') id: string, @Body() dto: UpdateRoleDto) {
    return this.roleService.update(id, dto)
  }

  @Patch(':id/permissions')
  @Permissions('role:assign-permission')
  @ApiOperation({ summary: '分配权限' })
  async updatePermissions(
    @Param('id') id: string,
    @Body() dto: UpdateRolePermissionsDto,
  ) {
    return this.roleService.updatePermissions(id, dto)
  }

  @Delete(':id')
  @Permissions('role:delete')
  @ApiOperation({ summary: '删除角色' })
  async delete(@Param('id') id: string) {
    return this.roleService.delete(id)
  }
}
