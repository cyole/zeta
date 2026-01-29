# 开发指南

## 开发环境设置

### 1. 环境要求

确保已安装以下工具：

| 工具           | 最低版本 | 说明         |
| -------------- | -------- | ------------ |
| Node.js        | >= 20.0  | 运行时环境   |
| pnpm           | >= 9.0   | 包管理器     |
| Docker         | 最新版   | 容器运行时   |
| Docker Compose | 最新版   | 容器编排工具 |

```bash
# 安装 pnpm (如果尚未安装)
npm install -g pnpm

# 验证版本
node --version
pnpm --version
docker --version
docker-compose --version
```

### 2. 安装依赖

```bash
# 克隆代码
git clone <repository-url> zeta
cd zeta

# 安装项目依赖
pnpm install
```

### 3. 启动数据库

```bash
# 启动 PostgreSQL 和 Redis（仅数据库服务）
docker-compose -f docker-compose.dev.yml up -d

# 检查服务状态
docker-compose -f docker-compose.dev.yml ps

# 停止服务
docker-compose -f docker-compose.dev.yml down
```

### 4. 配置环境变量

```bash
# 复制环境变量模板
cp apps/server/.env.example apps/server/.env
cp apps/web/.env.example apps/web/.env

# 开发环境可使用默认值，无需修改
```

### 5. 初始化数据库

```bash
# 生成 Prisma Client
pnpm db:generate

# 执行数据库迁移
pnpm db:migrate

# 填充种子数据（包含默认管理员账号）
pnpm db:seed
```

### 6. 启动开发服务器

```bash
# 同时启动前后端
pnpm dev

# 或分别启动
pnpm dev:server  # 后端: http://localhost:3001
pnpm dev:web     # 前端: http://localhost:3000
```

---

## 项目架构

### Monorepo 结构

```
zeta/
├── apps/
│   ├── server/          # NestJS 后端
│   └── web/             # Nuxt 4 前端
├── packages/
│   └── shared/          # 共享类型和常量
├── docker/
│   ├── docker-compose.yml      # 生产环境
│   ├── Dockerfile.server       # 后端镜像
│   ├── Dockerfile.web          # 前端镜像
│   └── nginx/                  # Nginx 配置
├── docker-compose.dev.yml      # 开发环境（仅 DB）
└── docs/                       # 项目文档
```

### 后端架构 (NestJS)

```
apps/server/src/
├── common/                 # 公共模块
│   ├── decorators/        # 自定义装饰器
│   │   ├── current-user.ts   # 获取当前用户
│   │   ├── permissions.ts    # 权限装饰器
│   │   ├── public.ts         # 公开路由
│   │   └── roles.ts          # 角色装饰器
│   ├── filters/           # 异常过滤器
│   │   └── http-exception.filter.ts
│   ├── guards/            # 守卫
│   │   ├── jwt-auth.guard.ts    # JWT 认证
│   │   ├── permissions.guard.ts  # 权限守卫
│   │   └── roles.guard.ts        # 角色守卫
│   └── interceptors/      # 拦截器
│       ├── logging.interceptor.ts    # 日志
│       └── transform.interceptor.ts  # 响应转换
├── config/                # 配置
│   └── app.config.ts
├── modules/               # 功能模块
│   ├── auth/             # 认证模块
│   │   ├── dto/
│   │   ├── guards/
│   │   ├── strategies/
│   │   ├── auth.controller.ts
│   │   ├── auth.module.ts
│   │   └── auth.service.ts
│   ├── dingtalk/         # 钉钉 OAuth
│   ├── mail/             # 邮件服务
│   ├── oauth2/           # OAuth2 通用模块
│   ├── permission/       # 权限管理
│   ├── prisma/           # Prisma 数据库
│   ├── redis/            # Redis 缓存
│   ├── role/             # 角色管理
│   └── user/             # 用户管理
├── app.controller.ts
├── app.module.ts
└── main.ts
```

### 前端架构 (Nuxt 4)

```
apps/web/app/
├── assets/               # 静态资源
├── components/           # 组件
│   └── ...
├── composables/          # 组合式函数
│   ├── useApi.ts            # API 请求封装
│   ├── useAuth.ts           # 认证状态管理
│   └── usePermissions.ts    # 权限检查
├── layouts/              # 布局
│   ├── auth.vue            # 认证页面布局
│   ├── dashboard.vue       # 管理后台布局
│   └── default.vue         # 默认布局
├── middleware/           # 路由中间件
│   ├── admin.ts            # 管理员检查
│   ├── auth.ts             # 登录检查
│   └── guest.ts            # 游客检查（已登录跳转）
├── pages/                # 页面
│   ├── auth/               # 认证相关页面
│   │   ├── callback/       # OAuth 回调
│   │   └── login.vue       # 登录页
│   ├── dashboard/          # 控制台页面
│   └── admin/              # 管理页面
└── utils/                # 工具函数
```

---

## 代码规范

### 后端规范

