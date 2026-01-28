import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { APP_GUARD } from '@nestjs/core'

import { JwtAuthGuard } from './common/guards/jwt-auth.guard'
import { ThrottlerGuard } from './common/guards/throttler.guard'
import configuration from './config/configuration'
import { ApplicationModule } from './modules/application/application.module'
import { AuthModule } from './modules/auth/auth.module'
import { DingtalkModule } from './modules/dingtalk'
import { MailModule } from './modules/mail/mail.module'
import { OAuth2Module } from './modules/oauth2/oauth2.module'
import { PermissionModule } from './modules/permission/permission.module'
import { PrismaModule } from './modules/prisma/prisma.module'
import { ProfileModule } from './modules/profile/profile.module'
import { QiniuModule } from './modules/qiniu/qiniu.module'
import { RedisModule } from './modules/redis/redis.module'
import { RoleModule } from './modules/role/role.module'
import { UploadModule } from './modules/upload/upload.module'
import { UserModule } from './modules/user/user.module'

@Module({
  imports: [
    // Configuration
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
      envFilePath: ['.env.local', '.env'],
    }),

    // Database & Cache
    PrismaModule,
    RedisModule,

    // Feature modules
    AuthModule,
    UserModule,
    RoleModule,
    PermissionModule,
    ProfileModule,
    DingtalkModule,
    OAuth2Module,
    ApplicationModule,
    MailModule,
    QiniuModule,
    UploadModule,
  ],
  providers: [
    // Global JWT guard
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
    // Global rate limit guard (custom implementation using Redis)
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}
