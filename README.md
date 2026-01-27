# 🎬 CineFlow SSR Lab

> 多人实时协作画布 · AIGC 卡牌生成系统

## 📌 当前版本：v2.0.0-full-ai

### ✅ 已上线功能

#### 🖼️ AI 图片生成
- **多模型支持**
  - 🍌 Gemini 3 Pro - Google 最新模型
  - 🎨 DALL-E 3 - OpenAI 高质量生成
  - 🖼️ Stable Diffusion XL - 开源高质量模型
  - 🧪 Mock 测试模式
- **📎 参考图上传** - 支持基于源图片生成
- **🎨 风格预设** - 6 种预设风格（电影感、动漫、写实等）
- **📐 画幅选择** - 16:9 / 9:16 / 1:1 / 4:3 四种比例

#### 🎬 AI 视频生成
- **多模型支持**
  - 🎬 Veo 2 - Google 最新视频生成
  - 🎥 Runway Gen-3 - 专业视频生成
  - 🧪 Mock 测试模式
- **📹 Image-to-Video** - 图片转视频
- **🎥 运镜控制** - 推拉摇移等运镜指令
- **⏱️ 时长控制** - 3-10 秒可调

#### 🎴 画布系统
- **👥 多人协作** - 基于 Yjs 的实时同步
- **🎴 卡牌系统** - 节点拖拽、连线、编辑
- **🔗 工作流管理** - 节点连接和父子关系
- **⚡ 实时进度** - 生成进度实时显示

### 🚧 开发中功能
- 📦 批次生成（多张）
- 🎥 虚拟摄影机参数
- ⚙️ 高级设置（Seed, Steps, CFG）
- 🎨 更多 AI 模型（Midjourney, 可灵等）

---

## 🚀 快速开始

### 1. 安装依赖
```bash
npm install
```

### 2. 配置环境变量
```bash
cp .env.example .env.local
```

编辑 `.env.local`：
```env
# Google Vertex AI (Gemini 3 Pro, Veo 2)
GOOGLE_CLOUD_PROJECT=your-project-id
GOOGLE_APPLICATION_CREDENTIALS=./vertex-key.json
VERTEX_AI_LOCATION=us-central1

# OpenAI (DALL-E 3)
OPENAI_API_KEY=sk-...

# Replicate (Stable Diffusion XL)
REPLICATE_API_KEY=r8_...

# Runway (Gen-3)
RUNWAY_API_KEY=...

# WebSocket 服务器
NEXT_PUBLIC_WS_URL=ws://localhost:1234
```

### 3. 启动 WebSocket 服务器
```bash
# 在单独的终端窗口运行
npx y-websocket
```

### 4. 启动开发服务器
```bash
npm run dev
```

访问 http://localhost:3000

---

## 📦 项目结构

```
cineflow-mvp/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── api/               # API 路由
│   │   │   ├── generate-image/  # 图片生成 API
│   │   │   └── enhance-prompt/  # Prompt 增强 API
│   │   ├── canvas/            # 画布页面
│   │   └── page.tsx           # 首页
│   ├── components/            # React 组件
│   │   ├── canvas/           # 画布相关组件
│   │   ├── nodes/            # 节点组件
│   │   └── panels/           # 面板组件
│   ├── config/               # 配置文件
│   │   └── features.ts       # 🔥 功能开关配置
│   ├── lib/                  # 工具库
│   │   ├── adapters/        # 模型适配器
│   │   ├── collaboration/   # 协作功能
│   │   └── store/           # 状态管理
│   └── types/               # TypeScript 类型
├── scripts/                  # 脚本工具
│   └── check-features.js    # 功能检查脚本
├── DEPLOYMENT.md            # 部署文档
└── DEPLOYMENT_CHECKLIST.md # 部署清单
```

---

## 🔧 功能开关

所有功能开关集中在 `src/config/features.ts`：

```typescript
export const FEATURES = {
  IMAGE_GENERATION: true,      // ✅ 图片生成
  VIDEO_GENERATION: false,     // 🚧 视频生成
  PROMPT_ENHANCEMENT: false,   // 🚧 AI增强
  CAMERA_CONTROL: false,       // 🚧 运镜控制
  ADVANCED_SETTINGS: false,    // 🚧 高级设置
  // ...
};
```

### 检查当前功能状态
```bash
npm run check-features
```

---

## 🎯 使用流程

