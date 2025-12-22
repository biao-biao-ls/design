# Docker 容器化部署技术指导文档

## 📋 文档概述

**适用场景**: 需要容器化部署的全栈项目  
**技术特点**: Docker + Docker Compose + 一键部署  
**参考项目**: 硬件学习平台的 Docker 部署方案  
**文档版本**: v1.0  

## 🎯 架构概述

基于当前项目验证的 Docker 容器化部署方案，提供：

- **环境一致性**: 开发、测试、生产环境完全一致
- **快速部署**: 一键部署脚本，5分钟完成部署
- **易于维护**: 容器化管理，服务隔离
- **可扩展性**: 支持水平扩展和负载均衡

## 🏗️ 部署架构

### 整体架构图

```
┌─────────────────────────────────────────────────────────────────┐
│                        外部访问层                                │
├─────────────────────────────────────────────────────────────────┤
│ HTTPS (443) │ HTTP (80) │ 域名解析 │ SSL 证书                   │
└─────────────────────────────────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│                    Nginx 反向代理容器                           │
├─────────────────────────────────────────────────────────────────┤
│ • 路由分发 (hw.knzn.net → web, admin.knzn.net → admin)        │
│ • SSL 终端                                                      │
│ • 负载均衡                                                      │
│ • 静态资源缓存                                                  │
│ • Gzip 压缩                                                     │
└─────────────────────────────────────────────────────────────────┘
                                │
                ┌───────────────┼───────────────┐
                ▼               ▼               ▼
┌──────────────────┐ ┌──────────────────┐ ┌──────────────────┐
│  Web 前端容器    │ │ Admin 后台容器   │ │  Backend API容器 │
├──────────────────┤ ├──────────────────┤ ├──────────────────┤
│ • Nuxt 4 SSR     │ │ • Nuxt 4 SSR     │ │ • NestJS         │
│ • Vue 3          │ │ • Element Plus   │ │ • Fastify        │
│ • 端口: 3000     │ │ • 端口: 3001     │ │ • 端口: 4000     │
└──────────────────┘ └──────────────────┘ └──────────────────┘
                                │
                ┌───────────────┼───────────────┐
                ▼               ▼               ▼
┌──────────────────┐ ┌──────────────────┐ ┌──────────────────┐
│ PostgreSQL 容器  │ │   Redis 容器     │ │  Qdrant 容器     │
├──────────────────┤ ├──────────────────┤ ├──────────────────┤
│ • 主数据库       │ │ • 缓存           │ │ • 向量数据库     │
│ • 端口: 5432     │ │ • 会话存储       │ │ • 端口: 6333     │
│ • 数据持久化     │ │ • 端口: 6379     │ │ • 数据持久化     │
└──────────────────┘ └──────────────────┘ └──────────────────┘
```

## 📁 Docker 配置文件结构

```
project-root/
├── docker-compose.yml              # 开发环境配置
├── docker-compose.prod.yml         # 生产环境配置
├── .env                            # 开发环境变量
├── .env.production                 # 生产环境变量模板
├── .env.production.local           # 生产环境实际配置（不提交）
│
├── apps/
│   ├── web/
│   │   ├── Dockerfile              # Web 前端 Dockerfile
│   │   └── .dockerignore
│   ├── admin/
│   │   ├── Dockerfile              # Admin 后台 Dockerfile
│   │   └── .dockerignore
│   └── backend/
│       ├── Dockerfile              # Backend API Dockerfile
│       └── .dockerignore
│
├── nginx/
│   ├── nginx.conf                  # 生产环境 Nginx 配置
│   └── nginx.local.conf            # 本地预览 Nginx 配置
│
├── ssl/                            # SSL 证书目录
│   ├── cf_cert.pem                 # SSL 证书
│   └── cf_key.pem                  # SSL 私钥
│
└── scripts/
    ├── deploy-local.sh             # 一键部署脚本
    ├── backup.sh                   # 数据备份脚本
    └── restore.sh                  # 数据恢复脚本
```

## 🐳 Docker Compose 配置

### 1. 开发环境配置

