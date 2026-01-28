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
import { AuthGuard } from '@nestjs/passport'
import { ApiBearerAuth, ApiBody, ApiOperation, ApiTags } from '@nestjs/swagger'
import { CurrentUser, Public } from '@/common/decorators'
import { AuthService } from './auth.service'
import { ForgotPasswordDto, LoginDto, RefreshTokenDto, RegisterDto, ResendVerificationDto, ResetPasswordDto, VerifyEmailDto } from './dto'

@ApiTags('认证')
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Public()
  @Post('register')
  @ApiOperation({ summary: '用户注册' })
  async register(@Body() dto: RegisterDto) {
    return this.authService.register(dto)
  }

  @Public()
  @Post('login')
  @ApiOperation({ summary: '用户登录' })
  async login(
    @Body() dto: LoginDto,
    @Headers('user-agent') userAgent: string,
    @Req() req: Request,
  ) {
    const ipAddress = req.ip || req.socket.remoteAddress
    return this.authService.login(dto, userAgent, ipAddress)
  }

  @Public()
  @UseGuards(AuthGuard('jwt-refresh'))
  @Post('refresh')
  @ApiOperation({ summary: '刷新令牌' })
  async refresh(
    @Body() dto: RefreshTokenDto,
    @CurrentUser() user: { id: string, tokenId: string },
    @Headers('user-agent') userAgent: string,
    @Req() req: Request,
  ) {
    const ipAddress = req.ip || req.socket.remoteAddress
    return this.authService.refreshTokens(
      user.id,
      user.tokenId,
      userAgent,
      ipAddress,
    )
  }

  @Post('logout')
  @ApiBearerAuth()
  @ApiOperation({ summary: '用户登出' })
  async logout(
    @CurrentUser('id') userId: string,
    @Headers('authorization') authorization: string,
    @Body('refreshToken') refreshToken?: string,
  ) {
    const accessToken = authorization?.replace('Bearer ', '')
    return this.authService.logout(userId, accessToken, refreshToken)
  }

  @Get('me')
  @ApiBearerAuth()
  @ApiOperation({ summary: '获取当前用户信息' })
  async getProfile(@CurrentUser('id') userId: string) {
    return this.authService.getProfile(userId)
  }

  @Public()
  @Post('verify-email')
  @ApiOperation({ summary: '验证邮箱' })
  async verifyEmail(@Body() dto: VerifyEmailDto) {
    return this.authService.verifyEmail(dto.token)
  }

  @Post('resend-verification')
  @ApiBearerAuth()
  @ApiOperation({ summary: '重发验证邮件' })
  async resendVerification(@CurrentUser('id') userId: string) {
    return this.authService.resendVerificationEmail(userId)
  }

  @Public()
  @Post('resend-verification-by-email')
  @ApiOperation({ summary: '通过邮箱重发验证邮件' })
  async resendVerificationByEmail(@Body() dto: ResendVerificationDto) {
    return this.authService.resendVerificationEmailByEmail(dto)
  }

  @Public()
  @Post('forgot-password')
  @ApiOperation({ summary: '忘记密码' })
  async forgotPassword(@Body() dto: ForgotPasswordDto) {
    return this.authService.forgotPassword(dto)
  }

  @Public()
  @Post('reset-password')
  @ApiOperation({ summary: '重置密码' })
  async resetPassword(@Body() dto: ResetPasswordDto) {
    return this.authService.resetPassword(dto)
  }

  // ==================== GitHub OAuth ====================

  @Public()
  @Get('github/config')
  @ApiOperation({ summary: '获取 GitHub OAuth 配置' })
  getGitHubConfig() {
    return this.authService.getGitHubConfig()
  }

  @Public()
  @Post('github/login')
  @ApiOperation({ summary: 'GitHub 授权登录' })
  @ApiBody({ schema: { properties: { code: { type: 'string' }, bindUserId: { type: 'string' } } } })
  async githubLogin(
    @Body('code') code: string,
    @Body('bindUserId') bindUserId: string | undefined,
    @Headers('user-agent') userAgent: string,
    @Req() req: Request,
  ) {
    const ipAddress = req.ip || req.socket.remoteAddress
    return this.authService.handleGitHubCallback(code, userAgent, ipAddress, bindUserId)
  }

  // ==================== DingTalk OAuth ====================

  @Public()
  @Get('dingtalk/config')
  @ApiOperation({ summary: '获取钉钉 OAuth 配置' })
  getDingTalkConfig() {
    return this.authService.getDingTalkConfig()
  }

  @Public()
  @Post('dingtalk/login')
  @ApiOperation({ summary: '钉钉授权登录' })
  @ApiBody({ schema: { properties: { code: { type: 'string' }, bindUserId: { type: 'string' } } } })
  async dingtalkLogin(
    @Body('code') code: string,
    @Body('bindUserId') bindUserId: string | undefined,
    @Headers('user-agent') userAgent: string,
    @Req() req: Request,
  ) {
    const ipAddress = req.ip || req.socket.remoteAddress
    return this.authService.handleDingTalkCallback(code, userAgent, ipAddress, bindUserId)
  }
}
