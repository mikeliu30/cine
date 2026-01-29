# 修复 GitHub Actions 部署权限问题

## 问题描述

GitHub Actions 部署到 Cloud Run 时出现权限错误：
```
denied: Permission 'artifactregistry.repositories.uploadArtifacts' denied on resource
```

## 原因

服务账号 `github-actions@aigc-workflow.iam.gserviceaccount.com` 缺少必要的权限。

---

## 解决方案

### 方法 1：通过 Google Cloud Console（推荐）

#### 步骤 1：打开 IAM 页面
访问：https://console.cloud.google.com/iam-admin/iam?project=aigc-workflow

#### 步骤 2：找到服务账号
在列表中找到：
- **显示名称**: GitHub Actions Deployer
- **邮箱**: github-actions@aigc-workflow.iam.gserviceaccount.com

#### 步骤 3：编辑权限
1. 点击服务账号右侧的 **✏️ 编辑（Edit）** 图标
2. 点击 **+ ADD ANOTHER ROLE** 按钮

#### 步骤 4：添加以下角色

**角色 1: Storage Admin**
- 搜索并选择：`Storage Admin`
- 用途：推送 Docker 镜像到 Google Container Registry (GCR)

**角色 2: Cloud Run Admin**
- 搜索并选择：`Cloud Run Admin`
- 用途：部署和管理 Cloud Run 服务

**角色 3: Service Account User**
- 搜索并选择：`Service Account User`
- 用途：以服务账号身份运行 Cloud Run 服务

**角色 4: Artifact Registry Writer**
- 搜索并选择：`Artifact Registry Writer`
- 用途：推送镜像到 Artifact Registry（如果使用）

#### 步骤 5：保存
点击 **SAVE** 按钮保存更改。

---

### 方法 2：通过 gcloud 命令行

如果你有项目 Owner 或 IAM Admin 权限，可以运行以下命令：

```bash
# 设置项目
gcloud config set project aigc-workflow

# 添加 Storage Admin 角色
gcloud projects add-iam-policy-binding aigc-workflow \
  --member="serviceAccount:github-actions@aigc-workflow.iam.gserviceaccount.com" \
  --role="roles/storage.admin"

# 添加 Cloud Run Admin 角色
gcloud projects add-iam-policy-binding aigc-workflow \
  --member="serviceAccount:github-actions@aigc-workflow.iam.gserviceaccount.com" \
  --role="roles/run.admin"

# 添加 Service Account User 角色
gcloud projects add-iam-policy-binding aigc-workflow \
  --member="serviceAccount:github-actions@aigc-workflow.iam.gserviceaccount.com" \
  --role="roles/iam.serviceAccountUser"

# 添加 Artifact Registry Writer 角色
gcloud projects add-iam-policy-binding aigc-workflow \
  --member="serviceAccount:github-actions@aigc-workflow.iam.gserviceaccount.com" \
  --role="roles/artifactregistry.writer"
```

---

## 验证权限

### 通过 Console
1. 在 IAM 页面中找到 `github-actions@aigc-workflow.iam.gserviceaccount.com`
2. 确认它有以下角色：
   - ✅ Storage Admin
   - ✅ Cloud Run Admin
   - ✅ Service Account User
   - ✅ Artifact Registry Writer

### 通过命令行
```bash
gcloud projects get-iam-policy aigc-workflow \
  --flatten="bindings[].members" \
  --filter="bindings.members:serviceAccount:github-actions@aigc-workflow.iam.gserviceaccount.com"
```

---

## 重新部署

权限配置完成后：

### 方法 1：手动触发 GitHub Actions
1. 访问：https://github.com/mikeliu30/cine/actions
2. 选择 "Deploy to Cloud Run" 工作流
3. 点击 "Run workflow" 按钮
4. 选择 `main` 分支
5. 点击 "Run workflow" 确认

### 方法 2：推送新提交
```bash
git commit --allow-empty -m "触发重新部署"
git push
```

---

## 预期结果

权限配置正确后，GitHub Actions 应该能够：
1. ✅ 构建 Docker 镜像
2. ✅ 推送镜像到 GCR
3. ✅ 部署到 Cloud Run
4. ✅ 显示部署 URL

部署成功后，应用将在以下地址可用：
https://cineflow-1046292953857.us-central1.run.app

---

## 常见问题

### Q: 为什么需要这些权限？
- **Storage Admin**: GCR 使用 Google Cloud Storage 存储 Docker 镜像
- **Cloud Run Admin**: 部署和更新 Cloud Run 服务
- **Service Account User**: 允许 Cloud Run 服务使用服务账号
- **Artifact Registry Writer**: 如果使用 Artifact Registry 而不是 GCR

### Q: 这些权限安全吗？
是的，这些是部署所需的最小权限集。服务账号只能：
- 推送镜像到项目的容器仓库
- 部署到项目的 Cloud Run 服务
- 不能访问其他 GCP 资源

### Q: 如何撤销权限？
在 IAM 页面中，编辑服务账号并删除不需要的角色即可。

---

## 需要帮助？

如果遇到问题，请检查：
1. 是否使用了正确的服务账号邮箱
2. 是否有权限修改 IAM 策略（需要 Owner 或 IAM Admin 角色）
3. GitHub Secrets 中的 `GCP_SA_KEY` 是否是该服务账号的密钥

---

**最后更新**: 2026-01-28