```yaml
# docker-compose.yml
services:
  # PostgreSQL 数据库
  postgres:
    image: postgres:17-alpine
    container_name: project-postgres
    restart: unless-stopped
    ports:
      - '${POSTGRES_PORT:-5432}:5432'
    environment:
      POSTGRES_USER: ${POSTGRES_USER:-postgres}
      POSTGRES_PASSWORD: ${POSTGRES_PASSWORD:-postgres}
      POSTGRES_DB: ${POSTGRES_DB:-my_project}
      POSTGRES_INITDB_ARGS: '-E UTF8 --locale=C'
    volumes:
      - postgres_data:/var/lib/postgresql/data
    healthcheck:
      test: ['CMD-SHELL', 'pg_isready -U ${POSTGRES_USER:-postgres}']
      interval: 10s
      timeout: 5s
      retries: 5
      start_period: 10s
    networks:
      - project-network

  # Redis 缓存
  redis:
    image: redis:7.4-alpine
    container_name: project-redis
    restart: unless-stopped
    ports:
      - '${REDIS_PORT:-6379}:6379'
    command:
      - redis-server
      - --appendonly
      - 'yes'
      - --maxmemory
      - 256mb
      - --maxmemory-policy
      - allkeys-lru
    volumes:
      - redis_data:/data
    healthcheck:
      test: ['CMD', 'redis-cli', 'ping']
      interval: 10s
      timeout: 5s
      retries: 5
      start_period: 5s
    networks:
      - project-network
  # 向量数据库（可选）
  qdrant:
    image: qdrant/qdrant:v1.7.4
    container_name: project-qdrant
    restart: unless-stopped
    ports:
      - '${QDRANT_PORT:-6333}:6333'
      - '${QDRANT_GRPC_PORT:-6334}:6334'
    environment:
      QDRANT__LOG_LEVEL: ${QDRANT_LOG_LEVEL:-INFO}
    volumes:
      - qdrant_data:/qdrant/storage
    healthcheck:
      test: ['CMD', 'wget', '--no-verbose', '--tries=1', '--spider', 'http://localhost:6333/']
      interval: 10s
      timeout: 5s
      retries: 5
      start_period: 10s
    networks:
      - project-network

  # Nginx 反向代理（本地预览模式）
  nginx:
    image: nginx:alpine
    container_name: project-nginx
    profiles:
      - preview
    ports:
      - '80:80'
    volumes:
      - ./nginx/nginx.local.conf:/etc/nginx/nginx.conf:ro
    extra_hosts:
      - 'host.docker.internal:host-gateway'
    networks:
      - project-network

networks:
  project-network:
    driver: bridge

volumes:
  postgres_data:
    driver: local
  redis_data:
    driver: local
  qdrant_data:
    driver: local
```

### 2. 生产环境配置

```yaml
# docker-compose.prod.yml
services:
  # 后端 API 服务
  backend:
    build:
      context: .
      dockerfile: apps/backend/Dockerfile
      target: production
      args:
        - NODE_ENV=production
    container_name: project-backend
    restart: unless-stopped
    ports:
      - '4000:4000'
    environment:
      - NODE_ENV=production
      - DATABASE_URL=${DATABASE_URL}
      - REDIS_URL=${REDIS_URL}
      - JWT_SECRET=${JWT_SECRET}
      - OPENAI_API_KEY=${OPENAI_API_KEY}
      - ANTHROPIC_API_KEY=${ANTHROPIC_API_KEY}
      - QDRANT_URL=${QDRANT_URL}
      - RUN_SEED=${RUN_SEED:-false}
    depends_on:
      postgres:
        condition: service_healthy
      redis:
        condition: service_healthy
    healthcheck:
      test: ['CMD', 'curl', '-f', 'http://localhost:4000/health']
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 60s
    networks:
      - project-network

  # Web 前端服务
  web:
    build:
      context: .
      dockerfile: apps/web/Dockerfile
      target: production
      args:
        - NODE_ENV=production
    container_name: project-web
    restart: unless-stopped
    environment:
      - NODE_ENV=production
      - NUXT_PUBLIC_API_BASE=/api
      - BACKEND_INTERNAL_URL=http://backend:4000
    depends_on:
      - backend
    healthcheck:
      test: ['CMD', 'curl', '-f', 'http://localhost:3000']
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 30s
    networks:
      - project-network

  # 管理后台服务
  admin:
    build:
      context: .
      dockerfile: apps/admin/Dockerfile
      target: production
      args:
        - NODE_ENV=production
    container_name: project-admin
    restart: unless-stopped
    environment:
      - NODE_ENV=production
      - NUXT_PUBLIC_API_BASE=/api
      - BACKEND_INTERNAL_URL=http://backend:4000
    depends_on:
      - backend
    healthcheck:
      test: ['CMD', 'curl', '-f', 'http://localhost:3001']
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 30s
    networks:
      - project-network

  # Nginx 反向代理
  nginx:
    image: nginx:alpine
    container_name: project-nginx
    restart: unless-stopped
    ports:
      - '80:80'
      - '443:443'
    volumes:
      - ./nginx/nginx.conf:/etc/nginx/nginx.conf:ro
      - ./ssl:/etc/nginx/ssl:ro
    depends_on:
      - web
      - admin
      - backend
    healthcheck:
      test: ['CMD', 'curl', '-f', 'http://localhost/health']
      interval: 30s
      timeout: 10s
      retries: 3
    networks:
      - project-network

  # PostgreSQL 数据库
  postgres:
    image: postgres:17-alpine
    container_name: project-postgres
    restart: unless-stopped
    environment:
      POSTGRES_USER: ${POSTGRES_USER}
      POSTGRES_PASSWORD: ${POSTGRES_PASSWORD}
      POSTGRES_DB: ${POSTGRES_DB}
      POSTGRES_INITDB_ARGS: '-E UTF8 --locale=C'
    volumes:
      - postgres_data:/var/lib/postgresql/data
    healthcheck:
      test: ['CMD-SHELL', 'pg_isready -U ${POSTGRES_USER}']
      interval: 10s
      timeout: 5s
      retries: 5
      start_period: 10s
    networks:
      - project-network

  # Redis 缓存
  redis:
    image: redis:7.4-alpine
    container_name: project-redis
    restart: unless-stopped
    command:
      - redis-server
      - --appendonly
      - 'yes'
      - --requirepass
      - '${REDIS_PASSWORD}'
      - --maxmemory
      - 512mb
      - --maxmemory-policy
      - allkeys-lru
    volumes:
      - redis_data:/data
    healthcheck:
      test: ['CMD', 'redis-cli', '--pass', '${REDIS_PASSWORD}', 'ping']
      interval: 10s
      timeout: 5s
      retries: 5
      start_period: 5s
    networks:
      - project-network

  # 向量数据库
  qdrant:
    image: qdrant/qdrant:v1.7.4
    container_name: project-qdrant
    restart: unless-stopped
    environment:
      QDRANT__LOG_LEVEL: INFO
      QDRANT__SERVICE__API_KEY: ${QDRANT_API_KEY}
    volumes:
      - qdrant_data:/qdrant/storage
    healthcheck:
      test: ['CMD', 'wget', '--no-verbose', '--tries=1', '--spider', 'http://localhost:6333/']
      interval: 10s
      timeout: 5s
      retries: 5
      start_period: 10s
    networks:
      - project-network

networks:
  project-network:
    driver: bridge

volumes:
  postgres_data:
    driver: local
  redis_data:
    driver: local
  qdrant_data:
    driver: local
```

