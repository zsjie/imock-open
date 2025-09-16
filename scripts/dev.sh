#!/bin/bash

# 开发环境启动脚本
echo "🚀 启动 imock 开发环境..."

# 检查 pnpm 是否安装
if ! command -v pnpm &> /dev/null; then
    echo "❌ pnpm 未安装，请先安装 pnpm: npm install -g pnpm"
    exit 1
fi

# 安装依赖
echo "📦 安装依赖..."
pnpm install

# 生成 Prisma Client
echo "🔧 生成数据库客户端..."
pnpm db:generate

# 启动开发服务器
echo "🎯 启动开发服务器..."
pnpm dev
