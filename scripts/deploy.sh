#!/bin/bash

# 一键部署脚本（服务器端）

set -e  # 遇到错误立即退出

echo "🚀 CineFlow 一键部署脚本"
echo "========================"
echo ""

# 检查是否在正确的目录
if [ ! -f "package.json" ]; then
    echo "❌ 错误：请在项目根目录运行此脚本"
    exit 1
fi

# 1. 拉取最新代码（如果是 Git 仓库）
if [ -d ".git" ]; then
    echo "📥 拉取最新代码..."
    git pull
    echo "✅ 代码已更新"
    echo ""
fi

# 2. 安装依赖
echo "📦 安装依赖..."
npm install
echo "✅ 依赖已安装"
echo ""

# 3. 构建应用
echo "🔨 构建应用..."
npm run build
echo "✅ 构建完成"
echo ""

# 4. 创建日志目录
echo "📁 创建日志目录..."
mkdir -p logs
echo "✅ 日志目录已创建"
echo ""

# 5. 停止旧进程（如果存在）
echo "🛑 停止旧进程..."
if pm2 list | grep -q "cineflow"; then
    pm2 delete cineflow
    echo "✅ 旧进程已停止"
else
    echo "ℹ️  没有运行中的进程"
fi
echo ""

# 6. 启动新进程
echo "🚀 启动应用..."
pm2 start ecosystem.config.js
echo "✅ 应用已启动"
echo ""

# 7. 保存 PM2 配置
echo "💾 保存 PM2 配置..."
pm2 save
echo "✅ 配置已保存"
echo ""

# 8. 显示状态
echo "📊 应用状态："
pm2 status
echo ""

# 9. 显示日志
echo "📝 最近的日志："
pm2 logs cineflow --lines 20 --nostream
echo ""

echo "✅ 部署完成！"
echo ""
echo "📝 常用命令："
echo "   查看状态: pm2 status"
echo "   查看日志: pm2 logs cineflow"
echo "   重启应用: pm2 restart cineflow"
echo "   停止应用: pm2 stop cineflow"
echo ""
echo "🌐 访问地址："
echo "   http://localhost:3000"
echo "   http://$(hostname -I | awk '{print $1}'):3000"

