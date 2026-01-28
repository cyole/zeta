import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Headers,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Query,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common'
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger'
import { CurrentUser, Public } from '@/common/decorators'
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard'
import { ApplicationService } from './application.service'
import {
  ApplicationQueryDto,
  AuthorizeDto,
  AuthorizeQueryDto,
  CreateApplicationDto,
  RefreshClientTokenDto,
  RevokeGrantDto,
  TokenDto,
  UpdateApplicationDto,
} from './dto'

@ApiTags('OAuth 应用管理')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('applications')
export class ApplicationController {
  constructor(private applicationService: ApplicationService) {}

  @Post()
  @ApiOperation({ summary: '创建 OAuth 应用' })
  async create(@CurrentUser('id') userId: string, @Body() dto: CreateApplicationDto) {
    return this.applicationService.create(userId, dto)
  }

  @Get()
  @ApiOperation({ summary: '获取我的应用列表' })
  async findMyApplications(@CurrentUser('id') userId: string, @Query() query: ApplicationQueryDto) {
    return this.applicationService.findMyApplications(userId, query)
  }

  @Get(':id')
  @ApiOperation({ summary: '获取应用详情' })
  async findOne(@Param('id') id: string, @CurrentUser('id') userId: string) {
    return this.applicationService.findOne(id, userId)
  }

  @Patch(':id')
  @ApiOperation({ summary: '更新应用' })
  async update(@Param('id') id: string, @CurrentUser('id') userId: string, @Body() dto: UpdateApplicationDto) {
    return this.applicationService.update(id, userId, dto)
  }

  @Post(':id/regenerate-secret')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '重新生成 Client Secret' })
  async regenerateSecret(@Param('id') id: string, @CurrentUser('id') userId: string) {
    return this.applicationService.regenerateSecret(id, userId)
  }

  @Delete(':id')
  @ApiOperation({ summary: '删除应用' })
  async delete(@Param('id') id: string, @CurrentUser('id') userId: string) {
    return this.applicationService.delete(id, userId)
  }
}

@ApiTags('OAuth 授权')
@Controller('oauth')
export class OAuthAuthorizationController {
  constructor(private applicationService: ApplicationService) {}

  @Get('authorize')
  @Public()
  @ApiOperation({ summary: 'OAuth 授权页面' })
  async authorizePage(@Query() query: AuthorizeQueryDto) {
    // 验证应用和回调地址
    const application = await this.applicationService.findByClientId(query.clientId)

    if (!application.isActive) {
      throw new BadRequestException('应用已被禁用')
    }

    if (!this.applicationService.validateRedirectUri(application.redirectUris as string[], query.redirectUri)) {
      throw new BadRequestException('无效的回调地址')
    }

    // 返回授权页面需要的参数
    return {
      application: {
        id: application.id,
        name: application.name,
        logo: application.logo,
        homepage: application.homepage,
      },
      redirectUri: query.redirectUri,
      state: query.state,
      clientId: query.clientId,
    }
  }

  @Post('authorize')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '用户确认授权' })
  async authorize(@Body() dto: AuthorizeDto, @CurrentUser('id') userId: string) {
    const { code, application } = await this.applicationService.createAuthorizationCode(userId, dto)

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
    return this.applicationService.exchangeToken(dto)
  }

  @Post('token/refresh')
  @Public()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '刷新 Token' })
  async refreshToken(@Body() dto: RefreshClientTokenDto) {
    return this.applicationService.refreshToken(dto)
  }

  @Get('me')
  @Public()
  @ApiOperation({ summary: '根据 Access Token 获取用户信息' })
  async getUserInfo(@Headers('authorization') authHeader: string) {
    if (!authHeader?.startsWith('Bearer ')) {
      throw new UnauthorizedException('缺少 Access Token')
    }
    const accessToken = authHeader.substring(7)
    return this.applicationService.getUserByAccessToken(accessToken)
  }
}

@ApiTags('用户授权管理')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('user/grants')
export class UserGrantsController {
  constructor(private applicationService: ApplicationService) {}

  @Get()
  @ApiOperation({ summary: '获取用户的授权列表' })
  async getGrants(@CurrentUser('id') userId: string) {
    return this.applicationService.getUserGrants(userId)
  }

  @Delete()
  @ApiOperation({ summary: '撤销授权' })
  async revokeGrant(@CurrentUser('id') userId: string, @Body() dto: RevokeGrantDto) {
    return this.applicationService.revokeGrant(userId, dto.applicationId)
  }
}
