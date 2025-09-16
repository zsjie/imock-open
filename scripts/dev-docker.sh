#!/bin/bash

# imock 开发环境 Docker Compose 启动脚本

set -e

echo "🚀 启动 imock 开发环境..."

# 检查是否存在 .env 文件
if [ ! -f ".env" ]; then
    echo "⚠️  .env 文件不存在，正在从 docker.dev.env.example 创建..."
    cp docker.dev.env.example .env
    echo "✅ 已创建 .env 文件，请根据需要修改配置"
fi

# 构建并启动服务
echo "🔨 构建并启动开发环境服务..."
docker compose -f docker-compose.dev.yml up --build
