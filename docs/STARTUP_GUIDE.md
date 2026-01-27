# 🚀 CineFlow 系统启动指南

## 📋 启动前检查清单

### 1. 环境变量配置
确保 `.env.local` 文件存在并配置正确：

```bash
# 查看配置文件
cat .env.local
```

**必需的配置**：
```env
# Google Cloud (用于 Gemini 3 Pro / Vertex AI)
GOOGLE_CLOUD_PROJECT=fleet-blend-469520-n7
GOOGLE_APPLICATION_CREDENTIALS=./fleet-blend-469520-n7-9cd71165921b.json
VERTEX_AI_LOCATION=us-central1

# Banana Pro API Key (备用)
BANANA_API_KEY=AIzaSyAoUtwjOaBbXEigAuoMMdWHZOUkvx9KZvw

# 火山方舟 (用于即梦 4.5)
ARK_API_KEY=e4df5214-5735-49f2-9de4-fd243ea10384

# WebSocket 服务器
NEXT_PUBLIC_WS_URL=ws://localhost:1234
```

### 2. 认证文件检查
确保 Google Cloud 服务账号密钥文件存在：

```bash
# 检查文件是否存在
ls fleet-blend-469520-n7-9cd71165921b.json
# 或
ls vertex-key.json
```

### 3. 依赖安装
```bash
cd cineflow-mvp
npm install
```

## 🎯 启动步骤

### 方式 1: 完整启动（推荐）

**需要开启 2 个终端窗口**

#### 终端 1: 启动 WebSocket 服务器
```bash
cd cineflow-mvp
node server/websocket.js
```

**预期输出**：
```
WebSocket server running on ws://localhost:1234
```

#### 终端 2: 启动 Next.js 开发服务器
```bash
cd cineflow-mvp
npm run dev
```

**预期输出**：
```
▲ Next.js 14.x.x
- Local:        http://localhost:3000
- Ready in 2.5s
```

### 方式 2: 快速启动（仅前端，无协作功能）

如果不需要多人协作功能，可以只启动前端：

```bash
cd cineflow-mvp
npm run dev
```

**注意**：会显示 "WebSocket 服务器未启动" 警告，但不影响单人使用。

## 🌐 访问应用

启动成功后，打开浏览器访问：

- **主画布页面**: http://localhost:3000/canvas
- **首页**: http://localhost:3000

## 🧪 验证启动成功

### 1. 检查前端状态
打开 http://localhost:3000/canvas，应该看到：
- ✅ 左上角显示 "已连接"（绿色圆点）
- ✅ 画布正常显示
- ✅ 右键菜单可以打开

### 2. 测试图片生成
1. 右键点击画布 → "添加图片节点"
2. 双击图片节点
3. 输入提示词："一只可爱的小猫"
4. 选择模型："🍌 Banana Pro"
5. 点击"生成"

**预期结果**：
- ✅ 节点状态变为"生成中"
- ✅ 控制台显示生成日志
- ✅ 10-30秒后显示生成的图片

### 3. 检查控制台日志
打开浏览器开发者工具（F12），应该看到：

```
[Vertex Gemini] Using enterprise Gemini for image generation
[Vertex Gemini] Model: gemini-3-pro-image-preview
[Vertex Gemini] Location: global (using global for preview model)
```

## 🔧 常见问题排查

### 问题 1: 端口被占用

**错误信息**：
```
Error: listen EADDRINUSE: address already in use :::3000
```

**解决方案**：
```bash
# Windows
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# 或者使用其他端口
npm run dev -- -p 3001
```

### 问题 2: WebSocket 连接失败

**现象**：左上角显示 "连接中..." 或黄色圆点

**解决方案**：
1. 确认 WebSocket 服务器已启动
2. 检查端口 1234 是否被占用
3. 检查 `.env.local` 中的 `NEXT_PUBLIC_WS_URL` 配置

### 问题 3: 404 错误（Gemini 3 Pro）

**错误信息**：
```
404 Not Found: Method 'google.cloud.aiplatform.v1.PredictionService.GenerateContent' not found
```

**解决方案**：
已修复！确保使用最新代码：
- ✅ `gemini-3-pro-image-preview` 模型
- ✅ 使用 `global` 端点
- ✅ 清理缓存：`Remove-Item -Recurse -Force .next`

### 问题 4: 模块未找到错误

**错误信息**：
```
Error: Cannot find module 'D:\workspace\CineFlow\cineflow-mvp\.next\server\pages\_document.js'
```

**解决方案**：
```bash
# 清理构建缓存
Remove-Item -Recurse -Force .next

# 重新启动
npm run dev
```

## 📊 系统架构

```
┌─────────────────────────────────────────────────┐
│  浏览器 (http://localhost:3000)                  │
│  - React Flow 画布                               │
│  - 节点管理                                      │
│  - 生成面板                                      │
└─────────────────┬───────────────────────────────┘
                  │
                  ├─── HTTP ───→ Next.js API Routes
                  │              (图片/视频生成)
                  │                    │
                  │                    ├─→ Vertex AI (Gemini 3 Pro)
                  │                    ├─→ Veo 3.1 Fast
                  │                    └─→ 火山方舟 (即梦 4.5)
                  │
                  └─── WebSocket ───→ WebSocket Server
                                      (多人协作)
```

## 🎯 快速命令参考

```bash
# 完整启动（2个终端）
Terminal 1: node server/websocket.js
Terminal 2: npm run dev

# 清理缓存并重启
Remove-Item -Recurse -Force .next
npm run dev

# 查看端口占用
netstat -ano | findstr :3000
netstat -ano | findstr :1234

# 测试端点配置
node scripts/test-gemini-endpoint.js
```

## 📚 相关文档

- [Gemini 3 Pro 修复说明](./GEMINI_3_PRO_FIX.md)
- [Banana Pro 接口状态](./BANANA_PRO_STATUS.md)
- [Veo 集成指南](./VEO_INTEGRATION.md)

## 🆘 获取帮助

如果遇到问题：
1. 检查控制台日志（浏览器 F12）
2. 检查终端输出
3. 查看相关文档
4. 清理缓存重试

