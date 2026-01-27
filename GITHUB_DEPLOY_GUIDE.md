# 🚀 GitHub + Cloud Run 自动化部署完整指南

## 📋 目录
1. [初始化 Git 仓库](#step1)
2. [创建 GitHub 仓库](#step2)
3. [配置 Google Cloud](#step3)
4. [配置 GitHub Secrets](#step4)
5. [推送代码并自动部署](#step5)
6. [验证部署](#step6)

---

## <a name="step1"></a>第一步：初始化 Git 仓库

### 1. 打开 PowerShell，进入项目目录

```powershell
cd D:\cineflow
```

### 2. 初始化 Git 仓库

```powershell
git init
```

### 3. 配置 Git 用户信息（如果还没配置）

```powershell
git config --global user.name "你的名字"
git config --global user.email "你的邮箱@example.com"
```

### 4. 添加所有文件到暂存区

```powershell
git add .
```

### 5. 创建第一次提交

```powershell
git commit -m "Initial commit: CineFlow v2.0.0 with AI generation"
```

---

## <a name="step2"></a>第二步：创建 GitHub 仓库

### 1. 访问 GitHub

打开浏览器，访问：https://github.com/new

### 2. 创建新仓库

填写以下信息：
- **Repository name**: `cineflow` 或 `cineflow-ssr-lab`
- **Description**: `多人实时协作画布 · AIGC 卡牌生成系统`
- **Visibility**: 
  - ✅ **Public** - 公开仓库（推荐）
  - ⚪ **Private** - 私有仓库
- **不要勾选**：
  - ❌ Add a README file
  - ❌ Add .gitignore
  - ❌ Choose a license

### 3. 点击 "Create repository"

---

## <a name="step3"></a>第三步：配置 Google Cloud

### 1. 创建 Google Cloud 项目（如果还没有）

访问：https://console.cloud.google.com/

```bash
# 或使用命令行
gcloud projects create cineflow-prod --name="CineFlow Production"
gcloud config set project cineflow-prod
```

### 2. 启用必要的 API

```bash
# 启用 Cloud Run API
gcloud services enable run.googleapis.com

# 启用 Container Registry API
gcloud services enable containerregistry.googleapis.com

# 启用 Cloud Build API
gcloud services enable cloudbuild.googleapis.com

# 启用 Secret Manager API
gcloud services enable secretmanager.googleapis.com

# 启用 Vertex AI API（用于 AI 生成）
gcloud services enable aiplatform.googleapis.com
```

### 3. 创建服务账号

```bash
# 创建服务账号
gcloud iam service-accounts create github-actions \
  --display-name="GitHub Actions Deployer"

# 获取项目 ID
export PROJECT_ID=$(gcloud config get-value project)

# 授予权限
gcloud projects add-iam-policy-binding $PROJECT_ID \
  --member="serviceAccount:github-actions@$PROJECT_ID.iam.gserviceaccount.com" \
  --role="roles/run.admin"

gcloud projects add-iam-policy-binding $PROJECT_ID \
  --member="serviceAccount:github-actions@$PROJECT_ID.iam.gserviceaccount.com" \
  --role="roles/storage.admin"

gcloud projects add-iam-policy-binding $PROJECT_ID \
  --member="serviceAccount:github-actions@$PROJECT_ID.iam.gserviceaccount.com" \
  --role="roles/iam.serviceAccountUser"
```

### 4. 创建服务账号密钥

```bash
# 生成密钥文件
gcloud iam service-accounts keys create github-actions-key.json \
  --iam-account=github-actions@$PROJECT_ID.iam.gserviceaccount.com

# 查看密钥内容（复制整个 JSON）
cat github-actions-key.json
```

**⚠️ 重要：复制整个 JSON 内容，稍后需要添加到 GitHub Secrets**

### 5. 创建 Secret Manager 密钥

```bash
# Vertex AI 凭证
echo -n '你的 vertex-key.json 内容' | gcloud secrets create vertex-credentials --data-file=-

# OpenAI API Key
echo -n 'sk-your-openai-key' | gcloud secrets create openai-api-key --data-file=-

# Replicate API Key
echo -n 'r8_your-replicate-key' | gcloud secrets create replicate-api-key --data-file=-

# Runway API Key
echo -n 'your-runway-key' | gcloud secrets create runway-api-key --data-file=-

# 豆包 API Key
echo -n 'your-ark-key' | gcloud secrets create ark-api-key --data-file=-
```

---

## <a name="step4"></a>第四步：配置 GitHub Secrets

### 1. 进入 GitHub 仓库设置

访问：`https://github.com/你的用户名/cineflow/settings/secrets/actions`

### 2. 添加以下 Secrets

点击 **"New repository secret"**，逐个添加：

#### Secret 1: GCP_PROJECT_ID
```
Name: GCP_PROJECT_ID
Value: 你的 Google Cloud 项目 ID（例如：cineflow-prod）
```

#### Secret 2: GCP_SA_KEY
```
Name: GCP_SA_KEY
Value: 粘贴 github-actions-key.json 的完整内容
```

示例格式：
```json
{
  "type": "service_account",
  "project_id": "cineflow-prod",
  "private_key_id": "...",
  "private_key": "-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n",
  "client_email": "github-actions@cineflow-prod.iam.gserviceaccount.com",
  ...
}
```

### 3. 验证 Secrets

确保添加了以下 2 个 Secrets：
- ✅ `GCP_PROJECT_ID`
- ✅ `GCP_SA_KEY`

---

## <a name="step5"></a>第五步：推送代码并自动部署

### 1. 关联远程仓库

```powershell
# 替换为你的 GitHub 用户名和仓库名
git remote add origin https://github.com/你的用户名/cineflow.git
```

### 2. 推送代码到 GitHub

```powershell
# 推送到 main 分支
git branch -M main
git push -u origin main
```

### 3. 自动触发部署

推送成功后，GitHub Actions 会自动：
1. ✅ 检出代码
2. ✅ 构建 Docker 镜像
3. ✅ 推送到 Google Container Registry
4. ✅ 部署到 Cloud Run
5. ✅ 显示部署 URL

### 4. 查看部署进度

访问：`https://github.com/你的用户名/cineflow/actions`

你会看到：
- 🟡 **黄色圆圈** - 正在部署
- ✅ **绿色对勾** - 部署成功
- ❌ **红色叉号** - 部署失败

---

## <a name="step6"></a>第六步：验证部署

### 1. 获取部署 URL

部署成功后，在 Actions 日志最后会显示：

```
https://cineflow-app-xxxxx-uc.a.run.app
```

### 2. 访问应用

打开浏览器，访问上面的 URL，应该能看到：
- ✅ 首页正常显示
- ✅ 进入画布功能正常
- ✅ AI 生成功能可用

### 3. 测试功能

```bash
# 测试图片生成
1. 进入画布
2. 双击创建节点
3. 选择 Mock 模式
4. 输入提示词
5. 点击生成
6. 应该看到测试图片

# 测试视频生成
1. 右键 → 添加视频节点
2. 选择 Mock 模式
3. 输入提示词
4. 点击生成
5. 应该看到测试视频
```

---

## 🔄 后续更新流程

### 每次修改代码后：

```powershell
# 1. 查看修改
git status

# 2. 添加修改
git add .

# 3. 提交修改
git commit -m "描述你的修改"

# 4. 推送到 GitHub
git push

# 5. 自动触发部署
# GitHub Actions 会自动部署到 Cloud Run
```

---

## 🛠️ 常见问题

### Q1: 推送失败，提示权限错误？

**A:** 需要配置 GitHub 认证

```powershell
# 方法 1：使用 Personal Access Token
# 1. 访问 https://github.com/settings/tokens
# 2. 生成新 token，勾选 repo 权限
# 3. 使用 token 作为密码推送

# 方法 2：使用 SSH
# 1. 生成 SSH 密钥
ssh-keygen -t ed25519 -C "你的邮箱@example.com"

# 2. 添加到 GitHub
# 访问 https://github.com/settings/keys
# 添加 ~/.ssh/id_ed25519.pub 的内容

# 3. 修改远程地址
git remote set-url origin git@github.com:你的用户名/cineflow.git
```

### Q2: GitHub Actions 部署失败？

**A:** 检查以下几点：

1. **检查 Secrets 是否正确配置**
   - 访问仓库 Settings → Secrets → Actions
   - 确认 `GCP_PROJECT_ID` 和 `GCP_SA_KEY` 存在

2. **检查 Google Cloud API 是否启用**
   ```bash
   gcloud services list --enabled
   ```

3. **查看详细错误日志**
   - 访问 GitHub Actions 页面
   - 点击失败的工作流
   - 查看具体错误信息

### Q3: Cloud Run 部署成功但无法访问？

**A:** 检查以下几点：

1. **检查服务是否允许未经身份验证的访问**
   ```bash
   gcloud run services add-iam-policy-binding cineflow-app \
     --region=us-central1 \
     --member="allUsers" \
     --role="roles/run.invoker"
   ```

2. **检查环境变量是否正确**
   ```bash
   gcloud run services describe cineflow-app --region=us-central1
   ```

3. **查看 Cloud Run 日志**
   ```bash
   gcloud logging read "resource.type=cloud_run_revision AND resource.labels.service_name=cineflow-app" --limit 50
   ```

---

## 📊 部署架构图

```
本地开发
    ↓
git push
    ↓
GitHub Repository
    ↓
GitHub Actions (自动触发)
    ↓
构建 Docker 镜像
    ↓
推送到 Google Container Registry
    ↓
部署到 Cloud Run
    ↓
生成公开 URL
    ↓
用户访问应用
```

---

## 🎉 完成！

现在你的项目已经：
- ✅ 上传到 GitHub
- ✅ 配置了自动化部署
- ✅ 每次推送代码自动部署到 Cloud Run
- ✅ 拥有公开访问的 URL

**下次修改代码，只需要：**
```powershell
git add .
git commit -m "你的修改说明"
git push
```

就会自动部署！🚀

