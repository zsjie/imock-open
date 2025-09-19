#!/bin/bash

# imock Docker 启动脚本
# 用于快速启动 imock 项目的 Docker 容器

set -e

echo "🐳 imock Docker 启动脚本"
echo "========================"

# 检查 Docker 是否安装
if ! command -v docker &> /dev/null; then
    echo "❌ 错误: Docker 未安装，请先安装 Docker"
    exit 1
fi

# 检查 Docker Compose 是否安装
if ! command -v docker compose &> /dev/null; then
    echo "❌ 错误: Docker Compose 未安装，请先安装 Docker Compose"
    exit 1
fi

# 检查 docker-compose.prod.yml 是否存在
if [ ! -f "docker-compose.prod.yml" ]; then
    echo "❌ 错误: 找不到 docker-compose.prod.yml"
    exit 1
fi

# 检查环境变量文件
if [ ! -f ".env" ]; then
    if [ -f "docker.env.example" ]; then
        echo "📋 复制 docker.env.example 到 .env"
        cp docker.env.example .env
        echo "⚠️  请编辑 .env 文件配置您的环境变量"
    else
        echo "⚠️  警告: 找不到 .env 文件，将使用默认配置"
    fi
fi

# 解析命令行参数
COMMAND=${1:-"up"}
BUILD_FLAG=""

case $COMMAND in
    "up")
        echo "🚀 启动 imock 服务..."
        BUILD_FLAG="--build"
        ;;
    "down")
        echo "🛑 停止 imock 服务..."
        docker compose down
        exit 0
        ;;
    "restart")
        echo "🔄 重启 imock 服务..."
        docker compose down
        BUILD_FLAG="--build"
        ;;
    "logs")
        echo "📋 查看服务日志..."
        docker compose logs -f
        exit 0
        ;;
    "clean")
        echo "🧹 清理 Docker 资源..."
        docker compose down -v --rmi all --remove-orphans
        docker system prune -f
        echo "✅ 清理完成"
        exit 0
        ;;
    "help"|"-h"|"--help")
        echo "使用方法: $0 [命令]"
        echo ""
        echo "命令:"
        echo "  up      启动服务 (默认)"
        echo "  down    停止服务"
        echo "  restart 重启服务"
        echo "  logs    查看日志"
        echo "  clean   清理 Docker 资源"
        echo "  help    显示此帮助信息"
        exit 0
        ;;
    *)
        echo "❌ 未知命令: $COMMAND"
        echo "使用 '$0 help' 查看可用命令"
        exit 1
        ;;
esac

echo "🔨 构建并启动服务..."
docker compose up $BUILD_FLAG
