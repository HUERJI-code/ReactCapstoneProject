# ===== 构建阶段 =====
FROM node:20-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
# 代码里已写死 API 地址，这里无需传任何环境变量
RUN npm run build

# ===== 运行阶段（静态托管）=====
FROM node:20-alpine
WORKDIR /app
RUN npm i -g serve@14
# CRA 构建产物在 /app/build
COPY --from=build /app/build /app/build
EXPOSE 80
# -s 解决 SPA 刷新 404；-l 80 监听 80（适配 Azure Web App for Containers）
CMD ["serve", "-s", "build", "-l", "80"]

# 可选：简单健康检查
HEALTHCHECK CMD wget -qO- http://127.0.0.1:80/ || exit 1
