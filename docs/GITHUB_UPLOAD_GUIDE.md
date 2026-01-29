# 📤 如何将项目上传到 GitHub - 完整指南

> **最后更新**: 2026-01-29  
> **项目**: CineFlow MVP  
> **仓库**: https://github.com/mikeliu30/cine

---

## 📋 目录

1. [前提条件](#前提条件)
2. [首次上传项目](#首次上传项目)
3. [日常更新流程](#日常更新流程)
4. [常用 Git 命令](#常用-git-命令)
5. [常见问题](#常见问题)

---

## ✅ 前提条件

### 1. 安装 Git

**检查是否已安装**:
```powershell
git --version
```

**如果未安装**:
- 访问: https://git-scm.com/download/win
- 下载并安装 Git for Windows

### 2. 配置 Git 用户信息

```powershell
# 设置用户名
git config --global user.name "Mike Liu"

# 设置邮箱
git config --global user.email "mikeliu30@example.com"

# 验证配置
git config --list
```

### 3. 创建 GitHub 账号

- 访问: https://github.com
- 注册账号（如果还没有）

---

## 🚀 首次上传项目

### 步骤 1: 在 GitHub 创建仓库

#### 1.1 访问 GitHub

```
https://github.com/new
```

#### 1.2 填写仓库信息

- **Repository name**: `cine`
- **Description**: `CineFlow - AI-powered video generation platform`
- **Visibility**: 
  - ✅ **Public** (公开，推荐)
  - ⬜ **Private** (私有)
- **Initialize this repository**:
  - ⬜ 不要勾选 "Add a README file"
  - ⬜ 不要勾选 "Add .gitignore"
  - ⬜ 不要勾选 "Choose a license"

#### 1.3 点击 "Create repository"

---

### 步骤 2: 初始化本地 Git 仓库

```powershell
# 切换到项目目录
cd D:\cineflow

# 初始化 Git 仓库
git init

# 查看状态
git status
```

**预期输出**:
```
Initialized empty Git repository in D:/cineflow/.git/
```

---

### 步骤 3: 添加文件到 Git

```powershell
# 添加所有文件
git add .

# 查看将要提交的文件
git status
```

**预期输出**:
```
Changes to be committed:
  (use "git rm --cached <file>..." to unstage)
        new file:   .gitignore
        new file:   package.json
        new file:   next.config.mjs
        ...
```

---

### 步骤 4: 创建第一次提交

```powershell
# 提交文件
git commit -m "Initial commit: CineFlow MVP"

# 查看提交历史
git log --oneline
```

**预期输出**:
```
a1b2c3d (HEAD -> main) Initial commit: CineFlow MVP
```

---

### 步骤 5: 连接到 GitHub 远程仓库

```powershell
# 添加远程仓库（替换为你的 GitHub 用户名）
git remote add origin https://github.com/mikeliu30/cine.git

# 验证远程仓库
git remote -v
```

**预期输出**:
```
origin  https://github.com/mikeliu30/cine.git (fetch)
origin  https://github.com/mikeliu30/cine.git (push)
```

---

### 步骤 6: 推送到 GitHub

```powershell
# 推送到 main 分支
git push -u origin main
```

**如果遇到认证提示**:
1. 输入 GitHub 用户名
2. 输入 Personal Access Token（不是密码）

**如何生成 Personal Access Token**:
1. 访问: https://github.com/settings/tokens
2. 点击 "Generate new token (classic)"
3. 勾选 `repo` 权限
4. 点击 "Generate token"
5. 复制 token（只显示一次！）

---

### 步骤 7: 验证上传成功

访问你的 GitHub 仓库:
```
https://github.com/mikeliu30/cine
```

应该能看到所有文件已上传！✅

---

## 🔄 日常更新流程

### 标准工作流程

每次修改代码后，按以下步骤操作：

#### 1. 查看更改

```powershell
# 切换到项目目录
cd D:\cineflow

# 查看哪些文件被修改了
git status
```

**输出示例**:
```
On branch main
Changes not staged for commit:
  modified:   src/app/page.tsx
  modified:   package.json

Untracked files:
  new-file.tsx
```

---

#### 2. 查看具体更改内容

```powershell
# 查看所有文件的更改
git diff

# 查看特定文件的更改
git diff src/app/page.tsx
```

---

#### 3. 添加文件到暂存区

```powershell
# 添加所有更改的文件
git add .

# 或者添加特定文件
git add src/app/page.tsx
git add package.json
```

---

#### 4. 提交更改

```powershell
# 提交（使用有意义的提交信息）
git commit -m "feat: add new feature description"
```

**提交信息规范**:
- `feat:` - 新功能
- `fix:` - 修复 bug
- `docs:` - 文档更新
- `style:` - 代码格式调整
- `refactor:` - 代码重构
- `test:` - 测试相关
- `chore:` - 构建/工具相关

**示例**:
```powershell
git commit -m "feat: add video generation feature"
git commit -m "fix: resolve canvas rendering issue"
git commit -m "docs: update deployment guide"
```

---

#### 5. 推送到 GitHub

```powershell
# 推送到远程仓库
git push origin main

# 或者简写（如果已设置上游分支）
git push
```

**预期输出**:
```
Enumerating objects: 5, done.
Counting objects: 100% (5/5), done.
Delta compression using up to 12 threads
Compressing objects: 100% (3/3), done.
Writing objects: 100% (3/3), 456 bytes | 456.00 KiB/s, done.
Total 3 (delta 2), reused 0 (delta 0)
To https://github.com/mikeliu30/cine.git
   a1b2c3d..e4f5g6h  main -> main
```

---

### 完整的日常更新命令（一键复制）

```powershell
# 1. 查看状态
git status

# 2. 添加所有更改
git add .

# 3. 提交（修改提交信息）
git commit -m "feat: your feature description"

# 4. 推送到 GitHub
git push origin main
```

---

## 📚 常用 Git 命令

### 查看状态和历史

```powershell
# 查看当前状态
git status

# 查看提交历史
git log

# 查看简洁的提交历史
git log --oneline

# 查看最近 5 次提交
git log --oneline -5

# 查看文件更改
git diff

# 查看已暂存的更改
git diff --staged
```

---

### 分支操作

```powershell
# 查看所有分支
git branch

# 查看当前分支
git branch --show-current

# 创建新分支
git branch feature-new

# 切换分支
git checkout feature-new

# 创建并切换到新分支
git checkout -b feature-new

# 合并分支到当前分支
git merge feature-new

# 删除分支
git branch -d feature-new
```

---

### 撤销操作

```powershell
# 撤销工作区的更改（未 add）
git restore <file>

# 撤销暂存区的文件（已 add，未 commit）
git restore --staged <file>

# 撤销最后一次提交（保留更改）
git reset --soft HEAD~1

# 撤销最后一次提交（丢弃更改）
git reset --hard HEAD~1

# 查看所有操作历史
git reflog
```

---

### 远程仓库操作

```powershell
# 查看远程仓库
git remote -v

# 添加远程仓库
git remote add origin <url>

# 修改远程仓库 URL
git remote set-url origin <new-url>

# 拉取远程更新
git pull origin main

# 推送到远程
git push origin main

# 强制推送（谨慎使用！）
git push -f origin main
```

---

## ⚠️ 常见问题

### 问题 1: 推送时提示 "Permission denied"

**原因**: 认证失败

**解决方案**:
```powershell
# 使用 Personal Access Token
# 1. 生成 token: https://github.com/settings/tokens
# 2. 推送时输入 token 作为密码
```

---

### 问题 2: 推送时提示 "Updates were rejected"

**原因**: 远程仓库有新的提交

**解决方案**:
```powershell
# 先拉取远程更新
git pull origin main

# 解决冲突（如果有）
# 然后再推送
git push origin main
```

---

### 问题 3: 不小心提交了敏感信息

**解决方案**:
```powershell
# 1. 从 Git 历史中删除文件
git filter-branch --force --index-filter \
  "git rm --cached --ignore-unmatch <sensitive-file>" \
  --prune-empty --tag-name-filter cat -- --all

# 2. 强制推送
git push -f origin main

# 3. 立即更改敏感信息（如密码、API 密钥）
```

---

### 问题 4: 如何忽略某些文件？

**解决方案**: 编辑 `.gitignore` 文件

```gitignore
# 依赖
node_modules/
.pnp
.pnp.js

# 构建产物
.next/
out/
build/
dist/

# 环境变量
.env
.env.local
.env.*.local

# 日志
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# 操作系统
.DS_Store
Thumbs.db

# IDE
.vscode/
.idea/
*.swp
*.swo

# 密钥文件
*.key
*.pem
*-key.json
```

---

## 🎯 最佳实践

### 1. 提交信息规范

✅ **好的提交信息**:
```
feat: add user authentication
fix: resolve canvas rendering bug
docs: update API documentation
```

❌ **不好的提交信息**:
```
update
fix bug
changes
```

---

### 2. 提交频率

- ✅ **经常提交**: 每完成一个小功能就提交
- ✅ **原子提交**: 每次提交只包含一个逻辑更改
- ❌ **避免**: 一次提交包含多个不相关的更改

---

### 3. 推送前检查

```powershell
# 1. 查看将要推送的内容
git log origin/main..HEAD

# 2. 确保代码可以运行
npm run build

# 3. 运行测试（如果有）
npm test

# 4. 然后推送
git push origin main
```

---

## 📊 完整工作流程图

```
本地修改代码
    ↓
git status (查看更改)
    ↓
git add . (添加到暂存区)
    ↓
git commit -m "message" (提交)
    ↓
git push origin main (推送到 GitHub)
    ↓
GitHub Actions 自动部署
    ↓
部署到 Cloud Run / Firebase
```

---

## 🎉 总结

### 首次上传（一次性）

```powershell
cd D:\cineflow
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/mikeliu30/cine.git
git push -u origin main
```

### 日常更新（每次修改后）

```powershell
cd D:\cineflow
git add .
git commit -m "feat: your description"
git push origin main
```

---

**就这么简单！** 🚀


