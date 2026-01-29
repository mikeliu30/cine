# 🚀 CI/CD 自动部署流程指南

> **最后更新**: 2026-01-29  
> **项目**: CineFlow MVP  
> **CI/CD 工具**: GitHub Actions

---

## 📋 目录

1. [CI/CD 架构概览](#cicd-架构概览)
2. [前置准备工作](#前置准备工作)
3. [Cloud Run CI/CD 配置](#cloud-run-cicd-配置)
4. [Firebase CI/CD 配置](#firebase-cicd-配置)
5. [部署流程](#部署流程)
6. [监控与调试](#监控与调试)

---

## 🏗️ CI/CD 架构概览

### 自动部署流程图

```
开发者本地修改代码
         ↓
    git push origin main
         ↓
GitHub Actions 自动触发
         ↓
    ┌────┴────┐
    ↓         ↓
Cloud Run   Firebase
部署 (SSR)  部署 (静态)
    ↓         ↓
  3-5 分钟   1-2 分钟
    ↓         ↓
  部署成功   部署成功
```

### 双 Workflow 架构

| Workflow | 触发条件 | 部署目标 | 构建模式 | 耗时 |
|---------|---------|---------|---------|------|
| **Deploy to Cloud Run** | 推送到 main | Cloud Run | SSR (standalone) | 3-5 分钟 |
| **Deploy to Firebase** | 推送到 main | Firebase Hosting | 静态导出 (export) | 1-2 分钟 |

---

## ✅ 前置准备工作

### 步骤 1: 配置 Google Cloud

```powershell
# 1. 启用计费账号
# 访问: https://console.cloud.google.com/billing

# 2. 启用必要的 API
gcloud config set project gen-lang-client-0537716100
gcloud services enable run.googleapis.com
gcloud services enable containerregistry.googleapis.com
gcloud services enable cloudbuild.googleapis.com
gcloud services enable artifactregistry.googleapis.com

# 3. 创建服务账号
gcloud iam service-accounts create github-actions --display-name="GitHub Actions Deployer"

# 4. 授予权限
$PROJECT_ID = "gen-lang-client-0537716100"
gcloud projects add-iam-policy-binding $PROJECT_ID `
  --member="serviceAccount:github-actions@$PROJECT_ID.iam.gserviceaccount.com" `
  --role="roles/run.admin"
gcloud projects add-iam-policy-binding $PROJECT_ID `
  --member="serviceAccount:github-actions@$PROJECT_ID.iam.gserviceaccount.com" `
  --role="roles/storage.admin"
gcloud projects add-iam-policy-binding $PROJECT_ID `
  --member="serviceAccount:github-actions@$PROJECT_ID.iam.gserviceaccount.com" `
  --role="roles/iam.serviceAccountUser"

# 5. 生成密钥
gcloud iam service-accounts keys create github-actions-key.json `
  --iam-account=github-actions@$PROJECT_ID.iam.gserviceaccount.com
```

⏱️ **预计时间**: 10-15 分钟（一次性配置）

---

### 步骤 2: 配置 GitHub Secrets

访问: `https://github.com/mikeliu30/cine/settings/secrets/actions`

添加以下 Secrets：

| Secret Name | 值 | 用途 |
|------------|---|------|
| `GCP_SA_KEY` | `github-actions-key.json` 的完整内容 | Cloud Run 部署认证 |
| `FIREBASE_SERVICE_ACCOUNT` | Firebase 服务账号 JSON | Firebase 部署认证 |

**获取 Firebase 服务账号密钥**:
1. 访问: `https://console.firebase.google.com/project/aigc-workflow/settings/serviceaccounts/adminsdk`
2. 点击 **"生成新的私钥"**
3. 下载 JSON 文件并复制内容

---

### 步骤 3: 配置项目文件

#### 3.1 创建 Dockerfile

文件路径: `Dockerfile`

```dockerfile
FROM node:20-alpine AS base
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm ci

FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_ENV=production
RUN npm run build

FROM base AS runner
WORKDIR /app
ENV NODE_ENV=production
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
USER nextjs
EXPOSE 3000
CMD ["node", "server.js"]
```

#### 3.2 配置 next.config.mjs

文件路径: `next.config.mjs`

```javascript
const nextConfig = {
  // 根据环境变量决定输出模式
  output: process.env.FIREBASE_BUILD === 'true' ? 'export' : 'standalone',
  
  eslint: { ignoreDuringBuilds: true },
  typescript: { ignoreBuildErrors: true },
  
  // 静态导出时禁用图片优化
  ...(process.env.FIREBASE_BUILD === 'true' && {
    images: { unoptimized: true },
  }),
};

export default nextConfig;
```

**关键说明**:
- `FIREBASE_BUILD=true` → 静态导出模式（生成 `out/` 目录）
- 默认 → standalone 模式（生成 `.next/standalone/`）

#### 3.3 配置 firebase.json

文件路径: `firebase.json`

```json
{
  "hosting": {
    "public": "out",
    "ignore": ["firebase.json", "**/.*", "**/node_modules/**"],
    "rewrites": [{"source": "**", "destination": "/index.html"}]
  }
}
```

---

## ☁️ Cloud Run CI/CD 配置

### Workflow 文件

文件路径: `.github/workflows/deploy-cloudrun.yml`

```yaml
name: Deploy to Cloud Run

on:
  push:
    branches:
      - main
  workflow_dispatch:

env:
  PROJECT_ID: gen-lang-client-0537716100
  SERVICE_NAME: cineflow
  REGION: us-central1

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Authenticate to Google Cloud
        uses: google-github-actions/auth@v2
        with:
          credentials_json: ${{ secrets.GCP_SA_KEY }}

      - name: Set up Cloud SDK
        uses: google-github-actions/setup-gcloud@v2

      - name: Configure Docker for GCR
        run: gcloud auth configure-docker

      - name: Delete existing Cloud Run service
        run: |
          gcloud run services delete ${{ env.SERVICE_NAME }} \
            --region=${{ env.REGION }} \
            --quiet || echo "Service does not exist"

      - name: Build and Push Docker image
        run: |
          docker build -t gcr.io/${{ env.PROJECT_ID }}/${{ env.SERVICE_NAME }}:${{ github.sha }} .
          docker push gcr.io/${{ env.PROJECT_ID }}/${{ env.SERVICE_NAME }}:${{ github.sha }}

      - name: Deploy to Cloud Run
        run: |
          gcloud run deploy ${{ env.SERVICE_NAME }} \
            --image gcr.io/${{ env.PROJECT_ID }}/${{ env.SERVICE_NAME }}:${{ github.sha }} \
            --platform managed \
            --region ${{ env.REGION }} \
            --allow-unauthenticated \
            --memory 2Gi \
            --cpu 2 \
            --timeout 300 \
            --max-instances 10 \
            --set-env-vars NODE_ENV=production

      - name: Show deployment URL
        run: |
          gcloud run services describe ${{ env.SERVICE_NAME }} \
            --region ${{ env.REGION }} \
            --format 'value(status.url)'
```

### Workflow 工作流程

1. **触发**: 推送代码到 `main` 分支
2. **认证**: 使用 `GCP_SA_KEY` 认证到 Google Cloud
3. **构建**: 使用 Dockerfile 构建 Docker 镜像
4. **推送**: 推送镜像到 Google Container Registry
5. **部署**: 部署到 Cloud Run
6. **输出**: 显示部署 URL

---

## 🔥 Firebase CI/CD 配置

### Workflow 文件

文件路径: `.github/workflows/firebase-hosting-merge.yml`

```yaml
name: Deploy to Firebase Hosting on merge

on:
  push:
    branches:
      - main
  workflow_dispatch:

jobs:
  build_and_deploy:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Build project for Firebase (static export)
        run: npm run build
        env:
          NODE_ENV: production
          FIREBASE_BUILD: true

      - name: Deploy to Firebase Hosting
        uses: FirebaseExtended/action-hosting-deploy@v0
        with:
          repoToken: '${{ secrets.GITHUB_TOKEN }}'
          firebaseServiceAccount: '${{ secrets.FIREBASE_SERVICE_ACCOUNT }}'
          channelId: live
          projectId: aigc-workflow
```

### Workflow 工作流程

1. **触发**: 推送代码到 `main` 分支
2. **安装**: 安装 Node.js 和项目依赖
3. **构建**: 使用 `FIREBASE_BUILD=true` 触发静态导出
4. **部署**: 上传 `out/` 目录到 Firebase Hosting

---

## 🚀 部署流程

### 完整部署步骤

```powershell
# 1. 切换到项目目录
cd D:\cineflow

# 2. 查看当前状态
git status

# 3. 添加所有更改
git add .

# 4. 提交更改（使用有意义的提交信息）
git commit -m "feat: add new feature"

# 5. 推送到 GitHub（自动触发 CI/CD）
git push origin main
```

### 自动触发结果

推送后，GitHub Actions 会自动：
- ✅ 触发 Cloud Run 部署
- ✅ 触发 Firebase 部署
- ✅ 两个部署并行执行

---

### 手动触发部署

#### 方法 1: GitHub 网页界面

1. 访问: `https://github.com/mikeliu30/cine/actions`
2. 选择要运行的 Workflow
3. 点击 **"Run workflow"**
4. 选择分支（`main`）
5. 点击 **"Run workflow"** 确认

#### 方法 2: 使用 GitHub CLI

```powershell
# 触发 Cloud Run 部署
gh workflow run "Deploy to Cloud Run"

# 触发 Firebase 部署
gh workflow run "Deploy to Firebase Hosting on merge"
```

---

## 📊 监控与调试

### 查看部署状态

访问: `https://github.com/mikeliu30/cine/actions`

**状态图标**:
- 🟡 **黄色圆圈**: 正在运行
- ✅ **绿色勾号**: 部署成功
- ❌ **红色叉号**: 部署失败

### 查看详细日志

1. 点击 Workflow 名称
2. 点击具体的运行记录
3. 展开每个步骤查看日志

**关键步骤**:
- **Cloud Run**: "Build and Push Docker image" 和 "Deploy to Cloud Run"
- **Firebase**: "Build project" 和 "Deploy to Firebase Hosting"

---

### 常见错误与解决方案

| 错误信息 | 原因 | 解决方案 |
|---------|------|---------|
| `Directory 'out' does not exist` | 未设置 `FIREBASE_BUILD=true` | 检查 Firebase workflow 环境变量 |
| `Permission denied` | 服务账号权限不足 | 重新授予 IAM 权限 |
| `Authentication failed` | GitHub Secrets 错误 | 检查 Secret 内容是否完整 |
| `Build failed` | 代码编译错误 | 本地运行 `npm run build` 测试 |

---

## 🎯 部署成功验证

### Cloud Run

```powershell
# 获取部署 URL
gcloud run services describe cineflow --region us-central1 --format 'value(status.url)'
```

### Firebase

访问: `https://aigc-workflow.web.app`

---

## 📈 部署时间参考

| 阶段 | Cloud Run | Firebase |
|-----|-----------|----------|
| 代码检出 | 10 秒 | 10 秒 |
| 环境设置 | 20 秒 | 30 秒 |
| 依赖安装 | - | 60 秒 |
| 构建 | 120 秒 | 40 秒 |
| 部署 | 60 秒 | 20 秒 |
| **总计** | **3-5 分钟** | **1-2 分钟** |

---

## ✅ CI/CD 配置检查清单

### 前置配置（一次性）

- [ ] Google Cloud 计费账号已启用
- [ ] 必要的 API 已启用
- [ ] 服务账号已创建并授权
- [ ] GitHub Secrets 已配置
- [ ] Dockerfile 已创建
- [ ] next.config.mjs 已配置
- [ ] firebase.json 已配置

### Workflow 文件

- [ ] `.github/workflows/deploy-cloudrun.yml` 已创建
- [ ] `.github/workflows/firebase-hosting-merge.yml` 已创建
- [ ] 环境变量配置正确
- [ ] 触发条件配置正确

### 测试验证

- [ ] 推送代码后 Workflow 自动触发
- [ ] Cloud Run 部署成功
- [ ] Firebase 部署成功
- [ ] 部署的网站可以访问

---

## 🎉 总结

### CI/CD 优势

✅ **自动化**: 推送代码即自动部署  
✅ **并行部署**: Cloud Run 和 Firebase 同时部署  
✅ **快速反馈**: 3-5 分钟内完成部署  
✅ **可追溯**: 完整的部署日志和历史记录  
✅ **可回滚**: 可以重新运行历史版本

### 日常使用

```powershell
# 标准工作流程
git add .
git commit -m "feat: your feature"
git push origin main

# 然后访问 GitHub Actions 监控部署
# https://github.com/mikeliu30/cine/actions
```

---

**文档结束** 🎉


