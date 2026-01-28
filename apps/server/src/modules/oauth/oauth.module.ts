import { forwardRef, Module } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { JwtModule } from '@nestjs/jwt'
import { DingtalkModule } from '@/modules/dingtalk'
import { OAuthController } from './oauth.controller'
import { OAuthService } from './oauth.service'

@Module({
  imports: [
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get('jwt.secret'),
        signOptions: {
          expiresIn: configService.get('jwt.expiresIn', '15m'),
        },
      }),
    }),
    forwardRef(() => DingtalkModule),
  ],
  controllers: [OAuthController],
  providers: [OAuthService],
  exports: [OAuthService],
})
export class OAuthModule {}
