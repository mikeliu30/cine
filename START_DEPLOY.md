# 🚀 立即部署 - 3 步上线

## 你有服务器吗？

### ✅ 有服务器 → 跳到「方案 A」
### ❌ 没有服务器 → 跳到「方案 B」

---

## 方案 A：已有服务器（30 分钟）

### 第 1 步：上传代码到服务器

**方式 1：使用 Git（推荐）**
```bash
# 在本地提交代码
git add .
git commit -m "Ready for deployment"
git push

# 在服务器上克隆
ssh root@your-server-ip
cd /var/www
git clone your-repo-url cineflow
cd cineflow/cineflow-mvp
```

**方式 2：使用 SCP 上传**
```bash
# 在本地执行（Windows PowerShell）
scp -r cineflow-mvp root@your-server-ip:/var/www/cineflow
```

### 第 2 步：在服务器上安装环境

```bash
# 连接到服务器
ssh root@your-server-ip

# 安装 Node.js 18
curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
apt install -y nodejs

# 安装 PM2
npm install -g pm2

# 验证安装
node -v  # 应该显示 v18.x.x
```

### 第 3 步：配置和部署

```bash
cd /var/www/cineflow/cineflow-mvp

# 上传服务账号密钥（在本地执行）
scp vertex-key.json root@your-server-ip:/var/www/cineflow/cineflow-mvp/

# 创建环境变量文件
cat > .env.local << EOF
GOOGLE_CLOUD_PROJECT=fleet-blend-469520-n7
VERTEX_AI_LOCATION=us-central1
NODE_ENV=production
EOF

# 给脚本添加执行权限
chmod +x scripts/deploy.sh

# 一键部署！
./scripts/deploy.sh
```

### 🎉 完成！

访问：`http://your-server-ip:3000`

---

## 方案 B：没有服务器 - 购买并部署（1 小时）

### 第 1 步：购买服务器（10 分钟）

**推荐平台：阿里云**

1. 访问：https://www.aliyun.com/product/ecs
2. 选择配置：
   - 地域：就近选择（如华东、华北）
   - 实例规格：**4核8GB**（推荐）或 2核4GB（最低）
   - 镜像：Ubuntu 20.04 64位
   - 带宽：5Mbps 或更高
   - 时长：按月购买
3. 价格：约 ¥300/月（4核8GB）
4. 购买后记录：
   - 公网 IP：`xxx.xxx.xxx.xxx`
   - root 密码：`xxxxxxxx`

### 第 2 步：连接服务器（5 分钟）

**Windows 用户：**
```powershell
# 使用 PowerShell 或下载 PuTTY
ssh root@your-server-ip
# 输入密码
```

**Mac/Linux 用户：**
```bash
ssh root@your-server-ip
# 输入密码
```

### 第 3 步：安装环境（10 分钟）

```bash
# 更新系统
apt update && apt upgrade -y

# 安装 Node.js 18
curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
apt install -y nodejs

# 安装 PM2
npm install -g pm2

# 安装 Git
apt install -y git

# 验证
node -v
npm -v
pm2 -v
```

### 第 4 步：上传代码（10 分钟）

**方式 1：使用 Git**
```bash
cd /var/www
git clone your-repo-url cineflow
cd cineflow/cineflow-mvp
```

**方式 2：手动上传**
```bash
# 在本地打包
cd cineflow-mvp
tar -czf cineflow.tar.gz .

# 上传到服务器（在本地执行）
scp cineflow.tar.gz root@your-server-ip:/var/www/

# 在服务器上解压
ssh root@your-server-ip
cd /var/www
mkdir cineflow
cd cineflow
tar -xzf ../cineflow.tar.gz
```

### 第 5 步：配置密钥（5 分钟）

