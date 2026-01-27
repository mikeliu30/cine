# 🚀 快速启动指南

## 当前系统启动方法

### 方法 1: 使用 PowerShell 脚本（推荐）

```powershell
# 1. 打开 PowerShell
# 2. 进入项目目录
cd d:\workspace\CineFlow\cineflow-mvp

# 3. 运行启动脚本
.\start.ps1
```

### 方法 2: 手动启动

```powershell
# 1. 进入项目目录
cd d:\workspace\CineFlow\cineflow-mvp

# 2. 清理缓存（如果遇到问题）
Remove-Item -Recurse -Force .next

# 3. 启动开发服务器
npm run dev
```

### 方法 3: 完整启动（包含协作功能）

**需要 2 个终端窗口**

#### 终端 1: WebSocket 服务器
```powershell
cd d:\workspace\CineFlow\cineflow-mvp
node server/websocket.js
```

#### 终端 2: Next.js 服务器
```powershell
cd d:\workspace\CineFlow\cineflow-mvp
npm run dev
```

## 📌 访问地址

启动成功后，打开浏览器访问：

- **画布页面**: http://localhost:3000/canvas
- **首页**: http://localhost:3000

## ✅ 验证启动成功

### 1. 检查终端输出

应该看到类似输出：
```
▲ Next.js 14.x.x
- Local:        http://localhost:3000
- Ready in 2.5s
```

### 2. 测试 Banana Pro 接口

1. 打开 http://localhost:3000/canvas
2. 右键点击画布 → "添加图片节点"
3. 双击图片节点
4. 输入提示词："一只可爱的小猫在花园里玩耍"
5. 选择模型："🍌 Banana Pro"
6. 点击"生成"

**预期结果**：
- ✅ 节点状态变为"生成中"
- ✅ 浏览器控制台（F12）显示：
  ```
  [Vertex Gemini] Model: gemini-3-pro-image-preview
  [Vertex Gemini] Location: global (using global for preview model)
  ```
- ✅ 10-30秒后显示生成的图片

## 🔧 常见问题

### 问题 1: 端口被占用

```powershell
# 查找占用端口的进程
netstat -ano | findstr :3000

# 结束进程（替换 <PID> 为实际进程 ID）
taskkill /PID <PID> /F
```

### 问题 2: 模块未找到错误

```powershell
# 清理缓存
Remove-Item -Recurse -Force .next

# 重新安装依赖
npm install

# 重新启动
npm run dev
```

### 问题 3: 404 错误（Gemini 3 Pro）

✅ 已修复！确保使用最新代码。

如果仍有问题：
```powershell
# 清理缓存
Remove-Item -Recurse -Force .next

# 重新启动
npm run dev
```

## 📊 当前配置状态

### ✅ 已配置的功能

| 功能 | 状态 | 说明 |
|-----|------|------|
| 🍌 Banana Pro | ✅ 已修复 | 使用 gemini-3-pro-image-preview |
| 🎨 Imagen 3 | ✅ 正常 | Vertex AI Imagen 3 |
| ✨ 即梦 4.5 | ✅ 正常 | 火山方舟 API |
| 🎬 Veo 3.1 Fast | ✅ 正常 | 视频生成 |
| 🔄 多人协作 | ⚠️ 可选 | 需要启动 WebSocket 服务器 |

### 🔑 环境变量

确保 `.env.local` 包含：
```env
GOOGLE_CLOUD_PROJECT=fleet-blend-469520-n7
GOOGLE_APPLICATION_CREDENTIALS=./fleet-blend-469520-n7-9cd71165921b.json
VERTEX_AI_LOCATION=us-central1
BANANA_API_KEY=AIzaSyAoUtwjOaBbXEigAuoMMdWHZOUkvx9KZvw
ARK_API_KEY=e4df5214-5735-49f2-9de4-fd243ea10384
```

## 🎯 下一步

1. ✅ 启动系统
2. ✅ 测试 Banana Pro 图片生成
3. ✅ 验证 404 错误已修复
4. 🎨 开始创作！

## 📚 相关文档

- [完整启动指南](./STARTUP_GUIDE.md)
- [Banana Pro 接口状态](./BANANA_PRO_STATUS.md)
- [Gemini 3 Pro 修复说明](./GEMINI_3_PRO_FIX.md)

