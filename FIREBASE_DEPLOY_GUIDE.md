# 🚀 Firebase 自动化部署指南

## 📋 Firebase 部署优势

- ✅ **完全免费** - Spark 计划免费额度充足
- ✅ **无需信用卡** - 免费计划不需要信用卡
- ✅ **自动 HTTPS** - 自动 SSL 证书
- ✅ **全球 CDN** - Firebase CDN 加速
- ✅ **自动部署** - GitHub 推送自动部署
- ✅ **简单配置** - 几分钟完成设置

---

## 第一步：安装 Firebase CLI

### 在 PowerShell 中运行：

```powershell
npm install -g firebase-tools
```

### 验证安装：

```powershell
firebase --version
```

---

## 第二步：登录 Firebase

```powershell
firebase login
```

这会：
1. 打开浏览器
2. 让你选择 Google 账号
3. 授权 Firebase CLI
4. 返回终端显示成功

---

## 第三步：初始化 Firebase 项目

### 3.1 进入项目目录

```powershell
cd D:\cineflow
```

### 3.2 初始化 Firebase

```powershell
firebase init
```

### 3.3 按照提示操作

**1. 选择功能（使用空格选择，回车确认）：**
```
? Which Firebase features do you want to set up?
  ◯ Realtime Database
  ◯ Firestore
  ◯ Functions
❯ ◉ Hosting
  ◯ Storage
  ◯ Emulators
```
选择：**Hosting**

**2. 选择项目：**
```
? Please select an option:
❯ Use an existing project
  Create a new project
  Add Firebase to an existing Google Cloud Platform project
```
选择：**Create a new project** 或 **Use an existing project**

**3. 输入项目 ID（如果创建新项目）：**
```
? Please specify a unique project id (cineflow-xxxxx):
```
输入：`cineflow-prod` 或其他唯一 ID

**4. 配置 Hosting：**
```
? What do you want to use as your public directory?
```
输入：`out`

```
? Configure as a single-page app (rewrite all urls to /index.html)?
```
输入：`No`

```
? Set up automatic builds and deploys with GitHub?
```
输入：`Yes`

**5. GitHub 配置：**
```
? For which GitHub repository would you like to set up a GitHub workflow?
```
输入：`mikeliu30/cine`

```
? Set up the workflow to run a build script before every deploy?
```
输入：`Yes`

```
? What script should be run before every deploy?
```
输入：`npm run build`

```
? Set up automatic deployment to your site's live channel when a PR is merged?
```
输入：`Yes`

```
? What is the name of the GitHub branch associated with your site's live channel?
```
输入：`main`

---

## 第四步：配置 Next.js 静态导出

### 4.1 更新 next.config.mjs

确保配置了静态导出：

```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  images: {
    unoptimized: true,
  },
  trailingSlash: true,
};

export default nextConfig;
```

### 4.2 更新 package.json

添加构建脚本：

```json
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "export": "next build && next export"
  }
}
```

---

## 第五步：配置 Firebase Hosting

### 5.1 创建 firebase.json

文件应该已经自动创建，确保内容如下：

```json
{
  "hosting": {
    "public": "out",
    "ignore": [
      "firebase.json",
      "**/.*",
      "**/node_modules/**"
    ],
    "rewrites": [
      {
        "source": "**",
        "destination": "/index.html"
      }
    ]
  }
}
```

### 5.2 创建 .firebaserc

```json
{
  "projects": {
    "default": "cineflow-prod"
  }
}
```

---

## 第六步：手动部署测试

### 6.1 构建项目

```powershell
npm run build
```

### 6.2 部署到 Firebase

```powershell
firebase deploy
```

### 6.3 查看部署结果

部署成功后会显示：
```
✔  Deploy complete!

Project Console: https://console.firebase.google.com/project/cineflow-prod/overview
Hosting URL: https://cineflow-prod.web.app
```

---

## 第七步：配置 GitHub Actions 自动部署

Firebase CLI 应该已经自动创建了 GitHub Actions 工作流。

### 7.1 检查工作流文件

文件位置：`.github\workflows\firebase-hosting-merge.yml`

内容应该类似：

```yaml
name: Deploy to Firebase Hosting on merge
on:
  push:
    branches:
      - main
jobs:
  build_and_deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - run: npm ci && npm run build
      - uses: FirebaseExtended/action-hosting-deploy@v0
        with:
          repoToken: '${{ secrets.GITHUB_TOKEN }}'
          firebaseServiceAccount: '${{ secrets.FIREBASE_SERVICE_ACCOUNT_CINEFLOW_PROD }}'
          channelId: live
          projectId: cineflow-prod
```

### 7.2 检查 PR 预览工作流

文件位置：`.github\workflows\firebase-hosting-pull-request.yml`

---

## 第八步：推送代码触发自动部署

### 8.1 提交 Firebase 配置

```powershell
git add .
git commit -m "Add Firebase hosting configuration"
git push
```

### 8.2 查看部署进度

访问：
```
https://github.com/mikeliu30/cine/actions
```

你会看到：
- 🟡 **黄色圆圈** - 正在部署
- ✅ **绿色对勾** - 部署成功
- ❌ **红色叉号** - 部署失败

### 8.3 访问部署的应用

部署成功后，访问：
```
https://cineflow-prod.web.app
```

或

```
https://cineflow-prod.firebaseapp.com
```

---

## 🔄 后续更新流程

每次修改代码后：

```powershell
git add .
git commit -m "你的修改说明"
git push
```

GitHub Actions 会自动：
1. ✅ 检出代码
2. ✅ 安装依赖
3. ✅ 构建项目
4. ✅ 部署到 Firebase Hosting
5. ✅ 更新线上服务

---

## 📊 Firebase 免费额度

### Spark 计划（免费）
- ✅ 10 GB 存储空间
- ✅ 360 MB/天 数据传输
- ✅ 自定义域名
- ✅ SSL 证书
- ✅ 全球 CDN

对于中小型应用完全够用！

---

## 🎯 完整命令总结

```powershell
# 1. 安装 Firebase CLI
npm install -g firebase-tools

# 2. 登录
firebase login

# 3. 初始化项目
cd D:\cineflow
firebase init

# 4. 手动部署测试
npm run build
firebase deploy

# 5. 推送代码自动部署
git add .
git commit -m "Add Firebase hosting"
git push
```

---

## 下一步

请在 PowerShell 中运行第一个命令开始配置！

