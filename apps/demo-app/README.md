# Zeta OAuth Demo App

这是一个简单的 OAuth 2.0 客户端演示应用，用于测试 Zeta 平台的 OAuth 登录功能。

## 功能说明

- 使用 Zeta 平台账号登录
- 登录后显示用户信息（ID、邮箱、角色等）
- 支持 Token 存储和自动续期

## 技术栈

- Vue 3
- Vue Router
- Vite

## 快速开始

### 1. 安装依赖

```bash
pnpm install
```

### 2. 配置 OAuth 应用

首先需要在 Zeta 平台创建一个 OAuth 应用：

1. 启动 Zeta 服务并登录
2. 访问 [应用管理页面](http://localhost:3000/dashboard/applications)
3. 创建新应用，填写以下信息：
   - **名称**: Demo App (或任意名称)
   - **回调地址**: `http://localhost:3002/callback`
   - **授权范围**: 可选

4. 创建后，记录下应用的 **Client ID** 和 **Client Secret**

### 3. 修改配置

编辑 `src/pages/Home.vue` 和 `src/pages/Callback.vue`，修改 CONFIG 配置：

```javascript
const CONFIG = {
  clientId: 'your-client-id-here',        // 替换为实际的 Client ID
  clientSecret: 'your-client-secret-here', // 替换为实际的 Client Secret
  redirectUri: 'http://localhost:3002/callback',
  // ...
}
```

### 4. 启动应用

```bash
pnpm dev:demo
```

应用将在 http://localhost:3002 运行

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

| 端点                   | 方法     | 说明             |
| ---------------------- | -------- | ---------------- |
| `/oauth/authorize`     | GET/POST | OAuth 授权       |
| `/oauth/token`         | POST     | 授权码换 token   |
| `/oauth/token/refresh` | POST     | 刷新 token       |
| `/api/user/me`         | GET      | 获取当前用户信息 |

## 目录结构

```
demo-app/
├── index.html
├── package.json
├── vite.config.js
├── README.md
└── src/
    ├── main.js
    ├── App.vue
    └── pages/
        ├── Home.vue      # 主页/登录页
        └── Callback.vue  # OAuth回调处理
```
