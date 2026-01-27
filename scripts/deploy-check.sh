#!/bin/bash

# 部署前检查脚本

echo "🔍 CineFlow 部署前检查..."
echo ""

# 检查 Node.js 版本
echo "1️⃣ 检查 Node.js 版本..."
NODE_VERSION=$(node -v)
echo "   Node.js: $NODE_VERSION"
if [[ "$NODE_VERSION" < "v18" ]]; then
    echo "   ❌ 需要 Node.js 18 或更高版本"
    exit 1
else
    echo "   ✅ Node.js 版本符合要求"
fi
echo ""

# 检查依赖
echo "2️⃣ 检查依赖..."
if [ ! -d "node_modules" ]; then
    echo "   ⚠️ 依赖未安装，正在安装..."
    npm install
else
    echo "   ✅ 依赖已安装"
fi
echo ""

# 检查环境变量
echo "3️⃣ 检查环境变量..."
if [ -f ".env.local" ]; then
    echo "   ✅ .env.local 文件存在"
    
    # 检查必需的环境变量
    if grep -q "GOOGLE_CLOUD_PROJECT" .env.local; then
        echo "   ✅ GOOGLE_CLOUD_PROJECT 已配置"
    else
        echo "   ❌ GOOGLE_CLOUD_PROJECT 未配置"
    fi
else
    echo "   ⚠️ .env.local 文件不存在"
    echo "   创建示例文件..."
    cat > .env.local << EOF
GOOGLE_CLOUD_PROJECT=your-project-id
VERTEX_AI_LOCATION=us-central1
NODE_ENV=production
EOF
    echo "   ✅ 已创建 .env.local，请填写配置"
fi
echo ""

# 检查服务账号密钥
echo "4️⃣ 检查服务账号密钥..."
if [ -f "vertex-key.json" ]; then
    echo "   ✅ vertex-key.json 存在"
else
    echo "   ❌ vertex-key.json 不存在"
    echo "   请将服务账号密钥文件放在项目根目录"
fi
echo ""

# 尝试构建
echo "5️⃣ 尝试构建..."
npm run build
if [ $? -eq 0 ]; then
    echo "   ✅ 构建成功"
else
    echo "   ❌ 构建失败，请检查错误信息"
    exit 1
fi
echo ""

echo "✅ 所有检查通过！可以部署了。"
echo ""
echo "📝 部署命令："
echo "   Vercel: vercel --prod"
echo "   服务器: pm2 start npm --name cineflow -- start"

