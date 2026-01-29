# Zeta - 前端提效平台

<div align="center">

**Frontend Efficiency Platform**

[![Node](https://img.shields.io/badge/Node-20%2B-brightgreen)](https://nodejs.org)
[![NestJS](https://img.shields.io/badge/NestJS-11.x-red)](https://nestjs.com)
[![Nuxt](https://img.shields.io/badge/Nuxt-4.x-green)](https://nuxt.com)
[![pnpm](https://img.shields.io/badge/pnpm-9%2B-blue)](https://pnpm.io)

[开发文档](./docs/development.md) • [部署文档](./docs/deployment.md) • [认证文档](./docs/authentication.md)

</div>

## 项目简介

Zeta 是一个开箱即用的前端提效平台，提供完整的用户认证、权限管理等基础能力，让你专注于业务开发。

**核心特性：**

- 🔐 **多重认证** - 邮箱密码、GitHub OAuth、钉钉 OAuth
- 👥 **RBAC 权限** - 基于角色的访问控制，细粒度权限管理
- 🚀 **开箱即用** - 完整的用户管理、角色管理、权限管理
- 📦 **Monorepo** - 前后端共享类型，统一构建流程
- 🐳 **Docker 部署** - 一键启动，生产级配置

---

## 技术栈

| 层级     | 技术选型                  |
| -------- | ------------------------- |
| 后端框架 | NestJS v11                |
| 数据库   | PostgreSQL 16 + Prisma ORM |
| 缓存     | Redis 7                   |
| 前端框架 | Nuxt 4 (SPA模式)          |
| UI框架   | Nuxt UI v4                |
| 构建工具 | pnpm + Turborepo          |
| 部署     | Docker Compose            |

---

## 快速开始

### 环境要求

| 工具            | 最低版本  |
| --------------- | --------- |
| Node.js         | >= 20.0   |
| pnpm            | >= 9.0    |
| Docker          | 最新版    |
| Docker Compose  | 最新版    |

### 开发环境

```bash
# 1. 克隆项目
git clone <repository-url> zeta
cd zeta

# 2. 安装依赖
pnpm install

# 3. 启动数据库服务
docker-compose -f docker-compose.dev.yml up -d

# 4. 配置环境变量
cp apps/server/.env.example apps/server/.env
cp apps/web/.env.example apps/web/.env
# 开发环境可使用默认值

# 5. 初始化数据库
pnpm db:generate
pnpm db:migrate
pnpm db:seed

# 6. 启动开发服务器
pnpm dev
```

访问：
- 前端: http://localhost:3000
- 后端 API: http://localhost:3001/api
- API 文档: http://localhost:3001/api/docs

### 默认账号

```
邮箱: admin@zeta.dev
密码: admin123
角色: 超级管理员
```

---

## 生产部署

```bash
# 克隆代码后进入 docker 目录
cd docker

# 复制并配置环境变量
cp .env.example .env
# 修改 .env 中的数据库密码、JWT 密钥等

# 启动所有服务
docker-compose up -d
```

**仅对外暴露 3000 端口**，数据库、Redis、后端 API 均在内网访问。

详细部署说明请查看 [部署文档](./docs/deployment.md)

---

## 项目结构

```
zeta/
├── apps/
│   ├── web/                    # Nuxt 4 前端
│   │   └── app/
│   │       ├── components/     # 组件
│   │       ├── composables/    # 组合式函数
│   │       ├── layouts/        # 布局
│   │       ├── middleware/     # 路由中间件
│   │       └── pages/          # 页面
│   │
│   └── server/                 # NestJS 后端
│       ├── prisma/             # 数据库 Schema
│       └── src/
│           ├── common/         # 公共模块
│           │   ├── decorators/ # 装饰器
│           │   ├── filters/    # 过滤器
│           │   ├── guards/     # 守卫
│           │   └── interceptors/ # 拦截器
│           └── modules/        # 功能模块
│               ├── auth/       # 认证
│               ├── dingtalk/   # 钉钉 OAuth
│               ├── oauth2/     # OAuth2 通用
│               ├── permission/ # 权限
│               ├── prisma/     # 数据库
│               ├── redis/      # 缓存
│               ├── role/       # 角色
│               └── user/       # 用户
│
├── packages/
│   └── shared/                 # 共享类型和常量
│
├── docker/                     # 生产环境 Docker 配置
│   ├── docker-compose.yml      # 完整服务编排
│   ├── .env.example            # 环境变量模板
│   ├── Dockerfile.server       # 后端镜像
│   ├── Dockerfile.web          # 前端镜像
│   └── nginx/                  # Nginx 配置
│
├── docker-compose.dev.yml      # 开发环境（仅 DB）
├── docs/                       # 项目文档
│   ├── development.md          # 开发指南
│   ├── deployment.md           # 部署指南
│   └── authentication.md       # 认证文档
└── README.md
```

---

## 常用命令

```bash
# === 开发 ===
pnpm dev              # 启动前后端
pnpm dev:web          # 仅启动前端
pnpm dev:server       # 仅启动后端

# === 构建 ===
pnpm build            # 构建所有
pnpm --filter @zeta/server build  # 构建后端
pnpm --filter @zeta/web build     # 构建前端

# === 数据库 ===
pnpm db:generate      # 生成 Prisma Client
pnpm db:migrate       # 执行迁移
pnpm db:seed          # 填充种子数据
pnpm --filter @zeta/server prisma studio  # 数据库管理界面

# === Docker 开发环境 ===
docker-compose -f docker-compose.dev.yml up -d    # 启动 DB
docker-compose -f docker-compose.dev.yml down     # 停止 DB

# === Docker 生产环境 ===
cd docker && docker-compose up -d      # 启动所有服务
cd docker && docker-compose down       # 停止服务
cd docker && docker-compose logs -f    # 查看日志
```

---

## 功能模块

### 认证模块

| 方式         | 说明                     |
| ------------ | ------------------------ |
| 邮箱密码     | 传统注册/登录            |
| JWT Token    | Access Token + Refresh Token |
| GitHub OAuth | 第三方登录               |
| 钉钉 OAuth   | 扫码登录                  |

### 权限模块 (RBAC)

- 预设角色: 超级管理员、管理员、前端、后端、测试
- 细粒度权限控制 (`user:create`, `role:update` 等)
- 支持角色和权限的组合使用

### 用户管理

- 用户 CRUD 操作
- 角色分配
- 状态管理 (ACTIVE/INACTIVE)

---

## 环境变量

### 必填配置

```bash
# 数据库
POSTGRES_USER=zeta
POSTGRES_PASSWORD=your-strong-password
POSTGRES_DB=zeta

# Redis
REDIS_PASSWORD=your-redis-password

# JWT（生产环境必须修改）
JWT_SECRET=your-jwt-secret-at-least-32-characters
JWT_REFRESH_SECRET=your-refresh-secret-at-least-32-characters
```

### 可选配置

```bash
# GitHub OAuth
GITHUB_CLIENT_ID=your-github-client-id
GITHUB_CLIENT_SECRET=your-github-client-secret
GITHUB_CALLBACK_URL=http://localhost:3000/auth/callback/github

# 钉钉 OAuth
DINGTALK_APP_KEY=your-dingtalk-app-key
DINGTALK_APP_SECRET=your-dingtalk-app-secret
DINGTALK_CALLBACK_URL=http://localhost:3000/auth/callback/dingtalk

# 邮件服务
MAIL_HOST=smtp.example.com
MAIL_PORT=587
MAIL_USER=your-email@example.com
MAIL_PASSWORD=your-email-password
```

完整配置说明请查看 [认证文档](./docs/authentication.md)

---

## 文档

| 文档               | 说明                       |
| ------------------ | -------------------------- |
| [开发指南](./docs/development.md)     | 开发环境设置、项目架构、API 开发 |
| [部署指南](./docs/deployment.md)     | 生产部署、环境配置、故障排查     |
| [认证文档](./docs/authentication.md) | OAuth 配置、权限系统、Token 机制 |

---

## License

[MIT](./LICENSE)
