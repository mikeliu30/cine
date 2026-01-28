# 🚀 Google Cloud Run 自动化部署 - 完整配置

## 📋 前提条件

- ✅ Google Cloud SDK 已安装（版本 553.0.0）
- ✅ 已登录账号：ruby@spoonlabs-partners.com
- ✅ 代码已推送到 GitHub：https://github.com/mikeliu30/cine
- ⚠️ 需要启用计费账号

---

## 第一步：启用 Google Cloud 计费账号

### 1.1 访问计费页面

打开浏览器，访问：
```
https://console.cloud.google.com/billing
```

### 1.2 创建或关联计费账号

**如果你是新用户：**
1. 点击 **"创建账号"**
2. 输入信用卡信息
3. 获得 **$300 免费额度**（90 天有效）
4. 点击 **"启用计费"**

**如果已有计费账号：**
1. 选择现有计费账号
2. 点击 **"关联项目"**
3. 选择项目：`gen-lang-client-0537716100` 或 `main-duality-485606-h6`

### 1.3 验证计费已启用

在 PowerShell 中运行：
```powershell
gcloud beta billing projects describe gen-lang-client-0537716100
```

应该看到：
```
billingAccountName: billingAccounts/XXXXXX-XXXXXX-XXXXXX
billingEnabled: true
```

---

## 第二步：运行自动化配置脚本

### 2.1 设置项目

```powershell
cd D:\cineflow

# 设置要使用的项目
gcloud config set project gen-lang-client-0537716100
```

### 2.2 启用必要的 API

```powershell
# 启用 Cloud Run API
gcloud services enable run.googleapis.com

# 启用 Container Registry API
gcloud services enable containerregistry.googleapis.com

# 启用 Cloud Build API
gcloud services enable cloudbuild.googleapis.com

# 启用 Secret Manager API
gcloud services enable secretmanager.googleapis.com

# 启用 Vertex AI API
gcloud services enable aiplatform.googleapis.com

# 启用 Artifact Registry API
gcloud services enable artifactregistry.googleapis.com
```

这个过程可能需要 2-3 分钟。

### 2.3 创建服务账号

```powershell
# 创建服务账号
gcloud iam service-accounts create github-actions --display-name="GitHub Actions Deployer"

# 获取项目 ID
$PROJECT_ID = gcloud config get-value project

# 授予 Cloud Run Admin 权限
gcloud projects add-iam-policy-binding $PROJECT_ID --member="serviceAccount:github-actions@$PROJECT_ID.iam.gserviceaccount.com" --role="roles/run.admin"

# 授予 Storage Admin 权限
gcloud projects add-iam-policy-binding $PROJECT_ID --member="serviceAccount:github-actions@$PROJECT_ID.iam.gserviceaccount.com" --role="roles/storage.admin"

# 授予 Service Account User 权限
gcloud projects add-iam-policy-binding $PROJECT_ID --member="serviceAccount:github-actions@$PROJECT_ID.iam.gserviceaccount.com" --role="roles/iam.serviceAccountUser"

# 授予 Artifact Registry Admin 权限
gcloud projects add-iam-policy-binding $PROJECT_ID --member="serviceAccount:github-actions@$PROJECT_ID.iam.gserviceaccount.com" --role="roles/artifactregistry.admin"
```

### 2.4 生成服务账号密钥

```powershell
# 生成密钥文件
gcloud iam service-accounts keys create github-actions-key.json --iam-account=github-actions@$PROJECT_ID.iam.gserviceaccount.com

# 查看密钥内容
Get-Content github-actions-key.json
```

**⚠️ 重要：复制整个 JSON 内容，稍后需要添加到 GitHub Secrets**

---

## 第三步：配置 GitHub Secrets

### 3.1 访问 GitHub Secrets 页面

打开浏览器，访问：
```
https://github.com/mikeliu30/cine/settings/secrets/actions
```

### 3.2 添加 Secret 1: GCP_PROJECT_ID

1. 点击 **"New repository secret"**
2. Name: `GCP_PROJECT_ID`
3. Value: `gen-lang-client-0537716100`
4. 点击 **"Add secret"**

### 3.3 添加 Secret 2: GCP_SA_KEY

1. 点击 **"New repository secret"**
2. Name: `GCP_SA_KEY`
3. Value: 粘贴 `github-actions-key.json` 的完整内容
4. 点击 **"Add secret"**

示例格式：
```json
{
  "type": "service_account",
  "project_id": "gen-lang-client-0537716100",
  "private_key_id": "...",
  "private_key": "-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n",
  "client_email": "github-actions@gen-lang-client-0537716100.iam.gserviceaccount.com",
  ...
}
```

### 3.4 验证 Secrets

确保添加了以下 2 个 Secrets：
- ✅ `GCP_PROJECT_ID`
- ✅ `GCP_SA_KEY`

---

## 第四步：更新 GitHub Actions 工作流

### 4.1 检查工作流文件

文件位置：`.github\workflows\deploy-cloud-run.yml`

