# 📗 KNZN Docker 全栈部署与运维指南 (Contabo VPS)

> **核心理念**: 单机容器化集群 - Docker Compose 编排 + Nginx 反代 + 自动化 CI/CD

## 📋 文档概述

**部署策略**: Contabo VPS 单机容器化集群  
**硬件配置**: Contabo VPS L (12GB RAM, 6 CPU cores, 100GB NVMe)  
**运维理念**: 自动化部署，最小化人工干预  
**成本控制**: 月运营成本 < $50，支撑 10K+ 用户  
**文档版本**: v2.0 (Contabo VPS 专用版)  

### 🖥️ 推荐硬件配置

| 配置项 | 规格 | 说明 |
|--------|------|------|
| **CPU** | 6 vCPU cores | 支持并行处理和多容器运行 |
| **内存** | 12GB RAM | PostgreSQL (6GB) + Nuxt App (4GB) + Redis (1GB) + 系统 (1GB) |
| **存储** | 100GB NVMe | 高速 SSD，优化数据库 I/O 性能 |
| **网络** | 不限流量 | 支持全球用户访问 |
| **月费用** | ~$13 USD | 性价比极高的配置选择 |  

## 🏗️ Docker 容器化架构

### 整体部署拓扑

```
┌─────────────────────────────────────────────────────────────────┐
│                        全球用户访问                              │
├─────────────────────────────────────────────────────────────────┤
│ 🌍 Global Users │ 🇺🇸 US │ 🇪🇺 EU │ 🇦🇺 AU │ 🇯🇵 JP          │
└─────────────────────────────────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│                    Cloudflare (可选 CDN)                       │
├─────────────────────────────────────────────────────────────────┤
│ • 全球 CDN 加速 (静态资源)                                      │
│ • DDoS 防护                                                     │
│ • DNS 管理                                                      │
└─────────────────────────────────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│                    Contabo VPS (单机集群)                      │
├─────────────────────────────────────────────────────────────────┤
│                     Nginx 容器 (入口)                          │
│ • SSL 证书管理 (Let's Encrypt)                                 │
│ • HTTP/2 + Gzip 压缩                                           │
│ • 静态资源缓存 (替代 Vercel Edge 功能)                        │
│ • 反向代理到 Nuxt 容器                                          │
│ • 安全头配置                                                    │
└─────────────────────────────────────────────────────────────────┘
                                │
                ┌───────────────┼───────────────┐
                ▼               ▼               ▼
┌──────────────────┐ ┌──────────────────┐ ┌──────────────────┐
│  Nuxt 4 容器     │ │ PostgreSQL 容器  │ │   Redis 容器     │
├──────────────────┤ ├──────────────────┤ ├──────────────────┤
│ • Vue 3 前端     │ │ • 主数据库       │ │ • Nitro 缓存     │
│ • Nitro 后端     │ │ • 数据持久化     │ │ • 会话存储       │
│ • Better-Auth    │ │ • 自动备份       │ │ • 限流控制       │
│ • Drizzle ORM    │ │ • 性能优化       │ │ • 排行榜缓存     │
│ • 端口: 3000     │ │ • 端口: 5432     │ │ • 端口: 6379     │
└──────────────────┘ └──────────────────┘ └──────────────────┘
```

## 📁 Docker 配置文件结构

```
knzn-project/
├── docker-compose.yml              # 主编排文件
├── docker-compose.prod.yml         # 生产环境覆盖
├── .env.production                 # 生产环境变量
│
├── docker/
│   ├── nginx/
│   │   ├── Dockerfile              # Nginx 容器
│   │   ├── nginx.conf              # 主配置
│   │   ├── ssl.conf                # SSL 配置
│   │   └── cache.conf              # 缓存配置
│   │
│   ├── app/
│   │   ├── Dockerfile              # Nuxt 应用容器
│   │   └── .dockerignore           # 构建忽略文件
│   │
│   └── postgres/
│       ├── init.sql                # 初始化脚本
│       └── postgresql.conf         # 性能优化配置
│
├── scripts/
│   ├── deploy.sh                   # 部署脚本
│   ├── backup.sh                   # 备份脚本
│   ├── restore.sh                  # 恢复脚本
│   └── update.sh                   # 更新脚本
│
└── .github/
    └── workflows/
        └── deploy.yml              # GitHub Actions CI/CD
```

## 🐳 Docker Compose 配置

### 主编排文件

```yaml
# docker-compose.yml
version: '3.8'

services:
  # 🌐 Nginx 反向代理
  nginx:
    build:
      context: ./docker/nginx
      dockerfile: Dockerfile
    container_name: knzn-nginx
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./docker/nginx/nginx.conf:/etc/nginx/nginx.conf:ro
      - ./docker/nginx/ssl.conf:/etc/nginx/conf.d/ssl.conf:ro
      - ./docker/nginx/cache.conf:/etc/nginx/conf.d/cache.conf:ro
      - nginx_cache:/var/cache/nginx
      - certbot_certs:/etc/letsencrypt
      - certbot_www:/var/www/certbot
    depends_on:
      - app
    restart: unless-stopped
    networks:
      - knzn-network

  # 🚀 Nuxt 4 应用
  app:
    build:
      context: .
      dockerfile: ./docker/app/Dockerfile
      target: production
    container_name: knzn-app
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - NITRO_PORT=3000
      - NITRO_HOST=0.0.0.0
      - DATABASE_URL=postgresql://knzn_user:${DATABASE_PASSWORD}@postgres:5432/knzn_production
      - REDIS_URL=redis://redis:6379
    env_file:
      - .env.production
    depends_on:
      postgres:
        condition: service_healthy
      redis:
        condition: service_started
    restart: unless-stopped
    networks:
      - knzn-network
    # 🔒 安全配置
    security_opt:
      - no-new-privileges:true
    # 📊 资源限制 (Contabo 优化)
    deploy:
      resources:
        limits:
          memory: 1G
          cpus: '1.0'
        reservations:
          memory: 512M
          cpus: '0.5'

  # 🗄️ PostgreSQL 数据库
  postgres:
    image: postgres:15-alpine
    container_name: knzn-postgres
    environment:
      POSTGRES_DB: knzn_production
      POSTGRES_USER: knzn_user
      POSTGRES_PASSWORD: ${DATABASE_PASSWORD}
      POSTGRES_INITDB_ARGS: "--encoding=UTF-8 --lc-collate=C --lc-ctype=C"
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./docker/postgres/init.sql:/docker-entrypoint-initdb.d/init.sql:ro
      - ./docker/postgres/postgresql.conf:/etc/postgresql/postgresql.conf:ro
    ports:
      - "5432:5432"  # 仅用于备份，生产环境可关闭
    restart: unless-stopped
    networks:
      - knzn-network
    # 🏥 健康检查
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U knzn_user -d knzn_production"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 60s
    # 📊 资源限制
    deploy:
      resources:
        limits:
          memory: 512M
          cpus: '0.5'
        reservations:
          memory: 256M
          cpus: '0.25'

  # 🔄 Redis 缓存
  redis:
    image: redis:7-alpine
    container_name: knzn-redis
    command: redis-server --appendonly yes --maxmemory 256mb --maxmemory-policy allkeys-lru
    volumes:
      - redis_data:/data
    ports:
      - "6379:6379"  # 仅用于调试，生产环境可关闭
    restart: unless-stopped
    networks:
      - knzn-network
    # 📊 资源限制
    deploy:
      resources:
        limits:
          memory: 256M
          cpus: '0.25'

  # 🔒 SSL 证书管理
  certbot:
    image: certbot/certbot
    container_name: knzn-certbot
    volumes:
      - certbot_certs:/etc/letsencrypt
      - certbot_www:/var/www/certbot
    command: certonly --webroot --webroot-path=/var/www/certbot --email admin@knzn.net --agree-tos --no-eff-email -d knzn.net -d www.knzn.net
    depends_on:
      - nginx
    profiles:
      - ssl-init  # 仅在初始化时运行

# 📦 数据卷
volumes:
  postgres_data:
    driver: local
  redis_data:
    driver: local
  nginx_cache:
    driver: local
  certbot_certs:
    driver: local
  certbot_www:
    driver: local

# 🌐 网络
networks:
  knzn-network:
    driver: bridge
```

### 生产环境覆盖配置

```yaml
# docker-compose.prod.yml
version: '3.8'

services:
  nginx:
    # 🔒 生产环境安全加固
    security_opt:
      - no-new-privileges:true
    # 📊 日志配置
    logging:
      driver: "json-file"
      options:
        max-size: "10m"
        max-file: "3"

  app:
    # 🚀 生产环境优化
    environment:
      - NODE_ENV=production
      - NUXT_TELEMETRY_DISABLED=1
    # 📊 日志配置
    logging:
      driver: "json-file"
      options:
        max-size: "10m"
        max-file: "3"

  postgres:
    # 🔒 生产环境端口关闭
    ports: []
    # 📊 日志配置
    logging:
      driver: "json-file"
      options:
        max-size: "5m"
        max-file: "3"

  redis:
    # 🔒 生产环境端口关闭
    ports: []
    # 📊 日志配置
    logging:
      driver: "json-file"
      options:
        max-size: "5m"
        max-file: "3"
```

## 🐳 Dockerfile 配置

### Nuxt 4 应用 Dockerfile

```dockerfile
# docker/app/Dockerfile
# 多阶段构建：Build Stage -> Production Stage

# ==========================================
# Build Stage (构建阶段)
# ==========================================
FROM node:20-alpine AS builder

# 🔧 安装构建依赖
RUN apk add --no-cache libc6-compat

# 📁 设置工作目录
WORKDIR /app

# 📦 复制 package 文件
COPY package.json pnpm-lock.yaml ./

# 🚀 安装 pnpm
RUN npm install -g pnpm

# 📥 安装依赖
RUN pnpm install --frozen-lockfile

# 📋 复制源代码
COPY . .

# 🏗️ 构建应用
RUN pnpm run build

# ==========================================
# Production Stage (生产阶段)
# ==========================================
FROM node:20-alpine AS production

# 🔧 安装运行时依赖
RUN apk add --no-cache \
    dumb-init \
    curl \
    && addgroup -g 1001 -S nodejs \
    && adduser -S nuxt -u 1001

# 📁 设置工作目录
WORKDIR /app

# 👤 切换到非 root 用户
USER nuxt

# 📋 从构建阶段复制文件
COPY --from=builder --chown=nuxt:nodejs /app/.output /app/.output
COPY --from=builder --chown=nuxt:nodejs /app/package.json /app/package.json

# 🌐 暴露端口
EXPOSE 3000

# 🔒 设置环境变量
ENV NODE_ENV=production
ENV NITRO_PORT=3000
ENV NITRO_HOST=0.0.0.0

# 🏥 健康检查
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:3000/api/health || exit 1

# 🚀 启动应用
ENTRYPOINT ["dumb-init", "--"]
CMD ["node", ".output/server/index.mjs"]
```

