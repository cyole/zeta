import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common'
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger'
import { Permissions } from '@/common/decorators'
import { PermissionsGuard } from '@/common/guards'
import {
  BatchAssignRolesDto,
  BatchDeleteUsersDto,
  CreateUserDto,
  UpdateUserDto,
  UpdateUserRolesDto,
  UserQueryDto,
} from './dto'
import { UserService } from './user.service'

@ApiTags('用户管理')
@ApiBearerAuth()
@Controller('users')
@UseGuards(PermissionsGuard)
export class UserController {
  constructor(private userService: UserService) {}

  @Get()
  @Permissions('user:read')
  @ApiOperation({ summary: '获取用户列表' })
  async findAll(@Query() query: UserQueryDto) {
    return this.userService.findAll(query)
  }

  @Get(':id')
  @Permissions('user:read')
  @ApiOperation({ summary: '获取用户详情' })
  async findOne(@Param('id') id: string) {
    return this.userService.findOne(id)
  }

  @Post()
  @Permissions('user:create')
  @ApiOperation({ summary: '创建用户' })
  async create(@Body() dto: CreateUserDto) {
    return this.userService.create(dto)
  }

  @Patch(':id')
  @Permissions('user:update')
  @ApiOperation({ summary: '更新用户' })
  async update(@Param('id') id: string, @Body() dto: UpdateUserDto) {
    return this.userService.update(id, dto)
  }

  @Patch(':id/roles')
  @Permissions('user:assign-role')
  @ApiOperation({ summary: '分配角色' })
  async updateRoles(@Param('id') id: string, @Body() dto: UpdateUserRolesDto) {
    return this.userService.updateRoles(id, dto)
  }

  @Delete(':id')
  @Permissions('user:delete')
  @ApiOperation({ summary: '删除用户' })
  async delete(@Param('id') id: string) {
    return this.userService.delete(id)
  }

  @Delete('batch')
  @Permissions('user:delete')
  @ApiOperation({ summary: '批量删除用户' })
  async batchDelete(@Body() dto: BatchDeleteUsersDto) {
    return this.userService.batchDelete(dto)
  }

  @Patch('batch/roles')
  @Permissions('user:assign-role')
  @ApiOperation({ summary: '批量分配角色' })
  async batchAssignRoles(@Body() dto: BatchAssignRolesDto) {
    return this.userService.batchAssignRoles(dto)
  }
}
