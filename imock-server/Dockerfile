# syntax=docker/dockerfile:1.6
# 使用官方 Node.js 22 镜像
FROM node:22-alpine AS base

# 设置工作目录
WORKDIR /app

# 安装必要的系统依赖： prisma 依赖 openssl
RUN apk add --no-cache openssl

# 启用 Corepack 并固定 pnpm 版本
RUN corepack enable && corepack prepare pnpm@8.15.0 --activate

# 复制 package.json 和相关配置文件
COPY package.json ./
COPY pnpm-lock.yaml* ./
COPY .npmrc ./

# 安装依赖（启用缓存与锁定）
RUN --mount=type=cache,target=/root/.pnpm-store pnpm install

# 复制源代码
COPY . .

# 生成 Prisma Client
RUN pnpm db:generate

# 构建应用
RUN pnpm build

# 精简为生产依赖
RUN pnpm prune --prod

# 生产环境阶段
FROM node:22-alpine AS production

# 安装必要的系统依赖
RUN apk add --no-cache dumb-init openssl

# 创建非 root 用户
RUN addgroup -g 1001 -S nodejs
RUN adduser -S imock -u 1001

# 设置工作目录
WORKDIR /app

# 生产环境无需安装 pnpm 与依赖

# 从构建阶段复制构建产物
COPY --from=base /app/dist ./dist
COPY --from=base /app/prisma ./prisma
COPY --from=base /app/node_modules ./node_modules

# 创建必要的目录
RUN mkdir -p ./public

# 更改文件所有权
RUN chown -R imock:nodejs /app
USER imock

# 暴露端口
EXPOSE 6060

# 健康检查
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://127.0.0.1:6060/api/health-check', (res) => { process.exit(res.statusCode === 200 ? 0 : 1) }).on('error', () => process.exit(1))"

# 使用 dumb-init 启动应用
ENTRYPOINT ["dumb-init", "--"]
CMD ["node", "dist/index.js"]
