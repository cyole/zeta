import { Module } from '@nestjs/common'
import { QiniuModule } from '@/modules/qiniu/qiniu.module'
import { UploadController } from './upload.controller'

@Module({
  imports: [QiniuModule.register()],
  controllers: [UploadController],
})
export class UploadModule {}
