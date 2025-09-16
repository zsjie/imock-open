# 构建阶段
FROM node:22-alpine AS build

# 设置工作目录
WORKDIR /app

# 安装 pnpm
RUN npm install -g pnpm@8.15.0

# 复制 package.json 和相关配置文件
COPY package.json ./
COPY pnpm-lock.yaml* ./

# 安装依赖
RUN pnpm install

# 接收构建参数
ARG RUNTIME_ENV=production
ARG MOCK_ENDPOINT=http://localhost:3000/server/proxy-api
ARG SOCKET_URL=http://localhost:3000

# 设置环境变量供 Vite 构建使用
ENV RUNTIME_ENV=${RUNTIME_ENV}
ENV MOCK_ENDPOINT=${MOCK_ENDPOINT}
ENV SOCKET_URL=${SOCKET_URL}

# 复制源代码
COPY . .

# 构建应用
RUN pnpm build:prod

# 生产环境阶段 - 使用 Nginx 服务静态文件
FROM nginx:alpine AS production

# 安装必要的系统依赖
RUN apk add --no-cache dumb-init

# 复制构建产物到 Nginx 目录
COPY --from=build /app/dist /usr/share/nginx/html

# 覆盖 Nginx 主配置（非 root 适配），并复制站点配置
COPY nginx.main.conf /etc/nginx/nginx.conf
COPY nginx.conf /etc/nginx/conf.d/default.conf

# 创建非 root 用户并设置权限
RUN addgroup -g 1001 -S nginx-user && \
    adduser -S nginx-user -u 1001 && \
    mkdir -p /tmp && \
    chown -R nginx-user:nginx-user /var/cache/nginx /var/run /var/log/nginx /usr/share/nginx/html /tmp && \
    chmod -R 755 /var/cache/nginx /var/run /var/log/nginx /tmp

# 切换到非 root 用户
USER nginx-user

# 暴露端口
EXPOSE 3010

# 健康检查
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://127.0.0.1:3010/ || exit 1

# 启动 Nginx
ENTRYPOINT ["dumb-init", "--"]
CMD ["nginx", "-g", "daemon off;"]
