# 🎨 AI 图片/视频生成功能实现说明

## 📋 实现概述

本次更新在项目基础上完整实现了 **AI 图片生成** 和 **AI 视频生成** 功能，支持多种主流 AI 模型。

---

## ✅ 已实现的功能

### 1️⃣ **图片生成模型**

| 模型 | 状态 | 特点 | API 端点 |
|------|------|------|----------|
| 🍌 **Gemini 3 Pro** | ✅ 已实现 | Google 最新模型，高质量 | `/api/generate/image` |
| 🎨 **DALL-E 3** | ✅ 新增 | OpenAI 高质量图片生成 | `/api/generate/dalle` |
| 🖼️ **Stable Diffusion XL** | ✅ 新增 | 开源高质量模型 | `/api/generate/sdxl` |
| 🧪 **Mock** | ✅ 测试模式 | 无需 API，快速测试 | - |

### 2️⃣ **视频生成模型**

| 模型 | 状态 | 特点 | API 端点 |
|------|------|------|----------|
| 🎬 **Veo 2** | ✅ 新增 | Google 最新视频生成 | `/api/generate/veo` |
| 🎥 **Runway Gen-3** | ✅ 新增 | 专业视频生成 | `/api/generate/runway` |
| 🧪 **Mock Video** | ✅ 测试模式 | 无需 API，快速测试 | - |

### 3️⃣ **核心功能**

- ✅ **同步生成** - 图片模型（Gemini, DALL-E, SDXL）
- ✅ **异步生成 + 轮询** - 视频模型（Veo 2, Runway）
- ✅ **进度显示** - 实时显示生成进度
- ✅ **参考图上传** - 支持 Image-to-Image 和 Image-to-Video
- ✅ **中文翻译** - 自动翻译中文提示词
- ✅ **错误降级** - API 失败时自动降级到 Mock
- ✅ **适配器模式** - 统一接口，易于扩展
- ✅ **画幅支持** - 16:9 / 9:16 / 1:1 / 4:3
- ✅ **运镜控制** - 视频生成支持运镜指令
- ✅ **Prompt 增强** - 自动优化提示词

---

## 🏗️ 架构设计

### 文件结构

```
src/
├── config/
│   └── features.ts                    # ✅ 更新：启用视频生成和新模型
│
├── lib/
│   ├── adapters/
│   │   ├── index.ts                   # ✅ 更新：注册新适配器
│   │   ├── dalle-adapter.ts           # 🆕 DALL-E 3 适配器
│   │   ├── stable-diffusion-adapter.ts # 🆕 SDXL 适配器
│   │   ├── veo2-adapter.ts            # 🆕 Veo 2 适配器
│   │   └── runway-adapter.ts          # 🆕 Runway 适配器
│   │
│   └── store/
│       └── generation-store.ts        # ✅ 更新：支持新模型路由
│
├── app/api/generate/
│   ├── dalle/
│   │   └── route.ts                   # 🆕 DALL-E 3 API
│   ├── sdxl/
│   │   └── route.ts                   # 🆕 SDXL API
│   ├── veo/
│   │   ├── route.ts                   # 🆕 Veo 2 API
│   │   └── status/
│   │       └── route.ts               # 🆕 Veo 2 状态查询
│   └── runway/
│       └── route.ts                   # 🆕 Runway API
│
└── types/
    └── generation.ts                  # ✅ 更新：新增模型类型
```

---

## 🔧 配置说明

### 1. 环境变量配置

在 `.env.local` 中添加以下配置：

```env
# ============================================
# 图片生成 API
# ============================================

# Google Vertex AI (Gemini 3 Pro)
GOOGLE_CLOUD_PROJECT=your-project-id
GOOGLE_APPLICATION_CREDENTIALS=./vertex-key.json
VERTEX_AI_LOCATION=us-central1

# OpenAI (DALL-E 3)
OPENAI_API_KEY=sk-...

# Replicate (Stable Diffusion XL)
REPLICATE_API_KEY=r8_...

# ============================================
# 视频生成 API
# ============================================

# Runway (Gen-3)
RUNWAY_API_KEY=...

# 豆包 API (中文翻译)
ARK_API_KEY=...

# ============================================
# 协作服务
# ============================================

NEXT_PUBLIC_WS_URL=ws://localhost:1234
```