### Nginx Dockerfile

```dockerfile
# docker/nginx/Dockerfile
FROM nginx:1.25-alpine

# 🔧 安装必要工具
RUN apk add --no-cache \
    curl \
    openssl

# 📋 复制配置文件
COPY nginx.conf /etc/nginx/nginx.conf
COPY ssl.conf /etc/nginx/conf.d/ssl.conf
COPY cache.conf /etc/nginx/conf.d/cache.conf

# 📁 创建必要目录
RUN mkdir -p /var/cache/nginx/client_temp \
    && mkdir -p /var/cache/nginx/proxy_temp \
    && mkdir -p /var/cache/nginx/fastcgi_temp \
    && mkdir -p /var/cache/nginx/uwsgi_temp \
    && mkdir -p /var/cache/nginx/scgi_temp

# 🔒 设置权限
RUN chown -R nginx:nginx /var/cache/nginx

# 🌐 暴露端口
EXPOSE 80 443

# 🏥 健康检查
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD curl -f http://localhost/health || exit 1

# 🚀 启动 Nginx
CMD ["nginx", "-g", "daemon off;"]
```

## 🌐 Nginx 配置

### 主配置文件

```nginx
# docker/nginx/nginx.conf
user nginx;
worker_processes auto;
error_log /var/log/nginx/error.log notice;
pid /var/run/nginx.pid;

# 🚀 性能优化
worker_rlimit_nofile 65535;

events {
    worker_connections 4096;
    use epoll;
    multi_accept on;
}

http {
    # 📋 基础配置
    include /etc/nginx/mime.types;
    default_type application/octet-stream;
    
    # 📊 日志格式
    log_format main '$remote_addr - $remote_user [$time_local] "$request" '
                    '$status $body_bytes_sent "$http_referer" '
                    '"$http_user_agent" "$http_x_forwarded_for" '
                    'rt=$request_time uct="$upstream_connect_time" '
                    'uht="$upstream_header_time" urt="$upstream_response_time"';
    
    access_log /var/log/nginx/access.log main;
    
    # 🚀 性能优化
    sendfile on;
    tcp_nopush on;
    tcp_nodelay on;
    keepalive_timeout 65;
    types_hash_max_size 2048;
    client_max_body_size 10M;
    
    # 🗜️ Gzip 压缩
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_proxied any;
    gzip_comp_level 6;
    gzip_types
        text/plain
        text/css
        text/xml
        text/javascript
        application/json
        application/javascript
        application/xml+rss
        application/atom+xml
        image/svg+xml;
    
    # 🔒 安全头
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header Referrer-Policy "no-referrer-when-downgrade" always;
    add_header Content-Security-Policy "default-src 'self' http: https: data: blob: 'unsafe-inline'" always;
    
    # 🔄 上游服务器
    upstream nuxt_app {
        server app:3000;
        keepalive 32;
    }
    
    # 🌐 主服务器配置
    server {
        listen 80;
        server_name knzn.net www.knzn.net;
        
        # 🔒 Let's Encrypt 验证
        location /.well-known/acme-challenge/ {
            root /var/www/certbot;
        }
        
        # 🔄 重定向到 HTTPS
        location / {
            return 301 https://$server_name$request_uri;
        }
    }
    
    # 🔒 HTTPS 服务器配置
    server {
        listen 443 ssl http2;
        server_name knzn.net www.knzn.net;
        
        # 🔐 SSL 证书
        ssl_certificate /etc/letsencrypt/live/knzn.net/fullchain.pem;
        ssl_certificate_key /etc/letsencrypt/live/knzn.net/privkey.pem;
        
        # 🔒 SSL 配置
        include /etc/nginx/conf.d/ssl.conf;
        
        # 📁 静态文件缓存
        include /etc/nginx/conf.d/cache.conf;
        
        # 🏥 健康检查
        location /health {
            access_log off;
            return 200 "healthy\n";
            add_header Content-Type text/plain;
        }
        
        # 🚀 代理到 Nuxt 应用
        location / {
            proxy_pass http://nuxt_app;
            proxy_http_version 1.1;
            proxy_set_header Upgrade $http_upgrade;
            proxy_set_header Connection 'upgrade';
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
            proxy_cache_bypass $http_upgrade;
            
            # ⏱️ 超时配置
            proxy_connect_timeout 60s;
            proxy_send_timeout 60s;
            proxy_read_timeout 60s;
            
            # 📊 缓冲配置
            proxy_buffering on;
            proxy_buffer_size 128k;
            proxy_buffers 4 256k;
            proxy_busy_buffers_size 256k;
        }
    }
}
```

## 🚀 Docker 容器化部署配置

### Docker Compose 配置文件

```yaml
# docker-compose.yml
version: '3.8'

services:
  # Nginx 反向代理
  nginx:
    image: nginx:alpine
    container_name: knzn-nginx
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx/nginx.conf:/etc/nginx/nginx.conf:ro
      - ./nginx/ssl:/etc/nginx/ssl:ro
      - certbot_certs:/etc/letsencrypt
    depends_on:
      - app
    restart: unless-stopped
    networks:
      - knzn-network

  # Nuxt 4 应用
  app:
    image: ghcr.io/your-username/knzn-app:latest
    container_name: knzn-app
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - DATABASE_URL=postgresql://knzn_user:${DATABASE_PASSWORD}@postgres:5432/knzn_production
      - REDIS_URL=redis://redis:6379
    env_file:
      - .env.production
    depends_on:
      - postgres
      - redis
    restart: unless-stopped
    deploy:
      resources:
        limits:
          memory: 4G
          cpus: '2.0'
        reservations:
          memory: 2G
          cpus: '1.0'
    networks:
      - knzn-network

  # PostgreSQL 数据库
  postgres:
    image: postgres:15-alpine
    container_name: knzn-postgres
    environment:
      POSTGRES_DB: knzn_production
      POSTGRES_USER: knzn_user
      POSTGRES_PASSWORD: ${DATABASE_PASSWORD}
    volumes:
      - postgres_data:/var/lib/postgresql/data
    restart: unless-stopped
    deploy:
      resources:
        limits:
          memory: 6G
          cpus: '3.0'
        reservations:
          memory: 3G
          cpus: '2.0'
    networks:
      - knzn-network

  # Redis 缓存
  redis:
    image: redis:7-alpine
    container_name: knzn-redis
    command: redis-server --appendonly yes --maxmemory 1gb --maxmemory-policy allkeys-lru
    volumes:
      - redis_data:/data
    restart: unless-stopped
    deploy:
      resources:
        limits:
          memory: 1G
          cpus: '0.5'
        reservations:
          memory: 512M
          cpus: '0.25'
    networks:
      - knzn-network

volumes:
  postgres_data:
  redis_data:
  certbot_certs:

networks:
  knzn-network:
    driver: bridge
```

### Dockerfile 配置

```dockerfile
# Dockerfile
FROM node:18-alpine AS base

# 安装依赖阶段
FROM base AS deps
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

# 构建阶段
FROM base AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# 运行阶段
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nuxtjs

COPY --from=deps /app/node_modules ./node_modules
COPY --from=builder /app/.output ./.output

USER nuxtjs

EXPOSE 3000

ENV PORT 3000
ENV HOSTNAME "0.0.0.0"

CMD ["node", ".output/server/index.mjs"]
```

### 环境变量配置

```bash
# .env.production
# 🗄️ 数据库配置
DATABASE_URL="postgresql://knzn_user:password@your-vps-ip:5432/knzn_production"
DATABASE_HOST="your-vps-ip"
DATABASE_NAME="knzn_production"
DATABASE_USER="knzn_user"
DATABASE_PASSWORD="your_secure_password"

# 🔐 认证服务
GOOGLE_CLIENT_ID="your_google_client_id"
GOOGLE_CLIENT_SECRET="your_google_client_secret"
GITHUB_CLIENT_ID="your_github_client_id"
GITHUB_CLIENT_SECRET="your_github_client_secret"
BETTER_AUTH_SECRET="your_auth_secret_key"

# 📧 邮件服务
RESEND_API_KEY="re_your_resend_api_key"

# 🤖 AI 服务
OPENAI_API_KEY="sk-your_openai_api_key"

# 📁 文件存储
R2_ACCESS_KEY_ID="your_r2_access_key"
R2_SECRET_ACCESS_KEY="your_r2_secret_key"
CLOUDFLARE_ACCOUNT_ID="your_cloudflare_account_id"
R2_BUCKET_NAME="knzn-assets"

# 💳 支付服务
LEMON_SQUEEZY_API_KEY="your_lemon_squeezy_api_key"
LEMON_SQUEEZY_WEBHOOK_SECRET="your_webhook_secret"

# 🔒 安全配置
INTERNAL_API_KEY="your_internal_api_key"
BACKUP_ENCRYPTION_KEY="your_backup_encryption_key"
JWT_SECRET="your_jwt_secret"

# 🌐 站点配置
SITE_URL="https://knzn.net"
COOKIE_DOMAIN="knzn.net"
```

### 部署脚本

```bash
#!/bin/bash
# deploy.sh - 一键部署脚本

echo "🚀 Starting KNZN deployment..."

# 1. 环境检查
if [ ! -f ".env.production" ]; then
    echo "❌ .env.production file not found!"
    exit 1
fi

# 2. 依赖安装
echo "📦 Installing dependencies..."
pnpm install --frozen-lockfile

# 3. 类型检查
echo "🔍 Type checking..."
pnpm run type-check

# 4. 构建检查
echo "🏗️ Building application..."
pnpm run build

# 5. 数据库迁移 (生产环境)
echo "🗄️ Running database migrations..."
pnpm run db:migrate:prod

# 6. 构建并推送 Docker 镜像
echo "🐳 Building and pushing Docker image..."
docker build -t knzn-app:latest .
docker tag knzn-app:latest ghcr.io/your-username/knzn-app:latest
docker push ghcr.io/your-username/knzn-app:latest

# 7. 部署到 Contabo VPS
echo "🚀 Deploying to Contabo VPS..."
ssh user@your-vps-ip "cd /opt/knzn && docker-compose pull && docker-compose up -d --force-recreate"

# 8. 部署后验证
echo "✅ Verifying deployment..."
curl -f https://knzn.net/api/health || {
    echo "❌ Health check failed!"
    exit 1
}

echo "🎉 Deployment completed successfully!"
echo "🌐 Site: https://knzn.net"
echo "📊 Dashboard: ssh user@your-vps-ip 'docker-compose logs -f'"
```

## 🖥️ VPS 服务器配置

### 服务器初始化脚本

