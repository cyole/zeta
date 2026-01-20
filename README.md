# Zeta - 前端提效平台

> 前端提效平台 - Frontend Efficiency Platform

## 项目简介

Zeta 是一个前端提效平台，提供开箱即用的基础能力，包括用户认证、权限管理等功能。

## 技术栈

| 层级 | 技术选型 |
|------|----------|
| 后端框架 | NestJS v11 |
| 数据库 | PostgreSQL + Prisma ORM |
| 缓存 | Redis |
| 前端框架 | Nuxt 4 (SPA模式) |
| UI框架 | Nuxt UI v4 |
| 构建工具 | pnpm + monorepo |
| 部署 | Docker Compose |

## 快速开始

### 环境要求

- Node.js >= 20.0.0
- pnpm >= 9.0.0
- Docker & Docker Compose

### 安装步骤

```bash
# 1. 克隆项目
git clone <repository-url>
cd zeta

# 2. 安装依赖
pnpm install

# 3. 启动数据库服务
pnpm docker:up
# 或使用开发配置
docker-compose -f docker-compose.dev.yml up -d

# 4. 配置环境变量
cp apps/server/.env.example apps/server/.env
# 编辑 .env 文件，配置必要的环境变量

# 5. 初始化数据库
pnpm db:generate
pnpm db:migrate
pnpm db:seed

# 6. 启动开发服务器
pnpm dev
```

### 访问地址

- 前端: http://localhost:3000
- 后端 API: http://localhost:3001/api
- API 文档: http://localhost:3001/api/docs

### 默认账号

```
邮箱: admin@zeta.dev
密码: admin123
角色: 超级管理员
```

## 项目结构

```
zeta/
├── apps/
│   ├── web/                    # Nuxt 4 SPA 前端
│   │   ├── app/
│   │   │   ├── components/     # 组件
│   │   │   ├── composables/    # 组合式函数
│   │   │   ├── layouts/        # 布局
│   │   │   ├── middleware/     # 路由中间件
│   │   │   ├── pages/          # 页面
│   │   │   └── utils/          # 工具函数
│   │   └── nuxt.config.ts
│   │
│   └── server/                 # NestJS 后端
│       ├── src/
│       │   ├── common/         # 公共模块
│       │   ├── config/         # 配置
│       │   └── modules/        # 功能模块
│       └── prisma/             # 数据库
│
├── packages/
│   └── shared/                 # 共享类型和常量
│
├── docker/                     # Docker 配置
├── docs/                       # 文档
└── docker-compose.yml          # Docker 编排
```

## 开发命令

```bash
# 启动所有开发服务器
pnpm dev

# 仅启动前端
pnpm dev:web

# 仅启动后端
pnpm dev:server

# 构建
pnpm build

# 数据库操作
pnpm db:generate   # 生成 Prisma Client
pnpm db:migrate    # 执行迁移
pnpm db:seed       # 填充种子数据
pnpm --filter @zeta/server prisma studio  # 打开 Prisma Studio

# Docker
pnpm docker:up     # 启动容器
pnpm docker:down   # 停止容器
```

## 功能模块

### 认证模块

- 邮箱注册/登录
- JWT Token (Access + Refresh)
- GitHub OAuth 登录
- 钉钉 OAuth 登录
- 邮箱验证

### 权限模块

- 基于角色的访问控制 (RBAC)
- 预设角色: 超级管理员、管理员、前端、后端、测试
- 细粒度权限控制

### 用户管理

- 用户 CRUD
- 角色分配
- 状态管理

## 环境变量说明

```bash
# 应用配置
NODE_ENV=development
PORT=3001

# 数据库
DATABASE_URL="postgresql://zeta:zeta123@localhost:5432/zeta"

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=zeta123

# JWT
JWT_SECRET=your-jwt-secret
JWT_EXPIRES_IN=15m
JWT_REFRESH_SECRET=your-refresh-secret
JWT_REFRESH_EXPIRES_IN=7d

# OAuth - GitHub
GITHUB_CLIENT_ID=your-github-client-id
GITHUB_CLIENT_SECRET=your-github-client-secret
GITHUB_CALLBACK_URL=http://localhost:3000/auth/callback/github

# OAuth - 钉钉
DINGTALK_APP_KEY=your-dingtalk-app-key
DINGTALK_APP_SECRET=your-dingtalk-app-secret
DINGTALK_CALLBACK_URL=http://localhost:3000/auth/callback/dingtalk

# 邮件
MAIL_HOST=smtp.example.com
MAIL_PORT=587
MAIL_USER=your-email@example.com
MAIL_PASSWORD=your-email-password
MAIL_FROM="Zeta <noreply@zeta.dev>"

# 前端地址
FRONTEND_URL=http://localhost:3000
```

## 部署

### Docker Compose 部署

```bash
# 构建并启动所有服务
docker-compose --profile prod up -d

# 查看日志
docker-compose logs -f
```

### 手动部署

参见 [部署文档](./docs/deployment.md)

## 许可证

MIT
