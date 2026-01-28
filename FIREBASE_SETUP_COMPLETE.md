# 🚀 Firebase 自动化部署 - 配置完成指南

## ✅ 已完成的配置

我已经为你创建了以下配置文件：

1. ✅ `firebase.json` - Firebase Hosting 配置
2. ✅ `.firebaserc` - Firebase 项目配置
3. ✅ `.github\workflows\firebase-hosting-merge.yml` - 主分支自动部署
4. ✅ `.github\workflows\firebase-hosting-pull-request.yml` - PR 预览部署

---

## 📋 接下来需要完成的步骤

### 步骤 1：创建 Firebase 项目

1. **访问 Firebase Console：**
   ```
   https://console.firebase.google.com/
   ```

2. **创建新项目：**
   - 点击 **"添加项目"** 或 **"Add project"**
   - 项目名称：`cineflow-prod`
   - 禁用 Google Analytics（可选）
   - 点击 **"创建项目"**

3. **等待项目创建完成**（约 30 秒）

---

### 步骤 2：获取 Firebase 服务账号密钥

#### 方法 A：使用 Firebase CLI（推荐）

在 PowerShell 中运行：

```powershell
cd D:\cineflow

# 登录 Firebase
firebase login

# 生成服务账号密钥
firebase init hosting:github
```

按照提示操作：
1. 选择项目：`cineflow-prod`
2. GitHub 仓库：`mikeliu30/cine`
3. 自动设置 GitHub Actions：`Yes`
4. 覆盖现有工作流文件：`Yes`

Firebase CLI 会自动：
- ✅ 创建服务账号
- ✅ 生成密钥
- ✅ 添加到 GitHub Secrets

#### 方法 B：手动配置

如果方法 A 失败，使用手动配置：

1. **访问 Firebase 项目设置：**
   ```
   https://console.firebase.google.com/project/cineflow-prod/settings/serviceaccounts/adminsdk
   ```

2. **生成新的私钥：**
   - 点击 **"生成新的私钥"**
   - 下载 JSON 文件
   - 保存为 `firebase-service-account.json`

3. **添加到 GitHub Secrets：**
   - 访问：`https://github.com/mikeliu30/cine/settings/secrets/actions`
   - 点击 **"New repository secret"**
   - Name: `FIREBASE_SERVICE_ACCOUNT`
   - Value: 粘贴 JSON 文件的完整内容
   - 点击 **"Add secret"**

---

### 步骤 3：更新 Next.js 配置

确保 `next.config.mjs` 配置了静态导出：

```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  images: {
    unoptimized: true,
  },
  trailingSlash: true,
  distDir: 'out',
};

export default nextConfig;
```

---

### 步骤 4：测试本地构建

```powershell
cd D:\cineflow

# 安装依赖
npm install

# 构建项目
npm run build

# 检查 out 目录是否生成
ls out
```

应该看到 `out` 目录包含：
- `index.html`
- `_next/` 目录
- 其他静态文件

---

### 步骤 5：手动部署测试（可选）

```powershell
# 登录 Firebase
firebase login

# 部署到 Firebase Hosting
firebase deploy --only hosting
```

部署成功后会显示：
```
✔  Deploy complete!

Hosting URL: https://cineflow-prod.web.app
```

---

### 步骤 6：推送代码触发自动部署

```powershell
cd D:\cineflow

# 添加所有文件
git add .

# 提交
git commit -m "Add Firebase hosting configuration"

# 推送到 GitHub
git push
```

---

### 步骤 7：查看部署进度

1. **访问 GitHub Actions：**
   ```
   https://github.com/mikeliu30/cine/actions
   ```

2. **查看工作流状态：**
   - 🟡 **黄色圆圈** - 正在部署（约 3-5 分钟）
   - ✅ **绿色对勾** - 部署成功
   - ❌ **红色叉号** - 部署失败

3. **获取部署 URL：**
   
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
- ✅ 360 MB/天 数据传输（约 10 GB/月）
- ✅ 自定义域名
- ✅ 免费 SSL 证书
- ✅ 全球 CDN

对于中小型应用完全够用！

---

## 🎯 快速命令参考

```powershell
# 登录 Firebase
firebase login

# 初始化 Firebase Hosting + GitHub
firebase init hosting:github

# 本地构建测试
npm run build

# 手动部署
firebase deploy --only hosting

# 查看部署列表
firebase hosting:channel:list

# 查看项目信息
firebase projects:list
```

---

## 🆘 常见问题

### Q1: firebase login 没有反应？

**A:** 检查浏览器是否打开了登录页面
- 如果没有，手动访问显示的 URL
- 完成登录后返回终端

### Q2: 部署失败 "Error: HTTP Error: 404"？

**A:** 项目 ID 不存在或拼写错误
- 检查 `.firebaserc` 中的项目 ID
- 确保在 Firebase Console 中创建了项目

### Q3: GitHub Actions 失败 "FIREBASE_SERVICE_ACCOUNT not found"？

**A:** 需要添加 GitHub Secret
- 访问：`https://github.com/mikeliu30/cine/settings/secrets/actions`
- 添加 `FIREBASE_SERVICE_ACCOUNT` Secret

### Q4: 构建失败 "out directory not found"？

**A:** 确保 Next.js 配置了静态导出
- 检查 `next.config.mjs` 中的 `output: 'export'`
- 运行 `npm run build` 测试

---

## 🎉 完成！

现在你的项目已经：
- ✅ 配置了 Firebase Hosting
- ✅ 设置了自动化部署
- ✅ 每次推送代码自动部署
- ✅ 拥有公开访问的 URL

**下次修改代码，只需要：**
```powershell
git add .
git commit -m "你的修改说明"
git push
```

就会自动部署！🚀