## 📦 Dockerfile 配置

### 1. 后端 Dockerfile

```dockerfile
# apps/backend/Dockerfile
# 多阶段构建，优化镜像大小
FROM node:20-alpine AS base

# 安装 pnpm
RUN npm install -g pnpm

# 设置工作目录
WORKDIR /app

# 复制 package.json 文件（利用 Docker 缓存）
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY apps/backend/package.json ./apps/backend/
COPY packages/types/package.json ./packages/types/

# 安装依赖
RUN pnpm install --frozen-lockfile

# 开发阶段
FROM base AS development
COPY . .
RUN pnpm --filter @repo/types build
RUN pnpm --filter @repo/backend prisma:generate
RUN pnpm --filter @repo/backend build
EXPOSE 4000
CMD ["pnpm", "--filter", "@repo/backend", "start:prod"]

# 生产阶段
FROM base AS production
COPY . .

# 构建应用
RUN pnpm --filter @repo/types build
RUN pnpm --filter @repo/backend prisma:generate
RUN pnpm --filter @repo/backend build

# 清理开发依赖
RUN pnpm prune --prod

# 创建非 root 用户
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nestjs -u 1001

# 设置权限
USER nestjs

EXPOSE 4000

# 健康检查
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:4000/health || exit 1

CMD ["pnpm", "--filter", "@repo/backend", "start:prod"]
```

### 2. 前端 Dockerfile

```dockerfile
# apps/web/Dockerfile
FROM node:20-alpine AS base

RUN npm install -g pnpm

WORKDIR /app

# 复制依赖文件
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY apps/web/package.json ./apps/web/
COPY packages/types/package.json ./packages/types/
COPY packages/api/package.json ./packages/api/

# 安装依赖
RUN pnpm install --frozen-lockfile

# 构建阶段
FROM base AS build
COPY . .

# 构建共享包
RUN pnpm --filter @repo/types build
RUN pnpm --filter @repo/api build

# 构建 Web 应用
RUN pnpm --filter @repo/web build

# 生产阶段
FROM base AS production

# 复制构建产物
COPY --from=build /app/.output /app/.output

# 创建非 root 用户
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nuxtjs -u 1001

USER nuxtjs

EXPOSE 3000

# 健康检查
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:3000 || exit 1

CMD ["node", ".output/server/index.mjs"]
```

## 🌐 Nginx 配置

### 1. 生产环境 Nginx 配置

