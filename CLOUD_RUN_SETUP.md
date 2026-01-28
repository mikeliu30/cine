# 🚀 Cloud Run 自动化部署配置指南

## 📋 配置步骤总览

1. ✅ 安装 Google Cloud SDK
2. ✅ 创建 Google Cloud 项目
3. ✅ 配置服务账号和权限
4. ✅ 在 GitHub 添加 Secrets
5. ✅ 推送代码自动部署

---

## 第一步：安装 Google Cloud SDK

### Windows 安装

1. **下载安装程序：**
   ```
   https://cloud.google.com/sdk/docs/install
   ```

2. **运行安装程序并完成安装**

3. **验证安装：**
   ```powershell
   gcloud version
   ```

4. **登录 Google Cloud：**
   ```powershell
   gcloud auth login
   ```

---

## 第二步：运行自动化配置脚本

### 在 PowerShell 中运行：

```powershell
cd D:\cineflow
.\scripts\setup-gcloud.ps1
```

### 脚本会自动完成：
- ✅ 检查 gcloud 是否安装
- ✅ 创建 Google Cloud 项目
- ✅ 启用必要的 API
- ✅ 创建服务账号
- ✅ 授予权限
- ✅ 生成密钥文件

---

## 第三步：配置 GitHub Secrets

### 1. 访问 GitHub Secrets 页面

```
https://github.com/mikeliu30/cine/settings/secrets/actions
```

### 2. 添加 Secret 1: GCP_PROJECT_ID

- 点击 **"New repository secret"**
- Name: `GCP_PROJECT_ID`
- Value: 你的项目 ID（例如：`cineflow-prod`）
- 点击 **"Add secret"**

### 3. 添加 Secret 2: GCP_SA_KEY

- 点击 **"New repository secret"**
- Name: `GCP_SA_KEY`
- Value: 复制 `github-actions-key.json` 的完整内容
- 点击 **"Add secret"**

---

## 第四步：推送代码触发部署

```powershell
cd D:\cineflow

# 添加配置文件
git add .

# 提交
git commit -m "Enable Cloud Run auto deployment"

# 推送（自动触发部署）
git push
```

---

## 第五步：查看部署进度

### 1. 访问 GitHub Actions

```
https://github.com/mikeliu30/cine/actions
```

### 2. 查看工作流状态

- 🟡 **黄色圆圈** - 正在部署
- ✅ **绿色对勾** - 部署成功
- ❌ **红色叉号** - 部署失败

### 3. 获取部署 URL

部署成功后，在 Actions 日志最后会显示：
```
https://cineflow-app-xxxxx-uc.a.run.app
```

---

## 🎯 快速开始

### 如果你已经有 Google Cloud 项目：

```powershell
# 1. 设置项目
gcloud config set project YOUR_PROJECT_ID

# 2. 运行配置脚本
cd D:\cineflow
.\scripts\setup-gcloud.ps1

# 3. 按照提示配置 GitHub Secrets

# 4. 推送代码
git push
```

---

## 🆘 常见问题

### Q1: gcloud 命令不存在？
**A:** 需要先安装 Google Cloud SDK
- 下载：https://cloud.google.com/sdk/docs/install
- 安装后重启 PowerShell

### Q2: 没有 Google Cloud 项目？
**A:** 创建新项目
```powershell
gcloud projects create cineflow-prod --name="CineFlow Production"
```

### Q3: API 启用失败？
**A:** 需要启用计费账号
- 访问：https://console.cloud.google.com/billing
- 关联计费账号到项目

### Q4: 部署失败？
**A:** 检查以下几点：
1. GitHub Secrets 是否正确配置
2. Google Cloud API 是否全部启用
3. 服务账号权限是否正确

---

## 📊 部署后的功能

部署成功后，你的应用会：
- ✅ 自动扩容（根据流量）
- ✅ HTTPS 加密
- ✅ 全球 CDN 加速
- ✅ 自动健康检查
- ✅ 零停机部署

---

## 🔄 后续更新流程

每次修改代码后：

```powershell
git add .
git commit -m "你的修改说明"
git push
```

GitHub Actions 会自动：
1. 构建 Docker 镜像
2. 推送到 Container Registry
3. 部署到 Cloud Run
4. 更新线上服务

---

## 📞 需要帮助？

如果遇到问题，请告诉我：
1. 错误信息
2. 执行的命令
3. 当前步骤

我会帮你解决！🚀

