#!/bin/bash

# 生产构建脚本
echo "🏗️  构建 imock 生产版本..."

# 清理旧的构建文件
echo "🧹 清理旧文件..."
pnpm clean

# 安装依赖
echo "📦 安装依赖..."
pnpm install --frozen-lockfile

# 类型检查
echo "🔍 类型检查..."
pnpm typecheck

# 代码检查
echo "🔧 代码检查..."
pnpm lint

# 构建项目
echo "🚀 开始构建..."
pnpm build

echo "✅ 构建完成！"
