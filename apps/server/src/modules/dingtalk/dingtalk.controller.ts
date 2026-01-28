import {
  Body,
  Controller,
  Get,
  Post,
  UseGuards,
} from '@nestjs/common'
import { ApiBody, ApiOperation, ApiTags } from '@nestjs/swagger'
import { CurrentUser, Public } from '@/common/decorators'
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard'
import { DingtalkService } from './dingtalk.service'
import { AgentIdDto, DeptIdDto, UserIdDto } from './dto/dingtalk.dto'

@ApiTags('DingTalk')
@Controller('dingtalk')
export class DingtalkController {
  constructor(private dingtalkService: DingtalkService) {}

  // ==================== DingTalk OAuth ====================

  @Public()
  @Get('config')
  @ApiOperation({ summary: '获取钉钉 OAuth 配置' })
  getOAuthConfig() {
    return this.dingtalkService.getOAuthConfig()
  }

  // ==================== DingTalk Test APIs ====================

  @Get('test/config')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: '获取钉钉测试配置信息' })
  getTestConfig() {
    return this.dingtalkService.getTestConfig()
  }

  @Post('test/user-info')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: '测试获取钉钉用户信息' })
  async testGetUserInfo(@CurrentUser() user: any) {
    return this.dingtalkService.testGetUserInfo(user.id)
  }

  @Post('test/refresh-token')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: '测试刷新钉钉访问令牌' })
  async testRefreshToken(@CurrentUser() user: any) {
    return this.dingtalkService.testRefreshToken(user.id)
  }

  @Get('test/binding-status')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: '获取当前用户钉钉绑定状态' })
  async getBindingStatus(@CurrentUser() user: any) {
    return this.dingtalkService.getBindingStatus(user.id)
  }

  // ==================== DingTalk Organization APIs ====================

  @Post('test/organization-info')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: '测试获取企业信息' })
  async testGetOrganizationInfo(@CurrentUser() user: any) {
    return this.dingtalkService.testGetOrganizationInfo(user.id)
  }

  @Post('test/departments')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: '测试获取部门列表' })
  async testGetDepartments(@CurrentUser() user: any) {
    return this.dingtalkService.testGetDepartments(user.id)
  }

  @Post('test/sub-departments')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: '测试获取子部门列表' })
  @ApiBody({ type: DeptIdDto, required: false })
  async testGetSubDepartments(
    @CurrentUser() user: any,
    @Body() dto?: DeptIdDto,
  ) {
    return this.dingtalkService.testGetSubDepartments(user.id, dto?.deptId)
  }

  @Post('test/department-users')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: '测试获取部门用户' })
  @ApiBody({ type: DeptIdDto, required: false })
  async testGetDepartmentUsers(
    @CurrentUser() user: any,
    @Body() dto?: DeptIdDto,
  ) {
    return this.dingtalkService.testGetDepartmentUsers(user.id, dto?.deptId)
  }

  @Post('test/user-details')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: '测试根据userId获取用户详细信息' })
  @ApiBody({ type: UserIdDto, required: false })
  async testGetUserDetails(
    @CurrentUser() user: any,
    @Body() dto?: UserIdDto,
  ) {
    return this.dingtalkService.testGetUserDetails(user.id, dto?.userId)
  }

  @Post('test/app-scope')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: '测试获取企业内部应用的可见范围' })
  @ApiBody({ type: AgentIdDto, required: false })
  async testGetAppVisibleScope(
    @CurrentUser() user: any,
    @Body() dto?: AgentIdDto,
  ) {
    return this.dingtalkService.testGetAppVisibleScope(user.id, dto?.agentId ? Number(dto.agentId) : undefined)
  }
}