```bash
#!/bin/bash
# vps-setup.sh - VPS 初始化脚本

echo "🖥️ Setting up KNZN VPS server..."

# 1. 系统更新
sudo apt update && sudo apt upgrade -y

# 2. 安装必要软件
sudo apt install -y \
    postgresql-14 \
    postgresql-contrib \
    redis-server \
    nginx \
    certbot \
    python3-certbot-nginx \
    ufw \
    fail2ban \
    htop \
    curl \
    wget \
    git

# 3. 配置防火墙
sudo ufw default deny incoming
sudo ufw default allow outgoing
sudo ufw allow ssh
sudo ufw allow 80
sudo ufw allow 443
sudo ufw allow 22   # SSH 访问
sudo ufw allow 6379  # Redis (本地)
sudo ufw --force enable

# 4. 配置 PostgreSQL
sudo -u postgres psql << EOF
CREATE DATABASE knzn_production;
CREATE USER knzn_user WITH ENCRYPTED PASSWORD '$DATABASE_PASSWORD';
GRANT ALL PRIVILEGES ON DATABASE knzn_production TO knzn_user;
ALTER USER knzn_user CREATEDB;
\q
EOF

# 5. 配置 PostgreSQL 远程访问 (针对 12GB RAM + 6 CPU cores 优化)
sudo tee -a /etc/postgresql/14/main/postgresql.conf << EOF
# KNZN Configuration - 针对 Contabo VPS L (12GB RAM, 6 CPU cores, 100GB NVMe) 优化
listen_addresses = '*'
max_connections = 200
shared_buffers = 3GB                    # 约 25% 的 RAM
effective_cache_size = 8GB              # 约 67% 的 RAM
work_mem = 16MB                         # 适合高并发
maintenance_work_mem = 512MB            # 维护操作内存
checkpoint_completion_target = 0.9      # 平滑检查点
wal_buffers = 16MB                      # WAL 缓冲区
default_statistics_target = 100         # 统计信息精度
random_page_cost = 1.1                  # NVMe SSD 优化
effective_io_concurrency = 200          # 6 CPU cores 并发优化
max_worker_processes = 6                # 匹配 CPU 核心数
max_parallel_workers = 4                # 并行查询工作进程
max_parallel_workers_per_gather = 2     # 每个查询的并行工作进程
EOF

# 6. 配置 PostgreSQL 访问控制
sudo tee -a /etc/postgresql/14/main/pg_hba.conf << EOF
# KNZN Docker 容器访问
host knzn_production knzn_user 172.18.0.0/16 md5
EOF

# 7. 重启服务
sudo systemctl restart postgresql
sudo systemctl enable postgresql
sudo systemctl restart redis-server
sudo systemctl enable redis-server

# 8. 配置备份目录
sudo mkdir -p /var/backups/knzn
sudo chown postgres:postgres /var/backups/knzn

# 9. 安装备份脚本
sudo tee /usr/local/bin/knzn-backup.sh << 'EOF'
#!/bin/bash
# KNZN 数据库备份脚本

BACKUP_DIR="/var/backups/knzn"
DATE=$(date +%Y%m%d_%H%M%S)
DB_NAME="knzn_production"
BACKUP_FILE="knzn_backup_${DATE}.sql"

# 创建备份
pg_dump -h localhost -U knzn_user -d $DB_NAME > $BACKUP_DIR/$BACKUP_FILE

# 压缩备份
gzip $BACKUP_DIR/$BACKUP_FILE

# 上传到 R2 (需要配置 AWS CLI)
aws s3 cp $BACKUP_DIR/${BACKUP_FILE}.gz \
    s3://knzn-backups/database/ \
    --endpoint-url https://$CLOUDFLARE_ACCOUNT_ID.r2.cloudflarestorage.com

# 清理本地备份 (保留 7 天)
find $BACKUP_DIR -name "*.gz" -mtime +7 -delete

echo "Backup completed: ${BACKUP_FILE}.gz"
EOF

sudo chmod +x /usr/local/bin/knzn-backup.sh

# 10. 配置定时备份
sudo crontab -l | { cat; echo "0 2 * * * /usr/local/bin/knzn-backup.sh"; } | sudo crontab -

echo "✅ VPS setup completed!"
echo "🗄️ PostgreSQL: Ready"
echo "🔄 Redis: Ready"
echo "🔒 Firewall: Configured"
echo "💾 Backup: Scheduled"
```

### PostgreSQL 优化配置

```sql
-- postgresql-optimization.sql
-- KNZN PostgreSQL 性能优化

-- 1. 创建必要的索引
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_users_created_at ON users(created_at);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_progress_user_id ON progress(user_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_progress_lesson_id ON progress(lesson_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_progress_status ON progress(status);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_certificates_user_id ON certificates(user_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_community_posts_user_id ON community_posts(user_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_community_posts_status ON community_posts(status);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_community_posts_created_at ON community_posts(created_at);

-- 2. 创建复合索引
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_progress_user_status ON progress(user_id, status);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_posts_status_created ON community_posts(status, created_at DESC);

-- 3. 分析表统计信息
ANALYZE users;
ANALYZE progress;
ANALYZE certificates;
ANALYZE community_posts;
ANALYZE blueprints;

-- 4. 创建视图优化常用查询
CREATE OR REPLACE VIEW user_progress_summary AS
SELECT 
    u.id,
    u.name,
    u.level,
    u.xp,
    COUNT(p.id) as total_lessons,
    COUNT(CASE WHEN p.status = 'completed' THEN 1 END) as completed_lessons,
    COUNT(c.id) as certificates_earned
FROM users u
LEFT JOIN progress p ON u.id = p.user_id
LEFT JOIN certificates c ON u.id = c.user_id
GROUP BY u.id, u.name, u.level, u.xp;

-- 5. 创建排行榜视图
CREATE OR REPLACE VIEW leaderboard AS
SELECT 
    u.id,
    u.name,
    u.avatar_url,
    u.xp,
    u.level,
    COUNT(c.id) as certificates,
    ROW_NUMBER() OVER (ORDER BY u.xp DESC) as rank
FROM users u
LEFT JOIN certificates c ON u.id = c.user_id
WHERE u.xp > 0
GROUP BY u.id, u.name, u.avatar_url, u.xp, u.level
ORDER BY u.xp DESC
LIMIT 100;
```

## 📁 Cloudflare R2 存储配置

### R2 存储桶设置

```bash
#!/bin/bash
# r2-setup.sh - Cloudflare R2 配置脚本

# 1. 安装 AWS CLI (用于 R2 操作)
curl "https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip" -o "awscliv2.zip"
unzip awscliv2.zip
sudo ./aws/install

# 2. 配置 R2 凭据
aws configure set aws_access_key_id $R2_ACCESS_KEY_ID
aws configure set aws_secret_access_key $R2_SECRET_ACCESS_KEY
aws configure set region auto

# 3. 创建存储桶
aws s3 mb s3://knzn-assets \
    --endpoint-url https://$CLOUDFLARE_ACCOUNT_ID.r2.cloudflarestorage.com

aws s3 mb s3://knzn-backups \
    --endpoint-url https://$CLOUDFLARE_ACCOUNT_ID.r2.cloudflarestorage.com

# 4. 配置 CORS
aws s3api put-bucket-cors \
    --bucket knzn-assets \
    --cors-configuration file://r2-cors.json \
    --endpoint-url https://$CLOUDFLARE_ACCOUNT_ID.r2.cloudflarestorage.com

echo "✅ R2 storage configured!"
```

```json
// r2-cors.json
{
  "CORSRules": [
    {
      "AllowedHeaders": ["*"],
      "AllowedMethods": ["GET", "PUT", "POST", "DELETE"],
      "AllowedOrigins": [
        "https://knzn.net",
        "https://*.knzn.net",
        "http://localhost:3000"
      ],
      "ExposeHeaders": ["ETag"],
      "MaxAgeSeconds": 3600
    }
  ]
}
```

### 文件管理 API

```typescript
// server/api/storage/manage.post.ts
import { S3Client, ListObjectsV2Command, DeleteObjectCommand } from '@aws-sdk/client-s3'

const r2Client = new S3Client({
  region: 'auto',
  endpoint: `https://${process.env.CLOUDFLARE_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID!,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
  },
})

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const { action, path, bucket = 'knzn-assets' } = body
  
  // 🔐 验证管理员权限
  const session = await getUserSession(event)
  if (!session?.user?.adminRole) {
    throw createError({
      statusCode: 403,
      statusMessage: 'Admin access required'
    })
  }
  
  try {
    switch (action) {
      case 'list':
        return await listFiles(bucket, path)
      case 'delete':
        return await deleteFile(bucket, path)
      case 'cleanup':
        return await cleanupOrphanFiles(bucket)
      default:
        throw createError({
          statusCode: 400,
          statusMessage: 'Invalid action'
        })
    }
  } catch (error) {
    throw createError({
      statusCode: 500,
      statusMessage: 'Storage operation failed'
    })
  }
})

// 📋 列出文件
const listFiles = async (bucket: string, prefix?: string) => {
  const command = new ListObjectsV2Command({
    Bucket: bucket,
    Prefix: prefix,
    MaxKeys: 1000
  })
  
  const response = await r2Client.send(command)
  
  return {
    files: response.Contents?.map(obj => ({
      key: obj.Key,
      size: obj.Size,
      lastModified: obj.LastModified,
      url: `https://assets.knzn.net/${obj.Key}`
    })) || [],
    totalSize: response.Contents?.reduce((sum, obj) => sum + (obj.Size || 0), 0) || 0
  }
}

// 🗑️ 删除文件
const deleteFile = async (bucket: string, key: string) => {
  const command = new DeleteObjectCommand({
    Bucket: bucket,
    Key: key
  })
  
  await r2Client.send(command)
  
  return { success: true, deletedKey: key }
}

// 🧹 清理孤儿文件
const cleanupOrphanFiles = async (bucket: string) => {
  // 1. 获取所有文件
  const { files } = await listFiles(bucket, 'uploads/')
  
  // 2. 查询数据库中引用的文件
  const referencedFiles = await db.select({ url: blueprints.coverImage })
    .from(blueprints)
    .where(isNotNull(blueprints.coverImage))
  
  const referencedKeys = new Set(
    referencedFiles
      .map(f => f.url?.replace('https://assets.knzn.net/', ''))
      .filter(Boolean)
  )
  
  // 3. 找出孤儿文件 (超过 7 天且未被引用)
  const orphanFiles = files.filter(file => {
    const isOld = file.lastModified && 
      (Date.now() - new Date(file.lastModified).getTime()) > 7 * 24 * 60 * 60 * 1000
    const isOrphan = !referencedKeys.has(file.key!)
    return isOld && isOrphan
  })
  
  // 4. 删除孤儿文件
  const deletedFiles = []
  for (const file of orphanFiles) {
    if (file.key) {
      await deleteFile(bucket, file.key)
      deletedFiles.push(file.key)
    }
  }
  
  return {
    deletedCount: deletedFiles.length,
    deletedFiles,
    freedSpace: orphanFiles.reduce((sum, f) => sum + (f.size || 0), 0)
  }
}
```
## 📧 Resend 邮件服务配置

### DNS 配置

```bash
# DNS 记录配置 (在域名提供商处设置)

