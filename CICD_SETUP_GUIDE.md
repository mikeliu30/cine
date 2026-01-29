# 🚀 CI/CD 自动部署配置指南

## ✅ 已完成的配置

### 1. 服务账号创建
- **服务账号**: `github-actions-deployer@aigc-workflow.iam.gserviceaccount.com`
- **权限**:
  - `roles/run.admin` - Cloud Run 管理权限
  - `roles/iam.serviceAccountUser` - 服务账号使用权限
  - `roles/artifactregistry.writer` - Artifact Registry 写入权限

### 2. 服务账号密钥
- **密钥文件**: `github-actions-key.json` (已创建在项目根目录)
- **密钥 ID**: `d23441d860cb84c1f2fc4efa8caa0dc57a0cfe2a`

---

## 📋 需要配置的 GitHub Secrets

### 步骤 1: 打开 GitHub 仓库设置

1. 访问: https://github.com/mikeliu30/cine/settings/secrets/actions
2. 点击 **"New repository secret"**

### 步骤 2: 添加 Secret #1 - GCP_PROJECT_ID

- **Name**: `GCP_PROJECT_ID`
- **Value**: `aigc-workflow`

点击 **"Add secret"** 保存。

### 步骤 3: 添加 Secret #2 - GCP_SA_KEY

- **Name**: `GCP_SA_KEY`
- **Value**: 复制 `github-actions-key.json` 文件的**完整内容**

**重要**: 复制整个 JSON 文件内容，包括所有的花括号和换行符。

点击 **"Add secret"** 保存。

---

## 🔧 需要创建 Artifact Registry

在部署之前，需要创建 Docker 镜像仓库：

```bash
gcloud artifacts repositories create cine \
  --repository-format=docker \
  --location=us-central1 \
  --description="CineFlow Docker images" \
  --project=aigc-workflow
```

---

## 🚀 触发自动部署

配置完成后，有两种方式触发部署：

### 方式 1: 推送代码到 main 分支
```bash
git add .
git commit -m "Enable CI/CD deployment"
git push origin main
```

### 方式 2: 手动触发 (GitHub Actions)
1. 访问: https://github.com/mikeliu30/cine/actions
2. 选择 **"Deploy to Cloud Run"** workflow
3. 点击 **"Run workflow"**
4. 选择 `main` 分支
5. 点击 **"Run workflow"** 按钮

---

## 📊 监控部署进度

1. 访问: https://github.com/mikeliu30/cine/actions
2. 查看最新的 workflow 运行状态
3. 点击进入查看详细日志

---

## ✅ 部署成功后

部署成功后，你会在 GitHub Actions 日志的最后看到部署的 URL，格式类似：
```
https://cineflow-xxxxx-uc.a.run.app
```

---

## 🔒 安全提示

⚠️ **重要**: `github-actions-key.json` 文件包含敏感信息，请：
1. **不要提交到 Git 仓库**
2. 配置完成后可以删除本地文件
3. 确保 `.gitignore` 包含 `*-key.json`

---

## 🎯 下一步

运行以下命令创建 Artifact Registry 并测试部署：

```bash
# 1. 创建 Artifact Registry
gcloud artifacts repositories create cine --repository-format=docker --location=us-central1 --description="CineFlow Docker images" --project=aigc-workflow

# 2. 推送代码触发部署
git add .
git commit -m "Enable CI/CD"
git push origin main
```

