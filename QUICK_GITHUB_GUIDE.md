# 🚀 快速上传到 GitHub - 5 分钟指南

## ⚡ 快速开始（3 种方法）

### 方法 1：使用自动化脚本（推荐）

```bash
# 双击运行
git-setup.bat

# 或在 PowerShell 中运行
.\git-setup.ps1
```

---

### 方法 2：手动执行命令

#### 1. 配置 Git 用户信息（首次使用）

```bash
git config --global user.name "你的名字"
git config --global user.email "你的邮箱@example.com"
```

#### 2. 添加文件并提交

```bash
git add .
git commit -m "Initial commit: CineFlow v2.0.0"
```

#### 3. 创建 GitHub 仓库

访问：https://github.com/new

- Repository name: `cineflow`
- Visibility: Public
- 不要勾选任何选项
- 点击 "Create repository"

#### 4. 关联并推送

```bash
# 替换为你的 GitHub 用户名
git remote add origin https://github.com/你的用户名/cineflow.git
git branch -M main
git push -u origin main
```

---

### 方法 3：使用 GitHub Desktop（最简单）

1. 下载 GitHub Desktop：https://desktop.github.com/
2. 打开 GitHub Desktop
3. File → Add Local Repository → 选择 `D:\cineflow`
4. 点击 "Publish repository"
5. 完成！

---

## 📋 完整步骤清单

### ✅ 本地准备（已完成）

- [x] 创建 `.gitignore` 文件
- [x] 创建 GitHub Actions 工作流
- [x] 初始化 Git 仓库

### 🔲 需要你完成的步骤

#### 步骤 1：配置 Git（首次使用）

```bash
git config --global user.name "你的名字"
git config --global user.email "你的邮箱"
```

#### 步骤 2：提交代码

```bash
git add .
git commit -m "Initial commit: CineFlow v2.0.0"
```

#### 步骤 3：创建 GitHub 仓库

1. 访问：https://github.com/new
2. 填写：
   - Repository name: `cineflow`
   - Description: `多人实时协作画布 · AIGC 卡牌生成系统`
   - Visibility: Public
3. 点击 "Create repository"

#### 步骤 4：推送到 GitHub

```bash
# 复制 GitHub 显示的命令，类似：
git remote add origin https://github.com/你的用户名/cineflow.git
git branch -M main
git push -u origin main
```

---

## 🔐 配置自动化部署（可选）

如果需要自动部署到 Google Cloud Run：

### 1. 配置 Google Cloud

```bash
# 启用 API
gcloud services enable run.googleapis.com
gcloud services enable containerregistry.googleapis.com
gcloud services enable cloudbuild.googleapis.com

# 创建服务账号
gcloud iam service-accounts create github-actions

# 生成密钥
gcloud iam service-accounts keys create github-key.json \
  --iam-account=github-actions@你的项目ID.iam.gserviceaccount.com
```

### 2. 配置 GitHub Secrets

访问：`https://github.com/你的用户名/cineflow/settings/secrets/actions`

添加：
- `GCP_PROJECT_ID`: 你的 Google Cloud 项目 ID
- `GCP_SA_KEY`: github-key.json 的完整内容

### 3. 推送代码自动部署

```bash
git push
# 自动触发部署到 Cloud Run
```

---

## 🎯 验证成功

### 检查 GitHub

访问：`https://github.com/你的用户名/cineflow`

应该看到：
- ✅ 所有代码文件
- ✅ README.md 显示正常
- ✅ .github/workflows 目录存在

### 检查自动部署（如果配置了）

访问：`https://github.com/你的用户名/cineflow/actions`

应该看到：
- ✅ 工作流正在运行或已完成
- ✅ 部署成功显示绿色对勾

---

## 🔄 日常更新流程

每次修改代码后：

```bash
# 1. 查看修改
git status

# 2. 添加修改
git add .

# 3. 提交
git commit -m "描述你的修改"

# 4. 推送
git push

# 5. 自动部署（如果配置了）
```

---

## ❓ 常见问题

### Q: 推送时要求输入用户名密码？

**A:** 使用 Personal Access Token

1. 访问：https://github.com/settings/tokens
2. 点击 "Generate new token (classic)"
3. 勾选 `repo` 权限
4. 生成并复制 token
5. 推送时使用 token 作为密码

### Q: 推送失败，提示 "remote: Permission denied"？

**A:** 检查仓库 URL

```bash
# 查看当前远程地址
git remote -v

# 如果不对，重新设置
git remote set-url origin https://github.com/你的用户名/cineflow.git
```

### Q: 如何撤销上次提交？

**A:** 使用 reset

```bash
# 撤销提交，保留修改
git reset --soft HEAD~1

# 撤销提交和修改
git reset --hard HEAD~1
```

---

## 📚 相关文档

- [完整部署指南](./GITHUB_DEPLOY_GUIDE.md)
- [项目 README](./README.md)
- [AI 生成实现文档](./AI_GENERATION_IMPLEMENTATION.md)

---

## 🎉 完成！

现在你的项目已经：
- ✅ 上传到 GitHub
- ✅ 版本控制
- ✅ 可以协作开发
- ✅ 自动化部署（可选）

**开始你的开发之旅吧！** 🚀

