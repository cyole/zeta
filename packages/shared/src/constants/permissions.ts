// Permission modules
export const PERMISSION_MODULES = {
  USER: 'user',
  ROLE: 'role',
  PERMISSION: 'permission',
} as const

// Permission actions
export const PERMISSIONS = {
  // User permissions
  USER_READ: 'user:read',
  USER_CREATE: 'user:create',
  USER_UPDATE: 'user:update',
  USER_DELETE: 'user:delete',
  USER_ASSIGN_ROLE: 'user:assign-role',

  // Role permissions
  ROLE_READ: 'role:read',
  ROLE_CREATE: 'role:create',
  ROLE_UPDATE: 'role:update',
  ROLE_DELETE: 'role:delete',
  ROLE_ASSIGN_PERMISSION: 'role:assign-permission',

  // Permission permissions
  PERMISSION_READ: 'permission:read',
} as const

export type PermissionName = (typeof PERMISSIONS)[keyof typeof PERMISSIONS]

// Permission display names (Chinese)
export const PERMISSION_DISPLAY_NAMES: Record<PermissionName, string> = {
  [PERMISSIONS.USER_READ]: '查看用户',
  [PERMISSIONS.USER_CREATE]: '创建用户',
  [PERMISSIONS.USER_UPDATE]: '更新用户',
  [PERMISSIONS.USER_DELETE]: '删除用户',
  [PERMISSIONS.USER_ASSIGN_ROLE]: '分配角色',
  [PERMISSIONS.ROLE_READ]: '查看角色',
  [PERMISSIONS.ROLE_CREATE]: '创建角色',
  [PERMISSIONS.ROLE_UPDATE]: '更新角色',
  [PERMISSIONS.ROLE_DELETE]: '删除角色',
  [PERMISSIONS.ROLE_ASSIGN_PERMISSION]: '分配权限',
  [PERMISSIONS.PERMISSION_READ]: '查看权限',
}

// Default permissions for each role
export const DEFAULT_ROLE_PERMISSIONS: Record<string, PermissionName[]> = {
  SUPER_ADMIN: Object.values(PERMISSIONS),
  ADMIN: [
    PERMISSIONS.USER_READ,
    PERMISSIONS.USER_CREATE,
    PERMISSIONS.USER_UPDATE,
    PERMISSIONS.USER_DELETE,
    PERMISSIONS.USER_ASSIGN_ROLE,
    PERMISSIONS.ROLE_READ,
    PERMISSIONS.ROLE_CREATE,
    PERMISSIONS.ROLE_UPDATE,
    PERMISSIONS.ROLE_DELETE,
    PERMISSIONS.ROLE_ASSIGN_PERMISSION,
    PERMISSIONS.PERMISSION_READ,
  ],
  FRONTEND: [
    PERMISSIONS.USER_READ,
    PERMISSIONS.ROLE_READ,
    PERMISSIONS.PERMISSION_READ,
  ],
  BACKEND: [
    PERMISSIONS.USER_READ,
    PERMISSIONS.ROLE_READ,
    PERMISSIONS.PERMISSION_READ,
  ],
  TESTER: [
    PERMISSIONS.USER_READ,
    PERMISSIONS.ROLE_READ,
    PERMISSIONS.PERMISSION_READ,
  ],
}
