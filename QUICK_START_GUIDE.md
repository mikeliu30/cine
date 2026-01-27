# 🚀 CineFlow 快速启动指南

> 5 分钟快速上手 CineFlow 图片生成功能

## 📋 前置要求

- Node.js 18+ 
- npm 或 yarn
- Gemini API Key（[获取地址](https://aistudio.google.com/app/apikey)）

## ⚡ 快速启动（3 步）

### 1️⃣ 安装依赖
```bash
cd cineflow-mvp
npm install
```

### 2️⃣ 配置环境变量
```bash
# 复制环境变量模板
cp .env.example .env.local

# 编辑 .env.local，填入你的 Gemini API Key
# GEMINI_API_KEY=你的密钥
```

### 3️⃣ 启动服务
```bash
# 终端 1: 启动 WebSocket 服务器（协作功能）
npx y-websocket

# 终端 2: 启动应用
npm run dev
```

访问 http://localhost:3000 🎉

## 🎯 使用流程

### 1. 进入画布
点击首页的 **"进入画布"** 按钮

### 2. 创建节点
**双击** 画布空白处创建新节点

### 3. 打开生成面板
点击节点上的 **"生成"** 按钮

### 4. 输入提示词
```
示例：
- A futuristic city at sunset, cyberpunk style
- 一只可爱的猫咪，水彩画风格
- Mountain landscape with aurora, cinematic lighting
```

### 5. 选择参数
- **模型**: Gemini 3 Pro（推荐）
- **画幅**: 16:9（横屏）/ 9:16（竖屏）/ 1:1（方形）
- **风格**: 电影感 / 动漫 / 写实 / 艺术 / 奇幻

### 6. 生成图片
- 点击 **"生成图片"** 按钮
- 或按 **Ctrl + Enter** 快捷键

### 7. 查看结果
图片生成后会自动显示在节点卡牌上

### 8. 继续创作
- 可以基于已生成的图片继续创作
- 支持多人实时协作

## 🎨 功能特性

### ✅ 当前可用
- 🖼️ **AI 图片生成** - Gemini 3 Pro 模型
- 📎 **参考图上传** - 基于源图片生成
- 🎨 **风格预设** - 6 种预设风格
- 📐 **画幅选择** - 3 种画幅比例
- 👥 **多人协作** - 实时同步
- 🎴 **卡牌系统** - 节点管理

### 🚧 开发中
- 🎬 视频生成
- 📦 批次生成
- 🪄 AI Prompt 增强
- 🎥 运镜控制
- 📷 虚拟摄影机
- ⚙️ 高级设置

## 🔍 功能检查

运行检查脚本查看当前功能状态：
```bash
npm run check-features
```

输出示例：
```
✅ 图片生成            已启用
❌ 视频生成            已禁用
✅ Gemini 3 Pro    可用
✅ 16:9            支持
```

## 🛠️ 常用命令

```bash
# 开发模式
npm run dev

# 构建生产版本
npm run build

# 启动生产服务器
npm start

# 代码检查
npm run lint

# WebSocket 服务器
npm run websocket

# 功能状态检查
npm run check-features
```

## 💡 使用技巧

### 提示词技巧
1. **具体描述** - 越详细越好
2. **添加风格** - 如 "cinematic", "anime", "realistic"
3. **光照描述** - 如 "soft lighting", "dramatic shadows"
4. **视角描述** - 如 "wide angle", "close-up", "aerial view"

### 快捷键
- `Ctrl + Enter` - 生成图片
- `Esc` - 关闭面板
- `双击画布` - 创建节点
- `Delete` - 删除选中节点

### 协作功能
- 多人可以同时编辑同一个画布
- 实时看到其他人的操作
- 自动同步所有更改

## ❓ 常见问题

### Q: 图片生成失败？
**A**: 检查以下几点：
1. Gemini API Key 是否正确配置
2. 网络连接是否正常
3. 查看浏览器控制台错误信息
4. 尝试使用 Mock 模型测试

### Q: 协作功能不工作？
**A**: 确保：
1. WebSocket 服务器已启动（`npx y-websocket`）
2. 端口 1234 未被占用
3. 防火墙允许 WebSocket 连接

### Q: 如何获取 Gemini API Key？
**A**: 
1. 访问 https://aistudio.google.com/app/apikey
2. 登录 Google 账号
3. 创建新的 API Key
4. 复制到 `.env.local` 文件

### Q: 可以离线使用吗？
**A**: 
- 图片生成需要联网（调用 Gemini API）
- 协作功能需要 WebSocket 服务器
- 单人使用可以不启动 WebSocket 服务器

## 📚 更多文档

- [完整部署文档](./DEPLOYMENT.md)
- [部署检查清单](./DEPLOYMENT_CHECKLIST.md)
- [功能开关说明](./FEATURE_TOGGLE_SUMMARY.md)
- [项目 README](./README.md)

## 🆘 获取帮助

遇到问题？
1. 查看浏览器控制台错误
2. 运行 `npm run check-features` 检查配置
3. 查看相关文档
4. 提交 Issue

## 🎉 开始创作

现在你已经准备好了！

1. 启动服务
2. 进入画布
3. 创建节点
4. 输入提示词
5. 生成你的第一张 AI 图片

祝你创作愉快！✨

---

**版本**: v1.0.0-image-only  
**更新**: 2024

