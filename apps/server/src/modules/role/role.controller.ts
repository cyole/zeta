import { CreateRoleDto, UpdateRoleDto, UpdateRolePermissionsDto } from './dto'
import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
  Req,
} from '@nestjs/common'
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger'
import { Permissions, SuperAdmin } from '@/common/decorators'
import { PermissionsGuard, SuperAdminGuard } from '@/common/guards'
import { RoleService } from './role.service'

@ApiTags('角色管理')
@ApiBearerAuth()
@Controller('roles')
@UseGuards(PermissionsGuard, SuperAdminGuard)
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
  async create(@Req() req: any, @Body() dto: CreateRoleDto) {
    console.log('[DEBUG] Raw body:', req.body)
    console.log('[DEBUG] Received DTO:', JSON.stringify(dto))
    console.log('[DEBUG] DTO keys:', Object.keys(dto))
    console.log('[DEBUG] DTO instance:', dto instanceof CreateRoleDto)
    console.log('[DEBUG] displayName:', dto.displayName, typeof dto.displayName)
    return this.roleService.create(dto)
  }

  @Patch(':id')
  @Permissions('role:update')
  @SuperAdmin()
  @ApiOperation({ summary: '更新角色 (系统角色仅超级管理员可修改)' })
  async update(@Req() req: any, @Param('id') id: string, @Body() dto: UpdateRoleDto) {
    console.log('[DEBUG UPDATE] Raw body:', req.body)
    console.log('[DEBUG UPDATE] Received DTO:', dto)
    console.log('[DEBUG UPDATE] DTO keys:', Object.keys(dto))
    return this.roleService.update(id, dto)
  }

  @Patch(':id/permissions')
  @Permissions('role:assign-permission')
  @SuperAdmin()
  @ApiOperation({ summary: '分配权限 (系统角色仅超级管理员可修改)' })
  async updatePermissions(
    @Param('id') id: string,
    @Body() dto: UpdateRolePermissionsDto,
  ) {
    return this.roleService.updatePermissions(id, dto)
  }

  @Delete(':id')
  @Permissions('role:delete')
  @SuperAdmin()
  @ApiOperation({ summary: '删除角色 (仅超级管理员可删除角色)' })
  async delete(@Param('id') id: string) {
    return this.roleService.delete(id)
  }
}
