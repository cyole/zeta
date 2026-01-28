import {
  Body,
  Controller,
  Get,
  Headers,
  HttpCode,
  HttpStatus,
  Post,
  Query,
  UnauthorizedException,
} from '@nestjs/common'
import { ApiOperation, ApiTags } from '@nestjs/swagger'
import { CurrentUser, Public } from '@/common/decorators'
import { AuthorizeDto, AuthorizeQueryDto, RefreshClientTokenDto, TokenDto } from './dto'
import { OAuth2Service } from './oauth2.service'

@ApiTags('OAuth 授权')
@Controller('oauth')
export class OAuth2Controller {
  constructor(private oauth2Service: OAuth2Service) {}

  @Get('authorize')
  @Public()
  @ApiOperation({ summary: 'OAuth 授权页面' })
  async authorizePage(@Query() query: AuthorizeQueryDto) {
    return this.oauth2Service.getAuthorizePage(query.clientId, query.redirectUri)
  }

  @Post('authorize')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '用户确认授权' })
  async authorize(@Body() dto: AuthorizeDto, @CurrentUser('id') userId: string) {
    const { code, application } = await this.oauth2Service.createAuthorizationCode(userId, dto)

    // 构建回调 URL
    const params = new URLSearchParams({
      code,
    })
    if (dto.state) {
      params.append('state', dto.state)
    }

    return {
      redirectUrl: `${dto.redirectUri}?${params.toString()}`,
      application: {
        name: application.name,
        logo: application.logo,
      },
    }
  }

  @Post('token')
  @Public()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '授权码换取 Token' })
  async token(@Body() dto: TokenDto) {
    return this.oauth2Service.exchangeToken(dto)
  }

  @Post('token/refresh')
  @Public()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '刷新 Token' })
  async refreshToken(@Body() dto: RefreshClientTokenDto) {
    return this.oauth2Service.refreshToken(dto)
  }

  @Get('me')
  @Public()
  @ApiOperation({ summary: '根据 Access Token 获取用户信息' })
  async getUserInfo(@Headers('authorization') authHeader: string) {
    if (!authHeader?.startsWith('Bearer ')) {
      throw new UnauthorizedException('缺少 Access Token')
    }
    const accessToken = authHeader.substring(7)
    return this.oauth2Service.getUserByAccessToken(accessToken)
  }
}
