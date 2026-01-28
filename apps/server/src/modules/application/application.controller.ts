import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common'
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger'
import { CurrentUser } from '@/common/decorators'
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard'
import { ApplicationService } from './application.service'
import { ApplicationQueryDto, CreateApplicationDto, UpdateApplicationDto } from './dto'

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