```nginx
# nginx/nginx.conf
user nginx;
worker_processes auto;
error_log /var/log/nginx/error.log notice;
pid /var/run/nginx.pid;

events {
    worker_connections 1024;
    use epoll;
    multi_accept on;
}

http {
    include /etc/nginx/mime.types;
    default_type application/octet-stream;

    # 日志格式
    log_format main '$remote_addr - $remote_user [$time_local] "$request" '
                    '$status $body_bytes_sent "$http_referer" '
                    '"$http_user_agent" "$http_x_forwarded_for"';

    access_log /var/log/nginx/access.log main;

    # 基础配置
    sendfile on;
    tcp_nopush on;
    tcp_nodelay on;
    keepalive_timeout 65;
    types_hash_max_size 2048;
    client_max_body_size 50M;

    # Gzip 压缩
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

    # 安全头
    add_header X-Frame-Options DENY;
    add_header X-Content-Type-Options nosniff;
    add_header X-XSS-Protection "1; mode=block";
    add_header Referrer-Policy "strict-origin-when-cross-origin";

    # 上游服务器定义
    upstream web_backend {
        server web:3000;
        keepalive 32;
    }

    upstream admin_backend {
        server admin:3001;
        keepalive 32;
    }

    upstream api_backend {
        server backend:4000;
        keepalive 32;
    }

    # HTTP 重定向到 HTTPS
    server {
        listen 80;
        server_name hw.knzn.net admin.knzn.net;
        return 301 https://$server_name$request_uri;
    }

    # 学生端 - hw.knzn.net
    server {
        listen 443 ssl http2;
        server_name hw.knzn.net;

        # SSL 配置
        ssl_certificate /etc/nginx/ssl/cf_cert.pem;
        ssl_certificate_key /etc/nginx/ssl/cf_key.pem;
        ssl_protocols TLSv1.2 TLSv1.3;
        ssl_ciphers ECDHE-RSA-AES128-GCM-SHA256:ECDHE-RSA-AES256-GCM-SHA384;
        ssl_prefer_server_ciphers off;
        ssl_session_cache shared:SSL:10m;
        ssl_session_timeout 10m;

        # HSTS
        add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;

        # API 路由 → Backend
        location /api/ {
            proxy_pass http://api_backend/;
            proxy_http_version 1.1;
            proxy_set_header Upgrade $http_upgrade;
            proxy_set_header Connection 'upgrade';
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
            proxy_cache_bypass $http_upgrade;
            proxy_read_timeout 300s;
            proxy_connect_timeout 75s;
        }

        # 前端路由 → Web
        location / {
            proxy_pass http://web_backend;
            proxy_http_version 1.1;
            proxy_set_header Upgrade $http_upgrade;
            proxy_set_header Connection 'upgrade';
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
            proxy_cache_bypass $http_upgrade;
        }

        # 静态资源缓存
        location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
            proxy_pass http://web_backend;
            expires 1y;
            add_header Cache-Control "public, immutable";
        }
    }

    # 管理端 - admin.knzn.net
    server {
        listen 443 ssl http2;
        server_name admin.knzn.net;

        # SSL 配置（同上）
        ssl_certificate /etc/nginx/ssl/cf_cert.pem;
        ssl_certificate_key /etc/nginx/ssl/cf_key.pem;
        ssl_protocols TLSv1.2 TLSv1.3;
        ssl_ciphers ECDHE-RSA-AES128-GCM-SHA256:ECDHE-RSA-AES256-GCM-SHA384;
        ssl_prefer_server_ciphers off;
        ssl_session_cache shared:SSL:10m;
        ssl_session_timeout 10m;

        add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;

        # API 路由 → Backend
        location /api/ {
            proxy_pass http://api_backend/;
            proxy_http_version 1.1;
            proxy_set_header Upgrade $http_upgrade;
            proxy_set_header Connection 'upgrade';
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
            proxy_cache_bypass $http_upgrade;
            proxy_read_timeout 300s;
        }

        # 管理端路由 → Admin
        location / {
            proxy_pass http://admin_backend;
            proxy_http_version 1.1;
            proxy_set_header Upgrade $http_upgrade;
            proxy_set_header Connection 'upgrade';
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
            proxy_cache_bypass $http_upgrade;
        }
    }

    # 健康检查端点
    server {
        listen 80;
        server_name localhost;
        
        location /health {
            access_log off;
            return 200 "healthy\n";
            add_header Content-Type text/plain;
        }
    }
}
```

## 🚀 一键部署脚本

### 核心部署脚本