### 2. 功能开关

在 `src/config/features.ts` 中已启用：

```typescript
export const FEATURES = {
  IMAGE_GENERATION: true,  // ✅ 图片生成
  VIDEO_GENERATION: true,  // ✅ 视频生成（新启用）
  PROMPT_ENHANCEMENT: true, // ✅ Prompt 增强（新启用）
  CAMERA_CONTROL: true,    // ✅ 运镜控制（新启用）
  
  MODELS: {
    IMAGE: {
      'gemini-3-pro': true,      // ✅ Gemini
      'dall-e-3': true,          // 🆕 DALL-E 3
      'stable-diffusion': true,  // 🆕 SDXL
      'mock': true,              // ✅ 测试
    },
    VIDEO: {
      'veo-2': true,             // 🆕 Veo 2
      'runway-gen3': true,       // 🆕 Runway
      'mock-video': true,        // ✅ 测试
    },
  },
  
  ASPECT_RATIOS: {
    '16:9': true,
    '9:16': true,
    '1:1': true,
    '4:3': true,  // ✅ 新启用
  },
};
```

---

## 🚀 使用方法

### 图片生成

1. **打开画布** - 访问 http://localhost:3000/canvas
2. **创建节点** - 双击画布空白处
3. **选择模型** - 在生成面板选择图片模型：
   - 🍌 Gemini 3 Pro（推荐）
   - 🎨 DALL-E 3（高质量）
   - 🖼️ Stable Diffusion XL（开源）
4. **输入提示词** - 描述想要生成的图片
5. **选择画幅** - 16:9 / 9:16 / 1:1 / 4:3
6. **点击生成** - 等待 10-30 秒

### 视频生成

1. **创建视频节点** - 右键菜单 → 添加视频节点
2. **选择模型** - 在生成面板选择视频模型：
   - 🎬 Veo 2（Google，高质量）
   - 🎥 Runway Gen-3（专业）
3. **输入提示词** - 描述视频内容和动作
4. **设置时长** - 3-10 秒
5. **选择运镜** - 推近、拉远、跟随等
6. **点击生成** - 等待 1-3 分钟（异步生成）

### Image-to-Video（图片转视频）

1. **从图片节点拖拽** - 从已有图片节点的锚点拖出
2. **选择生成视频** - 在弹出菜单选择"生成视频"
3. **自动填充参考图** - 系统自动使用源图片
4. **描述动作** - 输入想要的动作（如"running forward"）
5. **点击生成** - 等待视频生成完成

---

## 📊 API 调用流程

### 同步生成（图片）

```
用户输入
  ↓
前端 (GenerationPanel)
  ↓
Zustand Store (startGeneration)
  ↓
API Route (/api/generate/dalle)
  ↓
OpenAI API
  ↓
返回图片 URL
  ↓
更新节点显示
```

### 异步生成（视频）

```
用户输入
  ↓
前端 (GenerationPanel)
  ↓
Zustand Store (startGeneration)
  ↓
API Route (/api/generate/veo)
  ↓
Vertex AI (启动异步任务)
  ↓
返回 operationName
  ↓
前端开始轮询 (每 2 秒)
  ↓
API Route (/api/generate/veo/status)
  ↓
检查任务状态
  ↓
完成后返回视频 URL
  ↓
更新节点显示
```

---

## 🎯 测试方法

### 1. 测试图片生成

```bash
# 启动开发服务器
npm run dev

# 访问画布
http://localhost:3000/canvas

# 测试步骤：
1. 双击画布创建节点
2. 选择 "🧪 Mock (测试)" 模型
3. 输入任意提示词
4. 点击生成
5. 应该看到随机图片（无需 API）
```

