# 🚀 Google Cloud 部署指南 - Cloud Run

## 📋 前置准备

### 1. 确认你已有的资源
- ✅ Google Cloud 项目：`fleet-blend-469520-n7`
- ✅ 服务账号密钥：`vertex-key.json`
- ✅ Vertex AI API 已启用

### 2. 安装 Google Cloud SDK

**Windows:**
下载并安装：https://cloud.google.com/sdk/docs/install

**Mac/Linux:**
```bash
curl https://sdk.cloud.google.com | bash
exec -l $SHELL
```

### 3. 登录并配置
```bash
# 登录
gcloud auth login

# 设置项目
gcloud config set project fleet-blend-469520-n7

# 验证
gcloud config list
```

---

## 🎯 方案选择

### 方案 A：Cloud Run（推荐）⭐
- ✅ 无服务器，自动扩展
- ✅ 按使用量付费
- ✅ 自动 HTTPS
- ✅ 全球负载均衡
- 💰 成本：约 $20-50/月

### 方案 B：Compute Engine（VM）
- ✅ 完全控制
- ✅ 固定成本
- ⚠️ 需要自己管理
- 💰 成本：约 $50-100/月

---

## 🚀 方案 A：Cloud Run 部署（推荐）

### 步骤 1：启用必要的 API
```bash
# 启用 Cloud Run API
gcloud services enable run.googleapis.com

# 启用 Container Registry API
gcloud services enable containerregistry.googleapis.com

# 启用 Artifact Registry API
gcloud services enable artifactregistry.googleapis.com
```

### 步骤 2：配置 Docker
```bash
# 配置 Docker 认证
gcloud auth configure-docker
```

### 步骤 3：构建 Docker 镜像
```bash
# 进入项目目录
cd cineflow-mvp

# 构建镜像（使用 Cloud Build）
gcloud builds submit --tag gcr.io/fleet-blend-469520-n7/cineflow:latest

# 或者本地构建后推送
docker build -t gcr.io/fleet-blend-469520-n7/cineflow:latest .
docker push gcr.io/fleet-blend-469520-n7/cineflow:latest
```

### 步骤 4：创建 Secret（存储服务账号密钥）
```bash
# 创建 Secret Manager secret
gcloud secrets create vertex-key --data-file=vertex-key.json

# 授权 Cloud Run 访问 Secret
gcloud secrets add-iam-policy-binding vertex-key \
  --member="serviceAccount:$(gcloud projects describe fleet-blend-469520-n7 --format='value(projectNumber)')-compute@developer.gserviceaccount.com" \
  --role="roles/secretmanager.secretAccessor"
```

### 步骤 5：部署到 Cloud Run
```bash
gcloud run deploy cineflow \
  --image gcr.io/fleet-blend-469520-n7/cineflow:latest \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated \
  --memory 4Gi \
  --cpu 2 \
  --timeout 300 \
  --max-instances 10 \
  --set-env-vars "GOOGLE_CLOUD_PROJECT=fleet-blend-469520-n7,VERTEX_AI_LOCATION=us-central1,NODE_ENV=production" \
  --set-secrets "GOOGLE_APPLICATION_CREDENTIALS_JSON=vertex-key:latest"
```

### 步骤 6：获取 URL
```bash
# 部署完成后会显示 URL，类似：
# https://cineflow-xxxxx-uc.a.run.app

# 或者查询
gcloud run services describe cineflow --region us-central1 --format 'value(status.url)'
```

### 步骤 7：测试
```bash
# 访问应用
curl https://your-cloud-run-url.run.app

# 测试 API
curl https://your-cloud-run-url.run.app/api/quota/status
```

---

## 🚀 方案 B：Compute Engine 部署

### 步骤 1：创建 VM 实例
```bash
gcloud compute instances create cineflow-vm \
  --zone=us-central1-a \
  --machine-type=e2-standard-4 \
  --image-family=ubuntu-2004-lts \
  --image-project=ubuntu-os-cloud \
  --boot-disk-size=50GB \
  --tags=http-server,https-server
```

### 步骤 2：配置防火墙
```bash
# 允许 HTTP 流量
gcloud compute firewall-rules create allow-http \
  --allow tcp:80 \
  --target-tags http-server

# 允许应用端口
gcloud compute firewall-rules create allow-app \
  --allow tcp:3000 \
  --target-tags http-server
```

### 步骤 3：连接到 VM
```bash
gcloud compute ssh cineflow-vm --zone=us-central1-a
```

### 步骤 4：在 VM 上安装环境
```bash
# 更新系统
sudo apt update && sudo apt upgrade -y

# 安装 Node.js 18
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# 安装 PM2
sudo npm install -g pm2

# 验证
node -v
npm -v
```