```bash
#!/bin/bash
# scripts/deploy-local.sh

set -e

PROJECT_NAME="my-project"
DEFAULT_BRANCH="main"

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# 显示帮助信息
show_help() {
    cat << EOF
Docker 容器化部署脚本

用法:
    $0 [选项]

选项:
    -h, --help          显示此帮助信息
    -b, --branch BRANCH 指定分支（默认: main）
    -f, --force         强制部署（跳过确认）
    --first-deploy      强制首次部署模式
    --update-only       强制更新模式
    --service SERVICE   只更新指定服务
    --check             检查当前部署状态
    --logs              显示服务日志
    --backup            创建数据备份

示例:
    $0                  # 智能部署
    $0 -b dev           # 部署 dev 分支
    $0 --service web    # 只更新 web 服务
    $0 --backup         # 创建数据备份

EOF
}

# 检查环境
check_environment() {
    log_info "检查部署环境..."
    
    # 检查必需工具
    local missing_tools=()
    
    for tool in git docker; do
        if ! command -v "$tool" &> /dev/null; then
            missing_tools+=("$tool")
        fi
    done
    
    if [ ${#missing_tools[@]} -gt 0 ]; then
        log_error "缺失必需工具: ${missing_tools[*]}"
        exit 1
    fi
    
    # 检查 Docker 服务
    if ! docker info &> /dev/null; then
        log_error "Docker 服务未运行"
        exit 1
    fi
    
    # 检查 Docker Compose
    if ! docker compose version &> /dev/null; then
        log_error "Docker Compose 未安装或版本过低"
        exit 1
    fi
    
    log_success "环境检查通过"
}

# 检查 SSL 证书
check_ssl_certificates() {
    log_info "检查 SSL 证书..."
    
    if [ ! -d "./ssl" ]; then
        mkdir -p ./ssl
    fi
    
    local required_files=("cf_cert.pem" "cf_key.pem")
    local missing_files=()
    
    for file in "${required_files[@]}"; do
        if [ ! -f "./ssl/$file" ]; then
            missing_files+=("$file")
        fi
    done
    
    if [ ${#missing_files[@]} -gt 0 ]; then
        log_warning "缺少 SSL 证书文件: ${missing_files[*]}"
        
        if [ "$FORCE_DEPLOY" != true ]; then
            echo "选择处理方式："
            echo "1. 自动生成自签名证书（用于测试）"
            echo "2. 手动配置证书后继续"
            echo "3. 取消部署"
            read -p "请选择 (1/2/3): " choice
            
            case $choice in
                1)
                    generate_self_signed_cert
                    ;;
                2)
                    log_info "请手动配置证书文件后重新运行部署"
                    exit 0
                    ;;
                3)
                    log_info "部署已取消"
                    exit 0
                    ;;
                *)
                    log_error "无效选择"
                    exit 1
                    ;;
            esac
        else
            generate_self_signed_cert
        fi
    else
        log_success "SSL 证书检查通过"
    fi
}

# 生成自签名证书
generate_self_signed_cert() {
    log_info "生成自签名证书..."
    
    openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
        -keyout ssl/cf_key.pem \
        -out ssl/cf_cert.pem \
        -subj "/C=CN/ST=Beijing/L=Beijing/O=My Project/CN=localhost" \
        2>/dev/null
    
    if [ $? -eq 0 ]; then
        log_success "自签名证书生成完成"
    else
        log_error "证书生成失败，请检查 openssl 是否安装"
        exit 1
    fi
}

# 更新代码
update_code() {
    local branch="${1:-$DEFAULT_BRANCH}"
    
    log_info "更新代码到最新版本..."
    
    # 检查是否在 Git 仓库中
    if [ ! -d ".git" ]; then
        log_error "当前目录不是 Git 仓库"
        exit 1
    fi
    
    # 保存当前状态
    local current_branch=$(git branch --show-current)
    local has_changes=$(git status --porcelain)
    
    if [ -n "$has_changes" ]; then
        log_warning "检测到未提交的更改"
        
        if [ "$FORCE_DEPLOY" != true ]; then
            read -p "是否继续部署？这将暂存本地更改 (y/N): " confirm
            if [[ ! $confirm =~ ^[Yy]$ ]]; then
                log_info "部署已取消"
                exit 0
            fi
        fi
        
        git stash push -m "Auto-stash before deploy $(date)"
    fi
    
    # 切换到目标分支并拉取最新代码
    if [ "$current_branch" != "$branch" ]; then
        git checkout "$branch"
    fi
    
    git fetch origin
    git reset --hard "origin/$branch"
    
    log_success "代码更新完成"
    
    # 显示最新提交信息
    echo ""
    log_info "当前版本信息:"
    git log --oneline -3
    echo ""
}

# 检查部署状态
check_deployment_status() {
    log_info "检查当前部署状态..."
    
    if [ ! -f ".env.production.local" ]; then
        echo "🔴 未找到环境变量文件 .env.production.local"
        return 1
    fi
    
    local running_containers=$(docker compose -f docker-compose.prod.yml --env-file .env.production.local ps -q 2>/dev/null | wc -l)
    
    if [ "$running_containers" -gt 0 ]; then
        echo "🟢 检测到运行中的服务 ($running_containers 个容器)"
        docker compose -f docker-compose.prod.yml --env-file .env.production.local ps
        return 0
    else
        echo "🔴 未检测到运行中的服务"
        return 1
    fi
}

# 首次部署
first_deploy() {
    log_info "执行首次部署..."
    
    # 检查环境变量文件
    setup_environment_config
    
    # 构建并启动服务
    log_info "构建 Docker 镜像..."
    docker compose -f docker-compose.prod.yml --env-file .env.production.local build --no-cache
    
    log_info "启动所有服务..."
    docker compose -f docker-compose.prod.yml --env-file .env.production.local up -d
    
    # 等待服务启动
    wait_for_services
    
    # 运行数据库迁移
    run_database_migration
    
    log_success "首次部署完成"
}

# 滚动更新
rolling_update() {
    log_info "执行滚动更新..."
    
    # 构建新镜像
    log_info "构建新版本镜像..."
    docker compose -f docker-compose.prod.yml --env-file .env.production.local build --no-cache
    
    # 滚动更新服务
    local services=("backend" "web" "admin" "nginx")
    
    for service in "${services[@]}"; do
        log_info "更新服务: $service"
        
        if docker compose -f docker-compose.prod.yml --env-file .env.production.local ps --services | grep -q "^$service$"; then
            docker compose -f docker-compose.prod.yml --env-file .env.production.local up -d --no-deps --force-recreate "$service"
            
            # 等待服务健康检查通过
            wait_for_service_health "$service"
            
            sleep 3
        else
            log_warning "跳过不存在的服务: $service"
        fi
    done
    
    log_success "滚动更新完成"
}

# 设置环境配置
setup_environment_config() {
    if [ ! -f ".env.production.local" ]; then
        if [ -f ".env.production" ]; then
            log_info "创建生产环境配置..."
            cp .env.production .env.production.local
            log_warning "请编辑 .env.production.local 文件配置必要的环境变量"
            
            if [ "$FORCE_DEPLOY" != true ]; then
                read -p "是否已配置环境变量？(y/N): " confirm
                if [[ ! $confirm =~ ^[Yy]$ ]]; then
                    log_info "请先配置环境变量后再运行部署"
                    exit 0
                fi
            fi
        else
            log_error "未找到环境变量配置文件 .env.production"
            exit 1
        fi
    fi
    
    # 验证关键环境变量
    source .env.production.local
    
    local required_vars=("JWT_SECRET" "POSTGRES_PASSWORD")
    local missing_vars=()
    
    for var in "${required_vars[@]}"; do
        if [ -z "${!var}" ] || [ "${!var}" = "your-secure-${var,,}" ]; then
            missing_vars+=("$var")
        fi
    done
    
    if [ ${#missing_vars[@]} -gt 0 ]; then
        log_error "请在 .env.production.local 中设置以下环境变量: ${missing_vars[*]}"
        exit 1
    fi
}

# 等待服务启动
wait_for_services() {
    log_info "等待服务启动..."
    
    local max_attempts=60
    local attempt=0
    
    while [ $attempt -lt $max_attempts ]; do
        local healthy_services=$(docker compose -f docker-compose.prod.yml --env-file .env.production.local ps --format json | jq -r 'select(.Health == "healthy") | .Name' | wc -l)
        local total_services=$(docker compose -f docker-compose.prod.yml --env-file .env.production.local ps --format json | jq -r '.Name' | wc -l)
        
        if [ "$healthy_services" -eq "$total_services" ] && [ "$total_services" -gt 0 ]; then
            log_success "所有服务启动完成"
            return 0
        fi
        
        sleep 5
        attempt=$((attempt + 1))
        echo -n "."
    done
    
    log_warning "服务启动超时，请检查服务状态"
    return 1
}

# 等待单个服务健康检查
wait_for_service_health() {
    local service="$1"
    local max_attempts=30
    local attempt=0
    
    while [ $attempt -lt $max_attempts ]; do
        local health=$(docker compose -f docker-compose.prod.yml --env-file .env.production.local ps --format json | jq -r "select(.Service == \"$service\") | .Health")
        
        if [ "$health" = "healthy" ]; then
            log_success "$service 服务健康检查通过"
            return 0
        fi
        
        sleep 5
        attempt=$((attempt + 1))
        echo -n "."
    done
    
    log_warning "$service 服务健康检查超时"
    return 1
}

# 运行数据库迁移
run_database_migration() {
    log_info "运行数据库迁移..."
    
    # 等待后端服务完全启动
    sleep 30
    
    # 执行数据库迁移
    if docker exec project-backend sh -c "cd apps/backend && ./node_modules/.bin/prisma migrate deploy" > /dev/null 2>&1; then
        log_success "数据库迁移完成"
    else
        log_warning "数据库迁移可能存在问题，请检查后端日志"
    fi
}

# 验证部署
verify_deployment() {
    log_info "验证部署结果..."
    
    # 检查服务状态
    echo ""
    log_info "服务状态:"
    docker compose -f docker-compose.prod.yml --env-file .env.production.local ps
    
    # 测试服务连通性
    local services=(
        "http://localhost:4000/health:后端API"
        "http://localhost:80/health:Nginx健康检查"
    )
    
    echo ""
    log_info "连通性测试:"
    
    local failed_services=()
    
    for service_info in "${services[@]}"; do
        local url=$(echo "$service_info" | cut -d: -f1-2)
        local name=$(echo "$service_info" | cut -d: -f3)
        
        if curl -s --max-time 10 "$url" > /dev/null; then
            echo "  ✅ $name"
        else
            echo "  ❌ $name"
            failed_services+=("$name")
        fi
    done
    
    if [ ${#failed_services[@]} -eq 0 ]; then
        log_success "所有服务验证通过"
        return 0
    else
        log_warning "以下服务验证失败: ${failed_services[*]}"
        return 1
    fi
}

# 创建数据备份
create_backup() {
    log_info "创建数据备份..."
    
    local backup_dir="/tmp/backups"
    local timestamp=$(date +%Y%m%d_%H%M%S)
    local backup_file="backup_${timestamp}.sql"
    
    mkdir -p "$backup_dir"
    
    # 备份数据库
    if docker exec project-postgres pg_dump -U postgres my_project > "$backup_dir/$backup_file"; then
        log_success "数据备份完成: $backup_dir/$backup_file"
    else
        log_error "数据备份失败"
        return 1
    fi
    
    # 压缩备份文件
    gzip "$backup_dir/$backup_file"
    
    # 清理旧备份（保留最近 7 个）
    (cd "$backup_dir" && ls -t backup_*.sql.gz | tail -n +8 | xargs -r rm)
    
    log_success "备份创建完成"
}

# 显示服务日志
show_logs() {
    log_info "显示服务日志..."
    
    if [ ! -f ".env.production.local" ]; then
        log_error "未找到环境变量文件"
        exit 1
    fi
    
    docker compose -f docker-compose.prod.yml --env-file .env.production.local logs --tail=50 -f
}

# 显示部署完成信息
show_deployment_info() {
    echo ""
    echo "🎉 部署完成！"
    echo "=============="
    echo ""
    echo "📱 服务地址:"
    echo "  🌐 前端: https://hw.knzn.net"
    echo "  🔧 管理端: https://admin.knzn.net"
    echo "  🚀 API: https://hw.knzn.net/api"
    echo ""
    echo "🔧 管理命令:"
    echo "  查看状态: $0 --check"
    echo "  查看日志: $0 --logs"
    echo "  创建备份: $0 --backup"
    echo ""
    echo "📊 部署信息:"
    echo "  部署时间: $(date)"
    echo "  Git 分支: $(git branch --show-current)"
    echo "  Git 提交: $(git log --oneline -1)"
    echo ""
}

# 主函数
main() {
    local branch="$DEFAULT_BRANCH"
    local force_first_deploy=false
    local force_update_only=false
    local check_only=false
    local show_logs_flag=false
    local backup_flag=false
    local service_name=""
    FORCE_DEPLOY=false
    
    # 解析命令行参数
    while [[ $# -gt 0 ]]; do
        case $1 in
            -h|--help)
                show_help
                exit 0
                ;;
            -b|--branch)
                branch="$2"
                shift 2
                ;;
            -f|--force)
                FORCE_DEPLOY=true
                shift
                ;;
            --first-deploy)
                force_first_deploy=true
                shift
                ;;
            --update-only)
                force_update_only=true
                shift
                ;;
            --check)
                check_only=true
                shift
                ;;
            --logs)
                show_logs_flag=true
                shift
                ;;
            --backup)
                backup_flag=true
                shift
                ;;
            --service)
                service_name="$2"
                shift 2
                ;;
            *)
                log_error "未知参数: $1"
                show_help
                exit 1
                ;;
        esac
    done
    
    echo "🚀 $PROJECT_NAME - Docker 容器化部署"
    echo "===================================="
    echo "部署分支: $branch"
    echo "执行时间: $(date)"
    echo ""
    
    # 处理特殊操作
    if [ "$check_only" = true ]; then
        check_deployment_status
        exit 0
    fi
    
    if [ "$show_logs_flag" = true ]; then
        show_logs
        exit 0
    fi
    
    if [ "$backup_flag" = true ]; then
        create_backup
        exit 0
    fi
    
    # 处理单服务更新
    if [ -n "$service_name" ]; then
        log_info "执行单服务更新模式: $service_name"
        check_environment
        update_code "$branch"
        
        # 构建并更新单个服务
        docker compose -f docker-compose.prod.yml --env-file .env.production.local build --no-cache "$service_name"
        docker compose -f docker-compose.prod.yml --env-file .env.production.local up -d --no-deps --force-recreate "$service_name"
        
        wait_for_service_health "$service_name"
        exit 0
    fi
    
    # 执行部署流程
    check_environment
    check_ssl_certificates
    update_code "$branch"
    
    # 智能判断部署模式
    local is_deployed=false
    if check_deployment_status > /dev/null 2>&1; then
        is_deployed=true
    fi
    
    if [ "$force_first_deploy" = true ] || ([ "$force_update_only" = false ] && [ "$is_deployed" = false ]); then
        first_deploy
    elif [ "$force_update_only" = true ] || [ "$is_deployed" = true ]; then
        rolling_update
    fi
    
    # 验证部署结果
    echo ""
    if verify_deployment; then
        show_deployment_info
    else
        log_warning "部署验证存在问题，请检查服务状态"
        log_info "查看日志: $0 --logs"
        exit 1
    fi
}

main "$@"
```