# SPF 记录 (TXT)
knzn.net. IN TXT "v=spf1 include:_spf.resend.com ~all"

# DKIM 记录 (CNAME)
resend._domainkey.knzn.net. IN CNAME resend._domainkey.resend.com.

# DMARC 记录 (TXT)
_dmarc.knzn.net. IN TXT "v=DMARC1; p=quarantine; rua=mailto:dmarc@knzn.net; ruf=mailto:dmarc@knzn.net; fo=1"

# MX 记录 (用于接收邮件，可选)
knzn.net. IN MX 10 mx1.resend.com.
knzn.net. IN MX 20 mx2.resend.com.
```

### 邮件监控系统

```typescript
// server/api/admin/email/stats.get.ts
export default defineEventHandler(async (event) => {
  // 🔐 验证管理员权限
  const admin = await getAdminUser(event)
  if (!admin) {
    throw createError({ statusCode: 403, statusMessage: 'Admin access required' })
  }
  
  try {
    // 📊 获取 Resend 统计数据
    const response = await fetch('https://api.resend.com/emails', {
      headers: {
        'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
        'Content-Type': 'application/json'
      }
    })
    
    if (!response.ok) {
      throw new Error('Failed to fetch email stats')
    }
    
    const emailData = await response.json()
    
    // 📈 计算统计指标
    const stats = {
      totalSent: emailData.data?.length || 0,
      deliveryRate: calculateDeliveryRate(emailData.data),
      bounceRate: calculateBounceRate(emailData.data),
      openRate: calculateOpenRate(emailData.data),
      recentEmails: emailData.data?.slice(0, 10) || []
    }
    
    return stats
  } catch (error) {
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to fetch email statistics'
    })
  }
})

const calculateDeliveryRate = (emails: any[]) => {
  if (!emails.length) return 0
  const delivered = emails.filter(email => email.last_event === 'delivered').length
  return (delivered / emails.length * 100).toFixed(2)
}

const calculateBounceRate = (emails: any[]) => {
  if (!emails.length) return 0
  const bounced = emails.filter(email => email.last_event === 'bounced').length
  return (bounced / emails.length * 100).toFixed(2)
}

const calculateOpenRate = (emails: any[]) => {
  if (!emails.length) return 0
  const opened = emails.filter(email => email.last_event === 'opened').length
  return (opened / emails.length * 100).toFixed(2)
}
```

## 🔄 自动化备份系统

### 增强备份脚本

```bash
#!/bin/bash
# /usr/local/bin/knzn-backup-enhanced.sh
# KNZN 增强备份脚本

set -e  # 遇到错误立即退出

# 📋 配置变量
BACKUP_DIR="/var/backups/knzn"
LOG_FILE="/var/log/knzn-backup.log"
DATE=$(date +%Y%m%d_%H%M%S)
DB_NAME="knzn_production"
BACKUP_FILE="knzn_backup_${DATE}.sql"
ENCRYPTED_FILE="${BACKUP_FILE}.gz.enc"
RETENTION_DAYS=30

# 📝 日志函数
log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1" | tee -a $LOG_FILE
}

# 🚨 错误处理
error_exit() {
    log "ERROR: $1"
    # 发送告警邮件
    curl -X POST "https://knzn.net/api/admin/alerts/backup-failed" \
        -H "Content-Type: application/json" \
        -H "X-API-Key: $INTERNAL_API_KEY" \
        -d "{\"error\": \"$1\", \"timestamp\": \"$(date -Iseconds)\"}"
    exit 1
}

log "Starting KNZN database backup..."

# 🗂️ 创建备份目录
mkdir -p $BACKUP_DIR || error_exit "Failed to create backup directory"

# 🗄️ 数据库备份
log "Creating database dump..."
pg_dump -h localhost -U knzn_user -d $DB_NAME > $BACKUP_DIR/$BACKUP_FILE || error_exit "Database dump failed"

# 📏 检查备份文件大小
BACKUP_SIZE=$(stat -c%s "$BACKUP_DIR/$BACKUP_FILE")
if [ $BACKUP_SIZE -lt 1000 ]; then
    error_exit "Backup file too small: ${BACKUP_SIZE} bytes"
fi

log "Database dump completed: ${BACKUP_SIZE} bytes"

# 🗜️ 压缩备份
log "Compressing backup..."
gzip $BACKUP_DIR/$BACKUP_FILE || error_exit "Compression failed"

# 🔐 加密备份
log "Encrypting backup..."
openssl enc -aes-256-cbc -salt \
    -in $BACKUP_DIR/${BACKUP_FILE}.gz \
    -out $BACKUP_DIR/$ENCRYPTED_FILE \
    -k $BACKUP_ENCRYPTION_KEY || error_exit "Encryption failed"

# 📤 上传到 R2
log "Uploading to Cloudflare R2..."
aws s3 cp $BACKUP_DIR/$ENCRYPTED_FILE \
    s3://knzn-backups/database/$ENCRYPTED_FILE \
    --endpoint-url https://$CLOUDFLARE_ACCOUNT_ID.r2.cloudflarestorage.com || error_exit "Upload to R2 failed"

# ✅ 验证上传
aws s3 ls s3://knzn-backups/database/$ENCRYPTED_FILE \
    --endpoint-url https://$CLOUDFLARE_ACCOUNT_ID.r2.cloudflarestorage.com > /dev/null || error_exit "Upload verification failed"

log "Backup uploaded successfully: $ENCRYPTED_FILE"

# 🧹 清理本地文件
rm -f $BACKUP_DIR/${BACKUP_FILE}.gz
rm -f $BACKUP_DIR/$ENCRYPTED_FILE

# 🗑️ 清理旧备份 (保留30天)
log "Cleaning up old backups..."
CUTOFF_DATE=$(date -d "$RETENTION_DAYS days ago" +%Y%m%d)

aws s3 ls s3://knzn-backups/database/ \
    --endpoint-url https://$CLOUDFLARE_ACCOUNT_ID.r2.cloudflarestorage.com \
    | awk -v cutoff="$CUTOFF_DATE" '$1 < cutoff {print $4}' \
    | while read -r old_backup; do
        if [ -n "$old_backup" ]; then
            aws s3 rm s3://knzn-backups/database/$old_backup \
                --endpoint-url https://$CLOUDFLARE_ACCOUNT_ID.r2.cloudflarestorage.com
            log "Deleted old backup: $old_backup"
        fi
    done

# 📊 记录备份统计
FINAL_SIZE=$(aws s3api head-object \
    --bucket knzn-backups \
    --key database/$ENCRYPTED_FILE \
    --endpoint-url https://$CLOUDFLARE_ACCOUNT_ID.r2.cloudflarestorage.com \
    --query ContentLength --output text)

log "Backup completed successfully!"
log "Final encrypted size: $FINAL_SIZE bytes"
log "Compression ratio: $(echo "scale=2; $FINAL_SIZE * 100 / $BACKUP_SIZE" | bc)%"

# 📈 发送成功通知
curl -X POST "https://knzn.net/api/admin/alerts/backup-success" \
    -H "Content-Type: application/json" \
    -H "X-API-Key: $INTERNAL_API_KEY" \
    -d "{
        \"backup_file\": \"$ENCRYPTED_FILE\",
        \"original_size\": $BACKUP_SIZE,
        \"compressed_size\": $FINAL_SIZE,
        \"timestamp\": \"$(date -Iseconds)\"
    }"

log "Backup process completed successfully!"
```

### 备份恢复脚本

```bash
#!/bin/bash
# /usr/local/bin/knzn-restore.sh
# KNZN 数据库恢复脚本

set -e

# 📋 配置
RESTORE_DIR="/tmp/knzn-restore"
LOG_FILE="/var/log/knzn-restore.log"
DB_NAME="knzn_production"

# 📝 日志函数
log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1" | tee -a $LOG_FILE
}

# 🚨 错误处理
error_exit() {
    log "ERROR: $1"
    exit 1
}

# 📥 参数检查
if [ $# -ne 1 ]; then
    echo "Usage: $0 <backup_filename>"
    echo "Example: $0 knzn_backup_20241223_020000.sql.gz.enc"
    exit 1
fi

BACKUP_FILE=$1

log "Starting database restore from: $BACKUP_FILE"

# ⚠️ 安全确认
echo "⚠️  WARNING: This will REPLACE the current database!"
echo "Database: $DB_NAME"
echo "Backup file: $BACKUP_FILE"
echo ""
read -p "Are you sure you want to continue? (type 'YES' to confirm): " CONFIRM

if [ "$CONFIRM" != "YES" ]; then
    log "Restore cancelled by user"
    exit 0
fi

# 🗂️ 创建恢复目录
mkdir -p $RESTORE_DIR || error_exit "Failed to create restore directory"

# 📥 下载备份文件
log "Downloading backup from R2..."
aws s3 cp s3://knzn-backups/database/$BACKUP_FILE \
    $RESTORE_DIR/$BACKUP_FILE \
    --endpoint-url https://$CLOUDFLARE_ACCOUNT_ID.r2.cloudflarestorage.com || error_exit "Download failed"

# 🔓 解密备份
log "Decrypting backup..."
openssl enc -aes-256-cbc -d \
    -in $RESTORE_DIR/$BACKUP_FILE \
    -out $RESTORE_DIR/restore.sql.gz \
    -k $BACKUP_ENCRYPTION_KEY || error_exit "Decryption failed"

# 🗜️ 解压备份
log "Decompressing backup..."
gunzip $RESTORE_DIR/restore.sql.gz || error_exit "Decompression failed"

# 💾 创建当前数据库备份 (安全措施)
log "Creating safety backup of current database..."
SAFETY_BACKUP="safety_backup_$(date +%Y%m%d_%H%M%S).sql"
pg_dump -h localhost -U knzn_user -d $DB_NAME > $RESTORE_DIR/$SAFETY_BACKUP || error_exit "Safety backup failed"

log "Safety backup created: $SAFETY_BACKUP"

# 🔄 停止应用连接 (可选)
log "Terminating active connections..."
sudo -u postgres psql -c "
    SELECT pg_terminate_backend(pid) 
    FROM pg_stat_activity 
    WHERE datname = '$DB_NAME' AND pid <> pg_backend_pid();
"

# 🗄️ 恢复数据库
log "Restoring database..."
sudo -u postgres psql -c "DROP DATABASE IF EXISTS ${DB_NAME}_old;"
sudo -u postgres psql -c "ALTER DATABASE $DB_NAME RENAME TO ${DB_NAME}_old;"
sudo -u postgres psql -c "CREATE DATABASE $DB_NAME OWNER knzn_user;"

psql -h localhost -U knzn_user -d $DB_NAME < $RESTORE_DIR/restore.sql || {
    log "Restore failed! Rolling back..."
    sudo -u postgres psql -c "DROP DATABASE $DB_NAME;"
    sudo -u postgres psql -c "ALTER DATABASE ${DB_NAME}_old RENAME TO $DB_NAME;"
    error_exit "Database restore failed and rolled back"
}

# ✅ 验证恢复
log "Verifying restore..."
TABLE_COUNT=$(psql -h localhost -U knzn_user -d $DB_NAME -t -c "
    SELECT COUNT(*) FROM information_schema.tables 
    WHERE table_schema = 'public';
")

if [ "$TABLE_COUNT" -lt 5 ]; then
    error_exit "Restore verification failed: insufficient tables ($TABLE_COUNT)"
fi

log "Restore verification passed: $TABLE_COUNT tables found"

# 🧹 清理
log "Cleaning up..."
rm -rf $RESTORE_DIR

# 🗑️ 删除旧数据库
sudo -u postgres psql -c "DROP DATABASE ${DB_NAME}_old;"

log "Database restore completed successfully!"
log "Restored from: $BACKUP_FILE"
log "Tables restored: $TABLE_COUNT"

# 📈 发送恢复通知
curl -X POST "https://knzn.net/api/admin/alerts/restore-success" \
    -H "Content-Type: application/json" \
    -H "X-API-Key: $INTERNAL_API_KEY" \
    -d "{
        \"backup_file\": \"$BACKUP_FILE\",
        \"tables_restored\": $TABLE_COUNT,
        \"timestamp\": \"$(date -Iseconds)\"
    }"

echo "✅ Database restore completed successfully!"
```

## 📊 监控与告警系统

### 系统监控脚本

```bash
#!/bin/bash
# /usr/local/bin/knzn-monitor.sh
# KNZN 系统监控脚本

# 📋 配置
ALERT_ENDPOINT="https://knzn.net/api/admin/alerts/system"
LOG_FILE="/var/log/knzn-monitor.log"

# 📝 日志函数
log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1" | tee -a $LOG_FILE
}

