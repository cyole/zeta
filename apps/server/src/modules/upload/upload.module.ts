import { Module } from '@nestjs/common'
import { UploadController } from './upload.controller'
import { QiniuModule } from '@/modules/qiniu/qiniu.module'

@Module({
  imports: [QiniuModule.register()],
  controllers: [UploadController],
})
export class UploadModule {}
