#!/bin/bash

# Google Cloud Run 一键部署脚本

set -e

echo "🚀 CineFlow - Google Cloud Run 部署"
echo "===================================="
echo ""

# 配置
PROJECT_ID="fleet-blend-469520-n7"
SERVICE_NAME="cineflow"
REGION="us-central1"
IMAGE_NAME="gcr.io/${PROJECT_ID}/${SERVICE_NAME}:latest"

# 检查 gcloud 是否安装
if ! command -v gcloud &> /dev/null; then
    echo "❌ gcloud 未安装，请先安装 Google Cloud SDK"
    echo "   下载地址：https://cloud.google.com/sdk/docs/install"
    exit 1
fi

echo "✅ gcloud 已安装"
echo ""

# 设置项目
echo "📝 设置项目..."
gcloud config set project ${PROJECT_ID}
echo ""

# 启用必要的 API
echo "🔧 启用必要的 API..."
gcloud services enable run.googleapis.com
gcloud services enable containerregistry.googleapis.com
gcloud services enable artifactregistry.googleapis.com
gcloud services enable secretmanager.googleapis.com
echo "✅ API 已启用"
echo ""

# 检查 vertex-key.json 是否存在
if [ ! -f "vertex-key.json" ]; then
    echo "❌ vertex-key.json 不存在"
    echo "   请将服务账号密钥文件放在项目根目录"
    exit 1
fi
echo "✅ vertex-key.json 存在"
echo ""

# 创建或更新 Secret
echo "🔐 配置 Secret..."
if gcloud secrets describe vertex-key &> /dev/null; then
    echo "   Secret 已存在，更新中..."
    gcloud secrets versions add vertex-key --data-file=vertex-key.json
else
    echo "   创建新 Secret..."
    gcloud secrets create vertex-key --data-file=vertex-key.json
fi

# 授权 Cloud Run 访问 Secret
PROJECT_NUMBER=$(gcloud projects describe ${PROJECT_ID} --format='value(projectNumber)')
gcloud secrets add-iam-policy-binding vertex-key \
  --member="serviceAccount:${PROJECT_NUMBER}-compute@developer.gserviceaccount.com" \
  --role="roles/secretmanager.secretAccessor" \
  --quiet
echo "✅ Secret 配置完成"
echo ""

# 构建 Docker 镜像
echo "🐳 构建 Docker 镜像..."
echo "   这可能需要几分钟..."
gcloud builds submit --tag ${IMAGE_NAME} --timeout=20m
echo "✅ 镜像构建完成"
echo ""

# 部署到 Cloud Run
echo "🚀 部署到 Cloud Run..."
gcloud run deploy ${SERVICE_NAME} \
  --image ${IMAGE_NAME} \
  --platform managed \
  --region ${REGION} \
  --allow-unauthenticated \
  --memory 4Gi \
  --cpu 2 \
  --timeout 300 \
  --max-instances 10 \
  --min-instances 0 \
  --set-env-vars "GOOGLE_CLOUD_PROJECT=${PROJECT_ID},VERTEX_AI_LOCATION=${REGION},NODE_ENV=production" \
  --set-secrets "GOOGLE_APPLICATION_CREDENTIALS_JSON=vertex-key:latest" \
  --quiet

echo "✅ 部署完成！"
echo ""

# 获取服务 URL
SERVICE_URL=$(gcloud run services describe ${SERVICE_NAME} --region ${REGION} --format 'value(status.url)')

echo "🎉 部署成功！"
echo ""
echo "📝 服务信息："
echo "   项目: ${PROJECT_ID}"
echo "   服务: ${SERVICE_NAME}"
echo "   区域: ${REGION}"
echo ""
echo "🌐 访问地址："
echo "   主页: ${SERVICE_URL}"
echo "   画布: ${SERVICE_URL}/canvas"
echo ""
echo "📊 查看日志："
echo "   gcloud run services logs read ${SERVICE_NAME} --region ${REGION}"
echo ""
echo "🔄 更新部署："
echo "   ./scripts/deploy-gcloud.sh"

