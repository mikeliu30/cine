# CineFlow 服务器部署规格建议

## 📊 当前应用特点分析

### 资源消耗特征
1. **大图片处理**：Gemini 3 Pro 生成的图片可能达到 10-20MB（base64 编码）
2. **实时协作**：WebSocket 长连接 + Yjs CRDT 同步
3. **外部 API 调用**：Vertex AI Gemini（不占用本地计算资源）
4. **Next.js SSR**：服务端渲染 + API Routes

### 内存需求分析
- **开发环境**：4GB（包含热重载、TypeScript 编译等开销）
- **生产环境**：更高效，但仍需处理大图片
- **单个请求**：20-50MB（图片处理 + JSON 解析）
- **WebSocket 连接**：每个连接约 1-2MB
- **并发处理**：需要预留缓冲空间

## 🎯 推荐服务器规格

### 方案 1：小型部署（1-10 并发用户）
**适用场景**：个人项目、小团队内部使用

```
CPU:  2 核心（vCPU）
内存: 4GB RAM
存储: 20GB SSD
带宽: 5Mbps

推荐平台：
- 阿里云：ecs.t6-c1m2.large（约 ¥70/月）
- 腾讯云：S5.MEDIUM4（约 ¥80/月）
- AWS：t3.medium（约 $30/月）
- Vercel：Hobby Plan（免费，但有限制）
```

**注意事项**：
- Vercel 免费版有 10 秒函数超时限制
- 图片生成可能需要 20-30 秒，建议使用独立服务器

---

### 方案 2：中型部署（10-50 并发用户）⭐ 推荐
**适用场景**：小型创业公司、中型团队

```
CPU:  4 核心（vCPU）
内存: 8GB RAM
存储: 40GB SSD
带宽: 10Mbps

推荐平台：
- 阿里云：ecs.c6.xlarge（约 ¥300/月）
- 腾讯云：S5.LARGE8（约 ¥320/月）
- AWS：t3.xlarge（约 $120/月）
- DigitalOcean：$48/月 Droplet
```

**配置说明**：
- 8GB 内存可以舒适处理 10-20 个并发图片生成请求
- 4 核 CPU 足够处理 base64 编解码和 JSON 解析
- 10Mbps 带宽可以快速传输大图片

---

### 方案 3：大型部署（50-200 并发用户）
**适用场景**：商业产品、高流量应用

```
CPU:  8 核心（vCPU）
内存: 16GB RAM
存储: 100GB SSD
带宽: 20Mbps

推荐平台：
- 阿里云：ecs.c6.2xlarge（约 ¥600/月）
- 腾讯云：S5.2XLARGE16（约 ¥640/月）
- AWS：c5.2xlarge（约 $250/月）
```

**高可用配置**：
- 使用负载均衡（ALB/SLB）
- 多实例部署（至少 2 台）
- Redis 缓存（共享 session）
- CDN 加速（图片分发）

---

## 🔧 Node.js 内存配置

### 开发环境
```json
{
  "scripts": {
    "dev": "node --max-old-space-size=4096 node_modules/next/dist/bin/next dev"
  }
}
```

### 生产环境
```json
{
  "scripts": {
    "start": "node --max-old-space-size=2048 node_modules/next/dist/bin/next start"
  }
}
```

**说明**：
- 开发环境需要更多内存（4GB）用于热重载和编译
- 生产环境更高效，2GB 通常足够
- 如果遇到内存问题，可以增加到 4096 或 8192

---

## 🌐 部署平台对比

### Vercel（推荐用于前端）
**优点**：
- ✅ 零配置部署
- ✅ 自动 HTTPS
- ✅ 全球 CDN
- ✅ 免费额度

**缺点**：
- ❌ 函数超时限制（10 秒免费版，60 秒付费版）
- ❌ 内存限制（1GB 免费版）
- ❌ 不适合长时间运行的任务

**建议**：
- 前端部署在 Vercel
- API 部署在独立服务器

---

### 独立服务器（推荐用于 API）
**优点**：
- ✅ 完全控制
- ✅ 无超时限制
- ✅ 可自定义内存
- ✅ 适合长时间任务

**缺点**：
- ❌ 需要自己配置
- ❌ 需要维护
- ❌ 成本较高

**推荐平台**：
1. **阿里云**：国内访问快，价格适中
2. **腾讯云**：类似阿里云
3. **AWS**：全球覆盖，功能强大
4. **DigitalOcean**：简单易用，价格透明

---

## 📦 Docker 部署（推荐）

### Dockerfile 示例
```dockerfile
FROM node:18-alpine

WORKDIR /app

# 安装依赖
COPY package*.json ./
RUN npm ci --only=production

# 复制代码
COPY . .

# 构建
RUN npm run build

# 设置内存限制
ENV NODE_OPTIONS="--max-old-space-size=2048"

# 暴露端口
EXPOSE 3000

# 启动
CMD ["npm", "start"]
```

### Docker Compose 示例
```yaml
version: '3.8'

services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - GOOGLE_CLOUD_PROJECT=your-project
    deploy:
      resources:
        limits:
          cpus: '2'
          memory: 4G
        reservations:
          cpus: '1'
          memory: 2G
    restart: unless-stopped

  websocket:
    image: node:18-alpine
    command: npx y-websocket
    ports:
      - "1234:1234"
    restart: unless-stopped
```

---

## 💰 成本估算

### 小型部署（方案 1）
- 服务器：¥70-80/月
- 域名：¥50/年
- SSL 证书：免费（Let's Encrypt）
- **总计**：约 ¥100/月

### 中型部署（方案 2）⭐
- 服务器：¥300-320/月
- 负载均衡：¥50/月
- 域名：¥50/年
- CDN：¥100/月（按流量）
- **总计**：约 ¥500/月

### 大型部署（方案 3）
- 服务器 x2：¥1200/月
- 负载均衡：¥100/月
- Redis：¥200/月
- CDN：¥500/月
- **总计**：约 ¥2000/月

---

## 🚀 快速开始

### 1. 购买服务器
推荐：阿里云 ECS（4核8GB，方案2）

### 2. 安装环境
```bash
# 安装 Node.js 18
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# 安装 PM2（进程管理）
sudo npm install -g pm2

# 安装 Nginx（反向代理）
sudo apt-get install nginx
```

### 3. 部署应用
```bash
# 克隆代码
git clone your-repo
cd cineflow-mvp

# 安装依赖
npm install

# 构建
npm run build

# 启动（使用 PM2）
pm2 start npm --name "cineflow" -- start
pm2 startup
pm2 save
```

### 4. 配置 Nginx
```nginx
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

---

## 📊 监控建议

### 关键指标
- **内存使用率**：不应超过 80%
- **CPU 使用率**：平均不应超过 70%
- **响应时间**：图片生成 < 30 秒
- **错误率**：< 1%

### 监控工具
- **PM2 Monitor**：进程监控
- **Grafana + Prometheus**：性能监控
- **Sentry**：错误追踪
- **Google Cloud Monitoring**：API 调用监控

---

## ✅ 总结

**最佳实践**：
1. 开始使用**方案 2**（4核8GB）
2. 使用 Docker 部署，便于扩展
3. 配置 PM2 自动重启
4. 设置监控和告警
5. 定期备份数据

**扩展策略**：
- 用户 < 10：方案 1
- 用户 10-50：方案 2 ⭐
- 用户 50-200：方案 3
- 用户 > 200：考虑 Kubernetes 集群

有问题随时问我！🚀

