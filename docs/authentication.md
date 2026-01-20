# 认证系统文档

本文档描述 Zeta 平台的用户认证系统，包括登录流程、OAuth 配置和权限管理。

## 目录

- [认证流程概览](#认证流程概览)
- [邮箱密码登录](#邮箱密码登录)
- [GitHub OAuth 登录](#github-oauth-登录)
- [钉钉 OAuth 登录](#钉钉-oauth-登录)
- [Token 机制](#token-机制)
- [权限系统](#权限系统)
- [环境变量配置](#环境变量配置)

---

## 认证流程概览

Zeta 支持三种登录方式：

| 方式         | 端点                      | 说明             |
| ------------ | ------------------------- | ---------------- |
| 邮箱密码     | `POST /api/auth/login`    | 传统登录方式     |
| GitHub OAuth | `GET /api/oauth/github`   | 跳转 GitHub 授权 |
| 钉钉 OAuth   | `GET /api/oauth/dingtalk` | 跳转钉钉扫码授权 |

### 数据流

```
用户登录
    ↓
[邮箱/密码 或 OAuth]
    ↓
验证用户 + 查询角色权限
    ↓
生成 JWT tokens (access + refresh)
    ↓
存储 tokens 到 cookies
    ↓
请求受保护资源
    ↓
JwtAuthGuard 验证 token
    ↓
RolesGuard/PermissionsGuard 检查权限
    ↓
允许/拒绝请求
```

---

## 邮箱密码登录

### 请求

```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}
```

### 响应

```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIs...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "name": "用户名",
    "avatar": null,
    "status": "ACTIVE",
    "roles": [
      {
        "id": "uuid",
        "name": "FRONTEND",
        "displayName": "前端开发",
        "permissions": [...]
      }
    ]
  }
}
```

### 后端实现

**关键文件**：

- 控制器：`apps/server/src/modules/auth/auth.controller.ts`
- 服务：`apps/server/src/modules/auth/auth.service.ts`
- JWT 策略：`apps/server/src/modules/auth/strategies/jwt.strategy.ts`

**登录逻辑**：

1. 通过邮箱查找用户（包含 roles 和 permissions）
2. 使用 bcrypt 验证密码
3. 检查账户状态（必须为 `ACTIVE`）
4. 生成 JWT access token 和 refresh token
5. 更新 `lastLoginAt` 时间
6. 返回 tokens 和用户信息

---

## GitHub OAuth 登录

### 配置步骤

#### 1. 创建 GitHub OAuth App

1. 访问 [GitHub Developer Settings](https://github.com/settings/developers)
2. 点击 **New OAuth App**
3. 填写应用信息：

| 字段                       | 开发环境                                          | 生产环境                                                |
| -------------------------- | ------------------------------------------------- | ------------------------------------------------------- |
| Application name           | Zeta Dev                                          | Zeta                                                    |
| Homepage URL               | `http://localhost:3000`                           | `https://your-domain.com`                               |
| Authorization callback URL | `http://localhost:3001/api/oauth/github/callback` | `https://api.your-domain.com/api/oauth/github/callback` |

4. 创建后获取 **Client ID** 和 **Client Secret**

#### 2. 配置环境变量

在 `apps/server/.env` 中添加：

```bash
GITHUB_CLIENT_ID=你的_client_id
GITHUB_CLIENT_SECRET=你的_client_secret
GITHUB_CALLBACK_URL=http://localhost:3001/api/oauth/github/callback
```

### OAuth 流程

```
1. 前端跳转: window.location.href = `${apiBase}/oauth/github`
       ↓
2. 后端生成 state，重定向到 GitHub 授权页
       ↓
3. 用户在 GitHub 授权
       ↓
4. GitHub 回调: /api/oauth/github/callback?code=xxx&state=xxx
       ↓
5. 后端用 code 换取 access token
       ↓
6. 后端获取 GitHub 用户信息
       ↓
7. 查找或创建用户，生成 JWT
       ↓
8. 重定向到前端: /auth/callback/github?accessToken=xxx&refreshToken=xxx
       ↓
9. 前端从 URL 提取 token 存入 cookies
```

### 授权 URL 参数

```
https://github.com/login/oauth/authorize?
  client_id=[Client ID]&
  redirect_uri=[回调地址]&
  scope=read:user user:email&
  state=[随机值，防 CSRF]
```

---

## 钉钉 OAuth 登录

### 配置步骤

#### 1. 创建钉钉应用

1. 访问 [钉钉开放平台](https://open.dingtalk.com/)
2. 进入 **应用开发** → **企业内部应用** → **创建应用**
3. 在应用详情中获取：
   - **AppKey**（即 Client ID）
   - **AppSecret**（即 Client Secret）

#### 2. 配置登录权限

1. 在应用详情 → **登录与分享** → **登录应用**
2. 添加回调域名：
   - 开发环境：`localhost:3001`
   - 生产环境：`api.your-domain.com`

#### 3. 申请权限

在 **权限管理** 中申请：

- `openid`：获取用户 unionId（必需）
- `个人手机号信息`（可选）
- `通讯录个人信息读权限`（可选）

#### 4. 配置环境变量

在 `apps/server/.env` 中添加：

```bash
DINGTALK_CLIENT_ID=你的_appkey
DINGTALK_CLIENT_SECRET=你的_appsecret
DINGTALK_CALLBACK_URL=http://localhost:3001/api/oauth/dingtalk/callback
```

### OAuth 流程

```
1. 前端跳转: window.location.href = `${apiBase}/oauth/dingtalk`
       ↓
2. 后端生成 state，重定向到钉钉授权页
       ↓
3. 用户扫码/确认授权
       ↓
4. 钉钉回调: /api/oauth/dingtalk/callback?authCode=xxx&state=xxx
       ↓
5. 后端用 authCode 换取 access token
       ↓
6. 后端从 /v1.0/contact/users/me 获取用户信息
       ↓
7. 查找或创建用户，生成 JWT
       ↓
8. 重定向到前端: /auth/callback/dingtalk?accessToken=xxx&refreshToken=xxx
```

### 授权 URL 参数

```
https://login.dingtalk.com/oauth2/auth?
  response_type=code&
  client_id=[AppKey]&
  redirect_uri=[回调地址]&
  scope=openid&
  state=[随机值]
```

### 注意事项

- 钉钉可能不返回用户邮箱，系统会生成占位符：`${unionId}@dingtalk.placeholder`
- 需要在钉钉开放平台配置服务器出口 IP（生产环境）

---

## Token 机制

### Token 类型

| Token         | 有效期  | 用途              |
| ------------- | ------- | ----------------- |
| Access Token  | 15 分钟 | API 请求认证      |
| Refresh Token | 7 天    | 刷新 Access Token |

### Cookie 配置

```typescript
// Access Token Cookie
{
  name: 'zeta_access_token',
  maxAge: 60 * 15,  // 15 分钟
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax'
}

// Refresh Token Cookie
{
  name: 'zeta_refresh_token',
  maxAge: 60 * 60 * 24 * 7,  // 7 天
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax'
}
```

### Token 刷新

```http
POST /api/auth/refresh
Content-Type: application/json

{
  "refreshToken": "eyJhbGciOiJIUzI1NiIs..."
}
```

### 登出

```http
POST /api/auth/logout
Authorization: Bearer <access_token>
```

登出时会将 access token 加入 Redis 黑名单。

---

## 权限系统

### 角色定义

| 角色       | 标识          | 说明                           |
| ---------- | ------------- | ------------------------------ |
| 超级管理员 | `SUPER_ADMIN` | 拥有所有权限                   |
| 管理员     | `ADMIN`       | 用户和角色管理权限             |
| 前端开发   | `FRONTEND`    | 基础读取权限（OAuth 默认角色） |
| 后端开发   | `BACKEND`     | 基础读取权限                   |
| 测试人员   | `TESTER`      | 基础读取权限                   |

### 权限列表

```typescript
// 用户权限
'user:read' // 查看用户
'user:create' // 创建用户
'user:update' // 更新用户
'user:delete' // 删除用户
'user:assign-role' // 分配角色

// 角色权限
'role:read' // 查看角色
'role:create' // 创建角色
'role:update' // 更新角色
'role:delete' // 删除角色
'role:assign-permission' // 分配权限

// 权限权限
'permission:read' // 查看权限
```

### 后端使用

```typescript
// 角色检查
@Roles('SUPER_ADMIN', 'ADMIN')
@Get('admin-only')
async adminOnly() { ... }

// 权限检查
@Permissions('user:create')
@Post('users')
async createUser() { ... }

// 公开接口（跳过认证）
@Public()
@Post('login')
async login() { ... }
```

### 前端使用

```typescript
const { isSuperAdmin, isAdmin, hasPermission, hasRole } = usePermissions();

// 模板中
<div v-if="isSuperAdmin">超级管理员专属</div>
<div v-if="isAdmin">管理员功能</div>
<UButton v-if="hasPermission('user:create')">创建用户</UButton>
```

---

## 环境变量配置

### 完整示例

```bash
# apps/server/.env

# 数据库
DATABASE_URL="postgresql://user:pass@localhost:5432/zeta"

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379

# JWT
JWT_SECRET=your-jwt-secret-at-least-32-characters
JWT_REFRESH_SECRET=your-refresh-secret-at-least-32-characters
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d

# 前端地址（OAuth 回调后重定向）
FRONTEND_URL=http://localhost:3000

# GitHub OAuth
GITHUB_CLIENT_ID=your_github_client_id
GITHUB_CLIENT_SECRET=your_github_client_secret
GITHUB_CALLBACK_URL=http://localhost:3001/api/oauth/github/callback

# DingTalk OAuth
DINGTALK_CLIENT_ID=your_dingtalk_appkey
DINGTALK_CLIENT_SECRET=your_dingtalk_appsecret
DINGTALK_CALLBACK_URL=http://localhost:3001/api/oauth/dingtalk/callback
```

### 前端环境变量

```bash
# apps/web/.env
NUXT_PUBLIC_API_BASE=http://localhost:3001/api
```

---

## 测试账户

```
邮箱: admin@zeta.dev
密码: admin123
角色: SUPER_ADMIN
```

---

## 相关文件

### 后端

| 文件                                 | 说明                         |
| ------------------------------------ | ---------------------------- |
| `apps/server/src/modules/auth/`      | 认证模块                     |
| `apps/server/src/modules/oauth/`     | OAuth 模块                   |
| `apps/server/src/common/guards/`     | 认证守卫                     |
| `apps/server/src/common/decorators/` | 装饰器（@Public, @Roles 等） |

### 前端

| 文件                                         | 说明           |
| -------------------------------------------- | -------------- |
| `apps/web/app/pages/auth/login.vue`          | 登录页面       |
| `apps/web/app/pages/auth/callback/`          | OAuth 回调页面 |
| `apps/web/app/composables/useAuth.ts`        | 认证状态管理   |
| `apps/web/app/composables/usePermissions.ts` | 权限检查       |
| `apps/web/app/middleware/auth.ts`            | 认证中间件     |
