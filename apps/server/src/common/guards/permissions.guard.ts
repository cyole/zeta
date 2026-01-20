import type {
  CanActivate,
  ExecutionContext,
} from '@nestjs/common'
import type { Reflector } from '@nestjs/core'
import {
  ForbiddenException,
  Injectable,
} from '@nestjs/common'
import { PERMISSIONS_KEY } from '../decorators/permissions.decorator'

@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredPermissions = this.reflector.getAllAndOverride<string[]>(
      PERMISSIONS_KEY,
      [context.getHandler(), context.getClass()],
    )

    if (!requiredPermissions || requiredPermissions.length === 0) {
      return true
    }

    const { user } = context.switchToHttp().getRequest()

    if (!user || !user.roles) {
      throw new ForbiddenException('Access denied: No permissions assigned')
    }

    // Collect all permissions from user's roles
    const userPermissions = new Set<string>()
    for (const role of user.roles) {
      if (role.permissions) {
        for (const permission of role.permissions) {
          userPermissions.add(permission.name)
        }
      }
    }

    const hasPermission = requiredPermissions.every(permission =>
      userPermissions.has(permission),
    )

    if (!hasPermission) {
      throw new ForbiddenException(
        `Access denied: Required permissions [${requiredPermissions.join(', ')}]`,
      )
    }

    return true
  }
}
