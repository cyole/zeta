import { Module } from '@nestjs/common'
import { PrismaModule } from '@/modules/prisma/prisma.module'
import { OAuth2Controller } from './oauth2.controller'
import { OAuth2Service } from './oauth2.service'

@Module({
  imports: [PrismaModule],
  controllers: [OAuth2Controller],
  providers: [OAuth2Service],
  exports: [OAuth2Service],
})
export class OAuth2Module {}
