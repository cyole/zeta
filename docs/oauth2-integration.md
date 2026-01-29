# OAuth2 接入指南

本文档描述第三方应用如何接入 Zeta 平台的 OAuth2 服务，实现用户授权登录。

## 目录

- [OAuth2 流程概述](#oauth2-流程概述)
- [快速开始](#快速开始)
- [授权码模式详解](#授权码模式详解)
- [API 端点说明](#api-��点说明)
- [应用管理](#应用管理)
- [安全最佳实践](#安全最佳实践)
- [常见问题](#常见问题)

---

## OAuth2 流程概述

Zeta 实现了标准的 OAuth2.0 授权码模式（Authorization Code Flow），适用于有后端服务的应用。

### 完整流程图

```
┌─────────┐                                    ┌─────────┐
│  第三方  │                                    │  Zeta   │
│   应用   │                                    │  平台   │
└────┬────┘                                    └────┬────┘
     │                                               │
     │  1. 重定向用户到授权端点                        │
     ├──────────────────────────────────────────────>│
     │  GET /oauth2/authorize                        │
     │                                               │
     │                                    2. 验证用户 │
     │                                    是否已登录 │
     │                                               │
     │                                    3. 显示授权 │
     │                                    确认页面    │
     │<──────────────────────────────────────────────┤
     │                                               │
     │  4. 用户确认授权                               │
     ├──────────────────────────────────────────────>│
     │  POST /oauth2/authorize                       │
     │                                               │
     │  5. 重定向回第三方应用（含授权码）             │
     │<──────────────────────────────────────────────┤
     │  302 → redirect_uri?code=xxx&state=xxx        │
     │                                               │
     │  6. 后端用授权码换取 Token                     │
     ├──────────────────────────────────────────────>│
     │  POST /oauth2/token                           │
     │                                               │
     │  7. 返回 Access Token & Refresh Token         │
     │<──────────────────────────────────────────────┤
     │  { access_token, refresh_token, ... }          │
     │                                               │
     │  8. 使用 Access Token 获取用户信息             │
     ├──────────────────────────────────────────────>│
     │  GET /oauth2/me                               │
     │                                               │
     │  9. 返回用户信息                               │
     │<──────────────────────────────────────────────┤
     │  { id, email, name, ... }                     │
```

### Token 有效期

| Token         | 有效期  | 说明                          |
| ------------- | ------- | ----------------------------- |
| Authorization Code | 10 分钟 | 一次性使用，交换后立即失效 |
| Access Token  | 1 小时  | API 请求认证                  |
| Refresh Token | 30 天   | 刷新 Access Token             |

---

## 快速开始

### 步骤 1：创建 OAuth 应用

在 Zeta 平台管理后台创建应用，获取凭证：

```
Client ID:     xxxxxxxxxx
Client Secret: xxxxxxxxxx
```

### 步骤 2：配置回调地址

设置允许的回调地址（redirect_uri），例如：

```
https://your-app.com/oauth/callback
http://localhost:3000/oauth/callback  (开发环境)
```

### 步骤 3：发起授权请求

```typescript
// 生成随机 state，防止 CSRF 攻击
const state = generateRandomString();
sessionStorage.setItem('oauth_state', state);

// 构建授权 URL
const authUrl = new URL('http://localhost:3000/oauth2/authorize');
authUrl.searchParams.set('client_id', CLIENT_ID);
authUrl.searchParams.set('redirect_uri', REDIRECT_URI);
authUrl.searchParams.set('response_type', 'code');
authUrl.searchParams.set('state', state);

// 重定向用户
window.location.href = authUrl.toString();
```

### 步骤 4：处理授权回调

```typescript
// 你的回调页面，如 /oauth/callback
const urlParams = new URLSearchParams(window.location.search);
const code = urlParams.get('code');
const state = urlParams.get('state');

// 验证 state
const savedState = sessionStorage.getItem('oauth_state');
if (state !== savedState) {
  throw new Error('Invalid state');
}

// 用授权码换取 token（通过后端）
const tokens = await exchangeCodeForTokens(code);
```

### 步骤 5：换取 Token

```typescript
// 后端调用（不要在前端暴露 Client Secret）
const response = await fetch('http://localhost:3001/api/oauth2/token', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    code,
    client_id: CLIENT_ID,
    client_secret: CLIENT_SECRET,
    redirect_uri: REDIRECT_URI,
    grant_type: 'authorization_code'
  })
});

const { access_token, refresh_token } = await response.json();
```

---

## 授权码模式详解

### 1. 授权端点

请求用户授权。

**端点：** `GET /oauth2/authorize`

**请求参数：**

| 参数          | 类型     | 必填 | 说明                           |
| ------------- | -------- | ---- | ------------------------------ |
| client_id     | string   | 是   | 应用的 Client ID               |
| redirect_uri  | string   | 是   | 回调地址，必须与注册时一致     |
| response_type | string   | 是   | 固定值：`code`                 |
| state         | string   | 推荐 | 随机字符串，防 CSRF 攻击       |
| scope         | string   | 可选 | 权限范围，如：`read:user`      |

**示例：**

```http
GET /oauth2/authorize?
  client_id=9a71927e9242293768c5fe41fa8f07c4&
  redirect_uri=http://localhost:3002/callback&
  response_type=code&
  state=abc123
```

**用户行为：**

1. 如果未登录，跳转到登录页面
2. 登录后显示授权确认页面
3. 点击"授权"或"取消"

**授权成功重定向：**

```
302 Found
Location: redirect_uri?code=AUTH_CODE&state=abc123
```

**授权失败重定向：**

```
302 Found
Location: redirect_uri?error=access_denied&state=abc123
```

### 2. Token 端点

使用授权码换取 Access Token。

**端点：** `POST /api/oauth2/token`

**请求头：**

```
Content-Type: application/json
```

**请求参数：**

| 参数          | 类型   | 必填 | 说明                           |
| ------------- | ------ | ---- | ------------------------------ |
| code          | string | 是   | 授权码                         |
| client_id     | string | 是   | 应用的 Client ID               |
| client_secret | string | 是   | 应用的 Client Secret           |
| redirect_uri  | string | 是   | 回调地址，必须与授权时一致     |
| grant_type    | string | 是   | 固定值：`authorization_code`   |

**响应：**

```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIs...",
  "refresh_token": "eyJhbGciOiJIUzI1NiIs...",
  "token_type": "Bearer",
  "expires_in": 3600,
  "scope": "read:user"
}
```

**错误响应：**

```json
{
  "statusCode": 400,
  "message": "Invalid authorization code",
  "error": "invalid_grant"
}
```

### 3. 用户信息端点

使用 Access Token 获取用户信息。

**端点：** `GET /api/oauth2/me`

**请求头：**

```
Authorization: Bearer {access_token}
```

**响应：**

```json
{
  "id": "user-uuid",
  "email": "user@example.com",
  "name": "张三",
  "avatar": "https://cdn.example.com/avatar.jpg",
  "status": "ACTIVE"
}
```

**Token 过期响应：**

```json
{
  "statusCode": 401,
  "message": "Token expired"
}
```

### 4. 刷新 Token 端点

使用 Refresh Token 获取新的 Access Token。

**端点：** `POST /api/oauth2/token/refresh`

**请求参数：**

| 参数          | 类型   | 必填 | 说明                           |
| ------------- | ------ | ---- | ------------------------------ |
| refresh_token | string | 是   | 刷新令牌                       |
| client_id     | string | 是   | 应用的 Client ID               |
| client_secret | string | 是   | 应用的 Client Secret           |
| grant_type    | string | 是   | 固定值：`refresh_token`        |

**响应：**

```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIs...",
  "refresh_token": "eyJhbGciOiJIUzI1NiIs...",
  "token_type": "Bearer",
  "expires_in": 3600
}
```

**注意：** 每次刷新都会返回新的 Refresh Token，旧的立即失效。

---

## API 端点说明

### 授权端点

| 方法 | 路径                  | 说明                   |
| ---- | --------------------- | ---------------------- |
| GET  | `/oauth2/authorize`   | 显示授权页面           |
| POST | `/oauth2/authorize`   | 提交授权确认           |

### Token 端点

| 方法 | 路径                     | 说明                           |
| ---- | ------------------------ | ------------------------------ |
| POST | `/api/oauth2/token`      | 授权码换取 Access Token        |
| POST | `/api/oauth2/token/refresh` | 刷新 Access Token          |

### 资源端点

| 方法 | 路径              | 说明                       |
| ---- | ----------------- | -------------------------- |
| GET  | `/api/oauth2/me`  | 获取当前授权用户的信息     |

### 错误码

| 错误码            | HTTP 状态 | 说明                         |
| ----------------- | --------- | ---------------------------- |
| invalid_request   | 400       | 请求参数缺失或无效           |
| invalid_client    | 401       | Client ID 或 Secret 错误     |
| invalid_grant     | 400       | 授权码无效或已过期           |
| unauthorized_client | 403    | 应用未授权                   |
| unsupported_grant_type | 400 | 不支持的授权类型             |
| invalid_scope     | 400       | 权限范围无效                 |

---

## 应用管理

### 通过 API 管理应用

需要管理员权限，使用 JWT 认证。

#### 创建应用

```http
POST /api/applications
Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "name": "我的应用",
  "description": "应用描述",
  "homepage": "https://myapp.com",
  "redirectUris": ["https://myapp.com/callback"],
  "scopes": ["read:user"]
}
```

**响应：**

```json
{
  "id": "app-uuid",
  "clientId": "generated_client_id",
  "clientSecret": "generated_client_secret",
  "name": "我的应用",
  "redirectUris": ["https://myapp.com/callback"],
  "isActive": true
}
```

> **重要：** `clientSecret` 只在创建时返回一次，请妥善保存。

#### 更新应用

```http
PATCH /api/applications/:id
Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "name": "更新的应用名称",
  "redirectUris": ["https://myapp.com/callback", "https://myapp.com/callback2"]
}
```

#### 删除应用

```http
DELETE /api/applications/:id
Authorization: Bearer <admin_token>
```

---

## 安全最佳实践

### 1. 保护 Client Secret

- **永远不要**在前端代码中暴露 Client Secret
- Client Secret 只能存储在你的后端服务器
- 使用环境变量存储敏感信息

```typescript
// ✅ 正确：后端调用
const response = await fetch('/api/oauth2/token', {
  method: 'POST',
  body: JSON.stringify({
    client_id: process.env.CLIENT_ID,
    client_secret: process.env.CLIENT_SECRET,
    // ...
  })
});

// ❌ 错误：前端暴露 Secret
const response = await fetch('/api/oauth2/token', {
  body: JSON.stringify({
    client_secret: 'my-secret-in-frontend-code'  // 危险！
  })
});
```

### 2. 使用 State 参数防 CSRF

```typescript
// 生成随机 state
function generateState(): string {
  return Math.random().toString(36).substring(2) +
         Date.now().toString(36);
}

// 保存到 session
const state = generateState();
sessionStorage.setItem('oauth_state', state);

// 验证返回的 state
const returnedState = urlParams.get('state');
if (returnedState !== sessionStorage.getItem('oauth_state')) {
  throw new Error('CSRF detected');
}
```

### 3. 验证回调地址

- 注册应用时提供完整的回调 URL
- Zeta 会严格验证回调地址匹配
- 不要使用动态回调地址

### 4. 安全存储 Token

```typescript
// ✅ 推荐：HttpOnly Cookie（后端设置）
Set-Cookie: access_token=xxx; HttpOnly; Secure; SameSite=Strict

// ✅ 可接受：内存存储（SPA）
let accessToken: string | null = null;

// ❌ 不推荐：localStorage
localStorage.setItem('access_token', token);  // XSS 风险
```

### 5. 处理 Token 过期

```typescript
// 检查 Token 是否即将过期
function isTokenExpiringSoon(token: string): boolean {
  const payload = parseJwt(token);
  const expiresAt = payload.exp * 1000;
  return Date.now() > expiresAt - 5 * 60 * 1000;  // 5分钟前
}

// 自动刷新
async function getValidToken(): Promise<string> {
  if (isTokenExpiringSoon(accessToken)) {
    const newTokens = await refreshAccessToken();
    accessToken = newTokens.access_token;
    refreshToken = newTokens.refresh_token;
  }
  return accessToken;
}
```

### 6. 实现 PKCE（推荐）

对于无法安全存储 Secret 的应用（如移动端、SPA），应实现 PKCE 扩展。

> 注：Zeta 当前版本暂不支持 PKCE，如需此功能请联系平台管理员。

---

## 常见问题

### Q1: 授权码无效或已过期？

授权码有效期仅为 10 分钟，且只能使用一次。请确保：

1. 立即使用授权码换取 Token，不要延迟
2. 不要重复使用同一个授权码
3. 检查 `redirect_uri` 与授权时是否完全一致

### Q2: 回调地址不匹配？

确保满足以下条件：

1. 回调地址已在应用管理后台注册
2. 请求中的 `redirect_uri` 与注册时完全一致
3. 协议（http/https）、域名、端口、路径都要匹配

### Q3: 如何在本地开发？

1. 在应用管理中添加本地回调地址：`http://localhost:3000/callback`
2. 使用环境变量管理不同环境的配置

### Q4: Access Token 过期后怎么办？

使用 Refresh Token 端点获取新的 Access Token：

```typescript
const response = await fetch('/api/oauth2/token/refresh', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    refresh_token: refreshToken,
    client_id: CLIENT_ID,
    client_secret: CLIENT_SECRET,
    grant_type: 'refresh_token'
  })
});
```

### Q5: 如何撤销授权？

用户可以在 Zeta 平台的设置中撤销对特定应用的授权。撤销后：

- 所有 Access Token 立即失效
- Refresh Token 无法再刷新
- 用户需要重新授权

### Q6: 支持 Scope 权限控制吗？

当前版本返回基础用户信息。Scope 控制正在开发中，将支持：

- `read:user` - 读取基础用户信息
- `read:email` - 读取用户邮箱
- `read:profile` - 读取详细资料

---

## 示例项目

完整的演示应用已包含在项目中：

```bash
cd apps/demo-app
pnpm install
pnpm dev
# 访问 http://localhost:3002
```

演示应用使用默认测试凭证：

```
Client ID:     9a71927e9242293768c5fe41fa8f07c4
Client Secret: 50759abd32ce4b92aff4086cba90d6d4e9d0521d41b959397443ef8a02cda229
Redirect URI:  http://localhost:3002/callback
```

---

## 相关文件

| 文件                                      | 说明             |
| ----------------------------------------- | ---------------- |
| `apps/server/src/modules/oauth2/`         | OAuth2 服务端实现 |
| `apps/server/src/modules/oauth2/oauth2.controller.ts` | 控制器           |
| `apps/server/src/modules/oauth2/oauth2.service.ts`    | 服务层           |
| `apps/web/app/pages/oauth2/authorize.vue` | 授权确认页面     |
| `apps/demo-app/`                          | 完整演示应用     |
