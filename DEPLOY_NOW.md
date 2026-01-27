# 🚀 快速部署指南 - 立即上线

## 方案选择

### 方案 A：Vercel 部署（5 分钟）⚡ 最快
- ✅ 零配置，自动部署
- ✅ 免费 HTTPS + CDN
- ⚠️ 函数超时 60 秒（付费版）
- ⚠️ 内存限制 1GB

### 方案 B：独立服务器（30 分钟）⭐ 推荐
- ✅ 无限制，完全控制
- ✅ 适合长时间任务
- ⚠️ 需要自己配置

---

## 🎯 方案 A：Vercel 部署（推荐先试试）

### 步骤 1：准备代码
```bash
# 确保代码已提交到 Git
git add .
git commit -m "Ready for deployment"
git push origin main
```

### 步骤 2：部署到 Vercel
```bash
# 安装 Vercel CLI
npm install -g vercel

# 登录
vercel login

# 部署
vercel
```

按照提示操作：
1. 选择项目目录：`./cineflow-mvp`
2. 是否链接到现有项目：`N`（新项目）
3. 项目名称：`cineflow`
4. 确认设置

### 步骤 3：配置环境变量
```bash
# 在 Vercel Dashboard 中配置
# 或使用命令行：

vercel env add GOOGLE_CLOUD_PROJECT
# 输入：fleet-blend-469520-n7

vercel env add VERTEX_AI_LOCATION
# 输入：us-central1

# 上传服务账号密钥
# 注意：Vercel 不支持文件上传，需要转换为环境变量
```

### 步骤 4：处理服务账号密钥
```bash
# 将 vertex-key.json 转换为 base64
cat vertex-key.json | base64 > vertex-key-base64.txt

# 添加到环境变量
vercel env add GOOGLE_APPLICATION_CREDENTIALS_JSON
# 粘贴 base64 内容
```

### 步骤 5：修改代码以支持环境变量
需要修改 `src/app/api/generate/image/route.ts` 中的认证方式。

### 步骤 6：重新部署
```bash
vercel --prod
```

---

## 🎯 方案 B：独立服务器部署（阿里云/腾讯云）

### 前置准备
1. 购买服务器（推荐：4核8GB）
2. 安装 Ubuntu 20.04 或更高版本
3. 获取服务器 IP 地址

### 步骤 1：连接服务器
```bash
ssh root@your-server-ip
```

### 步骤 2：安装环境
```bash
# 更新系统
apt update && apt upgrade -y

# 安装 Node.js 18
curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
apt install -y nodejs

# 验证安装
node -v  # 应该显示 v18.x.x
npm -v

# 安装 PM2（进程管理器）
npm install -g pm2

# 安装 Git
apt install -y git
```

### 步骤 3：克隆代码
```bash
# 创建应用目录
mkdir -p /var/www
cd /var/www

# 克隆代码（如果有 Git 仓库）
git clone your-repo-url cineflow
cd cineflow/cineflow-mvp

# 或者使用 SCP 上传代码
# 在本地执行：
# scp -r cineflow-mvp root@your-server-ip:/var/www/cineflow
```

### 步骤 4：配置环境变量
```bash
# 创建 .env.local
cat > .env.local << EOF
GOOGLE_CLOUD_PROJECT=fleet-blend-469520-n7
VERTEX_AI_LOCATION=us-central1
NODE_ENV=production
EOF

# 上传服务账号密钥
# 在本地执行：
# scp vertex-key.json root@your-server-ip:/var/www/cineflow/cineflow-mvp/
```

### 步骤 5：安装依赖和构建
```bash
# 安装依赖
npm install

# 构建应用
npm run build
```

### 步骤 6：启动应用
```bash
# 使用 PM2 启动
pm2 start npm --name "cineflow" -- start

# 设置开机自启
pm2 startup
pm2 save

# 查看状态
pm2 status
pm2 logs cineflow
```

### 步骤 7：配置 Nginx（可选，推荐）
```bash
# 安装 Nginx
apt install -y nginx

# 创建配置文件
cat > /etc/nginx/sites-available/cineflow << 'EOF'
server {
    listen 80;
    server_name your-domain.com;  # 改为你的域名或 IP

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_cache_bypass $http_upgrade;
        
        # 增加超时时间（图片生成需要时间）
        proxy_read_timeout 120s;
        proxy_connect_timeout 120s;
    }
}
EOF

# 启用配置
ln -s /etc/nginx/sites-available/cineflow /etc/nginx/sites-enabled/
nginx -t
systemctl restart nginx
```

### 步骤 8：配置防火墙
```bash
# 允许 HTTP 和 HTTPS
ufw allow 80
ufw allow 443
ufw allow 22  # SSH
ufw enable
```

### 步骤 9：访问应用
```
http://your-server-ip
或
http://your-domain.com
```

---

## 🔧 生产环境优化

### 1. 修改 package.json
```json
{
  "scripts": {
    "start": "node --max-old-space-size=4096 node_modules/next/dist/bin/next start"
  }
}
```

### 2. 配置 PM2
```bash
# 创建 ecosystem.config.js
cat > ecosystem.config.js << 'EOF'
module.exports = {
  apps: [{
    name: 'cineflow',
    script: 'npm',
    args: 'start',
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '4G',
    env: {
      NODE_ENV: 'production',
      NODE_OPTIONS: '--max-old-space-size=4096'
    }
  }]
}
EOF

# 使用配置文件启动
pm2 start ecosystem.config.js
pm2 save
```

---

## 🆘 常见问题

### Q1: 内存不足错误
```bash
# 增加 Node.js 内存限制
pm2 delete cineflow
NODE_OPTIONS="--max-old-space-size=8192" pm2 start npm --name "cineflow" -- start
pm2 save
```

### Q2: 端口被占用
```bash
# 查看占用端口的进程
lsof -i :3000
# 或
netstat -tulpn | grep 3000

# 杀死进程
kill -9 <PID>
```

### Q3: 构建失败
```bash
# 清理缓存重新构建
rm -rf .next node_modules
npm install
npm run build
```

### Q4: 无法访问
```bash
# 检查应用状态
pm2 status
pm2 logs cineflow

# 检查 Nginx 状态
systemctl status nginx
nginx -t

# 检查防火墙
ufw status
```

---

## 📊 监控和维护

### 查看日志
```bash
# PM2 日志
pm2 logs cineflow

# Nginx 日志
tail -f /var/log/nginx/access.log
tail -f /var/log/nginx/error.log
```

### 重启应用
```bash
pm2 restart cineflow
```

### 更新代码
```bash
cd /var/www/cineflow/cineflow-mvp
git pull
npm install
npm run build
pm2 restart cineflow
```

---

## ✅ 部署检查清单

- [ ] 服务器已购买并配置
- [ ] Node.js 18+ 已安装
- [ ] 代码已上传到服务器
- [ ] 环境变量已配置
- [ ] vertex-key.json 已上传
- [ ] 依赖已安装（npm install）
- [ ] 应用已构建（npm run build）
- [ ] PM2 已启动应用
- [ ] Nginx 已配置（可选）
- [ ] 防火墙已配置
- [ ] 可以通过浏览器访问

---

## 🎉 部署完成！

访问你的应用：
- 直接访问：`http://your-server-ip:3000`
- 通过 Nginx：`http://your-server-ip`
- 通过域名：`http://your-domain.com`

进入画布：`http://your-domain.com/canvas`

