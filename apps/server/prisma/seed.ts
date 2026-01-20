import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

// Roles configuration
const roles = [
  {
    name: 'SUPER_ADMIN',
    displayName: '超级管理员',
    description: '拥有系统所有权限',
    isSystem: true,
  },
  {
    name: 'ADMIN',
    displayName: '管理员',
    description: '可管理用户和角色',
    isSystem: true,
  },
  {
    name: 'FRONTEND',
    displayName: '前端开发',
    description: '前端开发人员',
    isSystem: true,
  },
  {
    name: 'BACKEND',
    displayName: '后端开发',
    description: '后端开发人员',
    isSystem: true,
  },
  {
    name: 'TESTER',
    displayName: '测试人员',
    description: '测试人员',
    isSystem: true,
  },
];

// Permissions configuration
const permissions = [
  // User permissions
  { name: 'user:read', displayName: '查看用户', module: 'user' },
  { name: 'user:create', displayName: '创建用户', module: 'user' },
  { name: 'user:update', displayName: '更新用户', module: 'user' },
  { name: 'user:delete', displayName: '删除用户', module: 'user' },
  { name: 'user:assign-role', displayName: '分配角色', module: 'user' },

  // Role permissions
  { name: 'role:read', displayName: '查看角色', module: 'role' },
  { name: 'role:create', displayName: '创建角色', module: 'role' },
  { name: 'role:update', displayName: '更新角色', module: 'role' },
  { name: 'role:delete', displayName: '删除角色', module: 'role' },
  { name: 'role:assign-permission', displayName: '分配权限', module: 'role' },

  // Permission permissions
  { name: 'permission:read', displayName: '查看权限', module: 'permission' },
];

// Role-Permission mapping
const rolePermissions: Record<string, string[]> = {
  SUPER_ADMIN: permissions.map((p) => p.name),
  ADMIN: [
    'user:read',
    'user:create',
    'user:update',
    'user:delete',
    'user:assign-role',
    'role:read',
    'role:create',
    'role:update',
    'role:delete',
    'role:assign-permission',
    'permission:read',
  ],
  FRONTEND: ['user:read', 'role:read', 'permission:read'],
  BACKEND: ['user:read', 'role:read', 'permission:read'],
  TESTER: ['user:read', 'role:read', 'permission:read'],
};

async function main() {
  console.log('🌱 Starting database seed...');

  // Create permissions
  console.log('Creating permissions...');
  for (const permission of permissions) {
    await prisma.permission.upsert({
      where: { name: permission.name },
      update: {},
      create: permission,
    });
  }

  // Create roles
  console.log('Creating roles...');
  for (const role of roles) {
    await prisma.role.upsert({
      where: { name: role.name },
      update: {},
      create: role,
    });
  }

  // Assign permissions to roles
  console.log('Assigning permissions to roles...');
  for (const [roleName, permissionNames] of Object.entries(rolePermissions)) {
    const role = await prisma.role.findUnique({ where: { name: roleName } });
    if (!role) continue;

    for (const permissionName of permissionNames) {
      const permission = await prisma.permission.findUnique({
        where: { name: permissionName },
      });
      if (!permission) continue;

      await prisma.rolePermission.upsert({
        where: {
          roleId_permissionId: {
            roleId: role.id,
            permissionId: permission.id,
          },
        },
        update: {},
        create: {
          roleId: role.id,
          permissionId: permission.id,
        },
      });
    }
  }

  // Create default super admin user
  console.log('Creating default super admin user...');
  const superAdminRole = await prisma.role.findUnique({
    where: { name: 'SUPER_ADMIN' },
  });

  if (superAdminRole) {
    const existingAdmin = await prisma.user.findUnique({
      where: { email: 'admin@zeta.dev' },
    });

    if (!existingAdmin) {
      const hashedPassword = await bcrypt.hash('admin123', 12);

      const admin = await prisma.user.create({
        data: {
          email: 'admin@zeta.dev',
          password: hashedPassword,
          name: 'Super Admin',
          emailVerified: true,
          roles: {
            create: {
              roleId: superAdminRole.id,
            },
          },
        },
      });

      console.log(`✅ Created super admin: ${admin.email}`);
    } else {
      console.log('Super admin already exists, skipping...');
    }
  }

  console.log('✅ Database seed completed!');
}

main()
  .catch((e) => {
    console.error('❌ Seed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
