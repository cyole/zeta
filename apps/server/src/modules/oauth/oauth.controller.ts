import type { Request } from 'express'
import {
  Body,
  Controller,
  Get,
  Headers,
  Post,
  Req,
} from '@nestjs/common'
import { ApiBody, ApiOperation, ApiTags } from '@nestjs/swagger'
import { Public } from '@/common/decorators'
import { OAuthService } from './oauth.service'

class OAuthCodeDto {
  code: string
  bindUserId?: string
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
    @Body('bindUserId') bindUserId: string | undefined,
    @Headers('user-agent') userAgent: string,
    @Req() req: Request,
  ) {
    const ipAddress = req.ip || req.socket.remoteAddress
    return this.oauthService.handleGitHubCallback(code, userAgent, ipAddress, bindUserId)
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
    @Body('bindUserId') bindUserId: string | undefined,
    @Headers('user-agent') userAgent: string,
    @Req() req: Request,
  ) {
    const ipAddress = req.ip || req.socket.remoteAddress
    return this.oauthService.handleDingTalkCallback(code, userAgent, ipAddress, bindUserId)
  }
}
