# 🚀 Cloud Run 自动化部署 - 完整配置指南

## ⚠️ 当前状态

你的 Google Cloud 项目需要启用计费账号才能使用 Cloud Run。

---

## 📋 两种部署方案

### 方案 A：启用 Google Cloud 计费（推荐 - 功能最完整）

**优点：**
- ✅ 完整的 Cloud Run 功能
- ✅ 自动扩容
- ✅ 全球 CDN
- ✅ HTTPS 加密
- ✅ 新用户有 $300 免费额度

**步骤：**

#### 1. 启用计费账号

访问：https://console.cloud.google.com/billing

1. 点击 **"创建账号"** 或 **"关联计费账号"**
2. 输入信用卡信息（新用户获得 $300 免费额度）
3. 选择项目：`gen-lang-client-0537716100` 或 `main-duality-485606-h6`
4. 点击 **"设置账号"**

#### 2. 验证计费已启用

```powershell
gcloud beta billing projects describe gen-lang-client-0537716100
```

#### 3. 运行自动化配置脚本

```powershell
cd D:\cineflow
.\scripts\setup-gcloud.ps1
```

#### 4. 配置 GitHub Secrets

访问：https://github.com/mikeliu30/cine/settings/secrets/actions

添加两个 Secrets：
- `GCP_PROJECT_ID` - 你的项目 ID
- `GCP_SA_KEY` - 服务账号密钥 JSON

#### 5. 推送代码自动部署

```powershell
git add .
git commit -m "Enable Cloud Run deployment"
git push
```

---

### 方案 B：使用 Vercel 部署（免费替代方案）

**优点：**
- ✅ 完全免费
- ✅ 自动部署
- ✅ 全球 CDN
- ✅ HTTPS 加密
- ✅ 无需信用卡

**步骤：**

#### 1. 安装 Vercel CLI

```powershell
npm install -g vercel
```

#### 2. 登录 Vercel

```powershell
vercel login
```

#### 3. 部署项目

```powershell
cd D:\cineflow
vercel
```

按照提示操作：
- Set up and deploy? **Y**
- Which scope? 选择你的账号
- Link to existing project? **N**
- What's your project's name? **cineflow**
- In which directory is your code located? **./**
- Want to override the settings? **N**

#### 4. 配置环境变量

```powershell
# 添加环境变量
vercel env add GOOGLE_APPLICATION_CREDENTIALS_JSON
vercel env add OPENAI_API_KEY
vercel env add REPLICATE_API_KEY
vercel env add RUNWAY_API_KEY
vercel env add ARK_API_KEY
```

#### 5. 生产部署

```powershell
vercel --prod
```

#### 6. 配置 GitHub 集成

访问：https://vercel.com/dashboard

1. 点击项目
2. Settings → Git
3. 连接 GitHub 仓库：`mikeliu30/cine`
4. 每次推送自动部署

---

### 方案 C：使用 Railway 部署（免费替代方案）

**优点：**
- ✅ 每月 $5 免费额度
- ✅ 支持 Docker
- ✅ 自动部署
- ✅ 简单易用

**步骤：**

#### 1. 访问 Railway

https://railway.app/

#### 2. 连接 GitHub

1. 点击 **"Start a New Project"**
2. 选择 **"Deploy from GitHub repo"**
3. 选择仓库：`mikeliu30/cine`

#### 3. 配置环境变量

在 Railway 项目设置中添加：
- `GOOGLE_APPLICATION_CREDENTIALS_JSON`
- `OPENAI_API_KEY`
- `REPLICATE_API_KEY`
- `RUNWAY_API_KEY`
- `ARK_API_KEY`

#### 4. 部署

Railway 会自动检测 Dockerfile 并部署

---

## 📊 方案对比

| 特性 | Google Cloud Run | Vercel | Railway |
|------|-----------------|--------|---------|
| 价格 | $300 免费额度 | 完全免费 | $5/月免费 |
| 需要信用卡 | ✅ 是 | ❌ 否 | ❌ 否 |
| Docker 支持 | ✅ 是 | ❌ 否 | ✅ 是 |
| 自动扩容 | ✅ 是 | ✅ 是 | ✅ 是 |
| WebSocket | ✅ 是 | ⚠️ 有限 | ✅ 是 |
| 配置难度 | 中等 | 简单 | 简单 |

---

## 🎯 我的建议

### 如果你有信用卡：
**选择方案 A（Google Cloud Run）**
- 最适合 AI 应用
- 已有 Gemini 配置
- 功能最完整

### 如果暂时没有信用卡：
**选择方案 B（Vercel）**
- 最简单快速
- 完全免费
- 适合快速演示

---

## 🚀 快速开始

### 立即使用 Vercel 部署（5 分钟完成）

```powershell
# 1. 安装 Vercel
npm install -g vercel

# 2. 登录
vercel login

# 3. 部署
cd D:\cineflow
vercel

# 4. 生产部署
vercel --prod
```

完成！你会得到一个公开访问的 URL。

---

## 📞 需要帮助？

请告诉我你想使用哪个方案：

1. **方案 A** - Google Cloud Run（需要启用计费）
2. **方案 B** - Vercel（免费，最简单）
3. **方案 C** - Railway（免费，支持 Docker）

我会帮你完成配置！🚀