# 🚨 发送告警
send_alert() {
    local severity=$1
    local message=$2
    local metric=$3
    local value=$4
    
    curl -X POST $ALERT_ENDPOINT \
        -H "Content-Type: application/json" \
        -H "X-API-Key: $INTERNAL_API_KEY" \
        -d "{
            \"severity\": \"$severity\",
            \"message\": \"$message\",
            \"metric\": \"$metric\",
            \"value\": \"$value\",
            \"timestamp\": \"$(date -Iseconds)\",
            \"hostname\": \"$(hostname)\"
        }" || log "Failed to send alert: $message"
}

log "Starting system monitoring check..."

# 💾 检查磁盘使用率
DISK_USAGE=$(df / | awk 'NR==2 {print $5}' | sed 's/%//')
if [ $DISK_USAGE -gt 85 ]; then
    send_alert "critical" "Disk usage critical: ${DISK_USAGE}%" "disk_usage" "$DISK_USAGE"
elif [ $DISK_USAGE -gt 75 ]; then
    send_alert "warning" "Disk usage high: ${DISK_USAGE}%" "disk_usage" "$DISK_USAGE"
fi

# 🧠 检查内存使用率
MEMORY_USAGE=$(free | awk 'NR==2{printf "%.0f", $3*100/$2}')
if [ $MEMORY_USAGE -gt 90 ]; then
    send_alert "critical" "Memory usage critical: ${MEMORY_USAGE}%" "memory_usage" "$MEMORY_USAGE"
elif [ $MEMORY_USAGE -gt 80 ]; then
    send_alert "warning" "Memory usage high: ${MEMORY_USAGE}%" "memory_usage" "$MEMORY_USAGE"
fi

# 🔄 检查 PostgreSQL 状态
if ! systemctl is-active --quiet postgresql; then
    send_alert "critical" "PostgreSQL service is down" "postgresql_status" "down"
else
    # 检查数据库连接
    if ! sudo -u postgres psql -d knzn_production -c "SELECT 1;" > /dev/null 2>&1; then
        send_alert "critical" "PostgreSQL connection failed" "postgresql_connection" "failed"
    fi
    
    # 检查数据库大小
    DB_SIZE=$(sudo -u postgres psql -d knzn_production -t -c "
        SELECT pg_size_pretty(pg_database_size('knzn_production'));
    " | xargs)
    log "Database size: $DB_SIZE"
fi

# 🔄 检查 Redis 状态
if ! systemctl is-active --quiet redis-server; then
    send_alert "critical" "Redis service is down" "redis_status" "down"
else
    # 检查 Redis 连接
    if ! redis-cli ping > /dev/null 2>&1; then
        send_alert "critical" "Redis connection failed" "redis_connection" "failed"
    fi
fi

# 🌐 检查网络连接
if ! curl -f -s https://knzn.net/api/health > /dev/null; then
    send_alert "critical" "Website health check failed" "website_health" "failed"
fi

# 🔒 检查 SSL 证书 (如果使用自签名)
if command -v openssl > /dev/null; then
    SSL_EXPIRY=$(echo | openssl s_client -servername knzn.net -connect knzn.net:443 2>/dev/null | openssl x509 -noout -dates | grep notAfter | cut -d= -f2)
    SSL_EXPIRY_EPOCH=$(date -d "$SSL_EXPIRY" +%s)
    CURRENT_EPOCH=$(date +%s)
    DAYS_UNTIL_EXPIRY=$(( (SSL_EXPIRY_EPOCH - CURRENT_EPOCH) / 86400 ))
    
    if [ $DAYS_UNTIL_EXPIRY -lt 7 ]; then
        send_alert "critical" "SSL certificate expires in $DAYS_UNTIL_EXPIRY days" "ssl_expiry" "$DAYS_UNTIL_EXPIRY"
    elif [ $DAYS_UNTIL_EXPIRY -lt 30 ]; then
        send_alert "warning" "SSL certificate expires in $DAYS_UNTIL_EXPIRY days" "ssl_expiry" "$DAYS_UNTIL_EXPIRY"
    fi
fi

log "System monitoring check completed"
```

### 告警处理 API

```typescript
// server/api/admin/alerts/[type].post.ts
export default defineEventHandler(async (event) => {
  const alertType = getRouterParam(event, 'type')
  const body = await readBody(event)
  
  // 🔐 验证 API 密钥
  const apiKey = getHeader(event, 'x-api-key')
  if (apiKey !== process.env.INTERNAL_API_KEY) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Invalid API key'
    })
  }
  
  try {
    // 📝 记录告警到数据库
    await db.insert(systemAlerts).values({
      id: nanoid(),
      type: alertType,
      severity: body.severity || 'info',
      message: body.message,
      metadata: body,
      createdAt: new Date()
    })
    
    // 🚨 处理不同类型的告警
    switch (alertType) {
      case 'backup-failed':
        await handleBackupFailure(body)
        break
      case 'backup-success':
        await handleBackupSuccess(body)
        break
      case 'system':
        await handleSystemAlert(body)
        break
      case 'restore-success':
        await handleRestoreSuccess(body)
        break
    }
    
    return { success: true, alertId: nanoid() }
  } catch (error) {
    console.error('Alert processing error:', error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Alert processing failed'
    })
  }
})

// 💾 备份失败处理
const handleBackupFailure = async (alert: any) => {
  // 📧 发送紧急邮件通知
  await sendEmail({
    to: 'admin@knzn.net',
    template: 'backup-failure-alert',
    data: {
      error: alert.error,
      timestamp: alert.timestamp,
      hostname: alert.hostname || 'unknown'
    }
  })
  
  // 📱 发送 Slack 通知 (如果配置)
  if (process.env.SLACK_WEBHOOK_URL) {
    await fetch(process.env.SLACK_WEBHOOK_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        text: `🚨 KNZN Backup Failed: ${alert.error}`,
        channel: '#alerts',
        username: 'KNZN Monitor'
      })
    })
  }
}

// ✅ 备份成功处理
const handleBackupSuccess = async (alert: any) => {
  // 📊 更新备份统计
  await db.insert(backupStats).values({
    id: nanoid(),
    backupFile: alert.backup_file,
    originalSize: alert.original_size,
    compressedSize: alert.compressed_size,
    compressionRatio: (alert.compressed_size / alert.original_size * 100).toFixed(2),
    createdAt: new Date()
  })
}

// 🖥️ 系统告警处理
const handleSystemAlert = async (alert: any) => {
  const { severity, message, metric, value } = alert
  
  // 🚨 严重告警立即通知
  if (severity === 'critical') {
    await sendEmail({
      to: 'admin@knzn.net',
      template: 'system-critical-alert',
      data: {
        message,
        metric,
        value,
        timestamp: alert.timestamp,
        hostname: alert.hostname
      }
    })
  }
  
  // 📊 记录指标历史
  await db.insert(systemMetrics).values({
    id: nanoid(),
    metric,
    value: parseFloat(value) || 0,
    severity,
    createdAt: new Date()
  })
}
```

## 💰 成本优化策略

### 月度成本分析

```typescript
// 成本预算分析
const MONTHLY_COSTS = {
  // 🖥️ 基础设施成本
  infrastructure: {
    contabo: {
      plan: 'VPS L',
      specs: '12GB RAM, 6 CPU cores, 100GB NVMe',
      cost: 13,
      description: '完全私有化部署'
    },
      description: '无限带宽，边缘函数，分析'
    },
    vps: {
      provider: 'DigitalOcean Droplet',
      specs: '2GB RAM, 1 vCPU, 50GB SSD',
      cost: 12,
      description: 'PostgreSQL + Redis 服务器'
    },
    cloudflareR2: {
      storage: '50GB',
      requests: '1M/月',
      cost: 8,
      description: '文件存储 + CDN'
    }
  },
  
  // 🛠️ 第三方服务成本
  services: {
    resend: {
      plan: 'Pro',
      emails: '100K/月',
      cost: 20,
      description: '邮件发送服务'
    },
    openai: {
      model: 'gpt-4o-mini',
      tokens: '10M tokens/月',
      cost: 15,
      description: 'AI 助教服务'
    },
    lemonSqueezy: {
      commission: '5% + $0.50 per transaction',
      cost: 0, // 从收入中扣除
      description: '支付处理费用'
    }
  },
  
  // 📊 总成本
  totalMonthlyCost: 75, // $75/月
  
  // 🎯 收入目标
  revenueTarget: {
    proUsers: 1000,
    pricePerUser: 9.99,
    monthlyRevenue: 9990,
    netProfit: 9915, // 99.2% 利润率
    profitMargin: '99.2%'
  },
  
  // 📈 扩展成本 (10K 用户)
  scalingCosts: {
    contabo: 26, // 升级到 VPS XL (16GB RAM, 8 CPU cores)
    vps: 0, // 不再需要单独的数据库 VPS
    r2: 25, // 200GB 存储
    resend: 40, // 500K 邮件
    openai: 50, // 50M tokens
    total: 159 // $159/月
  }
}
```

### 成本监控 API

```typescript
// server/api/admin/costs/analysis.get.ts
export default defineEventHandler(async (event) => {
  const admin = await getAdminUser(event)
  if (!admin) {
    throw createError({ statusCode: 403, statusMessage: 'Admin access required' })
  }
  
  const currentMonth = new Date().toISOString().slice(0, 7) // YYYY-MM
  
  try {
    // 📊 计算各项成本
    const costs = {
      // 🗄️ 数据库存储成本
      database: await calculateDatabaseCosts(),
      
      // 📁 文件存储成本
      storage: await calculateStorageCosts(),
      
      // 📧 邮件发送成本
      email: await calculateEmailCosts(currentMonth),
      
      // 🤖 AI 使用成本
      ai: await calculateAICosts(currentMonth),
      
      // 💳 支付处理成本
      payment: await calculatePaymentCosts(currentMonth)
    }
    
    // 📈 计算总成本和利润率
    const totalCosts = Object.values(costs).reduce((sum, cost) => sum + cost.amount, 0)
    const revenue = await calculateMonthlyRevenue(currentMonth)
    const profitMargin = revenue > 0 ? ((revenue - totalCosts) / revenue * 100).toFixed(2) : 0
    
    return {
      costs,
      totalCosts,
      revenue,
      profit: revenue - totalCosts,
      profitMargin: `${profitMargin}%`,
      month: currentMonth
    }
  } catch (error) {
    throw createError({
      statusCode: 500,
      statusMessage: 'Cost analysis failed'
    })
  }
})

