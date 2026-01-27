@echo off
chcp 65001 >nul
echo.
echo ========================================
echo 🚀 CineFlow Git 初始化脚本
echo ========================================
echo.

REM 1. 配置 Git 用户信息
echo 📝 步骤 1: 配置 Git 用户信息
echo.
set /p userName="请输入你的 Git 用户名: "
set /p userEmail="请输入你的 Git 邮箱: "

git config --global user.name "%userName%"
git config --global user.email "%userEmail%"

echo.
echo ✅ Git 用户信息配置完成
echo.

REM 2. 添加所有文件
echo 📦 步骤 2: 添加所有文件到暂存区
git add .
echo ✅ 文件已添加
echo.

REM 3. 创建第一次提交
echo 💾 步骤 3: 创建第一次提交
git commit -m "Initial commit: CineFlow v2.0.0 with AI generation"
echo ✅ 提交完成
echo.

REM 4. 提示下一步
echo ========================================
echo ✅ Git 仓库初始化完成！
echo ========================================
echo.
echo 📋 下一步操作：
echo.
echo 1️⃣  访问 GitHub 创建新仓库：
echo    https://github.com/new
echo.
echo 2️⃣  创建仓库后，运行以下命令：
echo    git remote add origin https://github.com/你的用户名/cineflow.git
echo    git branch -M main
echo    git push -u origin main
echo.
echo 3️⃣  查看完整部署指南：
echo    打开 GITHUB_DEPLOY_GUIDE.md 文件
echo.
echo ========================================
echo.
pause

