# imock - API Mock 平台

> 一个简单易用的 API Mock 平台，支持 AI 智能生成、环境切换、请求分享等功能。

## ✨ 功能特性

- 🎯 **API Mock 管理** - 创建、编辑、启动/停止 mock API
- 🤖 **AI 智能生成** - 基于 AI 智能生成 mock 数据
- 🔄 **环境切换** - 支持 dev/test/pre/prod 多环境切换
- 📤 **请求分享** - 分享请求和响应数据，便于团队协作
- 📁 **OpenAPI 导入** - 支持导入 OpenAPI 类型文件来生成 mock 数据
- 📊 **请求日志** - 查看详细的请求和响应日志
- 🔐 **用户认证** - 支持邮箱注册登录

## 🏗️ 技术栈

**前端:**

- React 18 + TypeScript
- Ant Design + Tailwind CSS
- React Router + Zustand

**后端:**

- Node.js + TypeScript + Koa
- Prisma + MySQL
- LLM

## 🚀 快速开始

### 环境要求

- Node.js >= 22.12.0
- pnpm >= 8.5.0
- Docker

### 1. 安装 docker

👉 [Docker 安装指南](https://docs.docker.com/engine/install/)

### 2. 克隆项目

```bash
git clone git@github.com:zsjie/imock-open.git
cd imock-open
```

### 3. 一键启动开发环境

```bash
./scripts/dev-docker.sh
```

### 4. 访问应用

打开浏览器访问 `http://localhost:3010`

## 🔧 开发指南

### 项目结构

```sh
imock-open/
├── imock-server/          # 后端服务
│   ├── src/
│   │   ├── api/          # API 路由
│   │   ├── lib/          # 工具库
│   │   ├── models/       # 数据模型
│   │   └── middlewares/  # 中间件
│   ├── prisma/           # 数据库 Schema
│   └── package.json
├── imock-web/             # 前端应用
│   ├── src/
│   │   ├── components/   # 组件
│   │   ├── pages/        # 页面
│   │   ├── services/     # API 服务
│   │   └── utils/        # 工具函数
│   └── package.json
├── docker-compose.dev.yml     # Docker 开发环境配置
└── docker-compose.prod.yml     # Docker 生产环境配置
```

## 📝 许可证

本项目采用 [MIT 许可证](LICENSE)。

---

⭐ 如果这个项目对您有帮助，请给我们一个 Star！
