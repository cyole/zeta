import {
  Controller,
  Get,
  Query,
  Res,
  Req,
  Headers,
} from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { Response, Request } from 'express';
import { ConfigService } from '@nestjs/config';
import { OAuthService } from './oauth.service';
import { Public } from '@/common/decorators';

@ApiTags('OAuth')
@Controller('oauth')
export class OAuthController {
  constructor(
    private oauthService: OAuthService,
    private configService: ConfigService,
  ) {}

  // ==================== GitHub OAuth ====================

  @Public()
  @Get('github')
  @ApiOperation({ summary: '跳转到 GitHub 授权' })
  githubAuth(@Res() res: Response) {
    const state = this.oauthService.generateState();
    const authUrl = this.oauthService.getGitHubAuthUrl(state);
    res.redirect(authUrl);
  }

  @Public()
  @Get('github/callback')
  @ApiOperation({ summary: 'GitHub 授权回调' })
  async githubCallback(
    @Query('code') code: string,
    @Query('state') state: string,
    @Query('error') error: string,
    @Headers('user-agent') userAgent: string,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    const frontendUrl = this.configService.get('frontendUrl');

    if (error) {
      return res.redirect(`${frontendUrl}/auth/callback/github?error=${encodeURIComponent(error)}`);
    }

    try {
      const ipAddress = req.ip || req.socket.remoteAddress;
      const result = await this.oauthService.handleGitHubCallback(code, userAgent, ipAddress);

      // Redirect to frontend with tokens in query params (will be stored in cookies by frontend)
      const params = new URLSearchParams({
        accessToken: result.accessToken,
        refreshToken: result.refreshToken,
      });

      return res.redirect(`${frontendUrl}/auth/callback/github?${params.toString()}`);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      return res.redirect(`${frontendUrl}/auth/callback/github?error=${encodeURIComponent(message)}`);
    }
  }

  // ==================== DingTalk OAuth ====================

  @Public()
  @Get('dingtalk')
  @ApiOperation({ summary: '跳转到钉钉授权' })
  dingtalkAuth(@Res() res: Response) {
    const state = this.oauthService.generateState();
    const authUrl = this.oauthService.getDingTalkAuthUrl(state);
    res.redirect(authUrl);
  }

  @Public()
  @Get('dingtalk/callback')
  @ApiOperation({ summary: '钉钉授权回调' })
  async dingtalkCallback(
    @Query('authCode') authCode: string,
    @Query('state') state: string,
    @Query('error') error: string,
    @Headers('user-agent') userAgent: string,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    const frontendUrl = this.configService.get('frontendUrl');

    if (error) {
      return res.redirect(`${frontendUrl}/auth/callback/dingtalk?error=${encodeURIComponent(error)}`);
    }

    try {
      const ipAddress = req.ip || req.socket.remoteAddress;
      const result = await this.oauthService.handleDingTalkCallback(authCode, userAgent, ipAddress);

      const params = new URLSearchParams({
        accessToken: result.accessToken,
        refreshToken: result.refreshToken,
      });

      return res.redirect(`${frontendUrl}/auth/callback/dingtalk?${params.toString()}`);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      return res.redirect(`${frontendUrl}/auth/callback/dingtalk?error=${encodeURIComponent(message)}`);
    }
  }
}
