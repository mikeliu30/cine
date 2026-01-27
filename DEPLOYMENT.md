# CineFlow 部署方案 - 图片功能优先版

## 📋 当前状态

### ✅ 已完成功能
- **图片生成** - Gemini 3 Pro 模型完整接入
- **参考图上传** - 支持基于源图片生成
- **基础画幅** - 16:9, 9:16, 1:1 三种比例
- **实时协作** - 多人画布同步
- **卡牌系统** - 节点拖拽、连线、编辑

### 🚧 已禁用功能（开发中）
- 视频生成
- 批次生成（多张）
- Prompt AI 增强
- 运镜控制
- 虚拟摄影机参数
- 高级设置（Seed, Steps, CFG）
- 即梦 4.5 模型
- 4:3 画幅比例

## 🎯 功能开关配置

所有功能开关集中在 `src/config/features.ts` 文件中：

```typescript
export const FEATURES = {
  IMAGE_GENERATION: true,      // ✅ 图片生成
  VIDEO_GENERATION: false,     // 🚧 视频生成
  REFERENCE_IMAGE: true,       // ✅ 参考图
  BATCH_GENERATION: false,     // 🚧 批次生成
  PROMPT_ENHANCEMENT: false,   // 🚧 AI增强
  CAMERA_CONTROL: false,       // 🚧 运镜/摄影机
  ADVANCED_SETTINGS: false,    // 🚧 高级设置
  
  MODELS: {
    IMAGE: {
      'gemini-3-pro': true,    // ✅ 主力模型
      'jimeng': false,         // 🚧 未接入
      'mock': true,            // ✅ 测试用
    },
  },
  
  ASPECT_RATIOS: {
    '16:9': true,
    '9:16': true,
    '1:1': true,
    '4:3': false,              // 🚧 暂不支持
  },
};
```

## 🚀 部署步骤

### 1. 环境准备

```bash
# 安装依赖
npm install

# 配置环境变量
cp .env.example .env.local
```

在 `.env.local` 中配置：
```env
# Gemini API
GEMINI_API_KEY=your_gemini_api_key_here

# WebSocket 服务器（协作功能）
NEXT_PUBLIC_WS_URL=ws://localhost:1234
```

### 2. 启动 WebSocket 服务器（协作功能）

```bash
# 在单独的终端窗口运行
npx y-websocket
```

### 3. 启动应用

```bash
# 开发模式
npm run dev

# 生产构建
npm run build
npm start
```

### 4. 访问应用

- 本地开发：http://localhost:3000
- 进入画布：http://localhost:3000/canvas

## 📝 用户使用流程

1. **进入画布** - 点击首页"进入画布"按钮
2. **创建节点** - 双击画布空白处创建新节点
3. **输入提示词** - 在生成面板中描述想要的图片
4. **选择参数**：
   - 模型：Gemini 3 Pro（推荐）
   - 画幅：16:9 / 9:16 / 1:1
5. **生成图片** - 点击"生成图片"按钮或按 Ctrl+Enter
6. **查看结果** - 图片生成后自动显示在节点卡牌上
7. **继续创作** - 可以基于已生成的图片继续创作

## 🔧 后续开发计划

### Phase 1 - 图片功能增强
- [ ] 接入即梦 4.5 模型
- [ ] 支持批次生成（2/4/6/8张）
- [ ] Prompt AI 增强功能
- [ ] 虚拟摄影机参数
- [ ] 高级设置（Seed, Steps, CFG）

### Phase 2 - 视频功能
- [ ] 接入 Veo 2 视频模型
- [ ] 运镜控制矩阵
- [ ] 视频时长选择
- [ ] 视频预览播放

### Phase 3 - 编辑功能
- [ ] 重绘（Inpaint）
- [ ] 擦除
- [ ] 增强
- [ ] 扩图
- [ ] 抠图

## 🎨 UI 特性

### 当前可见功能
- ✅ 图片生成 Tab
- ✅ 提示词输入框
- ✅ 负面提示词（可选）
- ✅ 风格选择（6种预设）
- ✅ 模型选择（Gemini 3 Pro / Mock）
- ✅ 画幅选择（16:9 / 9:16 / 1:1）
- ✅ 参考图预览

### 已隐藏功能
- ❌ 视频生成 Tab
- ❌ 魔法增强按钮
- ❌ 运镜控制矩阵
- ❌ 虚拟摄影机折叠面板
- ❌ 高级设置折叠面板
- ❌ 即梦 4.5 模型选项
- ❌ 4:3 画幅选项

## 🔐 安全注意事项

1. **API Key 保护**
   - 不要将 `.env.local` 提交到 Git
   - 使用环境变量管理敏感信息
   - 生产环境使用服务器端 API 路由

2. **WebSocket 安全**
   - 生产环境使用 WSS（加密连接）
   - 配置 CORS 白名单
   - 实现用户认证机制

3. **资源限制**
   - 限制单次生成数量
   - 实现请求频率限制
   - 监控 API 使用量

## 📊 监控与日志

### 关键指标
- 图片生成成功率
- 平均生成时间
- API 调用次数
- 错误率

### 日志位置
- 浏览器控制台：前端错误
- 服务器日志：API 调用记录
- WebSocket 日志：协作同步状态

## 🆘 常见问题

### Q: 图片生成失败怎么办？
A: 检查以下几点：
1. Gemini API Key 是否正确配置
2. 网络连接是否正常
3. 查看浏览器控制台错误信息
4. 尝试使用 Mock 模型测试

### Q: 协作功能不工作？
A: 确保：
1. WebSocket 服务器已启动（npx y-websocket）
2. 端口 1234 未被占用
3. 防火墙允许 WebSocket 连接

### Q: 如何启用更多功能？
A: 编辑 `src/config/features.ts`，将对应功能开关改为 `true`

## 📞 技术支持

- 项目文档：README.md
- 功能配置：src/config/features.ts
- API 文档：src/app/api/*/route.ts

---

**版本**: v1.0.0-image-only  
**更新时间**: 2024  
**状态**: ✅ 生产就绪（图片功能）