确保内容正确：
```yaml
name: Deploy to Cloud Run

on:
  push:
    branches:
      - main
  workflow_dispatch:

env:
  PROJECT_ID: ${{ secrets.GCP_PROJECT_ID }}
  REGION: us-central1
  SERVICE_NAME: cineflow-app

jobs:
  deploy:
    name: Deploy to Cloud Run
    runs-on: ubuntu-latest

    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Set up Cloud SDK
        uses: google-github-actions/setup-gcloud@v2
        with:
          service_account_key: ${{ secrets.GCP_SA_KEY }}
          project_id: ${{ secrets.GCP_PROJECT_ID }}
          export_default_credentials: true

      - name: Authenticate Docker to GCR
        run: |
          gcloud auth configure-docker

      - name: Build Docker image
        run: |
          docker build -t gcr.io/$PROJECT_ID/$SERVICE_NAME:$GITHUB_SHA .

      - name: Push Docker image to GCR
        run: |
          docker push gcr.io/$PROJECT_ID/$SERVICE_NAME:$GITHUB_SHA

      - name: Deploy to Cloud Run
        run: |
          gcloud run deploy $SERVICE_NAME \
            --image gcr.io/$PROJECT_ID/$SERVICE_NAME:$GITHUB_SHA \
            --platform managed \
            --region $REGION \
            --allow-unauthenticated \
            --memory 2Gi \
            --cpu 2 \
            --timeout 300 \
            --set-env-vars "NODE_ENV=production"

      - name: Show deployment URL
        run: |
          gcloud run services describe $SERVICE_NAME --region $REGION --format 'value(status.url)'
```

---

## 第五步：推送代码触发部署

### 5.1 提交并推送

```powershell
cd D:\cineflow

# 添加所有文件
git add .

# 提交
git commit -m "Enable Cloud Run auto deployment"

# 推送到 GitHub（自动触发部署）
git push
```

### 5.2 查看部署进度

访问：
```
https://github.com/mikeliu30/cine/actions
```

你会看到：
- 🟡 **黄色圆圈** - 正在部署（约 5-10 分钟）
- ✅ **绿色对勾** - 部署成功
- ❌ **红色叉号** - 部署失败

### 5.3 获取部署 URL

部署成功后，在 Actions 日志最后会显示：
```
https://cineflow-app-xxxxx-uc.a.run.app
```

---

## 第六步：验证部署

### 6.1 访问应用

打开浏览器，访问部署 URL，应该能看到：
- ✅ 首页正常显示
- ✅ 进入画布功能正常
- ✅ AI 生成功能可用

### 6.2 测试功能

1. 进入画布
2. 双击创建节点
3. 选择 Mock 模式
4. 输入提示词
5. 点击生成
6. 应该看到测试图片/视频

---

## 🔄 后续更新流程

每次修改代码后：

```powershell
git add .
git commit -m "你的修改说明"
git push
```

GitHub Actions 会自动：
1. ✅ 检出代码
2. ✅ 构建 Docker 镜像
3. ✅ 推送到 Container Registry
4. ✅ 部署到 Cloud Run
5. ✅ 更新线上服务（零停机）

---

## 📊 Cloud Run 功能

部署成功后，你的应用会拥有：

- ✅ **自动扩容** - 根据流量自动调整实例数（0-1000）
- ✅ **HTTPS 加密** - 自动 SSL 证书
- ✅ **全球 CDN** - Google 全球网络加速
- ✅ **零停机部署** - 新版本平滑切换
- ✅ **自动健康检查** - 自动重启故障实例
- ✅ **实时日志** - 查看运行日志
- ✅ **自定义域名** - 可以绑定自己的域名

---

## 💰 费用说明

### 免费额度（每月）
- ✅ 200 万次请求
- ✅ 360,000 GB-秒
- ✅ 180,000 vCPU-秒

### 预估费用
对于中小型应用，通常在免费额度内。

### 查看费用
访问：https://console.cloud.google.com/billing

---

## 🆘 常见问题

### Q1: API 启用失败？
**A:** 需要启用计费账号
- 访问：https://console.cloud.google.com/billing
- 关联计费账号到项目

### Q2: 部署失败 "Permission denied"？
**A:** 检查服务账号权限
```powershell
gcloud projects get-iam-policy $PROJECT_ID
```

### Q3: 部署成功但无法访问？
**A:** 检查是否允许未经身份验证的访问
```powershell
gcloud run services add-iam-policy-binding cineflow-app --region=us-central1 --member="allUsers" --role="roles/run.invoker"
```

### Q4: 如何查看日志？
**A:** 
```powershell
gcloud logging read "resource.type=cloud_run_revision AND resource.labels.service_name=cineflow-app" --limit 50
```

或访问：https://console.cloud.google.com/run

---

## 🎉 完成！

现在你的项目已经：
- ✅ 配置了 Google Cloud Run
- ✅ 设置了自动化部署
- ✅ 每次推送代码自动部署
- ✅ 拥有公开访问的 URL

**下次修改代码，只需要：**
```powershell
git add .
git commit -m "你的修改说明"
git push
```

就会自动部署！🚀