### 图片生成
1. **进入画布** - 点击首页"进入画布"按钮
2. **创建节点** - 双击画布空白处
3. **输入提示词** - 描述想要生成的图片
4. **选择模型** - Gemini 3 Pro / DALL-E 3 / Stable Diffusion XL
5. **选择参数** - 画幅、风格
6. **生成图片** - 点击生成或按 Ctrl+Enter
7. **继续创作** - 基于生成的图片继续创作

### 视频生成
1. **创建视频节点** - 右键菜单 → 添加视频节点
2. **输入提示词** - 描述视频内容和动作
3. **选择模型** - Veo 2 / Runway Gen-3
4. **设置参数** - 时长、运镜方向
5. **生成视频** - 点击生成，等待 1-3 分钟
6. **查看结果** - 视频生成后自动显示

### Image-to-Video（图片转视频）
1. **从图片节点拖拽** - 从已有图片节点的锚点拖出
2. **选择生成视频** - 在弹出菜单选择"生成视频"
3. **描述动作** - 输入想要的动作（如"running forward"）
4. **点击生成** - 等待视频生成完成

---

## 📚 技术栈

- **框架**: Next.js 14 (App Router)
- **UI**: React 18 + Tailwind CSS + Framer Motion
- **画布**: ReactFlow
- **协作**: Yjs + y-websocket
- **状态**: Zustand
- **AI**: Google Gemini 3 Pro
- **语言**: TypeScript

---

## 🔐 环境变量

| 变量名 | 说明 | 必需 |
|--------|------|------|
| `GOOGLE_CLOUD_PROJECT` | Google Cloud 项目 ID | ✅ (Gemini/Veo) |
| `GOOGLE_APPLICATION_CREDENTIALS` | GCP 服务账号密钥文件路径 | ✅ (Gemini/Veo) |
| `OPENAI_API_KEY` | OpenAI API 密钥 | ⚪ (DALL-E 3) |
| `REPLICATE_API_KEY` | Replicate API 密钥 | ⚪ (SDXL) |
| `RUNWAY_API_KEY` | Runway API 密钥 | ⚪ (Runway) |
| `ARK_API_KEY` | 豆包 API 密钥（中文翻译） | ⚪ |
| `NEXT_PUBLIC_WS_URL` | WebSocket 服务器地址 | ✅ |

**注意：**
- ✅ 必需：核心功能需要
- ⚪ 可选：对应模型需要，未配置时自动降级到 Mock

---

## 📖 文档

- [部署文档](./DEPLOYMENT.md) - 详细的部署指南
- [部署清单](./DEPLOYMENT_CHECKLIST.md) - 部署前检查清单
- [功能配置](./src/config/features.ts) - 功能开关配置

---

## 🛠️ 开发命令

```bash
# 开发
npm run dev

# 构建
npm run build

# 启动生产服务器
npm start

# 代码检查
npm run lint

# WebSocket 服务器
npm run websocket

# 功能检查
npm run check-features
```

---

## 🚀 部署

### Vercel（推荐）
1. 推送代码到 GitHub
2. 在 Vercel 导入项目
3. 配置环境变量
4. 自动部署

详见 [DEPLOYMENT.md](./DEPLOYMENT.md)

---

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

---

## 📄 许可证

MIT

---

**版本**: v2.0.0-full-ai
**状态**: ✅ 生产就绪（图片+视频功能）
**更新**: 2024

---

## 🆕 v2.0.0 更新内容

### 新增功能
- ✅ **DALL-E 3 图片生成** - OpenAI 高质量模型
- ✅ **Stable Diffusion XL** - 开源高质量模型
- ✅ **Veo 2 视频生成** - Google 最新视频模型
- ✅ **Runway Gen-3** - 专业视频生成
- ✅ **异步生成 + 轮询** - 支持长时间生成任务
- ✅ **Image-to-Video** - 图片转视频功能
- ✅ **运镜控制** - 视频生成运镜指令
- ✅ **4:3 画幅** - 新增传统画幅支持

### 架构优化
- ✅ **适配器模式** - 统一多模型接口
- ✅ **错误降级** - API 失败自动降级到 Mock
- ✅ **进度显示** - 实时显示生成进度
- ✅ **类型安全** - 完整的 TypeScript 类型定义

### 文档更新
- ✅ [AI 生成实现说明](./AI_GENERATION_IMPLEMENTATION.md)
- ✅ [功能开关配置](./src/config/features.ts)
- ✅ [适配器文档](./src/lib/adapters/)

---

## 📞 支持

如有问题，请查看：
- [实现文档](./AI_GENERATION_IMPLEMENTATION.md)
- [部署文档](./DEPLOYMENT.md)
- [快速开始](./QUICK_START.md)
