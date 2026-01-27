# Google Cloud Run 一键部署脚本 (PowerShell 版本)

$ErrorActionPreference = "Stop"

Write-Host "🚀 CineFlow - Google Cloud Run 部署" -ForegroundColor Cyan
Write-Host "====================================" -ForegroundColor Cyan
Write-Host ""

# 配置
$PROJECT_ID = "fleet-blend-469520-n7"
$SERVICE_NAME = "cineflow"
$REGION = "us-central1"
$IMAGE_NAME = "gcr.io/$PROJECT_ID/${SERVICE_NAME}:latest"

# 检查 gcloud 是否安装
$gcloudCmd = Get-Command gcloud -ErrorAction SilentlyContinue
if (-not $gcloudCmd) {
    Write-Host "❌ gcloud 未安装，请先安装 Google Cloud SDK" -ForegroundColor Red
    Write-Host "   下载地址：https://cloud.google.com/sdk/docs/install" -ForegroundColor Yellow
    exit 1
}
Write-Host "✅ gcloud 已安装" -ForegroundColor Green
Write-Host ""

# 设置项目
Write-Host "📝 设置项目..." -ForegroundColor Yellow
gcloud config set project $PROJECT_ID
Write-Host ""

# 启用必要的 API
Write-Host "🔧 启用必要的 API..." -ForegroundColor Yellow
Write-Host "   这可能需要几分钟..." -ForegroundColor Gray
gcloud services enable run.googleapis.com
gcloud services enable containerregistry.googleapis.com
gcloud services enable artifactregistry.googleapis.com
gcloud services enable secretmanager.googleapis.com
Write-Host "✅ API 已启用" -ForegroundColor Green
Write-Host ""

# 检查 vertex-key.json 是否存在
if (-not (Test-Path "vertex-key.json")) {
    Write-Host "❌ vertex-key.json 不存在" -ForegroundColor Red
    Write-Host "   请将服务账号密钥文件放在项目根目录" -ForegroundColor Yellow
    exit 1
}
Write-Host "✅ vertex-key.json 存在" -ForegroundColor Green
Write-Host ""

# 创建或更新 Secret
Write-Host "🔐 配置 Secret..." -ForegroundColor Yellow
$null = gcloud secrets describe vertex-key 2>$null
if ($LASTEXITCODE -eq 0) {
    Write-Host "   Secret 已存在，更新中..." -ForegroundColor Gray
    gcloud secrets versions add vertex-key --data-file=vertex-key.json
} else {
    Write-Host "   创建新 Secret..." -ForegroundColor Gray
    gcloud secrets create vertex-key --data-file=vertex-key.json
}

# 授权 Cloud Run 访问 Secret
Write-Host "   授权访问..." -ForegroundColor Gray
$PROJECT_NUMBER = gcloud projects describe $PROJECT_ID --format="value(projectNumber)"
gcloud secrets add-iam-policy-binding vertex-key `
  --member="serviceAccount:${PROJECT_NUMBER}-compute@developer.gserviceaccount.com" `
  --role="roles/secretmanager.secretAccessor" `
  --quiet
Write-Host "✅ Secret 配置完成" -ForegroundColor Green
Write-Host ""

# 构建 Docker 镜像
Write-Host "🐳 构建 Docker 镜像..." -ForegroundColor Yellow
Write-Host "   这可能需要 5-10 分钟，请耐心等待..." -ForegroundColor Gray
Write-Host ""
gcloud builds submit --tag $IMAGE_NAME --timeout=20m
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ 镜像构建失败" -ForegroundColor Red
    exit 1
}
Write-Host "✅ 镜像构建完成" -ForegroundColor Green
Write-Host ""

# 部署到 Cloud Run
Write-Host "🚀 部署到 Cloud Run..." -ForegroundColor Yellow
gcloud run deploy $SERVICE_NAME `
  --image $IMAGE_NAME `
  --platform managed `
  --region $REGION `
  --allow-unauthenticated `
  --memory 4Gi `
  --cpu 2 `
  --timeout 300 `
  --max-instances 10 `
  --min-instances 0 `
  --set-env-vars "GOOGLE_CLOUD_PROJECT=$PROJECT_ID,VERTEX_AI_LOCATION=$REGION,NODE_ENV=production" `
  --set-secrets "GOOGLE_APPLICATION_CREDENTIALS_JSON=vertex-key:latest" `
  --quiet

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ 部署失败" -ForegroundColor Red
    exit 1
}
Write-Host "✅ 部署完成！" -ForegroundColor Green
Write-Host ""

# 获取服务 URL
$SERVICE_URL = gcloud run services describe $SERVICE_NAME --region $REGION --format "value(status.url)"

Write-Host "🎉 部署成功！" -ForegroundColor Green
Write-Host ""
Write-Host "📝 服务信息：" -ForegroundColor Cyan
Write-Host "   项目: $PROJECT_ID" -ForegroundColor White
Write-Host "   服务: $SERVICE_NAME" -ForegroundColor White
Write-Host "   区域: $REGION" -ForegroundColor White
Write-Host ""
Write-Host "🌐 访问地址：" -ForegroundColor Cyan
Write-Host "   主页: $SERVICE_URL" -ForegroundColor Green
Write-Host "   画布: $SERVICE_URL/canvas" -ForegroundColor Green
Write-Host ""
Write-Host "📊 常用命令：" -ForegroundColor Cyan
Write-Host "   查看日志: gcloud run services logs read $SERVICE_NAME --region $REGION" -ForegroundColor Gray
Write-Host "   查看状态: gcloud run services describe $SERVICE_NAME --region $REGION" -ForegroundColor Gray
Write-Host ""
Write-Host "🔄 更新部署：" -ForegroundColor Cyan
Write-Host "   .\scripts\deploy-gcloud.ps1" -ForegroundColor Gray
Write-Host ""

# 自动打开浏览器
$openBrowser = Read-Host "是否在浏览器中打开应用？(Y/n)"
if ($openBrowser -ne "n" -and $openBrowser -ne "N") {
    Start-Process $SERVICE_URL
}