// 💾 数据库成本计算
const calculateDatabaseCosts = async () => {
  const dbSize = await db.execute(sql`
    SELECT pg_size_pretty(pg_database_size('knzn_production')) as size,
           pg_database_size('knzn_production') as bytes
  `)
  
  const sizeGB = dbSize[0].bytes / (1024 * 1024 * 1024)
  const monthlyCost = sizeGB > 50 ? 12 + (sizeGB - 50) * 0.1 : 12 // 基础 $12，超出 50GB 每 GB $0.1
  
  return {
    amount: monthlyCost,
    details: {
      size: dbSize[0].size,
      sizeGB: sizeGB.toFixed(2),
      baseCost: 12,
      overageCost: Math.max(0, (sizeGB - 50) * 0.1)
    }
  }
}

// 📁 存储成本计算
const calculateStorageCosts = async () => {
  // 通过 R2 API 获取存储使用量
  const storageUsage = await fetch(`https://api.cloudflare.com/client/v4/accounts/${process.env.CLOUDFLARE_ACCOUNT_ID}/r2/buckets/knzn-assets/usage`, {
    headers: {
      'Authorization': `Bearer ${process.env.CLOUDFLARE_API_TOKEN}`,
      'Content-Type': 'application/json'
    }
  }).then(res => res.json())
  
  const storageGB = storageUsage.result?.storage_bytes / (1024 * 1024 * 1024) || 0
  const requestCount = storageUsage.result?.requests || 0
  
  const storageCost = storageGB * 0.015 // $0.015 per GB
  const requestCost = requestCount * 0.0000004 // $0.0000004 per request
  
  return {
    amount: storageCost + requestCost,
    details: {
      storageGB: storageGB.toFixed(2),
      requestCount,
      storageCost: storageCost.toFixed(4),
      requestCost: requestCost.toFixed(4)
    }
  }
}
```

---

**文档版本**: v2.0 - KNZN 专用版  
**最后更新**: 2024-12-23  
**适用项目**: KNZN 硬件学习平台  
**部署策略**: Contabo VPS 单机容器化集群

这份运维指南专为 Contabo VPS 的单机容器化部署设计，通过 Docker Compose 编排实现完整的应用栈，相比 Vercel 混合方案进一步降低了成本，同时保持了高可用性和易维护性。
### SSL 配置文件

```nginx
# docker/nginx/ssl.conf
# 🔒 SSL 安全配置

ssl_protocols TLSv1.2 TLSv1.3;
ssl_ciphers ECDHE-RSA-AES128-GCM-SHA256:ECDHE-RSA-AES256-GCM-SHA384:ECDHE-RSA-AES128-SHA256:ECDHE-RSA-AES256-SHA384:ECDHE-RSA-AES128-SHA:ECDHE-RSA-AES256-SHA:DHE-RSA-AES128-SHA256:DHE-RSA-AES256-SHA256:DHE-RSA-AES128-SHA:DHE-RSA-AES256-SHA:!aNULL:!eNULL:!EXPORT:!DES:!RC4:!MD5:!PSK:!SRP:!CAMELLIA;
ssl_prefer_server_ciphers off;

# 🔐 SSL 会话配置
ssl_session_cache shared:SSL:10m;
ssl_session_timeout 10m;
ssl_session_tickets off;

# 🔒 HSTS (HTTP Strict Transport Security)
add_header Strict-Transport-Security "max-age=63072000; includeSubDomains; preload" always;

# 🔐 OCSP Stapling
ssl_stapling on;
ssl_stapling_verify on;
ssl_trusted_certificate /etc/letsencrypt/live/knzn.net/chain.pem;
resolver 8.8.8.8 8.8.4.4 valid=300s;
resolver_timeout 5s;
```

### 缓存配置文件

```nginx
# docker/nginx/cache.conf
# 📁 静态资源缓存配置 (替代 Vercel Edge 功能)

# 🖼️ 图片缓存 (1年)
location ~* \.(jpg|jpeg|png|gif|ico|svg|webp|avif)$ {
    expires 1y;
    add_header Cache-Control "public, immutable";
    add_header Vary "Accept-Encoding";
    
    # 🗜️ 压缩
    gzip_static on;
    
    # 📊 访问日志关闭
    access_log off;
}

# 🎨 CSS/JS 缓存 (1年，带版本号)
location ~* \.(css|js|mjs)$ {
    expires 1y;
    add_header Cache-Control "public, immutable";
    add_header Vary "Accept-Encoding";
    
    # 🗜️ 压缩
    gzip_static on;
    
    # 📊 访问日志关闭
    access_log off;
}

# 🎬 媒体文件缓存 (1个月)
location ~* \.(mp4|webm|ogg|mp3|wav|flac|aac)$ {
    expires 1M;
    add_header Cache-Control "public";
    add_header Vary "Accept-Encoding";
    
    # 📊 访问日志关闭
    access_log off;
}

# 📄 字体文件缓存 (1年)
location ~* \.(woff|woff2|ttf|eot)$ {
    expires 1y;
    add_header Cache-Control "public, immutable";
    add_header Access-Control-Allow-Origin "*";
    
    # 📊 访问日志关闭
    access_log off;
}

# 🔄 API 缓存 (短期)
location /api/ {
    # 🚫 禁用缓存 (动态内容)
    add_header Cache-Control "no-cache, no-store, must-revalidate";
    add_header Pragma "no-cache";
    add_header Expires "0";
    
    # 🚀 代理到应用
    proxy_pass http://nuxt_app;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection 'upgrade';
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
    proxy_cache_bypass $http_upgrade;
}

# 📄 HTML 缓存 (短期)
location ~* \.html$ {
    expires 5m;
    add_header Cache-Control "public, must-revalidate";
    add_header Vary "Accept-Encoding";
}
```

## 🚀 CI/CD 自动化部署

### GitHub Actions 工作流

```yaml
# .github/workflows/deploy.yml
name: Deploy to Contabo VPS

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

env:
  REGISTRY: ghcr.io
  IMAGE_NAME: knzn-app

jobs:
  # 🧪 测试阶段
  test:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout code
        uses: actions/checkout@v4
      
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
      
      - name: Install pnpm
        run: npm install -g pnpm
      
      - name: Install dependencies
        run: pnpm install --frozen-lockfile
      
      - name: Run type check
        run: pnpm run type-check
      
      - name: Run linting
        run: pnpm run lint
      
      - name: Run tests
        run: pnpm run test

  # 🏗️ 构建阶段
  build:
    needs: test
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    
    permissions:
      contents: read
      packages: write
    
    steps:
      - name: Checkout code
        uses: actions/checkout@v4
      
      - name: Log in to Container Registry
        uses: docker/login-action@v3
        with:
          registry: ${{ env.REGISTRY }}
          username: ${{ github.actor }}
          password: ${{ secrets.GITHUB_TOKEN }}
      
      - name: Extract metadata
        id: meta
        uses: docker/metadata-action@v5
        with:
          images: ${{ env.REGISTRY }}/${{ github.repository }}/${{ env.IMAGE_NAME }}
          tags: |
            type=ref,event=branch
            type=ref,event=pr
            type=sha,prefix={{branch}}-
            type=raw,value=latest,enable={{is_default_branch}}
      
      - name: Build and push Docker image
        uses: docker/build-push-action@v5
        with:
          context: .
          file: ./docker/app/Dockerfile
          push: true
          tags: ${{ steps.meta.outputs.tags }}
          labels: ${{ steps.meta.outputs.labels }}
          target: production

  # 🚀 部署阶段
  deploy:
    needs: build
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    
    steps:
      - name: Deploy to Contabo VPS
        uses: appleboy/ssh-action@v1.0.0
        with:
          host: ${{ secrets.VPS_HOST }}
          username: ${{ secrets.VPS_USER }}
          key: ${{ secrets.VPS_SSH_KEY }}
          script: |
            # 🔄 更新代码
            cd /opt/knzn
            git pull origin main
            
            # 🐳 登录到 GitHub Container Registry
            echo ${{ secrets.GITHUB_TOKEN }} | docker login ghcr.io -u ${{ github.actor }} --password-stdin
            
            # 📥 拉取最新镜像
            docker-compose -f docker-compose.yml -f docker-compose.prod.yml pull app
            
            # 🔄 重启服务
            docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d app
            
            # 🧹 清理旧镜像
            docker image prune -f
            
            # 🏥 健康检查
            sleep 30
            curl -f http://localhost/health || exit 1
            
            echo "✅ Deployment completed successfully!"
```

## 📋 部署脚本

### 一键部署脚本

```bash
#!/bin/bash
# scripts/deploy.sh - Contabo VPS 一键部署脚本

set -e  # 遇到错误立即退出

echo "🚀 Starting KNZN deployment to Contabo VPS..."

# 📋 配置变量
PROJECT_DIR="/opt/knzn"
BACKUP_DIR="/opt/knzn-backups"
LOG_FILE="/var/log/knzn-deploy.log"

# 📝 日志函数
log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1" | tee -a $LOG_FILE
}

# 🚨 错误处理
error_exit() {
    log "ERROR: $1"
    exit 1
}

# 🔍 环境检查
log "Checking environment..."

# 检查 Docker
if ! command -v docker &> /dev/null; then
    error_exit "Docker is not installed"
fi

# 检查 Docker Compose
if ! command -v docker-compose &> /dev/null; then
    error_exit "Docker Compose is not installed"
fi

# 检查项目目录
if [ ! -d "$PROJECT_DIR" ]; then
    error_exit "Project directory $PROJECT_DIR does not exist"
fi

cd $PROJECT_DIR

# 📥 更新代码
log "Updating code from Git..."
git pull origin main || error_exit "Git pull failed"