### 2. 测试视频生成

```bash
# 测试步骤：
1. 右键菜单 → 添加视频节点
2. 选择 "🧪 Mock (测试)" 模型
3. 输入任意提示词
4. 点击生成
5. 应该看到测试视频（无需 API）
```

### 3. 测试真实 API

```bash
# 配置 API Key 后：
1. 选择真实模型（如 DALL-E 3）
2. 输入提示词："A cute cat in the garden"
3. 点击生成
4. 等待 10-30 秒
5. 应该看到 AI 生成的图片
```

---

## 🔍 功能检查

运行功能检查脚本：

```bash
npm run check-features
```

预期输出：

```
✅ 图片生成            已启用
✅ 视频生成            已启用
✅ 参考图上传           已启用
✅ Prompt增强        已启用
✅ 运镜控制            已启用

✅ Gemini 3 Pro    可用
✅ DALL-E 3        可用
✅ Stable Diffusion 可用
✅ Veo 2           可用
✅ Runway Gen-3    可用

✅ 16:9            支持
✅ 9:16            支持
✅ 1:1             支持
✅ 4:3             支持
```

---

## 🐛 故障排查

### 问题 1：API 调用失败

**症状：** 生成失败，显示错误信息

**解决方案：**
1. 检查 `.env.local` 中的 API Key 是否正确
2. 检查 API 配额是否用完
3. 查看浏览器控制台（F12）的错误信息
4. 系统会自动降级到 Mock 模式

### 问题 2：视频生成超时

**症状：** 视频生成一直显示"处理中"

**解决方案：**
1. 视频生成通常需要 1-3 分钟，请耐心等待
2. 检查网络连接
3. 查看浏览器控制台的轮询日志
4. 如果超过 5 分钟，刷新页面重试

### 问题 3：图片/视频不显示

**症状：** 生成成功但节点不显示内容

**解决方案：**
1. 检查浏览器控制台是否有 CORS 错误
2. 检查图片/视频 URL 是否有效
3. 尝试右键 → 在新标签页打开图片
4. 清除浏览器缓存

---

## 📈 性能优化建议

### 1. 图片优化
- 使用 WebP 格式
- 压缩 base64 数据
- 上传到 Cloud Storage

### 2. 视频优化
- 使用流式传输
- 分段加载
- 预览缩略图

### 3. API 优化
- 实现请求缓存
- 使用速率限制
- 批量处理请求

---

## 🔮 未来扩展

### 计划中的功能

1. **更多模型**
   - Midjourney
   - 可灵 1.6
   - 海螺视频

2. **高级功能**
   - 批次生成
   - ControlNet
   - LoRA 模型
   - 视频编辑

3. **优化功能**
   - 生成历史
   - 收藏夹
   - 分享功能
   - 导出工作流

---

## 📚 相关文档

- [功能开关配置](./src/config/features.ts)
- [适配器实现](./src/lib/adapters/)
- [API 路由](./src/app/api/generate/)
- [类型定义](./src/types/generation.ts)

---

## ✨ 总结

本次实现完成了：

1. ✅ **3 个新图片模型** - DALL-E 3, SDXL, Gemini 3 Pro
2. ✅ **2 个新视频模型** - Veo 2, Runway Gen-3
3. ✅ **6 个新 API 端点** - 完整的后端支持
4. ✅ **4 个新适配器** - 统一的接口设计
5. ✅ **异步轮询机制** - 支持长时间生成
6. ✅ **错误降级策略** - 保证系统稳定性
7. ✅ **完整的类型定义** - TypeScript 支持

现在你可以：
- 🎨 使用多种 AI 模型生成图片
- 🎬 生成高质量 AI 视频
- 🖼️ 图片转视频（I2V）
- 🎯 实时查看生成进度
- 🔄 自动错误处理和降级

**开始创作吧！** 🚀

