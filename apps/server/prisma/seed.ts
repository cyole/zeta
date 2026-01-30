import { PrismaPg } from '@prisma/adapter-pg'
import { PrismaClient } from '@prisma/client'
import * as bcrypt from 'bcrypt'
import { Pool } from 'pg'
import 'dotenv/config'

const connectionString = process.env.DATABASE_URL
const pool = new Pool({ connectionString })
const adapter = new PrismaPg(pool)
const prisma = new PrismaClient({ adapter })

// Roles configuration
const roles = [
  {
    name: 'SUPER_ADMIN',
    displayName: '系统管理员',
    description: '系统内最高权限，管理系统配置、内置角色、所有用户',
    isSystem: true,
  },
  {
    name: 'ADMIN',
    displayName: '管理员',
    description: '管理自己可操作的资源和用户，做业务管理',
    isSystem: true,
  },
  {
    name: 'GUEST',
    displayName: '游客',
    description: '最小权限角色，只读访问',
    isSystem: true,
  },
]

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
]

// Role-Permission mapping
const rolePermissions: Record<string, string[]> = {
  // SuperAdmin has all permissions
  SUPER_ADMIN: permissions.map(p => p.name),

  // Admin can manage users and custom roles, but cannot delete users or manage system roles
  ADMIN: [
    'user:read',
    'user:create',
    'user:update',
    'user:assign-role',
    'role:read',
    'role:create',
    'role:update',
    'role:assign-permission',
    'permission:read',
  ],

  // Guest has minimal read-only permissions
  GUEST: [
    'user:read',
    'role:read',
    'permission:read',
  ],
}

async function main() {
  console.log('🌱 Starting database seed...')

  // Create permissions
  console.log('Creating permissions...')
  for (const permission of permissions) {
    await prisma.permission.upsert({
      where: { name: permission.name },
      update: {},
      create: permission,
    })
  }

  // Create roles
  console.log('Creating roles...')
  for (const role of roles) {
    await prisma.role.upsert({
      where: { name: role.name },
      update: {},
      create: role,
    })
  }

  // Assign permissions to roles (only add missing, don't remove existing)
  console.log('Assigning permissions to roles...')
  for (const [roleName, permissionNames] of Object.entries(rolePermissions)) {
    const role = await prisma.role.findUnique({ where: { name: roleName } })
    if (!role)
      continue

    for (const permissionName of permissionNames) {
      const permission = await prisma.permission.findUnique({
        where: { name: permissionName },
      })
      if (!permission)
        continue

      // Only create if not exists, preserve any custom permissions
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
      })
    }
  }

  // Create default super admin user
  console.log('Creating default super admin user...')
  const superAdminRole = await prisma.role.findUnique({
    where: { name: 'SUPER_ADMIN' },
  })

  if (superAdminRole) {
    const existingAdmin = await prisma.user.findUnique({
      where: { email: 'admin@zeta.dev' },
    })

    if (!existingAdmin) {
      const hashedPassword = await bcrypt.hash('admin123', 12)

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
      })

      console.log(`✅ Created super admin: ${admin.email}`)
    }
    else {
      console.log('Super admin already exists, skipping...')
    }
  }

  // Create demo OAuth application
  console.log('Creating demo OAuth application...')
  const demoUser = await prisma.user.findUnique({
    where: { email: 'admin@zeta.dev' },
  })

  if (demoUser) {
    // 查找或创建 demo OAuth 应用
    const demoClientId = '9a71927e9242293768c5fe41fa8f07c4'
    const existingDemoApp = await prisma.application.findUnique({
      where: { clientId: demoClientId },
    })

    if (!existingDemoApp) {
      await prisma.application.create({
        data: {
          clientId: demoClientId,
          clientSecret: '50759abd32ce4b92aff4086cba90d6d4e9d0521d41b959397443ef8a02cda229',
          name: 'Demo App',
          description: 'Zeta OAuth2 演示应用',
          homepage: 'http://localhost:3002',
          redirectUris: ['http://localhost:3002/callback'],
          logo: null,
          scopes: ['read:user', 'read:email'],
          isActive: true,
          userId: demoUser.id,
        },
      })
      console.log('✅ Created demo OAuth application')
    }
    else {
      console.log('Demo OAuth application already exists, skipping...')
    }
  }

  console.log('✅ Database seed completed!')
}

main()
  .catch((e) => {
    console.error('❌ Seed error:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
