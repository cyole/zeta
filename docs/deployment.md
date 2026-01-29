# 部署指南

## 生产环境快速部署

### 1. 克隆代码

```bash
git clone <repository-url> zeta
cd zeta
```

### 2. 进入 docker 目录

```bash
cd docker
```

### 3. 配置环境变量

```bash
# 复制环境变量模板
cp .env.example .env

# 编辑 .env 文件，修改以下重要配置：
# - POSTGRES_PASSWORD: 数据库密码
# - REDIS_PASSWORD: Redis 密码
# - JWT_SECRET: JWT 密钥（至少 32 字符）
# - JWT_REFRESH_SECRET: JWT 刷新密钥（至少 32 字符）
```

### 4. 启动服务

```bash
# 构建并启动所有服务
docker-compose up -d

# 查看日志
docker-compose logs -f

# 查看服务状态
docker-compose ps
```

### 5. 访问应用

| 服务   | 地址                          | 说明             |
| ------ | ----------------------------- | ---------------- |
| 前端   | http://localhost:3000         | 主界面           |
| API    | http://localhost:3000/api     | 后端接口（代理） |
| Swagger | http://localhost:3000/api/docs | API 文档（仅非生产环境） |

### 6. 默认账号

```
邮箱: admin@zeta.dev
密码: admin123
```

**部署后请立即修改默认密码！**

---

## 服务架构

### 端口说明

| 服务       | 容器端口 | 对外端口 | 说明               |
| ---------- | -------- | -------- | ------------------ |
| web        | 80       | 3000     | 前端 + API 代理    |
| server     | 3001     | -        | 后端 API（内网）   |
| postgres   | 5432     | -        | 数据库（内网）     |
| redis      | 6379     | -        | 缓存（内网）       |

**安全说明**: 仅 3000 端口对外暴露，数据库、Redis、后端 API 仅在 Docker 内网可访问。

### 数据流向

```
用户请求 → :3000 (Nginx)
                ↓
         /api/* → server:3001 (后端)
         /      → 静态文件 (前端)
```

---

## 环境变量

### 必填配置

```bash
# 数据库
POSTGRES_USER=zeta
POSTGRES_PASSWORD=your-strong-postgres-password
POSTGRES_DB=zeta

# Redis
REDIS_PASSWORD=your-strong-redis-password

# JWT（重要：请使用强随机密钥）
JWT_SECRET=your-super-secret-jwt-key-at-least-32-characters
JWT_REFRESH_SECRET=your-super-secret-refresh-key-at-least-32-characters
```

### 可选配置

```bash
# 前端 URL（用于 OAuth 回调和邮件链接）
FRONTEND_URL=http://localhost:3000

# GitHub OAuth
GITHUB_CLIENT_ID=your-github-client-id
GITHUB_CLIENT_SECRET=your-github-client-secret
GITHUB_CALLBACK_URL=http://localhost:3000/auth/callback/github

# DingTalk OAuth
DINGTALK_APP_KEY=your-dingtalk-app-key
DINGTALK_APP_SECRET=your-dingtalk-app-secret
DINGTALK_CALLBACK_URL=http://localhost:3000/auth/callback/dingtalk

# 邮件服务
MAIL_HOST=smtp.example.com
MAIL_PORT=587
MAIL_USER=your-email@example.com
MAIL_PASSWORD=your-email-password
MAIL_FROM="Zeta <noreply@zeta.dev>"

# 七牛云对象存储
QINIU_ACCESS_KEY=your-qiniu-access-key
QINIU_SECRET_KEY=your-qiniu-secret-key
QINIU_BUCKET=your-bucket-name
QINIU_DOMAIN=https://your-domain.com
QINIU_ZONE=z0
```

---

## 常用命令

```bash
# 启动服务
docker-compose up -d

# 停止服务
docker-compose down

# 停止服务并删除数据卷（谨慎使用）
docker-compose down -v

# 查看日志
docker-compose logs -f

# 查看特定服务日志
docker-compose logs -f web
docker-compose logs -f server

# 重启服务
docker-compose restart

# 重新构建并启动
docker-compose up -d --build

# 进入容器
docker-compose exec server sh
docker-compose exec postgres psql -U zeta -d zeta
```

---

## 健康检查

```bash
# Web 服务健康检查
curl http://localhost:3000/health

# 后端 API 健康检查
curl http://localhost:3000/api

# 数据库健康检查
docker-compose exec postgres pg_isready -U zeta

# Redis 健康检查
docker-compose exec redis redis-cli -a YOUR_REDIS_PASSWORD ping
```

---

## 生产环境检查清单

### 安全

- [ ] 修改所有默认密码
- [ ] 配置强 JWT 密钥（至少 32 字符）
- [ ] 配置 HTTPS（使用 Let's Encrypt 或其他证书）
- [ ] 设置防火墙规则
- [ ] 限制 SSH 访问
- [ ] 定期更新镜像

### 数据

- [ ] 配置数据库自动备份
- [ ] 测试备份恢复流程
- [ ] 配置 Redis 持久化（已默认启用 AOF）

### 监控

- [ ] 配置日志收集（ELK/Loki 等）
- [ ] 设置监控告警（Prometheus/Grafana）
- [ ] 配置错误追踪（Sentry）
- [ ] 设置服务可用性监控

### 功能测试

- [ ] 测试用户登录/登出
- [ ] 测试 OAuth 登录流程
- [ ] 测试邮件发送功能
- [ ] 验证文件上传功能
- [ ] 检查 API 文档访问

---

## 故障排查

### 服务无法启动

```bash
# 查看详细日志
docker-compose logs

# 检查端口占用
netstat -tlnp | grep 3000
```

### 数据库连接失败

```bash
# 检查数据库健康状态
docker-compose exec postgres pg_isready -U zeta

# 进入数据库
docker-compose exec postgres psql -U zeta -d zeta

# 查看数据库日志
docker-compose logs postgres
```

### Redis 连接失败

```bash
# 检查 Redis 状态
docker-compose exec redis redis-cli -a YOUR_REDIS_PASSWORD ping

# 查看 Redis 日志
docker-compose logs redis
```

### 后端 API 错误

```bash
# 查看后端日志
docker-compose logs server

# 进入后端容器排查
docker-compose exec server sh
```

### 前端 404 或白屏

```bash
# 检查 Nginx 配置
docker-compose exec web cat /etc/nginx/conf.d/default.conf

# 查看 Nginx 日志
docker-compose logs web
```

### 数据库迁移问题

```bash
# 手动运行迁移
docker-compose exec server npx prisma migrate deploy

# 查看迁移状态
docker-compose exec server npx prisma migrate status
```

---

## 手动部署（高级）

### 后端部署

```bash
cd apps/server
pnpm build
NODE_ENV=production node dist/main.js
```

推荐使用 PM2：

```bash
pm2 start dist/main.js --name zeta-server
```

### 前端部署

```bash
cd apps/web
pnpm build
```

将 `.output/public` 目录部署到静态服务器。

---

## 更新部署

```bash
cd docker

# 拉取最新代码
git pull

# 重新构建并启动
docker-compose up -d --build
```
