import type { QiniuModuleOptions } from './qiniu.interface'
import { DynamicModule, Module, Provider } from '@nestjs/common'
import { ConfigModule, ConfigService } from '@nestjs/config'
import { QINIU_CONFIG_PROVIDER } from './qiniu.constants'
import { QiniuService } from './qiniu.service'

export const QiniuConfigProvider: Provider = {
  provide: QINIU_CONFIG_PROVIDER,
  inject: [ConfigService],
  useFactory: (configService: ConfigService): QiniuModuleOptions => ({
    accessKey: configService.get<string>('QINIU_ACCESS_KEY', ''),
    secretKey: configService.get<string>('QINIU_SECRET_KEY', ''),
    bucket: configService.get<string>('QINIU_BUCKET', ''),
    domain: configService.get<string>('QINIU_DOMAIN', ''),
    zone: configService.get<string>('QINIU_ZONE', 'z0'),
  }),
}

@Module({})
export class QiniuModule {
  private static moduleDefinition: DynamicModule

  static register(): DynamicModule {
    if (!this.moduleDefinition) {
      this.moduleDefinition = {
        module: QiniuModule,
        imports: [ConfigModule],
        providers: [QiniuConfigProvider, QiniuService],
        exports: [QiniuService],
        global: true,
      }
    }
    return this.moduleDefinition
  }
}
