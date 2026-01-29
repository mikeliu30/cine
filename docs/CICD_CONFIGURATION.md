# 🔄 CI/CD 自动部署配置指南

> **最后更新**: 2026-01-29  
> **项目**: CineFlow MVP  
> **CI/CD 工具**: GitHub Actions

---

## 📋 目录

1. [CI/CD 架构概览](#cicd-架构概览)
2. [Cloud Run Workflow 配置](#cloud-run-workflow-配置)
3. [Firebase Workflow 配置](#firebase-workflow-配置)
4. [Workflow 工作原理](#workflow-工作原理)
5. [触发条件](#触发条件)
6. [监控与调试](#监控与调试)

---

## 🏗️ CI/CD 架构概览

### 自动部署流程

```
开发者推送代码到 GitHub
         ↓
GitHub Actions 自动触发
         ↓
    ┌────┴────┐
    ↓         ↓
Cloud Run   Firebase
  (SSR)     (静态)
    ↓         ↓
  部署成功   部署成功
```

### 两个独立的 Workflow

| Workflow | 文件 | 触发条件 | 部署目标 | 耗时 |
|---------|------|---------|---------|------|
| **Deploy to Cloud Run** | `deploy-cloudrun.yml` | 推送到 main | Cloud Run | 3-5 分钟 |
| **Deploy to Firebase** | `firebase-hosting-merge.yml` | 推送到 main | Firebase Hosting | 1-2 分钟 |

---

## ☁️ Cloud Run Workflow 配置

### 文件位置

```
.github/workflows/deploy-cloudrun.yml
```

### 完整配置

```yaml
name: Deploy to Cloud Run

on:
  push:
    branches:
      - main  # 监听 main 分支的推送
  workflow_dispatch:  # 允许手动触发

env:
  PROJECT_ID: gen-lang-client-0537716100
  SERVICE_NAME: cineflow
  REGION: us-central1

jobs:
  deploy:
    runs-on: ubuntu-latest
    
    steps:
      # 步骤 1: 检出代码
      - name: Checkout code
        uses: actions/checkout@v4

      # 步骤 2: 认证到 Google Cloud
      - name: Authenticate to Google Cloud
        uses: google-github-actions/auth@v2
        with:
          credentials_json: ${{ secrets.GCP_SA_KEY }}

      # 步骤 3: 设置 Cloud SDK
      - name: Set up Cloud SDK
        uses: google-github-actions/setup-gcloud@v2

      # 步骤 4: 配置 Docker 认证
      - name: Configure Docker for GCR
        run: gcloud auth configure-docker

      # 步骤 5: 删除旧服务（可选）
      - name: Delete existing Cloud Run service
        run: |
          gcloud run services delete ${{ env.SERVICE_NAME }} \
            --region=${{ env.REGION }} \
            --quiet || echo "Service does not exist, skipping deletion"

      # 步骤 6: 构建并推送 Docker 镜像
      - name: Build and Push Docker image
        run: |
          docker build -t gcr.io/${{ env.PROJECT_ID }}/${{ env.SERVICE_NAME }}:${{ github.sha }} .
          docker push gcr.io/${{ env.PROJECT_ID }}/${{ env.SERVICE_NAME }}:${{ github.sha }}

      # 步骤 7: 部署到 Cloud Run
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

      # 步骤 8: 显示部署 URL
      - name: Show deployment URL
        run: |
          gcloud run services describe ${{ env.SERVICE_NAME }} \
            --region ${{ env.REGION }} \
            --format 'value(status.url)'
```

### 配置说明

#### 环境变量

| 变量 | 值 | 说明 |
|-----|---|------|
| `PROJECT_ID` | `gen-lang-client-0537716100` | GCP 项目 ID |
| `SERVICE_NAME` | `cineflow` | Cloud Run 服务名称 |
| `REGION` | `us-central1` | 部署区域 |

#### 必需的 GitHub Secrets

| Secret | 说明 | 获取方式 |
|--------|------|---------|
| `GCP_SA_KEY` | 服务账号密钥 | `gcloud iam service-accounts keys create` |

#### 部署参数

| 参数 | 值 | 说明 |
|-----|---|------|
| `--memory` | `2Gi` | 内存限制 |
| `--cpu` | `2` | CPU 核心数 |
| `--timeout` | `300` | 请求超时（秒） |
| `--max-instances` | `10` | 最大实例数 |
| `--allow-unauthenticated` | - | 允许公开访问 |

---

## 🔥 Firebase Workflow 配置

### 文件位置

```
.github/workflows/firebase-hosting-merge.yml
```

### 完整配置

```yaml
name: Deploy to Firebase Hosting on merge

on:
  push:
    branches:
      - main  # 监听 main 分支的推送
  workflow_dispatch:  # 允许手动触发

jobs:
  build_and_deploy:
    runs-on: ubuntu-latest
    
    steps:
      # 步骤 1: 检出代码
      - name: Checkout code
        uses: actions/checkout@v4

      # 步骤 2: 设置 Node.js 环境
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'

      # 步骤 3: 安装依赖
      - name: Install dependencies
        run: npm ci

      # 步骤 4: 构建项目（静态导出模式）
      - name: Build project for Firebase (static export)
        run: npm run build
        env:
          NODE_ENV: production
          FIREBASE_BUILD: true  # 关键！触发静态导出

      # 步骤 5: 部署到 Firebase Hosting
      - name: Deploy to Firebase Hosting
        uses: FirebaseExtended/action-hosting-deploy@v0
        with:
          repoToken: '${{ secrets.GITHUB_TOKEN }}'
          firebaseServiceAccount: '${{ secrets.FIREBASE_SERVICE_ACCOUNT }}'
          channelId: live
          projectId: aigc-workflow
```

### 配置说明

#### 必需的 GitHub Secrets

| Secret | 说明 | 获取方式 |
|--------|------|---------|
| `FIREBASE_SERVICE_ACCOUNT` | Firebase 服务账号密钥 | Firebase 控制台生成 |
| `GITHUB_TOKEN` | GitHub 自动提供 | 无需手动配置 |

#### 关键环境变量

```yaml
env:
  NODE_ENV: production
  FIREBASE_BUILD: true  # 触发 next.config.mjs 中的静态导出模式
```

---

## ⚙️ Workflow 工作原理

### Cloud Run Workflow 详解

#### 1. **触发阶段**
```yaml
on:
  push:
    branches:
      - main
```
- 当代码推送到 `main` 分支时自动触发
- 也可以通过 `workflow_dispatch` 手动触发

#### 2. **认证阶段**
```yaml
- uses: google-github-actions/auth@v2
  with:
    credentials_json: ${{ secrets.GCP_SA_KEY }}
```
- 使用服务账号密钥认证到 Google Cloud
- 密钥存储在 GitHub Secrets 中

#### 3. **构建阶段**
```bash
docker build -t gcr.io/$PROJECT_ID/$SERVICE_NAME:$COMMIT_SHA .
docker push gcr.io/$PROJECT_ID/$SERVICE_NAME:$COMMIT_SHA
```
- 使用 Dockerfile 构建 Docker 镜像
- 推送到 Google Container Registry (GCR)
- 使用 commit SHA 作为镜像标签

#### 4. **部署阶段**
```bash
gcloud run deploy $SERVICE_NAME \
  --image gcr.io/$PROJECT_ID/$SERVICE_NAME:$COMMIT_SHA \
  --region $REGION
```
- 部署镜像到 Cloud Run
- 自动配置负载均衡和自动扩缩容

---

### Firebase Workflow 详解

#### 1. **构建阶段**
```yaml
- run: npm run build
  env:
    FIREBASE_BUILD: true
```
- 设置 `FIREBASE_BUILD=true` 环境变量
- 触发 `next.config.mjs` 中的静态导出模式
- 生成 `out/` 目录

#### 2. **部署阶段**
```yaml
- uses: FirebaseExtended/action-hosting-deploy@v0
```
- 使用 Firebase 官方 Action
- 自动上传 `out/` 目录到 Firebase Hosting
- 部署到全球 CDN

---

## 🎯 触发条件

### 自动触发

```powershell
# 推送代码到 main 分支
git push origin main
```

**触发结果**:
- ✅ Cloud Run Workflow 启动
- ✅ Firebase Workflow 启动
- ✅ 两个部署并行执行

---

### 手动触发

#### 方法 1: GitHub 网页界面

1. 访问: `https://github.com/mikeliu30/cine/actions`
2. 选择要运行的 Workflow
3. 点击 **"Run workflow"**
4. 选择分支（通常是 `main`）
5. 点击 **"Run workflow"** 确认

#### 方法 2: GitHub CLI

```powershell
# 触发 Cloud Run 部署
gh workflow run "Deploy to Cloud Run"

# 触发 Firebase 部署
gh workflow run "Deploy to Firebase Hosting on merge"
```

---

## 📊 监控与调试

### 查看 Workflow 运行状态

访问: `https://github.com/mikeliu30/cine/actions`

**状态图标**:
- 🟡 **黄色圆圈**: 正在运行
- ✅ **绿色勾号**: 成功
- ❌ **红色叉号**: 失败

---

### 查看详细日志

1. 点击 Workflow 名称
2. 点击具体的运行记录
3. 展开每个步骤查看日志

**关键日志位置**:
- **Cloud Run**: "Deploy to Cloud Run" 步骤
- **Firebase**: "Deploy to Firebase Hosting" 步骤

---

### 常见失败原因

| 错误 | 原因 | 解决方案 |
|-----|------|---------|
| **Authentication failed** | GitHub Secrets 配置错误 | 检查 `GCP_SA_KEY` 或 `FIREBASE_SERVICE_ACCOUNT` |
| **Permission denied** | 服务账号权限不足 | 重新授予 IAM 权限 |
| **Build failed** | 代码编译错误 | 检查本地 `npm run build` |
| **Timeout** | 构建时间过长 | 优化依赖或增加超时时间 |

---

## 🔧 高级配置

### 添加环境变量

在 Cloud Run Workflow 中添加环境变量：

```yaml
--set-env-vars NODE_ENV=production,API_KEY=xxx,DATABASE_URL=yyy
```

### 配置多环境部署

```yaml
on:
  push:
    branches:
      - main      # 生产环境
      - staging   # 预发布环境
      - develop   # 开发环境
```

### 添加通知

在 Workflow 末尾添加通知步骤：

```yaml
- name: Notify on success
  if: success()
  run: echo "Deployment successful!"

- name: Notify on failure
  if: failure()
  run: echo "Deployment failed!"
```

---

## 🎉 总结

### ✅ CI/CD 配置完成清单

- ✅ Cloud Run Workflow 已配置
- ✅ Firebase Workflow 已配置
- ✅ GitHub Secrets 已设置
- ✅ 自动部署已启用
- ✅ 手动触发已启用

### 📊 部署时间

| Workflow | 平均耗时 | 最快 | 最慢 |
|---------|---------|------|------|
| Cloud Run | 3-5 分钟 | 2m 59s | 8 分钟 |
| Firebase | 1-2 分钟 | 1m 8s | 3 分钟 |

---

**文档结束** 🎉


