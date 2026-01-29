# Zeta OAuth Demo App

这是一个简单的 OAuth 2.0 客户端演示应用，用于测试 Zeta 平台的 OAuth 登录功能。

## 功能说明

- 使用 Zeta 平台账号登录
- 登录后显示用户信息（ID、邮箱、角色等）
- 查看 Token 信息（访问令牌、刷新令牌）
- 支持权限和角色展示

## 技术栈

- Vue 3
- Vue Router
- Vite
- TypeScript

## 快速开始

### 1. 启动 Zeta 服务

首先确保 Zeta 后端和前端服务正在运行：

```bash
# 在项目根目录
pnpm dev
```

### 2. 初始化数据库（创建 Demo OAuth 应用）

```bash
# 运行数据库迁移和种子数据
pnpm db:migrate
pnpm db:seed
```

种子脚本会自动创建一个名为 "Demo App" 的 OAuth 应用，凭证如下：

- **Client ID**: `9a71927e9242293768c5fe41fa8f07c4`
- **Client Secret**: `50759abd32ce4b92aff4086cba90d6d4e9d0521d41b959397443ef8a02cda229`
- **回调地址**: `http://localhost:3002/callback`

### 3. 配置 Demo App（可选）

Demo App 已包含默认配置，可以直接运行。如需使用自定义 OAuth 应用：

```bash
# 复制环境变量模板
cp .env.example .env

# 编辑 .env 文件，修改配置
```

### 4. 安装依赖并启动

```bash
# 安装依赖
pnpm install

# 启动 Demo App
pnpm dev:demo
```

应用将在 http://localhost:3002 运行

### 5. 测试登录

1. 访问 http://localhost:3002
2. 点击 "使用 Zeta 账号登录"
3. 使用默认测试账号登录：
   - **邮箱**: `admin@zeta.dev`
   - **密码**: `admin123`
4. 确认授权
5. 登录成功后查看用户信息

## OAuth 登录流程

```
┌─────────┐                ┌─────────────┐              ┌──────────┐
│  Demo   │                │    Zeta     │              │  User    │
│   App   │                │   Platform  │              │          │
└────┬────┘                └──────┬──────┘              └────┬─────┘
     │  1. 点击登录              │                           │
     ├─────────────────────────>│  2. 跳转到授权页面           │
     │                          ├──────────────────────────>│
     │                          │  3. 用户确认授权           │
     │                          │<──────────────────────────┤
     │  4. 回调带授权码          │                           │
     │<─────────────────────────┤                           │
     │  5. 用授权码换token       │                           │
     ├─────────────────────────>│                           │
     │  6. 返回access token     │                           │
     │<─────────────────────────┤                           │
     │  7. 用token获取用户信息   │                           │
     ├─────────────────────────>│                           │
     │  8. 返回用户信息          │                           │
     │<─────────────────────────┤                           │
     │  9. 显示用户信息          │                           │
     │                          │                           │
```

## API 端点

| 端点                        | 方法     | 说明             |
| --------------------------- | -------- | ---------------- |
| `/oauth/authorize`          | GET/POST | OAuth 授权页面   |
| `/api/oauth2/token`         | POST     | 授权码换 token   |
| `/api/oauth2/token/refresh` | POST     | 刷新 token       |
| `/api/oauth2/me`            | GET      | 获取当前用户信息 |

## 环境变量

| 变量                       | 说明             | 默认值                                                             |
| -------------------------- | ---------------- | ------------------------------------------------------------------ |
| `VITE_OAUTH_CLIENT_ID`     | OAuth 客户端 ID  | `9a71927e9242293768c5fe41fa8f07c4`                                 |
| `VITE_OAUTH_CLIENT_SECRET` | OAuth 客户端密钥 | `50759abd32ce4b92aff4086cba90d6d4e9d0521d41b959397443ef8a02cda229` |
| `VITE_OAUTH_REDIRECT_URI`  | OAuth 回调地址   | `http://localhost:3002/callback`                                   |
| `VITE_OAUTH_AUTHORIZE_URL` | OAuth 授权端点   | `http://localhost:3000/oauth/authorize`                            |
| `VITE_OAUTH_TOKEN_URL`     | OAuth Token 端点 | `http://localhost:3001/api/oauth2/token`                           |
| `VITE_OAUTH_USER_INFO_URL` | 用户信息端点     | `http://localhost:3001/api/oauth2/me`                              |

## 目录结构

```
demo-app/
├── index.html
├── package.json
├── vite.config.js
├── .env.example
├── README.md
└── src/
    ├── main.ts
    ├── config/
    │   └── index.ts       # OAuth 配置
    ├── types/
    │   └── index.ts       # TypeScript 类型定义
    ├── App.vue
    └── pages/
        ├── Home.vue       # 主页/登录页/仪表板
        └── Callback.vue   # OAuth 回调处理
```

## 使用自定义 OAuth 应用

如果要创建自己的 OAuth 应用：

1. 访问 Zeta 平台 [应用管理页面](http://localhost:3000/dashboard/applications)
2. 创建新应用，填写信息：
   - **名称**: 你的应用名称
   - **回调地址**: `http://localhost:3002/callback`（或其他地址）
   - **授权范围**: 选择需要的权限
3. 创建后，获取 **Client ID** 和 **Client Secret**
4. 在 Demo App 的 `.env` 文件中配置这些值
5. 重启 Demo App
