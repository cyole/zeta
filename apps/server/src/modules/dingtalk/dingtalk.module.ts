import { Module } from '@nestjs/common'
import { PrismaModule } from '@/modules/prisma/prisma.module'
import { DingtalkController } from './dingtalk.controller'
import { DingtalkService } from './dingtalk.service'

@Module({
  imports: [PrismaModule],
  controllers: [DingtalkController],
  providers: [DingtalkService],
  exports: [DingtalkService],
})
export class DingtalkModule {}
