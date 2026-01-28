# Google Cloud 自动化配置脚本
# 使用方法：在 PowerShell 中运行 .\scripts\setup-gcloud.ps1

Write-Host "🚀 Google Cloud Run 自动化部署配置" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# 检查 gcloud 是否安装
Write-Host "📦 检查 Google Cloud SDK..." -ForegroundColor Yellow
$gcloudVersion = gcloud version 2>$null
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Google Cloud SDK 未安装" -ForegroundColor Red
    Write-Host ""
    Write-Host "请先安装 Google Cloud SDK：" -ForegroundColor Yellow
    Write-Host "https://cloud.google.com/sdk/docs/install" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "安装后重新运行此脚本。" -ForegroundColor Yellow
    exit 1
}
Write-Host "✅ Google Cloud SDK 已安装" -ForegroundColor Green
Write-Host ""

# 1. 输入项目信息
Write-Host "📝 步骤 1: 配置项目信息" -ForegroundColor Yellow
Write-Host ""
$projectId = Read-Host "请输入 Google Cloud 项目 ID (例如: cineflow-prod)"
$region = Read-Host "请输入部署区域 (默认: us-central1，直接回车使用默认)"
if ([string]::IsNullOrWhiteSpace($region)) {
    $region = "us-central1"
}
Write-Host ""

# 2. 设置项目
Write-Host "🔧 步骤 2: 设置当前项目" -ForegroundColor Yellow
gcloud config set project $projectId
Write-Host ""

# 3. 启用必要的 API
Write-Host "🔌 步骤 3: 启用必要的 API (这可能需要几分钟)" -ForegroundColor Yellow
Write-Host "启用 Cloud Run API..." -ForegroundColor Gray
gcloud services enable run.googleapis.com --quiet

Write-Host "启用 Container Registry API..." -ForegroundColor Gray
gcloud services enable containerregistry.googleapis.com --quiet

Write-Host "启用 Cloud Build API..." -ForegroundColor Gray
gcloud services enable cloudbuild.googleapis.com --quiet

Write-Host "启用 Secret Manager API..." -ForegroundColor Gray
gcloud services enable secretmanager.googleapis.com --quiet

Write-Host "启用 Vertex AI API..." -ForegroundColor Gray
gcloud services enable aiplatform.googleapis.com --quiet

Write-Host "✅ 所有 API 已启用" -ForegroundColor Green
Write-Host ""

# 4. 创建服务账号
Write-Host "👤 步骤 4: 创建服务账号" -ForegroundColor Yellow
$serviceAccount = "github-actions"
$serviceAccountEmail = "$serviceAccount@$projectId.iam.gserviceaccount.com"

gcloud iam service-accounts create $serviceAccount `
    --display-name="GitHub Actions Deployer" `
    --quiet 2>$null

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ 服务账号创建成功: $serviceAccountEmail" -ForegroundColor Green
} else {
    Write-Host "⚠️  服务账号可能已存在，继续..." -ForegroundColor Yellow
}
Write-Host ""

# 5. 授予权限
Write-Host "🔐 步骤 5: 授予服务账号权限" -ForegroundColor Yellow

Write-Host "授予 Cloud Run Admin 权限..." -ForegroundColor Gray
gcloud projects add-iam-policy-binding $projectId `
    --member="serviceAccount:$serviceAccountEmail" `
    --role="roles/run.admin" `
    --quiet

Write-Host "授予 Storage Admin 权限..." -ForegroundColor Gray
gcloud projects add-iam-policy-binding $projectId `
    --member="serviceAccount:$serviceAccountEmail" `
    --role="roles/storage.admin" `
    --quiet

Write-Host "授予 Service Account User 权限..." -ForegroundColor Gray
gcloud projects add-iam-policy-binding $projectId `
    --member="serviceAccount:$serviceAccountEmail" `
    --role="roles/iam.serviceAccountUser" `
    --quiet

Write-Host "✅ 权限授予完成" -ForegroundColor Green
Write-Host ""

# 6. 生成服务账号密钥
Write-Host "🔑 步骤 6: 生成服务账号密钥" -ForegroundColor Yellow
$keyFile = "github-actions-key.json"

gcloud iam service-accounts keys create $keyFile `
    --iam-account=$serviceAccountEmail `
    --quiet

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ 密钥文件已生成: $keyFile" -ForegroundColor Green
    Write-Host ""
    Write-Host "⚠️  重要：请妥善保管此文件，不要提交到 Git！" -ForegroundColor Red
} else {
    Write-Host "❌ 密钥生成失败" -ForegroundColor Red
    exit 1
}
Write-Host ""

# 7. 显示密钥内容
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "✅ Google Cloud 配置完成！" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "📋 下一步：配置 GitHub Secrets" -ForegroundColor Yellow
Write-Host ""
Write-Host "1️⃣  访问 GitHub 仓库设置：" -ForegroundColor White
Write-Host "   https://github.com/mikeliu30/cine/settings/secrets/actions" -ForegroundColor Cyan
Write-Host ""
Write-Host "2️⃣  添加以下 Secrets：" -ForegroundColor White
Write-Host ""
Write-Host "   Secret 1: GCP_PROJECT_ID" -ForegroundColor Cyan
Write-Host "   Value: $projectId" -ForegroundColor Gray
Write-Host ""
Write-Host "   Secret 2: GCP_SA_KEY" -ForegroundColor Cyan
Write-Host "   Value: (复制下面的 JSON 内容)" -ForegroundColor Gray
Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "📄 服务账号密钥 JSON (复制全部内容)：" -ForegroundColor Yellow
Write-Host "========================================" -ForegroundColor Cyan
Get-Content $keyFile
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "3️⃣  配置完成后，推送代码即可自动部署：" -ForegroundColor White
Write-Host "   git add ." -ForegroundColor Cyan
Write-Host "   git commit -m 'Enable auto deployment'" -ForegroundColor Cyan
Write-Host "   git push" -ForegroundColor Cyan
Write-Host ""
Write-Host "🎉 完成！" -ForegroundColor Green

