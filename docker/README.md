# Zeta 生产环境部署

## 快速开始

```bash
# 1. 克隆代码
git clone <repository-url> zeta
cd zeta

# 2. 进入 docker 目录
cd docker

# 3. 复制并修改环境变量
cp .env.example .env
# 编辑 .env 文件，修改数据库密码、JWT 密钥等敏感信息

# 4. 启动服务
docker-compose up -d

# 5. 查看日志
docker-compose logs -f

# 6. 访问应用
# 前端: http://localhost:3000
# API: http://localhost:3000/api
```

## 服务说明

| 服务 | 容器名 | 内部端口 | 对外端口 | 说明 |
|------|--------|----------|----------|------|
| web | zeta-web | 80 | 3000 | 前端 + API 代理 |
| server | zeta-server | 3001 | - | 后端 API (内网) |
| postgres | zeta-postgres | 5432 | - | 数据库 (内网) |
| redis | zeta-redis | 6379 | - | 缓存 (内网) |

## 安全说明

- 仅对外暴露 **3000** 端口
- 数据库、Redis、后端 API 仅在 Docker 内网可访问
- Nginx 反向代理 `/api` 请求到后端服务

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

# 更新镜像并重启
docker-compose up -d --build

# 查看运行状态
docker-compose ps
```

## 环境变量配置

必填配置项：

| 变量 | 说明 | 示例 |
|------|------|------|
| `POSTGRES_USER` | 数据库用户名 | `zeta` |
| `POSTGRES_PASSWORD` | 数据库密码（强密码） | - |
| `POSTGRES_DB` | 数据库名称 | `zeta` |
| `REDIS_PASSWORD` | Redis 密码（强密码） | - |
| `JWT_SECRET` | JWT 密钥（强随机字符串） | - |
| `JWT_REFRESH_SECRET` | JWT 刷新密钥（强随机字符串） | - |

可选配置项：

| 变量 | 说明 |
|------|------|
| `FRONTEND_URL` | 前端地址，用于 OAuth 回调和邮件链接 |
| `GITHUB_CLIENT_ID` | GitHub OAuth 应用 ID |
| `GITHUB_CLIENT_SECRET` | GitHub OAuth 密钥 |
| `DINGTALK_APP_KEY` | 钉钉 OAuth App Key |
| `DINGTALK_APP_SECRET` | 钉钉 OAuth 密钥 |
| `MAIL_*` | 邮件服务配置 |
| `QINIU_*` | 七牛云对象存储配置 |

## 默认账号

```
邮箱: admin@zeta.dev
密码: admin123
```

**部署后请立即修改默认密码！**

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
```

### Redis 连接失败

```bash
# 检查 Redis 状态
docker-compose exec redis redis-cli -a YOUR_REDIS_PASSWORD ping
```