```bash
# 上传 vertex-key.json（在本地执行）
scp vertex-key.json root@your-server-ip:/var/www/cineflow/

# 在服务器上创建环境变量
cd /var/www/cineflow
cat > .env.local << EOF
GOOGLE_CLOUD_PROJECT=fleet-blend-469520-n7
VERTEX_AI_LOCATION=us-central1
NODE_ENV=production
EOF
```

### 第 6 步：部署（10 分钟）

```bash
cd /var/www/cineflow

# 安装依赖
npm install

# 构建
npm run build

# 启动
pm2 start ecosystem.config.js
pm2 save
pm2 startup  # 设置开机自启
```

### 第 7 步：配置防火墙（5 分钟）

```bash
# 允许 HTTP 访问
ufw allow 3000
ufw allow 22  # SSH
ufw enable
```

**阿里云用户还需要：**
1. 登录阿里云控制台
2. 进入 ECS 实例
3. 点击「安全组」
4. 添加规则：允许 TCP 3000 端口

### 🎉 完成！

访问：`http://your-server-ip:3000`

---

## 🔧 可选：配置域名和 Nginx（20 分钟）

### 1. 购买域名
- 阿里云：https://wanwang.aliyun.com/
- 腾讯云：https://dnspod.cloud.tencent.com/
- 价格：约 ¥50/年

### 2. 配置 DNS
```
类型：A 记录
主机记录：@ 或 www
记录值：your-server-ip
TTL：10 分钟
```

### 3. 安装 Nginx
```bash
apt install -y nginx

# 创建配置
cat > /etc/nginx/sites-available/cineflow << 'EOF'
server {
    listen 80;
    server_name your-domain.com www.your-domain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_read_timeout 120s;
    }
}
EOF

# 启用配置
ln -s /etc/nginx/sites-available/cineflow /etc/nginx/sites-enabled/
nginx -t
systemctl restart nginx

# 配置防火墙
ufw allow 80
ufw allow 443
```

### 4. 配置 HTTPS（可选）
```bash
# 安装 Certbot
apt install -y certbot python3-certbot-nginx

# 获取证书
certbot --nginx -d your-domain.com -d www.your-domain.com

# 自动续期
certbot renew --dry-run
```

---

## 📊 部署后检查

### 1. 检查应用状态
```bash
pm2 status
pm2 logs cineflow
```

### 2. 测试访问
```bash
# 本地测试
curl http://localhost:3000

# 外部测试
curl http://your-server-ip:3000
```

### 3. 测试 API
```bash
curl http://your-server-ip:3000/api/quota/status
```

---

## 🆘 常见问题

### Q: 无法访问？
```bash
# 检查应用是否运行
pm2 status

# 检查端口是否监听
netstat -tulpn | grep 3000

# 检查防火墙
ufw status

# 检查阿里云安全组
# 登录控制台 → ECS → 安全组 → 添加规则
```

### Q: 内存不足？
```bash
# 增加内存限制
pm2 delete cineflow
NODE_OPTIONS="--max-old-space-size=8192" pm2 start ecosystem.config.js
pm2 save
```

### Q: 如何更新代码？
```bash
cd /var/www/cineflow
git pull  # 或重新上传
npm install
npm run build
pm2 restart cineflow
```

---

## ✅ 部署完成检查清单

- [ ] 服务器已购买并可访问
- [ ] Node.js 18+ 已安装
- [ ] 代码已上传
- [ ] vertex-key.json 已上传
- [ ] .env.local 已配置
- [ ] 依赖已安装（npm install）
- [ ] 应用已构建（npm run build）
- [ ] PM2 已启动应用
- [ ] 防火墙已配置
- [ ] 可以通过浏览器访问
- [ ] 可以生成图片

---

## 🎉 恭喜！你的应用已上线！

**访问地址：**
- 直接访问：`http://your-server-ip:3000`
- 画布页面：`http://your-server-ip:3000/canvas`

**下一步：**
1. 配置域名（可选）
2. 配置 HTTPS（推荐）
3. 设置监控和备份
4. 邀请用户测试

有问题随时问我！🚀

