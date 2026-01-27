import { Module } from '@nestjs/common'
import { ApplicationController, OAuthAuthorizationController, UserGrantsController } from './application.controller'
import { ApplicationService } from './application.service'

@Module({
  controllers: [ApplicationController, OAuthAuthorizationController, UserGrantsController],
  providers: [ApplicationService],
  exports: [ApplicationService],
})
export class ApplicationModule {}
