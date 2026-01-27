# CineFlow Git 初始化和推送脚本
# 使用方法：在 PowerShell 中运行 .\git-setup.ps1

Write-Host "🚀 CineFlow Git 初始化脚本" -ForegroundColor Cyan
Write-Host "================================" -ForegroundColor Cyan
Write-Host ""

# 1. 配置 Git 用户信息
Write-Host "📝 步骤 1: 配置 Git 用户信息" -ForegroundColor Yellow
$userName = Read-Host "请输入你的 Git 用户名"
$userEmail = Read-Host "请输入你的 Git 邮箱"

git config --global user.name "$userName"
git config --global user.email "$userEmail"

Write-Host "✅ Git 用户信息配置完成" -ForegroundColor Green
Write-Host ""

# 2. 检查 Git 状态
Write-Host "📊 步骤 2: 检查 Git 状态" -ForegroundColor Yellow
git status
Write-Host ""

# 3. 添加所有文件
Write-Host "📦 步骤 3: 添加所有文件到暂存区" -ForegroundColor Yellow
git add .
Write-Host "✅ 文件已添加" -ForegroundColor Green
Write-Host ""

# 4. 创建第一次提交
Write-Host "💾 步骤 4: 创建第一次提交" -ForegroundColor Yellow
git commit -m "Initial commit: CineFlow v2.0.0 with AI generation (Image + Video)"
Write-Host "✅ 提交完成" -ForegroundColor Green
Write-Host ""

# 5. 提示下一步
Write-Host "================================" -ForegroundColor Cyan
Write-Host "✅ Git 仓库初始化完成！" -ForegroundColor Green
Write-Host ""
Write-Host "📋 下一步操作：" -ForegroundColor Yellow
Write-Host ""
Write-Host "1️⃣  访问 GitHub 创建新仓库：" -ForegroundColor White
Write-Host "   https://github.com/new" -ForegroundColor Cyan
Write-Host ""
Write-Host "2️⃣  创建仓库后，运行以下命令关联远程仓库：" -ForegroundColor White
Write-Host "   git remote add origin https://github.com/你的用户名/cineflow.git" -ForegroundColor Cyan
Write-Host "   git branch -M main" -ForegroundColor Cyan
Write-Host "   git push -u origin main" -ForegroundColor Cyan
Write-Host ""
Write-Host "3️⃣  查看完整部署指南：" -ForegroundColor White
Write-Host "   打开 GITHUB_DEPLOY_GUIDE.md 文件" -ForegroundColor Cyan
Write-Host ""
Write-Host "================================" -ForegroundColor Cyan