## 📊 监控和维护

### 1. 健康检查配置

```yaml
# 在 docker-compose.prod.yml 中的健康检查示例
healthcheck:
  test: ['CMD', 'curl', '-f', 'http://localhost:4000/health']
  interval: 30s      # 检查间隔
  timeout: 10s       # 超时时间
  retries: 3         # 重试次数
  start_period: 60s  # 启动宽限期
```

### 2. 日志管理

```bash
# 查看所有服务日志
docker compose -f docker-compose.prod.yml logs

# 查看特定服务日志
docker compose -f docker-compose.prod.yml logs backend

# 实时跟踪日志
docker compose -f docker-compose.prod.yml logs -f

# 查看最近 100 行日志
docker compose -f docker-compose.prod.yml logs --tail=100
```

### 3. 数据备份脚本

```bash
#!/bin/bash
# scripts/backup.sh

set -e

BACKUP_DIR="/opt/backups"
DATE=$(date +%Y%m%d_%H%M%S)
DB_BACKUP_FILE="db_backup_${DATE}.sql"
FILES_BACKUP_FILE="files_backup_${DATE}.tar.gz"

# 创建备份目录
mkdir -p "$BACKUP_DIR"

# 数据库备份
echo "开始数据库备份..."
docker exec project-postgres pg_dump -U postgres my_project > "$BACKUP_DIR/$DB_BACKUP_FILE"

# 压缩数据库备份
gzip "$BACKUP_DIR/$DB_BACKUP_FILE"

# 文件备份（如果有上传文件）
if [ -d "./uploads" ]; then
    echo "开始文件备份..."
    tar -czf "$BACKUP_DIR/$FILES_BACKUP_FILE" uploads/
fi

# 清理旧备份（保留 7 天）
find "$BACKUP_DIR" -name "*.sql.gz" -mtime +7 -delete
find "$BACKUP_DIR" -name "*.tar.gz" -mtime +7 -delete

echo "备份完成: $BACKUP_DIR"
```