### 步骤 5：上传代码
```bash
# 在本地执行
gcloud compute scp --recurse cineflow-mvp cineflow-vm:~/ --zone=us-central1-a
gcloud compute scp vertex-key.json cineflow-vm:~/cineflow-mvp/ --zone=us-central1-a
```

### 步骤 6：部署应用
```bash
# SSH 到 VM
gcloud compute ssh cineflow-vm --zone=us-central1-a

# 进入目录
cd ~/cineflow-mvp

# 创建环境变量
cat > .env.local << EOF
GOOGLE_CLOUD_PROJECT=fleet-blend-469520-n7
VERTEX_AI_LOCATION=us-central1
NODE_ENV=production
EOF

# 安装依赖
npm install

# 构建
npm run build

# 启动
pm2 start ecosystem.config.js
pm2 save
pm2 startup
```

### 步骤 7：获取外部 IP
```bash
gcloud compute instances describe cineflow-vm --zone=us-central1-a --format='get(networkInterfaces[0].accessConfigs[0].natIP)'
```

访问：`http://EXTERNAL_IP:3000`

---

## 💰 成本估算

### Cloud Run（推荐）
```
假设：
- 每月 10,000 次请求
- 每次请求 30 秒
- 4GB 内存

成本：
- 请求费用：$0.40
- CPU 时间：$18
- 内存：$2
- 网络：$5
总计：约 $25/月
```

### Compute Engine
```
e2-standard-4 (4 vCPU, 16GB RAM):
- 实例费用：$120/月
- 网络：$10/月
总计：约 $130/月
```

---

## 🔧 配置自定义域名

### 1. 在 Cloud Run 中配置
```bash
# 映射域名
gcloud run domain-mappings create \
  --service cineflow \
  --domain your-domain.com \
  --region us-central1
```

### 2. 配置 DNS
按照提示在你的域名提供商处添加 DNS 记录。

---

## 📊 监控和日志

### 查看日志
```bash
# Cloud Run 日志
gcloud run services logs read cineflow --region us-central1

# 实时日志
gcloud run services logs tail cineflow --region us-central1
```

### 查看指标
访问：https://console.cloud.google.com/run

---

## 🔄 更新部署

### Cloud Run
```bash
# 重新构建镜像
gcloud builds submit --tag gcr.io/fleet-blend-469520-n7/cineflow:latest

# 部署新版本
gcloud run deploy cineflow \
  --image gcr.io/fleet-blend-469520-n7/cineflow:latest \
  --region us-central1
```

### Compute Engine
```bash
# SSH 到 VM
gcloud compute ssh cineflow-vm --zone=us-central1-a

# 更新代码
cd ~/cineflow-mvp
git pull  # 或重新上传

# 重新构建和重启
npm install
npm run build
pm2 restart cineflow
```

---

## 🆘 常见问题

### Q: Cloud Run 超时？
```bash
# 增加超时时间（最大 3600 秒）
gcloud run services update cineflow \
  --timeout 600 \
  --region us-central1
```

### Q: 内存不足？
```bash
# 增加内存
gcloud run services update cineflow \
  --memory 8Gi \
  --region us-central1
```

### Q: 如何查看错误？
```bash
# 查看最近的错误日志
gcloud run services logs read cineflow \
  --region us-central1 \
  --limit 50 \
  --format json | jq 'select(.severity=="ERROR")'
```

---

## ✅ 部署检查清单

- [ ] Google Cloud SDK 已安装
- [ ] 已登录并设置项目
- [ ] API 已启用（Cloud Run / Compute Engine）
- [ ] Docker 镜像已构建（Cloud Run）
- [ ] Secret 已创建（Cloud Run）
- [ ] 服务已部署
- [ ] 防火墙已配置（Compute Engine）
- [ ] 可以访问应用
- [ ] 可以生成图片

---

## 🎉 部署完成！

**Cloud Run URL:**
```
https://cineflow-xxxxx-uc.a.run.app
https://cineflow-xxxxx-uc.a.run.app/canvas
```

**Compute Engine:**
```
http://EXTERNAL_IP:3000
http://EXTERNAL_IP:3000/canvas
```

---

## 📝 推荐配置

我强烈推荐使用 **Cloud Run**，因为：
1. ✅ 自动扩展（流量大时自动增加实例）
2. ✅ 按使用量付费（没有流量时几乎不花钱）
3. ✅ 自动 HTTPS
4. ✅ 全球 CDN
5. ✅ 无需管理服务器

有问题随时问我！🚀

