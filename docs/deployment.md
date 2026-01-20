# 部署指南

## Docker Compose 部署

### 1. 准备环境

确保服务器已安装 Docker 和 Docker Compose。

### 2. 配置环境变量

创建 `.env` 文件：

```bash
# 数据库
POSTGRES_USER=zeta
POSTGRES_PASSWORD=your-secure-password
POSTGRES_DB=zeta

# Redis
REDIS_PASSWORD=your-redis-password

# JWT (请使用强密钥)
JWT_SECRET=your-super-secret-jwt-key-at-least-32-characters
JWT_REFRESH_SECRET=your-super-secret-refresh-key-at-least-32-characters

# OAuth (可选)
GITHUB_CLIENT_ID=your-github-client-id
GITHUB_CLIENT_SECRET=your-github-client-secret
DINGTALK_APP_KEY=your-dingtalk-app-key
DINGTALK_APP_SECRET=your-dingtalk-app-secret

# 邮件 (可选)
MAIL_HOST=smtp.example.com
MAIL_PORT=587
MAIL_USER=your-email@example.com
MAIL_PASSWORD=your-email-password
```

### 3. 构建并启动

```bash
# 构建镜像
docker-compose build

# 启动所有服务 (包括前后端)
docker-compose --profile prod up -d

# 查看日志
docker-compose logs -f

# 停止服务
docker-compose --profile prod down
```

### 4. 初始化数据库

```bash
# 进入后端容器
docker-compose exec server sh

# 执行迁移
npx prisma migrate deploy

# 填充种子数据
npx ts-node prisma/seed.ts
```

## 手动部署

### 后端部署

1. **构建后端**

```bash
cd apps/server
pnpm build
```

2. **配置环境变量**

在部署服务器上设置所有必要的环境变量。

3. **运行数据库迁移**

```bash
npx prisma migrate deploy
npx ts-node prisma/seed.ts
```

4. **启动服务**

```bash
node dist/main.js
```

推荐使用 PM2 进行进程管理：

```bash
pm2 start dist/main.js --name zeta-server
```

### 前端部署

1. **构建前端**

```bash
cd apps/web
pnpm build
# 或者生成静态文件
pnpm generate
```

2. **部署到静态服务器**

将 `.output/public` 目录部署到 Nginx、Vercel、Netlify 等。

3. **Nginx 配置示例**

```nginx
server {
    listen 80;
    server_name your-domain.com;
    root /var/www/zeta;
    index index.html;

    # Gzip
    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml;

    # SPA 路由
    location / {
        try_files $uri $uri/ /index.html;
    }

    # API 代理
    location /api {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

## 生产环境检查清单

- [ ] 修改所有默认密码
- [ ] 配置强 JWT 密钥 (至少 32 字符)
- [ ] 配置 HTTPS
- [ ] 设置防火墙规则
- [ ] 配置日志收集
- [ ] 设置数据库备份
- [ ] 配置监控告警
- [ ] 测试邮件发送功能
- [ ] 验证 OAuth 回调地址

## 服务端口

| 服务       | 端口 | 说明     |
| ---------- | ---- | -------- |
| Web        | 3000 | 前端应用 |
| API        | 3001 | 后端 API |
| PostgreSQL | 5432 | 数据库   |
| Redis      | 6379 | 缓存     |

## 健康检查

- 后端: `GET /api/health`
- 数据库: `pg_isready -U zeta`
- Redis: `redis-cli ping`

## 故障排查

### 1. 后端无法启动

检查日志：

```bash
docker-compose logs server
```

常见问题：

- 数据库连接失败
- 环境变量未配置
- 端口被占用

### 2. 前端访问 404

确保 Nginx 配置了 SPA 路由：

```nginx
try_files $uri $uri/ /index.html;
```

### 3. API 请求失败

检查 CORS 配置和 API 代理设置。