# 🔍 检查环境变量文件
if [ ! -f ".env.production" ]; then
    error_exit ".env.production file not found"
fi

# 💾 创建备份
log "Creating backup..."
mkdir -p $BACKUP_DIR
BACKUP_NAME="knzn-backup-$(date +%Y%m%d_%H%M%S)"

# 备份数据库
docker-compose exec -T postgres pg_dump -U knzn_user knzn_production > $BACKUP_DIR/$BACKUP_NAME.sql || error_exit "Database backup failed"

# 备份配置文件
cp .env.production $BACKUP_DIR/$BACKUP_NAME.env

log "Backup created: $BACKUP_NAME"

# 🏗️ 构建和部署
log "Building and deploying containers..."

# 拉取最新镜像
docker-compose -f docker-compose.yml -f docker-compose.prod.yml pull || error_exit "Docker pull failed"

# 重新构建应用镜像 (如果需要)
docker-compose -f docker-compose.yml -f docker-compose.prod.yml build app || error_exit "Docker build failed"

# 启动服务
docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d || error_exit "Docker compose up failed"

# ⏱️ 等待服务启动
log "Waiting for services to start..."
sleep 30

# 🏥 健康检查
log "Performing health checks..."

# 检查 Nginx
if ! curl -f http://localhost/health > /dev/null 2>&1; then
    error_exit "Nginx health check failed"
fi

# 检查应用
if ! curl -f http://localhost:3000/api/health > /dev/null 2>&1; then
    error_exit "App health check failed"
fi

# 检查数据库
if ! docker-compose exec -T postgres pg_isready -U knzn_user > /dev/null 2>&1; then
    error_exit "Database health check failed"
fi

# 检查 Redis
if ! docker-compose exec -T redis redis-cli ping > /dev/null 2>&1; then
    error_exit "Redis health check failed"
fi

# 🧹 清理
log "Cleaning up..."

# 清理旧镜像
docker image prune -f

# 清理旧备份 (保留 7 天)
find $BACKUP_DIR -name "knzn-backup-*" -mtime +7 -delete

# 📊 部署统计
log "Deployment completed successfully!"
log "Services status:"
docker-compose -f docker-compose.yml -f docker-compose.prod.yml ps

# 📈 发送部署通知 (可选)
if [ -n "$WEBHOOK_URL" ]; then
    curl -X POST "$WEBHOOK_URL" \
        -H "Content-Type: application/json" \
        -d "{\"text\":\"✅ KNZN deployed successfully to Contabo VPS\"}"
fi

echo "🎉 Deployment completed successfully!"
echo "🌐 Site: https://knzn.net"
echo "📊 Logs: docker-compose logs -f"
```

### VPS 初始化脚本

```bash
#!/bin/bash
# scripts/vps-setup.sh - Contabo VPS 初始化脚本

set -e

echo "🖥️ Setting up Contabo VPS for KNZN..."

# 1. 系统更新
sudo apt update && sudo apt upgrade -y

# 2. 安装基础软件
sudo apt install -y \
    curl \
    wget \
    git \
    htop \
    ufw \
    fail2ban \
    unzip \
    software-properties-common \
    apt-transport-https \
    ca-certificates \
    gnupg \
    lsb-release

# 3. 安装 Docker
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /usr/share/keyrings/docker-archive-keyring.gpg

echo "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/docker-archive-keyring.gpg] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

sudo apt update
sudo apt install -y docker-ce docker-ce-cli containerd.io

# 4. 安装 Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# 5. 配置 Docker 用户组
sudo usermod -aG docker $USER

# 6. 配置防火墙
sudo ufw default deny incoming
sudo ufw default allow outgoing
sudo ufw allow ssh
sudo ufw allow 80
sudo ufw allow 443
sudo ufw --force enable

# 7. 配置 Fail2Ban
sudo systemctl enable fail2ban
sudo systemctl start fail2ban

# 8. 创建项目目录
sudo mkdir -p /opt/knzn
sudo chown $USER:$USER /opt/knzn

# 9. 创建备份目录
sudo mkdir -p /opt/knzn-backups
sudo chown $USER:$USER /opt/knzn-backups

# 10. 配置系统优化
echo "# KNZN System Optimization" | sudo tee -a /etc/sysctl.conf
echo "vm.max_map_count=262144" | sudo tee -a /etc/sysctl.conf
echo "fs.file-max=65536" | sudo tee -a /etc/sysctl.conf
echo "net.core.somaxconn=65535" | sudo tee -a /etc/sysctl.conf

# 11. 应用系统配置
sudo sysctl -p

# 12. 配置 Docker 守护进程
sudo tee /etc/docker/daemon.json << EOF
{
  "log-driver": "json-file",
  "log-opts": {
    "max-size": "10m",
    "max-file": "3"
  },
  "storage-driver": "overlay2"
}
EOF

# 13. 重启 Docker
sudo systemctl restart docker
sudo systemctl enable docker

# 14. 安装 Node.js (用于本地开发)
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

# 15. 安装 pnpm
npm install -g pnpm

echo "✅ Contabo VPS setup completed!"
echo "📋 Next steps:"
echo "1. Clone your repository to /opt/knzn"
echo "2. Configure .env.production file"
echo "3. Run ./scripts/deploy.sh"
echo ""
echo "🔄 Please log out and log back in to apply Docker group changes"
```

## 💾 备份与恢复系统

### 自动备份脚本

```bash
#!/bin/bash
# scripts/backup.sh - 增强备份脚本

set -e

# 📋 配置变量
BACKUP_DIR="/opt/knzn-backups"
PROJECT_DIR="/opt/knzn"
LOG_FILE="/var/log/knzn-backup.log"
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_NAME="knzn-backup-${DATE}"
RETENTION_DAYS=30

# 📝 日志函数
log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1" | tee -a $LOG_FILE
}

# 🚨 错误处理
error_exit() {
    log "ERROR: $1"
    # 发送告警邮件 (如果配置了)
    if [ -n "$ALERT_EMAIL" ]; then
        echo "Backup failed: $1" | mail -s "KNZN Backup Failed" $ALERT_EMAIL
    fi
    exit 1
}

log "Starting KNZN backup: $BACKUP_NAME"

# 🗂️ 创建备份目录
mkdir -p $BACKUP_DIR || error_exit "Failed to create backup directory"

cd $PROJECT_DIR

# 🗄️ 数据库备份
log "Creating database backup..."
docker-compose exec -T postgres pg_dump -U knzn_user -c knzn_production > $BACKUP_DIR/${BACKUP_NAME}.sql || error_exit "Database backup failed"

# 📏 检查备份文件大小
BACKUP_SIZE=$(stat -c%s "$BACKUP_DIR/${BACKUP_NAME}.sql")
if [ $BACKUP_SIZE -lt 1000 ]; then
    error_exit "Backup file too small: ${BACKUP_SIZE} bytes"
fi

log "Database backup completed: ${BACKUP_SIZE} bytes"

# 🗜️ 压缩备份
log "Compressing backup..."
gzip $BACKUP_DIR/${BACKUP_NAME}.sql || error_exit "Compression failed"

# 🔐 加密备份 (如果配置了加密密钥)
if [ -n "$BACKUP_ENCRYPTION_KEY" ]; then
    log "Encrypting backup..."
    openssl enc -aes-256-cbc -salt \
        -in $BACKUP_DIR/${BACKUP_NAME}.sql.gz \
        -out $BACKUP_DIR/${BACKUP_NAME}.sql.gz.enc \
        -k $BACKUP_ENCRYPTION_KEY || error_exit "Encryption failed"
    
    # 删除未加密文件
    rm $BACKUP_DIR/${BACKUP_NAME}.sql.gz
    FINAL_FILE="${BACKUP_NAME}.sql.gz.enc"
else
    FINAL_FILE="${BACKUP_NAME}.sql.gz"
fi

# 📤 上传到云存储 (如果配置了)
if [ -n "$R2_ACCESS_KEY_ID" ] && [ -n "$R2_SECRET_ACCESS_KEY" ]; then
    log "Uploading to Cloudflare R2..."
    
    # 配置 AWS CLI for R2
    export AWS_ACCESS_KEY_ID=$R2_ACCESS_KEY_ID
    export AWS_SECRET_ACCESS_KEY=$R2_SECRET_ACCESS_KEY
    
    aws s3 cp $BACKUP_DIR/$FINAL_FILE \
        s3://knzn-backups/database/$FINAL_FILE \
        --endpoint-url https://$CLOUDFLARE_ACCOUNT_ID.r2.cloudflarestorage.com || error_exit "Upload to R2 failed"
    
    log "Backup uploaded to R2: $FINAL_FILE"
fi

# 📋 备份配置文件
log "Backing up configuration files..."
cp .env.production $BACKUP_DIR/${BACKUP_NAME}.env
cp docker-compose.yml $BACKUP_DIR/${BACKUP_NAME}-compose.yml
cp docker-compose.prod.yml $BACKUP_DIR/${BACKUP_NAME}-compose-prod.yml

# 🗑️ 清理旧备份
log "Cleaning up old backups..."
find $BACKUP_DIR -name "knzn-backup-*" -mtime +$RETENTION_DAYS -delete

# 📊 备份统计
FINAL_SIZE=$(stat -c%s "$BACKUP_DIR/$FINAL_FILE")
log "Backup completed successfully!"
log "Final file: $FINAL_FILE"
log "Final size: $FINAL_SIZE bytes"

# 📈 发送成功通知
if [ -n "$WEBHOOK_URL" ]; then
    curl -X POST "$WEBHOOK_URL" \
        -H "Content-Type: application/json" \
        -d "{\"text\":\"✅ KNZN backup completed: $FINAL_FILE ($FINAL_SIZE bytes)\"}"
fi

log "Backup process completed successfully!"
```

### 恢复脚本

```bash
#!/bin/bash
# scripts/restore.sh - 数据库恢复脚本

set -e

# 📋 配置
BACKUP_DIR="/opt/knzn-backups"
PROJECT_DIR="/opt/knzn"
LOG_FILE="/var/log/knzn-restore.log"

# 📝 日志函数
log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1" | tee -a $LOG_FILE
}

# 🚨 错误处理
error_exit() {
    log "ERROR: $1"
    exit 1
}

