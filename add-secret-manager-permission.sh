#!/bin/bash

# 为 Compute Engine 默认服务账号添加 Secret Manager 访问权限

PROJECT_ID="aigc-workflow"
PROJECT_NUMBER="1046292953857"
SERVICE_ACCOUNT="${PROJECT_NUMBER}-compute@developer.gserviceaccount.com"

echo "🔧 为服务账号添加 Secret Manager Secret Accessor 角色..."
echo "服务账号: ${SERVICE_ACCOUNT}"
echo ""

# 添加 Secret Manager Secret Accessor 角色
gcloud projects add-iam-policy-binding ${PROJECT_ID} \
  --member="serviceAccount:${SERVICE_ACCOUNT}" \
  --role="roles/secretmanager.secretAccessor"

echo ""
echo "✅ 权限添加完成！"
echo ""
echo "现在可以重新部署到 Cloud Run 了。"