1. **模块结构**: 每个功能模块包含 controller, service, module, dto
2. **命名约定**:
   - 文件名: kebab-case (如 `auth.service.ts`)
   - 类名: PascalCase (如 `AuthService`)
   - 接口名: PascalCase + I 前缀 (如 `IUserResponse`)
3. **API 响应**: 统一使用 `TransformInterceptor` 包装响应
4. **异常处理**: 使用 `HttpExceptionFilter` 统一处理异常

### 前端规范

1. **组件命名**: 使用 PascalCase (如 `UserProfile.vue`)
2. **Composables**: 以 `use` 开头 (如 `useAuth`, `useApi`)
3. **页面结构**: 使用 `definePageMeta` 定义布局和中间件

---

## API 开发

### 创建新模块

```bash
# 使用 NestJS CLI 创建模块
cd apps/server
pnpm nest g module modules/example
pnpm nest g controller modules/example
pnpm nest g service modules/example
```

### 添加 Swagger 文档

```typescript
import { ApiBearerAuth, ApiOperation, ApiTags, ApiResponse } from '@nestjs/swagger'

@ApiTags('示例')
@Controller('example')
export class ExampleController {
  @Get()
  @ApiOperation({ summary: '获取列表' })
  @ApiResponse({ status: 200, description: '成功返回' })
  @ApiBearerAuth()
  findAll() {
    // ...
  }
}
```

访问 Swagger 文档: http://localhost:3001/api/docs

---

## 数据库操作

### Prisma 常用命令

```bash
# 生成迁移
pnpm --filter @zeta/server prisma migrate dev --name your_migration_name

# 重置数据库（开发环境）
pnpm --filter @zeta/server prisma migrate reset

# 打开数据库管理界面
pnpm --filter @zeta/server prisma studio

# 生成 Prisma Client
pnpm db:generate
```

### 添加新表

1. 编辑 `apps/server/prisma/schema.prisma`
2. 运行 `pnpm db:migrate`
3. 更新种子数据（如需要）

---

## 认证开发

### 保护路由 (后端)

```typescript
import { UseGuards } from '@nestjs/common'
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard'
import { RolesGuard } from '../common/guards/roles.guard'
import { PermissionsGuard } from '../common/guards/permissions.guard'
import { Public, Roles, Permissions } from '../common/decorators'

// 公开路由（无需登录）
@Public()
@Post('login')
async login() { ... }

// 需要登录
@UseGuards(JwtAuthGuard)
@Get('profile')
async getProfile() { ... }

// 需要特定角色
@Roles('ADMIN', 'SUPER_ADMIN')
@UseGuards(RolesGuard, JwtAuthGuard)
@Get('admin-only')
async adminOnly() { ... }

// 需要特定权限
@Permissions('user:create')
@UseGuards(PermissionsGuard, JwtAuthGuard)
@Post('users')
async createUser() { ... }
```

### 保护页面 (前端)

```typescript
// pages/admin/users.vue
definePageMeta({
  layout: 'dashboard',
  middleware: 'admin',  // 需要管理员权限
})

// composables/usePermissions.ts
const { isAdmin, hasPermission } = usePermissions()
```

---

## 测试

```bash
# 后端单元测试
pnpm --filter @zeta/server test

# 后端 E2E 测试
pnpm --filter @zeta/server test:e2e

# 前端类型检查
pnpm --filter @zeta/web typecheck

# 前端 Lint
pnpm --filter @zeta/web lint
```

---

## 常用命令速查

```bash
# 依赖管理
pnpm install                    # 安装所有依赖
pnpm add <package>              # 添加依赖

# 数据库
pnpm db:generate                # 生成 Prisma Client
pnpm db:migrate                 # 运行迁移
pnpm db:seed                    # 填充种子数据

# 开发
pnpm dev                        # 启动前后端
pnpm dev:server                 # 仅启动后端
pnpm dev:web                    # 仅启动前端

# 构建
pnpm build                      # 构建所有
pnpm --filter @zeta/server build # 构建后端
pnpm --filter @zeta/web build    # 构建前端

# Docker（开发环境）
docker-compose -f docker-compose.dev.yml up -d    # 启动 DB
docker-compose -f docker-compose.dev.yml down     # 停止 DB
```

---

## 常见问题

### 1. 数据库连接失败

```bash
# 确保 Docker 容器正在运行
docker-compose -f docker-compose.dev.yml ps

# 查看容器日志
docker-compose -f docker-compose.dev.yml logs postgres
docker-compose -f docker-compose.dev.yml logs redis
```

### 2. Prisma Client 未生成

```bash
pnpm db:generate
```

### 3. 端口被占用

修改 `.env` 或 `nuxt.config.ts` 中的端口配置。

### 4. 迁移历史丢失

```bash
# 重置数据库（开发环境）
pnpm --filter @zeta/server prisma migrate reset
```

---

## 默认账号

```
邮箱: admin@zeta.dev
密码: admin123
角色: SUPER_ADMIN
```
