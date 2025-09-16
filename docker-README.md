# imock Docker 部署指南

本文档介绍如何使用 Docker 部署 imock 项目。

## 🚀 快速开始

### 1. 一键启动

```bash
# 克隆项目
git clone <repository-url>
cd imock-open

# 一键启动
./docker-start.sh
```

### 2. 手动启动

```bash
# 复制配置文件
cp docker.env.example .env

# 编辑环境变量（可选）
vim .env

# 启动服务
docker compose up --build -d
```

## 📁 Docker 相关文件说明

```txt
imock-open/
├── docker-compose.yml           # Docker Compose 配置
├── docker.env.example           # 环境变量配置模板
├── docker-start.sh              # 一键启动脚本
├── docker-README.md             # Docker 部署文档
├── imock-server/
│   ├── Dockerfile              # 后端 Dockerfile
│   └── .dockerignore           # 后端构建忽略文件
└── imock-web/
    ├── Dockerfile              # 前端 Dockerfile
    ├── nginx.conf              # Nginx 配置
    └── .dockerignore           # 前端构建忽略文件
```

## 🐳 服务架构

```txt
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   imock-web     │    │  imock-server   │    │     MySQL       │
│   (Nginx)       │◄──►│   (Node.js)     │◄──►│   (Database)    │
│   Port: 3010    │    │   Port: 3000    │    │   Port: 3306    │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         └───────────────────────┼───────────────────────┘
                                 │
                    ┌─────────────────┐
                    │ imock-network   │
                    │ (Docker Bridge) │
                    └─────────────────┘
```

## ⚙️ 环境变量配置

### 数据库配置

```sh
MYSQL_ROOT_PASSWORD=rootpassword
MYSQL_DATABASE=imock
MYSQL_USER=imock
MYSQL_PASSWORD=imockpassword
MYSQL_PORT=3306
```

### 服务端口配置

```sh
SERVER_PORT=3000
WEB_PORT=3010
```

### 后端配置

```sh
JWT_SECRET=your-jwt-secret-key-please-change-in-production
RUNTIME_ENV=production
ORIGIN=http://localhost:3010
```

### 前端配置

```sh
REACT_APP_API_URL=http://localhost:3000
```

### 可选配置

```sh
# AI Mock 功能
QWEN_API_KEY=sk-your-qwen-api-key

# 邮件服务
EMAIL_HOST=smtp.example.com
EMAIL_PORT=587
EMAIL_USER=your-email@example.com
EMAIL_PASS=your-email-password
```

## 📋 常用命令

### 启动脚本命令

```bash
./docker-start.sh up        # 启动服务 (默认)
./docker-start.sh down      # 停止服务
./docker-start.sh restart   # 重启服务
./docker-start.sh logs      # 查看日志
./docker-start.sh clean     # 清理 Docker 资源
./docker-start.sh help      # 显示帮助信息
```

### Docker Compose 命令

```bash
# 启动服务
docker compose up -d --build

# 停止服务
docker compose down

# 查看日志
docker compose logs -f

# 查看服务状态
docker compose ps

# 重启单个服务
docker compose restart imock-server
docker compose restart imock-web

# 进入容器
docker compose exec imock-server sh
docker compose exec imock-web sh
```

### 数据库操作

```bash
# 进入数据库容器
docker compose exec mysql mysql -u root -p

# 数据库备份
docker compose exec mysql mysqldump -u root -p imock > backup.sql

# 数据库恢复
docker compose exec -T mysql mysql -u root -p imock < backup.sql
```

## 🔧 开发调试

### 查看容器日志

```bash
# 查看所有服务日志
docker compose logs -f

# 查看特定服务日志
docker compose logs -f imock-server
docker compose logs -f imock-web
docker compose logs -f mysql
```

### 进入容器调试

```bash
# 进入后端容器
docker compose exec imock-server sh

# 进入前端容器
docker compose exec imock-web sh

# 进入数据库容器
docker compose exec mysql bash
```

### 重新构建镜像

```bash
# 重新构建所有镜像
docker compose build --no-cache

# 重新构建特定服务
docker compose build --no-cache imock-server
docker compose build --no-cache imock-web
```
