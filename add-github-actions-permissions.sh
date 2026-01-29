#!/bin/bash
# 使用有权限的账号添加 GitHub Actions 服务账号权限

# 切换到有权限的账号
gcloud config set account baz@spoonlabs-partners.com

# 设置项目
gcloud config set project aigc-workflow

# 添加权限
echo "添加 Storage Admin 权限..."
gcloud projects add-iam-policy-binding aigc-workflow \
  --member="serviceAccount:github-actions@aigc-workflow.iam.gserviceaccount.com" \
  --role="roles/storage.admin"

echo "添加 Cloud Run Admin 权限..."
gcloud projects add-iam-policy-binding aigc-workflow \
  --member="serviceAccount:github-actions@aigc-workflow.iam.gserviceaccount.com" \
  --role="roles/run.admin"

echo "添加 Service Account User 权限..."
gcloud projects add-iam-policy-binding aigc-workflow \
  --member="serviceAccount:github-actions@aigc-workflow.iam.gserviceaccount.com" \
  --role="roles/iam.serviceAccountUser"

echo "添加 Artifact Registry Writer 权限..."
gcloud projects add-iam-policy-binding aigc-workflow \
  --member="serviceAccount:github-actions@aigc-workflow.iam.gserviceaccount.com" \
  --role="roles/artifactregistry.writer"

echo "✅ 权限添加完成！"