# 📥 参数检查
if [ $# -ne 1 ]; then
    echo "Usage: $0 <backup_filename>"
    echo "Example: $0 knzn-backup-20241223_020000.sql.gz"
    echo ""
    echo "Available backups:"
    ls -la $BACKUP_DIR/knzn-backup-*.sql.gz* 2>/dev/null || echo "No backups found"
    exit 1
fi

BACKUP_FILE=$1
BACKUP_PATH="$BACKUP_DIR/$BACKUP_FILE"

# 🔍 检查备份文件
if [ ! -f "$BACKUP_PATH" ]; then
    error_exit "Backup file not found: $BACKUP_PATH"
fi

log "Starting database restore from: $BACKUP_FILE"

# ⚠️ 安全确认
echo "⚠️  WARNING: This will REPLACE the current database!"
echo "Backup file: $BACKUP_FILE"
echo "Database: knzn_production"
echo ""
read -p "Are you sure you want to continue? (type 'YES' to confirm): " CONFIRM

if [ "$CONFIRM" != "YES" ]; then
    log "Restore cancelled by user"
    exit 0
fi

cd $PROJECT_DIR

# 💾 创建当前数据库备份 (安全措施)
log "Creating safety backup of current database..."
SAFETY_BACKUP="safety-backup-$(date +%Y%m%d_%H%M%S).sql"
docker-compose exec -T postgres pg_dump -U knzn_user knzn_production > $BACKUP_DIR/$SAFETY_BACKUP || error_exit "Safety backup failed"

log "Safety backup created: $SAFETY_BACKUP"

# 🔓 处理加密文件
RESTORE_FILE="$BACKUP_PATH"
if [[ $BACKUP_FILE == *.enc ]]; then
    if [ -z "$BACKUP_ENCRYPTION_KEY" ]; then
        error_exit "Backup is encrypted but BACKUP_ENCRYPTION_KEY is not set"
    fi
    
    log "Decrypting backup..."
    DECRYPTED_FILE="${BACKUP_PATH%.enc}"
    openssl enc -aes-256-cbc -d \
        -in $BACKUP_PATH \
        -out $DECRYPTED_FILE \
        -k $BACKUP_ENCRYPTION_KEY || error_exit "Decryption failed"
    
    RESTORE_FILE="$DECRYPTED_FILE"
fi

# 🗜️ 解压文件
if [[ $RESTORE_FILE == *.gz ]]; then
    log "Decompressing backup..."
    DECOMPRESSED_FILE="${RESTORE_FILE%.gz}"
    gunzip -c $RESTORE_FILE > $DECOMPRESSED_FILE || error_exit "Decompression failed"
    RESTORE_FILE="$DECOMPRESSED_FILE"
fi

# 🔄 停止应用 (避免数据库连接冲突)
log "Stopping application..."
docker-compose stop app

# 🗄️ 恢复数据库
log "Restoring database..."
docker-compose exec -T postgres psql -U knzn_user -d knzn_production < $RESTORE_FILE || {
    log "Restore failed! Rolling back..."
    docker-compose exec -T postgres psql -U knzn_user -d knzn_production < $BACKUP_DIR/$SAFETY_BACKUP
    error_exit "Database restore failed and rolled back"
}

# 🚀 重启应用
log "Restarting application..."
docker-compose start app

# ⏱️ 等待应用启动
sleep 30

# ✅ 验证恢复
log "Verifying restore..."
if ! curl -f http://localhost:3000/api/health > /dev/null 2>&1; then
    error_exit "Application health check failed after restore"
fi

# 🧹 清理临时文件
if [ -f "$DECOMPRESSED_FILE" ]; then
    rm -f "$DECOMPRESSED_FILE"
fi

if [ -f "$DECRYPTED_FILE" ]; then
    rm -f "$DECRYPTED_FILE"
fi

log "Database restore completed successfully!"
log "Restored from: $BACKUP_FILE"

# 📈 发送恢复通知
if [ -n "$WEBHOOK_URL" ]; then
    curl -X POST "$WEBHOOK_URL" \
        -H "Content-Type: application/json" \
        -d "{\"text\":\"✅ KNZN database restored from: $BACKUP_FILE\"}"
fi

echo "✅ Database restore completed successfully!"
```

## 📊 监控与告警

### 系统监控脚本

```bash
#!/bin/bash
# scripts/monitor.sh - 系统监控脚本

# 📋 配置
LOG_FILE="/var/log/knzn-monitor.log"
ALERT_THRESHOLD_CPU=80
ALERT_THRESHOLD_MEMORY=85
ALERT_THRESHOLD_DISK=90

# 📝 日志函数
log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1" | tee -a $LOG_FILE
}

# 🚨 发送告警
send_alert() {
    local severity=$1
    local message=$2
    local metric=$3
    local value=$4
    
    log "ALERT [$severity]: $message"
    
    # 发送 Webhook 通知
    if [ -n "$WEBHOOK_URL" ]; then
        curl -X POST "$WEBHOOK_URL" \
            -H "Content-Type: application/json" \
            -d "{
                \"text\": \"🚨 KNZN Alert [$severity]: $message\",
                \"metric\": \"$metric\",
                \"value\": \"$value\",
                \"timestamp\": \"$(date -Iseconds)\",
                \"hostname\": \"$(hostname)\"
            }"
    fi
    
    # 发送邮件告警
    if [ -n "$ALERT_EMAIL" ]; then
        echo "$message (Value: $value)" | mail -s "KNZN Alert: $metric" $ALERT_EMAIL
    fi
}

log "Starting system monitoring check..."

# 💾 检查磁盘使用率
DISK_USAGE=$(df / | awk 'NR==2 {print $5}' | sed 's/%//')
if [ $DISK_USAGE -gt $ALERT_THRESHOLD_DISK ]; then
    send_alert "CRITICAL" "Disk usage critical: ${DISK_USAGE}%" "disk_usage" "$DISK_USAGE"
elif [ $DISK_USAGE -gt 75 ]; then
    send_alert "WARNING" "Disk usage high: ${DISK_USAGE}%" "disk_usage" "$DISK_USAGE"
fi

# 🧠 检查内存使用率
MEMORY_USAGE=$(free | awk 'NR==2{printf "%.0f", $3*100/$2}')
if [ $MEMORY_USAGE -gt $ALERT_THRESHOLD_MEMORY ]; then
    send_alert "CRITICAL" "Memory usage critical: ${MEMORY_USAGE}%" "memory_usage" "$MEMORY_USAGE"
elif [ $MEMORY_USAGE -gt 70 ]; then
    send_alert "WARNING" "Memory usage high: ${MEMORY_USAGE}%" "memory_usage" "$MEMORY_USAGE"
fi

# 🔄 检查 CPU 使用率
CPU_USAGE=$(top -bn1 | grep "Cpu(s)" | awk '{print $2}' | sed 's/%us,//')
CPU_USAGE_INT=$(echo $CPU_USAGE | cut -d'.' -f1)
if [ $CPU_USAGE_INT -gt $ALERT_THRESHOLD_CPU ]; then
    send_alert "CRITICAL" "CPU usage critical: ${CPU_USAGE}%" "cpu_usage" "$CPU_USAGE"
elif [ $CPU_USAGE_INT -gt 60 ]; then
    send_alert "WARNING" "CPU usage high: ${CPU_USAGE}%" "cpu_usage" "$CPU_USAGE"
fi

# 🐳 检查 Docker 容器状态
CONTAINERS_DOWN=$(docker-compose -f /opt/knzn/docker-compose.yml -f /opt/knzn/docker-compose.prod.yml ps -q | xargs docker inspect -f '{{.State.Status}}' | grep -v running | wc -l)
if [ $CONTAINERS_DOWN -gt 0 ]; then
    send_alert "CRITICAL" "Some containers are not running" "containers_down" "$CONTAINERS_DOWN"
fi

# 🌐 检查网站可用性
if ! curl -f -s http://localhost/health > /dev/null; then
    send_alert "CRITICAL" "Website health check failed" "website_health" "failed"
fi

# 🗄️ 检查数据库连接
if ! docker-compose -f /opt/knzn/docker-compose.yml exec -T postgres pg_isready -U knzn_user > /dev/null 2>&1; then
    send_alert "CRITICAL" "Database connection failed" "database_connection" "failed"
fi

# 🔄 检查 Redis 连接
if ! docker-compose -f /opt/knzn/docker-compose.yml exec -T redis redis-cli ping > /dev/null 2>&1; then
    send_alert "CRITICAL" "Redis connection failed" "redis_connection" "failed"
fi

log "System monitoring check completed"
```

### Cron 任务配置

```bash
# 添加到 crontab: crontab -e

# 🕐 每小时监控系统状态
0 * * * * /opt/knzn/scripts/monitor.sh

# 🌅 每天凌晨 2 点备份数据库
0 2 * * * /opt/knzn/scripts/backup.sh

# 🧹 每周日凌晨 4 点清理 Docker
0 4 * * 0 docker system prune -f

# 🔄 每天凌晨 3 点重启 Nginx (清理缓存)
0 3 * * * docker-compose -f /opt/knzn/docker-compose.yml restart nginx

# 📊 每小时检查 SSL 证书有效期
0 * * * * /opt/knzn/scripts/check-ssl.sh
```

## 💰 成本优化 (Contabo VPS)

### 月度成本分析

```typescript
const CONTABO_MONTHLY_COSTS = {
  // 🖥️ 基础设施成本
  infrastructure: {
    contaboVPS: {
      plan: 'VPS L (12GB RAM, 6 vCPU, 100GB NVMe)',
      cost: 12.99, // €12.99/月
      description: '完整应用栈 + 数据库'
    },
    domain: {
      provider: 'Cloudflare',
      cost: 0, // 免费域名管理
      description: 'DNS + 基础 CDN'
    }
  },
  
  // 🛠️ 第三方服务成本 (保持不变)
  services: {
    resend: {
      plan: 'Pro',
      emails: '100K/月',
      cost: 20,
      description: '邮件发送服务'
    },
    openai: {
      model: 'gpt-4o-mini',
      tokens: '10M tokens/月',
      cost: 15,
      description: 'AI 助教服务'
    },
    cloudflareR2: {
      storage: '50GB',
      requests: '1M/月',
      cost: 8,
      description: '文件存储 + CDN'
    },
    lemonSqueezy: {
      commission: '5% + $0.50 per transaction',
      cost: 0, // 从收入中扣除
      description: '支付处理费用'
    }
  },
  
  // 📊 总成本 (大幅降低)
  totalMonthlyCost: 56, // $56/月 (vs 原来 $75)
  
  // 🎯 收入目标 (不变)
  revenueTarget: {
    proUsers: 1000,
    pricePerUser: 9.99,
    monthlyRevenue: 9990,
    netProfit: 9934, // 99.4% 利润率
    profitMargin: '99.4%'
  },
  
  // 📈 扩展成本 (10K 用户)
  scalingCosts: {
    contaboVPS: 25.99, // 升级到 VPS XL (16GB RAM, 8 CPU cores)
    r2: 25, // 200GB 存储
    resend: 40, // 500K 邮件
    openai: 50, // 50M tokens
    total: 141 // $141/月 (vs 原来 $159)
  }
}
```

---

**文档版本**: v2.0 - Contabo VPS 专用版  
**最后更新**: 2024-12-23  
**适用项目**: KNZN 硬件学习平台  
**部署策略**: Docker 容器化集群 + Nginx 反代

这份运维指南专为 Contabo VPS 的单机容器化部署设计，通过 Docker Compose 编排实现完整的应用栈，相比 Vercel 混合方案进一步降低了成本，同时保持了高可用性和易维护性。