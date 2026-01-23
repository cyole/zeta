import { Module } from '@nestjs/common'
import { QiniuModule } from '@/modules/qiniu/qiniu.module'
import { ProfileController } from './profile.controller'
import { ProfileService } from './profile.service'

@Module({
  imports: [QiniuModule.register()],
  controllers: [ProfileController],
  providers: [ProfileService],
  exports: [ProfileService],
})
export class ProfileModule {}
