import type { Request } from 'express'
import {
  Body,
  Controller,
  Get,
  Headers,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common'
import { ApiBody, ApiOperation, ApiTags } from '@nestjs/swagger'
import { Public, CurrentUser } from '@/common/decorators'
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard'
import { OAuthService } from './oauth.service'

class OAuthCodeDto {
  code: string
}

class DeptIdDto {
  deptId?: string
}

class UserIdDto {
  userId?: string
}

class AgentIdDto {
  agentId?: string
}

@ApiTags('OAuth')
@Controller('oauth')
export class OAuthController {
  constructor(private oauthService: OAuthService) {}

  // ==================== GitHub OAuth ====================

  @Public()
  @Get('github/config')
  @ApiOperation({ summary: '获取 GitHub OAuth 配置' })
  getGitHubConfig() {
    return this.oauthService.getGitHubConfig()
  }

  @Public()
  @Post('github/login')
  @ApiOperation({ summary: 'GitHub 授权登录' })
  @ApiBody({ type: OAuthCodeDto })
  async githubLogin(
    @Body('code') code: string,
    @Headers('user-agent') userAgent: string,
    @Req() req: Request,
  ) {
    const ipAddress = req.ip || req.socket.remoteAddress
    return this.oauthService.handleGitHubCallback(code, userAgent, ipAddress)
  }

  // ==================== DingTalk OAuth ====================

  @Public()
  @Get('dingtalk/config')
  @ApiOperation({ summary: '获取钉钉 OAuth 配置' })
  getDingTalkConfig() {
    return this.oauthService.getDingTalkConfig()
  }

  @Public()
  @Post('dingtalk/login')
  @ApiOperation({ summary: '钉钉授权登录' })
  @ApiBody({ type: OAuthCodeDto })
  async dingtalkLogin(
    @Body('code') code: string,
    @Headers('user-agent') userAgent: string,
    @Req() req: Request,
  ) {
    const ipAddress = req.ip || req.socket.remoteAddress
    return this.oauthService.handleDingTalkCallback(code, userAgent, ipAddress)
  }

  // ==================== DingTalk Test APIs ====================

  @Get('dingtalk/test/config')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: '获取钉钉测试配置信息' })
  getDingTalkTestConfig() {
    return this.oauthService.getDingTalkTestConfig()
  }

  @Post('dingtalk/test/user-info')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: '测试获取钉钉用户信息' })
  async testDingTalkUserInfo(@CurrentUser() user: any) {
    return this.oauthService.testDingTalkUserInfo(user.id)
  }

  @Post('dingtalk/test/token')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: '测试刷新钉钉访问令牌' })
  async testDingTalkRefreshToken(@CurrentUser() user: any) {
    return this.oauthService.testDingTalkRefreshToken(user.id)
  }

  @Get('dingtalk/test/binding-status')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: '获取当前用户钉钉绑定状态' })
  async getDingTalkBindingStatus(@CurrentUser() user: any) {
    return this.oauthService.getDingTalkBindingStatus(user.id)
  }

  // ==================== DingTalk Organization APIs ====================

  @Post('dingtalk/test/organization-info')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: '测试获取企业信息' })
  async testGetOrganizationInfo(@CurrentUser() user: any) {
    return this.oauthService.testGetOrganizationInfo(user.id)
  }

  @Post('dingtalk/test/departments')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: '测试获取部门列表' })
  async testGetDepartments(@CurrentUser() user: any) {
    return this.oauthService.testGetDepartments(user.id)
  }

  @Post('dingtalk/test/sub-departments')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: '测试获取子部门列表' })
  @ApiBody({ type: DeptIdDto, required: false })
  async testGetSubDepartments(
    @CurrentUser() user: any,
    @Body() dto?: DeptIdDto,
  ) {
    return this.oauthService.testGetSubDepartments(user.id, dto?.deptId)
  }

  @Post('dingtalk/test/department-users')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: '测试获取部门用户' })
  @ApiBody({ type: DeptIdDto, required: false })
  async testGetDepartmentUsers(
    @CurrentUser() user: any,
    @Body() dto?: DeptIdDto,
  ) {
    return this.oauthService.testGetDepartmentUsers(user.id, dto?.deptId)
  }

  @Post('dingtalk/test/user-details')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: '测试根据userId获取用户详细信息' })
  @ApiBody({ type: UserIdDto, required: false })
  async testGetUserDetails(
    @CurrentUser() user: any,
    @Body() dto?: UserIdDto,
  ) {
    return this.oauthService.testGetUserDetails(user.id, dto?.userId)
  }

  @Post('dingtalk/test/app-scope')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: '测试获取企业内部应用的可见范围' })
  @ApiBody({ type: AgentIdDto, required: false })
  async testGetAppVisibleScope(
    @CurrentUser() user: any,
    @Body() dto?: AgentIdDto,
  ) {
    return this.oauthService.testGetAppVisibleScope(user.id, dto?.agentId ? Number(dto.agentId) : undefined)
  }
}
