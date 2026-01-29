#!/bin/bash

# 修复 GCP 服务账号权限
# 用于解决 GitHub Actions 部署到 Cloud Run 的权限问题

# 设置变量
PROJECT_ID="aigc-workflow"
SERVICE_ACCOUNT_EMAIL="github-actions@${PROJECT_ID}.iam.gserviceaccount.com"

echo "🔧 修复 GCP 服务账号权限..."
echo "项目 ID: $PROJECT_ID"
echo "服务账号: $SERVICE_ACCOUNT_EMAIL"
echo ""

# 设置当前项目
gcloud config set project $PROJECT_ID

# 添加必要的权限
echo "📝 添加权限..."

# 1. Storage Admin - 用于推送 Docker 镜像到 GCR
gcloud projects add-iam-policy-binding $PROJECT_ID \
  --member="serviceAccount:${SERVICE_ACCOUNT_EMAIL}" \
  --role="roles/storage.admin"

# 2. Cloud Run Admin - 用于部署服务
gcloud projects add-iam-policy-binding $PROJECT_ID \
  --member="serviceAccount:${SERVICE_ACCOUNT_EMAIL}" \
  --role="roles/run.admin"

# 3. Service Account User - 用于以服务账号身份运行
gcloud projects add-iam-policy-binding $PROJECT_ID \
  --member="serviceAccount:${SERVICE_ACCOUNT_EMAIL}" \
  --role="roles/iam.serviceAccountUser"

# 4. Artifact Registry Writer - 用于推送镜像（如果使用 Artifact Registry）
gcloud projects add-iam-policy-binding $PROJECT_ID \
  --member="serviceAccount:${SERVICE_ACCOUNT_EMAIL}" \
  --role="roles/artifactregistry.writer"

echo ""
echo "✅ 权限配置完成！"
echo ""
echo "📋 已添加的权限："
echo "  - Storage Admin (推送 Docker 镜像)"
echo "  - Cloud Run Admin (部署服务)"
echo "  - Service Account User (运行服务)"
echo "  - Artifact Registry Writer (推送到 Artifact Registry)"
echo ""
echo "🔍 验证权限："
gcloud projects get-iam-policy $PROJECT_ID \
  --flatten="bindings[].members" \
  --filter="bindings.members:serviceAccount:${SERVICE_ACCOUNT_EMAIL}"
echo ""
echo "✅ 完成！现在可以重新运行 GitHub Actions 部署了。"

