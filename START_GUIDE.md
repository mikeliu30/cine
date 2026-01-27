# 🚀 CineFlow 启动指南

## ⚡ 快速启动（推荐）

CineFlow 需要启动 **2 个服务**：

### 方法 1: 使用两个终端（推荐）

#### 终端 1 - WebSocket 服务器
```powershell
cd d:\workspace\CineFlow\cineflow-mvp
npm run websocket
```

**预期输出**：
```
🚀 ================================
   WebSocket 服务器已启动
   地址: ws://localhost:1234
🚀 ================================

等待客户端连接...
```

#### 终端 2 - Next.js 开发服务器
```powershell
cd d:\workspace\CineFlow\cineflow-mvp
npm run dev
```

**预期输出**：
```
  ▲ Next.js 14.2.35
  - Local:        http://localhost:3000
  - Network:      http://192.168.x.x:3000

 ✓ Ready in 2.5s
```

---

### 方法 2: 使用启动脚本

```powershell
cd d:\workspace\CineFlow\cineflow-mvp
.\start.ps1
```

然后选择：
1. 先在一个终端选择 `1` 启动 WebSocket
2. 再开另一个终端选择 `2` 启动 Next.js

---

## 📊 服务状态检查

### 检查 WebSocket 服务器
```powershell
# 访问 HTTP 端点
curl http://localhost:1234
```

**预期输出**：`CineFlow WebSocket Server Running`

### 检查 Next.js 服务器
```powershell
# 访问主页
curl http://localhost:3000
```

**预期输出**：HTML 内容

---

## 🌐 访问地址

启动成功后，访问以下地址：

| 服务 | 地址 | 说明 |
|-----|------|------|
| 主页 | http://localhost:3000 | 欢迎页面 |
| 画布 | http://localhost:3000/canvas | 主要工作区 |
| WebSocket | ws://localhost:1234 | 协作同步 |

---

## 🎨 开始使用

1. 打开浏览器访问：http://localhost:3000/canvas
2. 右键点击画布 → 选择节点类型
3. 双击节点进行配置
4. 开始创作！

---

## 🐛 常见问题

### 问题 1: `npx y-websocket` 失败

**错误**：
```
npm error could not determine executable to run
```

**解决方案**：
使用正确的命令：
```powershell
npm run websocket
# 或
node server/websocket.js
```

---

### 问题 2: 端口被占用

**错误**：
```
Error: listen EADDRINUSE: address already in use :::3000
```

**解决方案**：
```powershell
# 查找占用端口的进程
netstat -ano | findstr :3000

# 结束进程（替换 PID）
taskkill /PID <PID> /F
```

---

### 问题 3: WebSocket 连接失败

**现象**：画布无法同步

**检查**：
1. 确认 WebSocket 服务器正在运行
2. 检查控制台是否有连接错误
3. 确认端口 1234 未被占用

**解决方案**：
```powershell
# 重启 WebSocket 服务器
npm run websocket
```

---

### 问题 4: 图片生成失败

**检查**：
1. 确认 `.env.local` 文件存在
2. 确认 `vertex-key.json` 文件存在
3. 查看控制台错误信息

**环境变量**：
```env
GOOGLE_CLOUD_PROJECT=fleet-blend-469520-n7
GOOGLE_APPLICATION_CREDENTIALS=./fleet-blend-469520-n7-9cd71165921b.json
VERTEX_AI_LOCATION=us-central1
ARK_API_KEY=e4df5214-5735-49f2-9de4-fd243ea10384
```

---

## 🔧 开发命令

| 命令 | 说明 |
|-----|------|
| `npm run websocket` | 启动 WebSocket 服务器 |
| `npm run dev` | 启动 Next.js 开发服务器 |
| `npm run build` | 构建生产版本 |
| `npm run start` | 启动生产服务器 |
| `npm run lint` | 代码检查 |

---

## 📚 相关文档

- [API 配置](./COMPLETE_API_DISABLE.md) - API 配置说明
- [API 对比](./API_COMPARISON.md) - Gemini 3 Pro vs 即梦 4.5
- [修复总结](./REPAIR_SUMMARY.md) - 系统修复记录

---

## 💡 提示

### 推荐工作流程

1. **启动服务**（两个终端）
   ```powershell
   # 终端 1
   npm run websocket
   
   # 终端 2
   npm run dev
   ```

2. **访问画布**
   ```
   http://localhost:3000/canvas
   ```

3. **创建节点**
   - 右键 → 添加图片节点
   - 双击节点 → 配置参数
   - 选择 API（Gemini 3 Pro 或即梦 4.5）
   - 输入提示词 → 生成

4. **查看结果**
   - 图片会自动显示在节点中
   - 可以下载或继续编辑

---

## ✅ 启动检查清单

- [ ] WebSocket 服务器运行中（端口 1234）
- [ ] Next.js 服务器运行中（端口 3000）
- [ ] 浏览器可以访问 http://localhost:3000
- [ ] 画布页面正常加载
- [ ] 可以创建节点
- [ ] 图片生成功能正常

---

## 🎉 开始创作！

所有服务启动后，你就可以开始使用 CineFlow 进行创作了！

**推荐首次使用**：
1. 创建一个图片节点
2. 选择 "🍌 Gemini 3 Pro"
3. 输入：`一只可爱的小猫在花园里玩耍，高质量，专业摄影`
4. 点击生成
5. 等待 10-30 秒
6. 查看生成的高质量图片

🚀 **祝你创作愉快！**

