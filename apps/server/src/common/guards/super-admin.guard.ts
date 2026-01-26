import type {
  CanActivate,
  ExecutionContext,
} from '@nestjs/common'
import {
  ForbiddenException,
  Injectable,
} from '@nestjs/common'
import { Reflector } from '@nestjs/core'
import { SUPER_ADMIN_KEY } from '../decorators/super-admin.decorator'

@Injectable()
export class SuperAdminGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const isSuperAdminOnly = this.reflector.getAllAndOverride<boolean>(
      SUPER_ADMIN_KEY,
      [context.getHandler(), context.getClass()],
    )

    if (!isSuperAdminOnly) {
      return true
    }

    const { user } = context.switchToHttp().getRequest()

    if (!user || !user.roles) {
      throw new ForbiddenException('需要超级管理员权限')
    }

    const userRoles = user.roles.map(
      (role: { name: string }) => role.name,
    )

    if (!userRoles.includes('SUPER_ADMIN')) {
      throw new ForbiddenException('需要超级管理员权限')
    }

    return true
  }
}
