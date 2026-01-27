# 🚀 CineFlow 部署清单

## ✅ 部署前检查

### 1. 功能验证
- [ ] 运行功能检查：`npm run check-features`
- [ ] 确认图片生成功能已启用
- [ ] 确认不需要的功能已禁用
- [ ] 测试 Gemini 3 Pro 模型可用

### 2. 环境配置
- [ ] 复制 `.env.example` 到 `.env.local`
- [ ] 配置 `GEMINI_API_KEY`
- [ ] 配置 `NEXT_PUBLIC_WS_URL`
- [ ] 验证环境变量加载正常

### 3. 依赖安装
```bash
npm install
```

### 4. 构建测试
```bash
npm run build
```

### 5. 本地测试
```bash
# 终端 1: 启动 WebSocket 服务器
npx y-websocket

# 终端 2: 启动应用
npm run dev
```

访问 http://localhost:3000 测试以下功能：
- [ ] 首页显示正常
- [ ] 进入画布页面
- [ ] 创建节点
- [ ] 打开生成面板
- [ ] 只显示图片生成 Tab（视频 Tab 已隐藏）
- [ ] 模型选择只有 Gemini 3 Pro 和 Mock
- [ ] 画幅选择只有 16:9, 9:16, 1:1
- [ ] 没有魔法增强按钮
- [ ] 没有运镜控制
- [ ] 没有虚拟摄影机
- [ ] 没有高级设置
- [ ] 生成图片功能正常

## 📦 生产部署

### Vercel 部署（推荐）

1. **推送代码到 GitHub**
```bash
git add .
git commit -m "feat: 图片生成功能上线版本"
git push origin main
```

2. **在 Vercel 导入项目**
   - 访问 https://vercel.com
   - 点击 "Import Project"
   - 选择你的 GitHub 仓库

3. **配置环境变量**
   在 Vercel 项目设置中添加：
   - `GEMINI_API_KEY`: 你的 Gemini API Key
   - `NEXT_PUBLIC_WS_URL`: WebSocket 服务器地址

4. **部署 WebSocket 服务器**
   
   选项 A: 使用 Railway
   ```bash
   # 在 server 目录创建 Dockerfile
   # 部署到 Railway
   ```
   
   选项 B: 使用独立服务器
   ```bash
   # SSH 到服务器
   npm install -g y-websocket
   y-websocket --port 1234
   ```

5. **验证部署**
   - [ ] 访问生产环境 URL
   - [ ] 测试图片生成功能
   - [ ] 测试多人协作功能
   - [ ] 检查控制台无错误

### Docker 部署

```bash
# 构建镜像
docker build -t cineflow-mvp .

# 运行容器
docker run -p 3000:3000 \
  -e GEMINI_API_KEY=your_key \
  -e NEXT_PUBLIC_WS_URL=ws://your-ws-server:1234 \
  cineflow-mvp
```

## 🔧 部署后配置

### 1. 监控设置
- [ ] 配置错误追踪（Sentry）
- [ ] 配置性能监控
- [ ] 配置日志收集

### 2. 安全加固
- [ ] 启用 HTTPS
- [ ] 配置 CORS
- [ ] 实现 API 限流
- [ ] 添加用户认证（可选）

### 3. 性能优化
- [ ] 启用 CDN
- [ ] 配置图片缓存
- [ ] 优化首屏加载

## 📝 上线公告模板

```markdown
🎉 CineFlow v1.0 正式上线！

✨ 当前功能：
- 🖼️ AI 图片生成（Gemini 3 Pro）
- 📎 参考图上传
- 🎨 多种风格预设
- 📐 三种画幅比例（16:9 / 9:16 / 1:1）
- 👥 多人实时协作
- 🎴 卡牌式节点管理

🚧 即将推出：
- 🎬 视频生成
- 📦 批次生成
- 🪄 AI Prompt 增强
- 🎥 运镜控制
- 📷 虚拟摄影机

欢迎体验：[你的部署地址]
```

## 🆘 回滚计划

如果部署出现问题：

1. **Vercel 回滚**
   - 在 Vercel Dashboard 选择之前的部署
   - 点击 "Promote to Production"

2. **代码回滚**
```bash
git revert HEAD
git push origin main
```

3. **紧急修复**
   - 临时禁用所有功能
   - 显示维护页面
   - 修复后重新部署

## 📊 成功指标

部署成功的标准：
- [ ] 首页加载时间 < 2s
- [ ] 图片生成成功率 > 95%
- [ ] 协作同步延迟 < 100ms
- [ ] 无严重错误日志
- [ ] 用户可以正常使用核心功能

## 🎯 下一步

部署完成后：
1. 收集用户反馈
2. 监控性能指标
3. 修复发现的 Bug
4. 开发下一阶段功能
5. 准备下次迭代

---

**检查完成时间**: ___________  
**部署负责人**: ___________  
**部署状态**: [ ] 成功 [ ] 失败 [ ] 回滚

