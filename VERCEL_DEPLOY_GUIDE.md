# 🚀 Vercel 部署快速指南

## ✅ 当前状态
- ✅ Vercel CLI 已安装
- ⏳ 等待登录 Vercel

---

## 📋 Vercel 部署步骤

### 步骤 1：登录 Vercel

在 PowerShell 中运行：

```powershell
cd D:\cineflow
vercel login
```

会提示你选择登录方式：
- **GitHub** (推荐)
- **GitLab**
- **Bitbucket**
- **Email**

**推荐选择 GitHub**，因为你的代码已经在 GitHub 上。

### 步骤 2：部署项目

登录成功后，运行：

```powershell
vercel
```

按照提示操作：

1. **Set up and deploy "D:\cineflow"?** 
   - 输入：`Y`

2. **Which scope do you want to deploy to?**
   - 选择你的账号（使用方向键选择）

3. **Link to existing project?**
   - 输入：`N`

4. **What's your project's name?**
   - 输入：`cineflow` 或直接回车

5. **In which directory is your code located?**
   - 直接回车（使用默认 `./`）

6. **Want to override the settings?**
   - 输入：`N`

Vercel 会自动：
- ✅ 检测 Next.js 项目
- ✅ 构建项目
- ✅ 部署到 Vercel
- ✅ 生成预览 URL

### 步骤 3：生产部署

预览成功后，部署到生产环境：

```powershell
vercel --prod
```

你会得到一个生产环境 URL，例如：
```
https://cineflow.vercel.app
```

---

## 🔐 配置环境变量

### 方法 A：通过 Vercel Dashboard（推荐）

1. 访问：https://vercel.com/dashboard
2. 选择项目 `cineflow`
3. 点击 **Settings** → **Environment Variables**
4. 添加以下变量：

```
GOOGLE_APPLICATION_CREDENTIALS_JSON=你的 Vertex AI 密钥 JSON
OPENAI_API_KEY=sk-your-openai-key
REPLICATE_API_KEY=r8_your-replicate-key
RUNWAY_API_KEY=your-runway-key
ARK_API_KEY=your-ark-key
NODE_ENV=production
```

5. 点击 **Save**
6. 重新部署：`vercel --prod`

### 方法 B：通过命令行

```powershell
# 添加环境变量
vercel env add GOOGLE_APPLICATION_CREDENTIALS_JSON production
vercel env add OPENAI_API_KEY production
vercel env add REPLICATE_API_KEY production
vercel env add RUNWAY_API_KEY production
vercel env add ARK_API_KEY production

# 重新部署
vercel --prod
```

---

## 🔄 配置 GitHub 自动部署

### 1. 连接 GitHub 仓库

访问：https://vercel.com/dashboard

1. 选择项目 `cineflow`
2. 点击 **Settings** → **Git**
3. 点击 **Connect Git Repository**
4. 选择 `mikeliu30/cine`
5. 点击 **Connect**

### 2. 配置自动部署

连接后，Vercel 会自动：
- ✅ 监听 GitHub 推送
- ✅ 每次推送自动部署
- ✅ 生成预览 URL（PR）
- ✅ 自动部署到生产环境（main 分支）

### 3. 测试自动部署

```powershell
cd D:\cineflow

# 修改文件
echo "# Test" >> README.md

# 提交并推送
git add .
git commit -m "Test Vercel auto deployment"
git push

# Vercel 会自动部署！
```

---

## 📊 Vercel 功能

部署成功后，你的应用会拥有：

- ✅ **全球 CDN** - 自动加速
- ✅ **HTTPS** - 自动 SSL 证书
- ✅ **自动扩容** - 根据流量自动调整
- ✅ **预览部署** - 每个 PR 都有独立预览
- ✅ **实时日志** - 查看运行日志
- ✅ **分析统计** - 访问量、性能监控
- ✅ **自定义域名** - 可以绑定自己的域名

---

## 🎯 完整部署流程

```powershell
# 1. 登录 Vercel
vercel login

# 2. 部署项目
vercel

# 3. 生产部署
vercel --prod

# 4. 配置环境变量（在 Vercel Dashboard）
# 访问：https://vercel.com/dashboard

# 5. 连接 GitHub 自动部署
# 在 Vercel Dashboard 中连接仓库

# 6. 后续更新只需推送代码
git add .
git commit -m "Update"
git push
# Vercel 自动部署！
```

---

## 🆘 常见问题

### Q1: vercel login 没有反应？

**A:** 检查浏览器是否打开了登录页面
- 如果没有，手动访问显示的 URL
- 完成登录后返回终端

### Q2: 部署失败？

**A:** 检查以下几点：
1. 确保 `package.json` 中有 `build` 脚本
2. 确保 `next.config.mjs` 配置正确
3. 查看 Vercel 部署日志

### Q3: 环境变量不生效？

**A:** 
1. 确保在 Vercel Dashboard 中添加了环境变量
2. 重新部署：`vercel --prod`
3. 环境变量修改后需要重新部署

### Q4: 如何查看部署日志？

**A:** 
- 访问：https://vercel.com/dashboard
- 选择项目 → Deployments
- 点击具体部署查看日志

---

## 📞 下一步

1. **在 PowerShell 中运行：**
   ```powershell
   cd D:\cineflow
   vercel login
   ```

2. **选择 GitHub 登录**

3. **完成登录后运行：**
   ```powershell
   vercel
   ```

4. **按照提示完成部署**

---

## 🎉 完成！

部署成功后，你会得到：
- ✅ 预览 URL：`https://cineflow-xxx.vercel.app`
- ✅ 生产 URL：`https://cineflow.vercel.app`
- ✅ 自动 CI/CD
- ✅ 全球访问

**祝你部署顺利！** 🚀

