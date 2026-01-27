# CineFlow 启动脚本
# 使用方法: .\start.ps1

Write-Host "🚀 启动 CineFlow 系统..." -ForegroundColor Cyan
Write-Host ""

# 检查当前目录
$currentDir = Get-Location
Write-Host "📁 当前目录: $currentDir" -ForegroundColor Yellow

# 确保在正确的目录
if (-not (Test-Path "package.json")) {
    Write-Host "❌ 错误: 未找到 package.json" -ForegroundColor Red
    Write-Host "请确保在 cineflow-mvp 目录下运行此脚本" -ForegroundColor Red
    exit 1
}

# 检查环境变量文件
if (-not (Test-Path ".env.local")) {
    Write-Host "⚠️  警告: 未找到 .env.local 文件" -ForegroundColor Yellow
} else {
    Write-Host "✅ 环境变量文件已找到" -ForegroundColor Green
}

# 检查认证文件
$authFiles = @(
    "fleet-blend-469520-n7-9cd71165921b.json",
    "vertex-key.json"
)

$authFound = $false
foreach ($file in $authFiles) {
    if (Test-Path $file) {
        Write-Host "✅ 认证文件已找到: $file" -ForegroundColor Green
        $authFound = $true
        break
    }
}

if (-not $authFound) {
    Write-Host "⚠️  警告: 未找到 Google Cloud 认证文件" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "🔧 清理构建缓存..." -ForegroundColor Cyan

# 清理 .next 目录
if (Test-Path ".next") {
    Remove-Item -Recurse -Force .next
    Write-Host "✅ 已清理 .next 目录" -ForegroundColor Green
} else {
    Write-Host "ℹ️  .next 目录不存在，跳过清理" -ForegroundColor Gray
}

Write-Host ""
Write-Host "🚀 启动 CineFlow 系统..." -ForegroundColor Cyan
Write-Host ""
Write-Host "⚠️  注意: 需要在两个终端中分别运行以下命令:" -ForegroundColor Yellow
Write-Host ""
Write-Host "   终端 1 (WebSocket 服务器):" -ForegroundColor Cyan
Write-Host "   npm run websocket" -ForegroundColor White
Write-Host ""
Write-Host "   终端 2 (Next.js 开发服务器):" -ForegroundColor Cyan
Write-Host "   npm run dev" -ForegroundColor White
Write-Host ""
Write-Host "📌 访问地址:" -ForegroundColor Yellow
Write-Host "   主页: http://localhost:3000" -ForegroundColor White
Write-Host "   画布: http://localhost:3000/canvas" -ForegroundColor White
Write-Host "   WebSocket: ws://localhost:1234" -ForegroundColor White
Write-Host ""
Write-Host "💡 提示: 按 Ctrl+C 停止服务器" -ForegroundColor Gray
Write-Host ""

# 询问用户要启动哪个服务
Write-Host "请选择要启动的服务:" -ForegroundColor Cyan
Write-Host "  1. WebSocket 服务器 (端口 1234)" -ForegroundColor White
Write-Host "  2. Next.js 开发服务器 (端口 3000)" -ForegroundColor White
Write-Host "  3. 退出" -ForegroundColor White
Write-Host ""
$choice = Read-Host "请输入选项 (1/2/3)"

switch ($choice) {
    "1" {
        Write-Host ""
        Write-Host "🚀 启动 WebSocket 服务器..." -ForegroundColor Cyan
        npm run websocket
    }
    "2" {
        Write-Host ""
        Write-Host "🚀 启动 Next.js 开发服务器..." -ForegroundColor Cyan
        npm run dev
    }
    "3" {
        Write-Host "👋 退出" -ForegroundColor Gray
        exit 0
    }
    default {
        Write-Host "❌ 无效选项，退出" -ForegroundColor Red
        exit 1
    }
}

