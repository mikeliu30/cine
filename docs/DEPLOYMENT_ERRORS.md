# ⚠️ 部署过程中的错误与注意事项

> **基于实际部署经验总结**  
> **日期**: 2026-01-29  
> **项目**: CineFlow MVP

---

## 📋 目录

1. [Cloud Run 部署错误](#cloud-run-部署错误)
2. [Firebase 部署错误](#firebase-部署错误)
3. [配置错误](#配置错误)
4. [最佳实践](#最佳实践)

---

## ☁️ Cloud Run 部署错误

### ❌ 错误 1: 计费账号未启用

**错误信息**:
```
ERROR: (gcloud.services.enable) FAILED_PRECONDITION: Precondition check failed.
```

**原因**: GCP 项目没有启用计费账号

**解决方案**:
1. 访问: `https://console.cloud.google.com/billing`
2. 创建或关联计费账号
3. 验证状态:
```powershell
gcloud beta billing projects describe gen-lang-client-0537716100
```

**验证成功标志**:
```
billingEnabled: true
```

⏱️ **解决时间**: 5-10 分钟

---

### ❌ 错误 2: API 未启用

**错误信息**:
```
ERROR: (gcloud.run.deploy) API [run.googleapis.com] not enabled
```

**原因**: 必要的 Google Cloud API 未启用

**解决方案**:
```powershell
gcloud services enable run.googleapis.com
gcloud services enable containerregistry.googleapis.com
gcloud services enable cloudbuild.googleapis.com
gcloud services enable artifactregistry.googleapis.com
```

⏱️ **解决时间**: 2-3 分钟

---

### ❌ 错误 3: 服务账号权限不足

**错误信息**:
```
ERROR: (gcloud.run.deploy) Permission denied
```

**原因**: GitHub Actions 服务账号缺少必要权限

**解决方案**:
```powershell
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
```

⏱️ **解决时间**: 1-2 分钟

---

### ❌ 错误 4: Docker 构建失败

**错误信息**:
```
ERROR: failed to solve: process "/bin/sh -c npm run build" did not complete successfully
```

**原因**: Next.js 构建时缺少 `standalone` 输出配置

**解决方案**: 确保 `next.config.mjs` 包含:
```javascript
const nextConfig = {
  output: 'standalone',  // 必须！
  // ...其他配置
};
```

⏱️ **解决时间**: 立即

---

## 🔥 Firebase 部署错误

### ❌ 错误 5: Directory 'out' does not exist

**错误信息**:
```
Error: Directory 'out' for Hosting does not exist.
```

**原因**: Firebase 期望静态导出目录 `out`，但构建时使用了 `standalone` 模式

**解决方案**: 在 Firebase workflow 中设置环境变量:
```yaml
- name: Build project for Firebase (static export)
  run: npm run build
  env:
    NODE_ENV: production
    FIREBASE_BUILD: true  # 关键！
```

**配置 next.config.mjs**:
```javascript
const nextConfig = {
  output: process.env.FIREBASE_BUILD === 'true' ? 'export' : 'standalone',
  
  // 静态导出时禁用图片优化
  ...(process.env.FIREBASE_BUILD === 'true' && {
    images: { unoptimized: true },
  }),
};
```

⏱️ **解决时间**: 5 分钟

---

### ❌ 错误 6: Firebase 服务账号密钥错误

**错误信息**:
```
Error: Unable to authenticate with Firebase
```

**原因**: GitHub Secret 中的 `FIREBASE_SERVICE_ACCOUNT` 格式错误或不完整

**解决方案**:
1. 重新生成密钥: `https://console.firebase.google.com/project/aigc-workflow/settings/serviceaccounts/adminsdk`
2. 确保复制**完整的 JSON 内容**（包括所有大括号）
3. 粘贴到 GitHub Secrets 时不要添加额外的空格或换行

⏱️ **解决时间**: 2-3 分钟

---

## ⚙️ 配置错误

### ❌ 错误 7: GitHub Secrets 未配置

**错误信息**:
```
Error: Input required and not supplied: credentials_json
```

**原因**: GitHub Secrets 缺失或名称错误

**必需的 Secrets**:

| Secret Name | 用途 | 获取方式 |
|------------|------|---------|
| `GCP_SA_KEY` | Cloud Run 部署 | `gcloud iam service-accounts keys create` |
| `FIREBASE_SERVICE_ACCOUNT` | Firebase 部署 | Firebase 控制台生成 |

**验证方法**:
访问: `https://github.com/mikeliu30/cine/settings/secrets/actions`

⏱️ **解决时间**: 5 分钟

---

### ❌ 错误 8: Workflow 触发条件错误

**问题**: 推送代码后 workflow 没有触发

**原因**: Workflow 配置的分支名称错误

**检查 workflow 文件**:
```yaml
on:
  push:
    branches:
      - main  # 确保分支名称正确！
```

**验证当前分支**:
```powershell
git branch --show-current
```

⏱️ **解决时间**: 1 分钟

---

## ✅ 最佳实践

### 1. 部署前检查清单

```powershell
# 检查 Git 状态
git status

# 检查当前分支
git branch --show-current

# 检查远程仓库
git remote -v

# 检查 GCP 项目
gcloud config get-value project

# 检查计费状态
gcloud beta billing projects describe gen-lang-client-0537716100
```

---

### 2. 推送代码的标准流程

```powershell
# 1. 查看更改
git status

# 2. 添加文件
git add .

# 3. 提交（使用有意义的消息）
git commit -m "feat: add new feature"

# 4. 推送到 GitHub
git push origin main

# 5. 立即查看 Actions
# 访问: https://github.com/mikeliu30/cine/actions
```

---

### 3. 监控部署进度

**GitHub Actions 页面**: `https://github.com/mikeliu30/cine/actions`

**预期看到**:
- ✅ **Deploy to Cloud Run**: 3-5 分钟
- ✅ **Deploy to Firebase Hosting**: 1-2 分钟

**如果失败**:
1. 点击失败的 workflow
2. 查看错误日志
3. 根据错误信息查找本文档的解决方案

---

### 4. 验证部署成功

**Cloud Run**:
```powershell
gcloud run services describe cineflow --region us-central1 --format 'value(status.url)'
```

**Firebase**:
访问: `https://aigc-workflow.web.app`

---

## 🎯 关键注意事项

### ⚠️ 重要提醒

1. **计费账号**: 必须先启用，否则所有部署都会失败
2. **环境变量**: Firebase 部署必须设置 `FIREBASE_BUILD=true`
3. **服务账号权限**: 需要 3 个角色（run.admin, storage.admin, iam.serviceAccountUser）
4. **GitHub Secrets**: JSON 格式必须完整，不能有格式错误
5. **分支名称**: 确保 workflow 监听的分支与推送的分支一致

### 💡 省时技巧

1. **一次性启用所有 API**: 避免多次失败
2. **先验证本地配置**: 再推送到 GitHub
3. **使用 workflow_dispatch**: 可以手动触发部署，无需推送代码
4. **保存服务账号密钥**: 避免重复生成

---

## 📊 部署时间参考

| 步骤 | 预计时间 | 备注 |
|-----|---------|------|
| 启用计费账号 | 5-10 分钟 | 首次需要输入信用卡 |
| 启用 API | 2-3 分钟 | 一次性操作 |
| 创建服务账号 | 2-3 分钟 | 一次性操作 |
| 配置 GitHub Secrets | 5 分钟 | 一次性操作 |
| Cloud Run 部署 | 3-5 分钟 | 每次推送 |
| Firebase 部署 | 1-2 分钟 | 每次推送 |

**总计（首次）**: 约 20-30 分钟  
**总计（后续）**: 约 5-7 分钟

---

**文档结束** 🎉


