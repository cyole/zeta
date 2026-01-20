# 开发指南

## 开发环境设置

### 1. 安装依赖

确保已安装以下工具：
- Node.js >= 20.0.0
- pnpm >= 9.0.0
- Docker & Docker Compose

```bash
# 安装 pnpm (如果尚未安装)
npm install -g pnpm

# 安装项目依赖
pnpm install
```

### 2. 启动数据库

```bash
# 使用开发配置启动 PostgreSQL 和 Redis
docker-compose -f docker-compose.dev.yml up -d

# 检查服务状态
docker-compose -f docker-compose.dev.yml ps
```

### 3. 配置环境变量

```bash
# 复制环境变量模板
cp apps/server/.env.example apps/server/.env

# 编辑配置（开发环境可使用默认值）
```

### 4. 初始化数据库

```bash
# 生成 Prisma Client
pnpm db:generate

# 执行数据库迁移
pnpm db:migrate

# 填充种子数据
pnpm db:seed
```

### 5. 启动开发服务器

```bash
# 同时启动前后端
pnpm dev

# 或分别启动
pnpm dev:server  # 后端: http://localhost:3001
pnpm dev:web     # 前端: http://localhost:3000
```

## 项目架构

### 后端架构 (NestJS)

```
apps/server/src/
├── common/                 # 公共模块
│   ├── decorators/        # 自定义装饰器
│   │   ├── current-user   # 获取当前用户
│   │   ├── permissions    # 权限装饰器
│   │   ├── public         # 公开路由
│   │   └── roles          # 角色装饰器
│   ├── filters/           # 异常过滤器
│   ├── guards/            # 守卫
│   │   ├── jwt-auth       # JWT 认证
│   │   ├── permissions    # 权限守卫
│   │   └── roles          # 角色守卫
│   └── interceptors/      # 拦截器
│       ├── logging        # 日志
│       └── transform      # 响应转换
├── config/                # 配置
└── modules/               # 功能模块
    ├── auth/             # 认证
    ├── mail/             # 邮件
    ├── oauth/            # OAuth
    ├── permission/       # 权限
    ├── prisma/           # 数据库
    ├── redis/            # 缓存
    ├── role/             # 角色
    └── user/             # 用户
```

### 前端架构 (Nuxt)

```
apps/web/app/
├── assets/               # 静态资源
├── components/           # 组件
├── composables/          # 组合式函数
│   ├── useAuth          # 认证状态
│   ├── useApi           # API 请求
│   └── usePermissions   # 权限检查
├── layouts/              # 布局
│   ├── auth             # 认证页面布局
│   ├── dashboard        # 管理后台布局
│   └── default          # 默认布局
├── middleware/           # 路由中间件
│   ├── admin            # 管理员检查
│   ├── auth             # 登录检查
│   └── guest            # 游客检查
├── pages/                # 页面
│   ├── auth/            # 认证页面
│   ├── admin/           # 管理页面
│   └── dashboard/       # 控制台页面
└── utils/                # 工具函数
```

## 代码规范

### 后端规范

1. **模块结构**: 每个功能模块包含 controller, service, module, dto
2. **命名约定**: 使用 kebab-case 文件名，PascalCase 类名
3. **API 响应**: 统一使用 TransformInterceptor 包装响应
4. **异常处理**: 使用 HttpExceptionFilter 统一处理异常

### 前端规范

1. **组件命名**: 使用 PascalCase，组件文件使用 .vue 扩展名
2. **Composables**: 以 use 开头，如 useAuth, useApi
3. **页面结构**: 使用 definePageMeta 定义布局和中间件

## API 开发

### 创建新模块

```bash
# 使用 NestJS CLI 创建模块
cd apps/server
pnpm nest g module modules/example
pnpm nest g controller modules/example
pnpm nest g service modules/example
```

### API 文档

- 使用 Swagger 装饰器添加 API 文档
- 访问 http://localhost:3001/api/docs 查看

```typescript
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('示例')
@Controller('example')
export class ExampleController {
  @Get()
  @ApiOperation({ summary: '获取列表' })
  @ApiBearerAuth()
  findAll() {
    // ...
  }
}
```

## 数据库操作

### Prisma 常用命令

```bash
# 生成迁移
pnpm --filter @zeta/server prisma migrate dev --name your_migration_name

# 重置数据库
pnpm --filter @zeta/server prisma migrate reset

# 打开数据库管理界面
pnpm --filter @zeta/server prisma studio
```

### 添加新表

1. 编辑 `apps/server/prisma/schema.prisma`
2. 运行 `pnpm db:migrate`
3. 更新种子数据（如需要）

## 认证开发

### 保护路由 (后端)

```typescript
// 需要登录
@UseGuards(JwtAuthGuard)

// 公开路由
@Public()

// 需要特定角色
@Roles('ADMIN', 'SUPER_ADMIN')
@UseGuards(RolesGuard)

// 需要特定权限
@Permissions('user:create')
@UseGuards(PermissionsGuard)
```

### 保护页面 (前端)

```typescript
// pages/admin/users.vue
definePageMeta({
  layout: 'dashboard',
  middleware: 'admin',
});
```

## 测试

```bash
# 后端单元测试
pnpm --filter @zeta/server test

# 后端 E2E 测试
pnpm --filter @zeta/server test:e2e

# 前端类型检查
pnpm --filter @zeta/web typecheck
```

## 常见问题

### 1. 数据库连接失败

确保 Docker 容器正在运行：
```bash
docker-compose -f docker-compose.dev.yml ps
```

### 2. Prisma Client 未生成

```bash
pnpm db:generate
```

### 3. 端口被占用

修改 `.env` 或 `nuxt.config.ts` 中的端口配置。
