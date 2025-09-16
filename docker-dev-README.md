# imock 开发环境 Docker 配置

本文档介绍如何使用 Docker Compose 搭建 imock 的本地开发环境，支持代码热更新。

## 📋 功能特性

- ✅ 支持后端 TypeScript 代码热更新
- ✅ 支持前端 React 代码热更新
- ✅ 与生产环境一致的端口配置
- ✅ 数据库数据持久化
- ✅ 完整的开发工具链

## 🚀 快速开始

### 1. 环境准备

确保已安装：

- Docker
- Docker Compose

### 2. 配置环境变量

```bash
# 复制开发环境配置文件
cp docker.dev.env.example .env

# 根据需要修改 .env 文件中的配置
```

### 3. 启动开发环境

```bash
# 方法一：使用脚本（推荐）
./scripts/dev-docker.sh

# 方法二：直接使用 docker-compose
docker compose -f docker-compose.dev.yml up --build -d
```

### 4. 访问服务

启动成功后，可以通过以下地址访问：

- **前端服务**: <http://localhost:3010>
- **后端服务**: <http://localhost:6060>
- **数据库**: localhost:3306

## 📊 开发环境管理

### 查看服务状态

```bash
docker compose -f docker-compose.dev.yml ps
```

### 查看日志

```bash
# 查看所有服务日志
./scripts/dev-docker-logs.sh all

# 查看后端服务日志
./scripts/dev-docker-logs.sh server

# 查看前端服务日志
./scripts/dev-docker-logs.sh web

# 查看数据库日志
./scripts/dev-docker-logs.sh mysql
```

### 停止开发环境

```bash
# 使用脚本停止
./scripts/dev-docker-stop.sh

# 直接停止
docker compose -f docker-compose.dev.yml down
```

### 重启服务

```bash
# 重启所有服务
docker compose -f docker-compose.dev.yml restart

# 重启单个服务
docker compose -f docker-compose.dev.yml restart imock-server-dev
docker compose -f docker-compose.dev.yml restart imock-web-dev
```

## 🔧 热更新机制

### 后端热更新

- 使用 `tsc-watch` 监听 TypeScript 文件变化
- 自动编译并重启 Node.js 服务
- 支持断点调试

### 前端热更新

- 使用 Vite 开发服务器
- 支持 HMR (Hot Module Replacement)
- 实时预览代码变化

## 📁 目录结构

开发环境会挂载以下目录到容器中：

```
imock-server/
├── src/              -> /app/src (源代码)
├── package.json      -> /app/package.json
├── tsconfig.json     -> /app/tsconfig.json
└── prisma/           -> /app/prisma

imock-web/
├── src/              -> /app/src (源代码)
├── public/           -> /app/public
├── package.json      -> /app/package.json
└── *.config.*        -> /app/ (配置文件)
```

## 🐛 故障排除

### 端口冲突

开发环境使用与生产环境相同的端口。如果遇到端口冲突，可以修改 `.env` 文件中的端口配置：

```bash
SERVER_PORT=6060  # 后端端口
WEB_PORT=3010     # 前端端口
MYSQL_PORT=3306   # 数据库端口
```

### 权限问题

如果遇到文件权限问题：

```bash
# 修复文件权限
sudo chown -R $USER:$USER ./imock-server/node_modules
sudo chown -R $USER:$USER ./imock-web/node_modules
```

### 清理环境

如果需要完全重置开发环境：

```bash
# 停止并删除所有容器、网络、卷
docker compose -f docker-compose.dev.yml down -v --rmi all

# 重新构建
./scripts/dev-docker.sh
```

## 📝 开发建议

1. **代码修改**: 直接在本地修改代码，容器会自动检测变化并重新加载
2. **数据库管理**: 使用 `pnpm db:studio` 或连接 localhost:3307 管理数据库
3. **依赖更新**: 修改 package.json 后需要重新构建容器
4. **环境变量**: 修改环境变量后需要重启对应服务

## 🔗 相关命令

```bash
# 进入容器内部
docker compose -f docker-compose.dev.yml exec imock-server-dev sh
docker compose -f docker-compose.dev.yml exec imock-web-dev sh

# 查看容器资源使用情况
docker stats

# 清理未使用的 Docker 资源
docker system prune -f
```
