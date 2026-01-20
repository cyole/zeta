// Default role names
export const ROLES = {
  SUPER_ADMIN: 'SUPER_ADMIN',
  ADMIN: 'ADMIN',
  FRONTEND: 'FRONTEND',
  BACKEND: 'BACKEND',
  TESTER: 'TESTER',
} as const;

export type RoleName = (typeof ROLES)[keyof typeof ROLES];

// Role display names (Chinese)
export const ROLE_DISPLAY_NAMES: Record<RoleName, string> = {
  [ROLES.SUPER_ADMIN]: '超级管理员',
  [ROLES.ADMIN]: '管理员',
  [ROLES.FRONTEND]: '前端开发',
  [ROLES.BACKEND]: '后端开发',
  [ROLES.TESTER]: '测试人员',
};

// Role descriptions
export const ROLE_DESCRIPTIONS: Record<RoleName, string> = {
  [ROLES.SUPER_ADMIN]: '拥有系统所有权限',
  [ROLES.ADMIN]: '可管理用户和角色',
  [ROLES.FRONTEND]: '前端开发人员',
  [ROLES.BACKEND]: '后端开发人员',
  [ROLES.TESTER]: '测试人员',
};