### 4. 数据恢复脚本

```bash
#!/bin/bash
# scripts/restore.sh

set -e

if [ $# -ne 1 ]; then
    echo "用法: $0 <backup_file.sql.gz>"
    exit 1
fi

BACKUP_FILE="$1"

if [ ! -f "$BACKUP_FILE" ]; then
    echo "备份文件不存在: $BACKUP_FILE"
    exit 1
fi

echo "警告: 这将覆盖当前数据库！"
read -p "确认继续？(y/N): " confirm

if [[ ! $confirm =~ ^[Yy]$ ]]; then
    echo "操作已取消"
    exit 0
fi

# 停止应用服务（保留数据库）
docker compose -f docker-compose.prod.yml stop backend web admin

# 恢复数据库
echo "开始恢复数据库..."
gunzip -c "$BACKUP_FILE" | docker exec -i project-postgres psql -U postgres -d my_project

# 重启应用服务
docker compose -f docker-compose.prod.yml start backend web admin

echo "数据恢复完成"
```

## 🔧 最佳实践

### 1. 镜像优化

- **多阶段构建**: 减少最终镜像大小
- **层缓存**: 合理安排 Dockerfile 指令顺序
- **基础镜像**: 使用 Alpine Linux 减少镜像大小
- **安全扫描**: 定期扫描镜像漏洞

### 2. 网络安全

- **内部网络**: 使用 Docker 内部网络隔离服务
- **最小权限**: 容器以非 root 用户运行
- **端口暴露**: 只暴露必要的端口
- **SSL/TLS**: 强制使用 HTTPS

### 3. 资源管理

```yaml
# 在 docker-compose.prod.yml 中添加资源限制
services:
  backend:
    deploy:
      resources:
        limits:
          cpus: '1.0'
          memory: 1G
        reservations:
          cpus: '0.5'
          memory: 512M
```

### 4. 环境变量管理

- **敏感信息**: 使用 Docker Secrets 或外部密钥管理
- **配置分离**: 开发和生产环境配置分离
- **默认值**: 为环境变量设置合理默认值

## 🎯 总结

这套 Docker 容器化部署方案具有以下优势：

1. **环境一致性**: 开发、测试、生产环境完全一致
2. **快速部署**: 一键部署脚本，5分钟完成部署
3. **易于维护**: 容器化管理，服务隔离
4. **可扩展性**: 支持水平扩展和负载均衡
5. **安全可靠**: SSL 加密、健康检查、自动重启
6. **运维友好**: 完整的日志、监控、备份方案

适用于需要快速部署、稳定运行的生产环境项目。