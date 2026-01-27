# 🎯 Tapnow 风格无限 AIGC 画布 - 技术方案

## 基于 PRD 需求的完整实现方案

---

## 📊 系统架构图

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           表现层 (Presentation Layer)                        │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  ┌────────────────┐  │
│  │  ImageNode   │  │  VideoNode   │  │   TextNode   │  │ GenerationPanel│  │
│  │  (图片节点)   │  │  (视频节点)   │  │  (文本节点)   │  │   (生成弹窗)    │  │
│  └──────────────┘  └──────────────┘  └──────────────┘  └────────────────┘  │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  ┌────────────────┐  │
│  │ContextMenu   │  │FloatingAction│  │ CameraPanel  │  │  MovementPanel │  │
│  │  (右键菜单)   │  │  (悬停菜单)   │  │ (摄影机面板)  │  │  (运镜面板)    │  │
│  └──────────────┘  └──────────────┘  └──────────────┘  └────────────────┘  │
├─────────────────────────────────────────────────────────────────────────────┤
│                           交互层 (Interaction Layer)                         │
│  ┌─────────────────────┐  ┌─────────────────────┐  ┌─────────────────────┐ │
│  │   React Flow Canvas │  │   Keyboard Shortcuts │  │   Drag & Drop       │ │
│  │   (无限画布)         │  │   (快捷键系统)        │  │   (拖放系统)         │ │
│  └─────────────────────┘  └─────────────────────┘  └─────────────────────┘ │
├─────────────────────────────────────────────────────────────────────────────┤
│                           状态层 (State Layer)                               │
│  ┌─────────────────────┐  ┌─────────────────────┐  ┌─────────────────────┐ │
│  │   Zustand Store     │  │   Yjs CRDT          │  │   Task Queue        │ │
│  │   (本地状态)         │  │   (协作状态)         │  │   (任务队列)         │ │
│  └─────────────────────┘  └─────────────────────┘  └─────────────────────┘ │
├─────────────────────────────────────────────────────────────────────────────┤
│                           服务层 (Service Layer)                             │
│  ┌─────────────────────┐  ┌─────────────────────┐  ┌─────────────────────┐ │
│  │   Generation API    │  │   Model Router      │  │   Storage Service   │ │
│  │   (生成服务)         │  │   (模型路由)         │  │   (存储服务)         │ │
│  └─────────────────────┘  └─────────────────────┘  └─────────────────────┘ │
├─────────────────────────────────────────────────────────────────────────────┤
│                           适配层 (Adapter Layer)                             │
│  ┌───────────┐  ┌───────────┐  ┌───────────┐  ┌───────────┐  ┌───────────┐│
│  │ BananaPro │  │ Jimeng4.5 │  │ Hailuo2.3 │  │  Kling2.0 │  │  Vidu2.0  ││
│  │  (图片)    │  │  (图片)    │  │  (视频)    │  │  (视频)    │  │  (视频)   ││
│  └───────────┘  └───────────┘  └───────────┘  └───────────┘  └───────────┘│
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 📁 项目目录结构

```
cineflow-mvp/
├── src/
│   ├── app/
│   │   ├── page.tsx                      # 首页
│   │   ├── layout.tsx                    # 全局布局
│   │   ├── globals.css                   # 全局样式
│   │   ├── canvas/
│   │   │   └── page.tsx                  # 画布主页面
│   │   └── api/
│   │       ├── generate/
│   │       │   ├── image/route.ts        # 图片生成 API
│   │       │   └── video/route.ts        # 视频生成 API
│   │       ├── task/
│   │       │   └── [taskId]/route.ts     # 任务状态查询
│   │       ├── upload/route.ts           # 文件上传
│   │       └── enhance/route.ts          # Prompt 增强 (魔法棒)
│   │
│   ├── components/
│   │   ├── canvas/
│   │   │   ├── FlowCanvas.tsx            # React Flow 画布
│   │   │   ├── FloatingToolbar.tsx       # 底部工具栏
│   │   │   ├── ContextMenu.tsx           # 右键菜单 ⭐ 新增
│   │   │   ├── CursorOverlay.tsx         # 多人光标
│   │   │   └── KeyboardShortcuts.tsx     # 快捷键处理 ⭐ 新增
│   │   │
│   │   ├── nodes/
│   │   │   ├── ImageNode.tsx             # 图片节点 ⭐ 重构
│   │   │   ├── VideoNode.tsx             # 视频节点 ⭐ 新增
│   │   │   ├── TextNode.tsx              # 文本节点 ⭐ 新增
│   │   │   ├── FloatingActionBar.tsx     # 节点悬停菜单 ⭐ 新增
│   │   │   └── index.ts                  # 节点类型注册
│   │   │
│   │   ├── panels/
│   │   │   ├── GenerationPanel.tsx       # 生成控制弹窗 ⭐ 核心
│   │   │   ├── PromptInput.tsx           # Prompt 输入框
│   │   │   ├── ModelSelector.tsx         # 模型选择器
│   │   │   ├── AspectRatioSelector.tsx   # 画幅比例选择
│   │   │   ├── CameraControlPanel.tsx    # 虚拟摄影机面板 ⭐ 新增
│   │   │   ├── MovementMatrixPanel.tsx   # 运镜指令面板 ⭐ 新增
│   │   │   └── AdvancedSettings.tsx      # 高级设置折叠
│   │   │
│   │   ├── effects/
│   │   │   ├── BreathingBorder.tsx       # 呼吸灯边框
│   │   │   ├── GoldenFlash.tsx           # 出金闪光
│   │   │   └── LoadingOverlay.tsx        # 加载遮罩
│   │   │
│   │   └── ui/
│   │       ├── Button.tsx
│   │       ├── Input.tsx
│   │       ├── Slider.tsx
│   │       ├── Select.tsx
│   │       ├── Carousel.tsx              # 滚轮选择器 ⭐ 新增
│   │       ├── ProgressBar.tsx
│   │       └── Modal.tsx
│   │
│   ├── lib/
│   │   ├── adapters/
│   │   │   ├── types.ts                  # 适配器接口
│   │   │   ├── adapter-factory.ts        # 适配器工厂
│   │   │   ├── banana-pro.ts             # Banana Pro 适配器 ⭐ 新增
│   │   │   ├── jimeng.ts                 # 即梦 4.5 适配器 ⭐ 新增
│   │   │   ├── hailuo.ts                 # Hailuo 2.3 适配器 ⭐ 新增
│   │   │   ├── kling.ts                  # Kling 2.0 适配器 ⭐ 新增
│   │   │   └── vidu.ts                   # Vidu 2.0 适配器 ⭐ 新增
│   │   │
│   │   ├── collaboration/
│   │   │   ├── yjs-provider.ts
│   │   │   ├── sync-nodes.ts
│   │   │   └── presence.ts
│   │   │
│   │   ├── store/
│   │   │   ├── canvas-store.ts           # 画布状态
│   │   │   ├── generation-store.ts       # 生成状态 ⭐ 新增
│   │   │   └── ui-store.ts               # UI 状态 ⭐ 新增
│   │   │
│   │   └── utils/
│   │       ├── prompt-enhance.ts         # Prompt 增强
│   │       ├── camera-presets.ts         # 摄影机预设 ⭐ 新增
│   │       └── movement-presets.ts       # 运镜预设 ⭐ 新增
│   │
│   └── types/
│       ├── node.ts                       # 节点类型
│       ├── generation.ts                 # 生成参数类型 ⭐ 新增
│       ├── camera.ts                     # 摄影机类型 ⭐ 新增
│       └── movement.ts                   # 运镜类型 ⭐ 新增
│
├── server/
│   └── websocket.js
│
├── public/
│   └── mock/
│
└── docs/
    ├── PRD_TAPNOW_CANVAS.md
    └── TECHNICAL_SPEC_TAPNOW.md          # 本文档
```

---

## 📋 核心数据模型

### 1. 节点类型定义

```typescript
// types/node.ts

// 基础节点数据
interface BaseNodeData {
  node_id: string;
  parent_id: string | null;
  created_at: string;
  created_by: string;
}

// 图片节点
export interface ImageNodeData extends BaseNodeData {
  type: 'image';
  content_url: string | null;
  thumbnail_url: string | null;
  status: 'idle' | 'generating' | 'success' | 'error';
  progress: number;
  generation_metadata: ImageGenerationMeta | null;
}

// 视频节点
export interface VideoNodeData extends BaseNodeData {
  type: 'video';
  content_url: string | null;
  thumbnail_url: string | null;
  duration: number;  // 秒
  status: 'idle' | 'generating' | 'success' | 'error';
  progress: number;
  generation_metadata: VideoGenerationMeta | null;
}

// 文本节点
export interface TextNodeData extends BaseNodeData {
  type: 'text';
  content: string;
  language: 'zh' | 'en';
}

// 节点联合类型
export type CanvasNodeData = ImageNodeData | VideoNodeData | TextNodeData;
```

### 2. 生成参数类型

```typescript
// types/generation.ts

// 图片生成参数
export interface ImageGenerationMeta {
  prompt: string;
  negative_prompt?: string;
  model: 'banana-pro' | 'jimeng-4.5';
  ratio: '16:9' | '9:16' | '1:1' | '4:3' | '3:4';
  resolution: '1K' | '2K' | '4K';
  seed?: number;
  steps?: number;
  cfg?: number;
  ref_image?: string;
  camera_settings?: CameraSettings;
}

// 视频生成参数
export interface VideoGenerationMeta {
  prompt: string;
  model: 'hailuo-2.3' | 'kling-2.0' | 'vidu-2.0';
  source_image: string;
  duration: 6 | 10;
  resolution: '1080P' | '4K';
  camera_movement?: CameraMovement;
  seed?: number;
}

// 生成任务
export interface GenerationTask {
  task_id: string;
  node_id: string;
  type: 'image' | 'video';
  status: 'queued' | 'processing' | 'succeeded' | 'failed' | 'cancelled';
  progress: number;
  params: ImageGenerationMeta | VideoGenerationMeta;
  result?: {
    url: string;
    thumbnail_url?: string;
    seed: number;
    duration_ms: number;
  };
  error?: string;
  created_at: string;
  completed_at?: string;
}
```

### 3. 摄影机类型

```typescript
// types/camera.ts

// 虚拟摄影机设置 (图片生成)
export interface CameraSettings {
  body: 'digital' | 'sony-venice' | 'film';
  lens: 'zeiss-ultra-prime' | 'canon-ef' | 'cooke-s4' | 'arri-signature';
  focal_length: 14 | 24 | 35 | 50 | 85 | 135;
  aperture: 1.4 | 2 | 2.8 | 4 | 5.6 | 8 | 11;
}

// 摄影机预设
export const CAMERA_PRESETS = {
  cinematic: {
    body: 'sony-venice',
    lens: 'zeiss-ultra-prime',
    focal_length: 35,
    aperture: 2.8,
  },
  portrait: {
    body: 'digital',
    lens: 'canon-ef',
    focal_length: 85,
    aperture: 1.4,
  },
  landscape: {
    body: 'film',
    lens: 'zeiss-ultra-prime',
    focal_length: 24,
    aperture: 8,
  },
} as const;
```

### 4. 运镜类型

```typescript
// types/movement.ts

// 运镜指令 (视频生成)
export interface CameraMovement {
  // 推拉类 (Z轴)
  zoom?: 'in' | 'out';

  // 摇摄类 (旋转)
  pan?: 'left' | 'right';
  tilt?: 'up' | 'down';

  // 移摄类 (X/Y轴)
  truck?: 'left' | 'right';
  pedestal?: 'up' | 'down';
  dolly?: 'in' | 'out';

  // 特殊类
  special?: 'follow' | 'shake' | 'static';

  // 强度 (0-1)
  intensity: number;
}

// 运镜预设
export const MOVEMENT_PRESETS = {
  dramatic_zoom: { zoom: 'in', intensity: 0.8 },
  reveal: { zoom: 'out', intensity: 0.6 },
  pan_left: { pan: 'left', intensity: 0.5 },
  pan_right: { pan: 'right', intensity: 0.5 },
  tilt_up: { tilt: 'up', intensity: 0.5 },
  tilt_down: { tilt: 'down', intensity: 0.5 },
  dolly_in: { dolly: 'in', intensity: 0.6 },
  dolly_out: { dolly: 'out', intensity: 0.6 },
  follow_subject: { special: 'follow', intensity: 0.7 },
  handheld: { special: 'shake', intensity: 0.3 },
  static_beauty: { special: 'static', intensity: 0.1 },
} as const;
```

---

## 🔧 核心模块实现

### 1. 适配器接口

```typescript
// lib/adapters/types.ts

export interface GenerationAdapter {
  readonly name: string;
  readonly type: 'image' | 'video';
  readonly supportedModels: string[];

  // 提交生成任务
  generate(params: GenerationParams): Promise<string>;  // 返回 task_id

  // 查询任务状态
  getStatus(taskId: string): Promise<TaskStatus>;

  // 获取结果
  getResult(taskId: string): Promise<TaskResult>;

  // 取消任务
  cancel(taskId: string): Promise<void>;
}

export interface GenerationParams {
  prompt: string;
  negative_prompt?: string;
  model: string;
  ratio?: string;
  resolution?: string;
  seed?: number;
  ref_image?: string;
  source_image?: string;
  duration?: number;
  camera_settings?: CameraSettings;
  camera_movement?: CameraMovement;
}

export interface TaskStatus {
  status: 'queued' | 'processing' | 'succeeded' | 'failed';
  progress: number;
  message?: string;
}

export interface TaskResult {
  url: string;
  thumbnail_url?: string;
  seed: number;
  duration_ms: number;
  metadata?: Record<string, any>;
}
```

### 2. Banana Pro 适配器

```typescript
// lib/adapters/banana-pro.ts

import { GenerationAdapter, GenerationParams, TaskStatus, TaskResult } from './types';

const API_BASE = 'https://api.banana.dev/v1';

export class BananaProAdapter implements GenerationAdapter {
  readonly name = 'Banana Pro';
  readonly type = 'image' as const;
  readonly supportedModels = ['banana-pro'];

  private apiKey: string;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  async generate(params: GenerationParams): Promise<string> {
    // 构建 Prompt (融合摄影机参数)
    const enhancedPrompt = this.buildPrompt(params);

    const response = await fetch(`${API_BASE}/generate`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        prompt: enhancedPrompt,
        negative_prompt: params.negative_prompt || 'low quality, blurry',
        width: this.getWidth(params.ratio, params.resolution),
        height: this.getHeight(params.ratio, params.resolution),
        seed: params.seed,
        num_inference_steps: 30,
        guidance_scale: 7.5,
      }),
    });

    const data = await response.json();
    return data.task_id;
  }

  private buildPrompt(params: GenerationParams): string {
    let prompt = params.prompt;

    // 融合摄影机参数到 Prompt
    if (params.camera_settings) {
      const { body, lens, focal_length, aperture } = params.camera_settings;
      const cameraPrompt = this.getCameraPrompt(body, lens, focal_length, aperture);
      prompt = `${prompt}, ${cameraPrompt}`;
    }

    return prompt;
  }

  private getCameraPrompt(
    body: string,
    lens: string,
    focalLength: number,
    aperture: number
  ): string {
    const bodyMap: Record<string, string> = {
      'digital': 'sharp digital photography',
      'sony-venice': 'cinematic film look, Sony Venice color science',
      'film': 'analog film grain, Kodak Portra 400',
    };

    const lensMap: Record<string, string> = {
      'zeiss-ultra-prime': 'Zeiss Ultra Prime lens, smooth bokeh',
      'canon-ef': 'Canon EF lens, natural colors',
      'cooke-s4': 'Cooke S4 lens, warm skin tones',
      'arri-signature': 'ARRI Signature Prime, cinematic flare',
    };

    const focalMap: Record<number, string> = {
      14: 'ultra wide angle 14mm, dramatic perspective',
      24: 'wide angle 24mm, environmental portrait',
      35: '35mm lens, natural perspective',
      50: '50mm standard lens, classic look',
      85: '85mm portrait lens, flattering compression',
      135: '135mm telephoto, compressed background',
    };

    const apertureDesc = aperture <= 2
      ? 'shallow depth of field, creamy bokeh'
      : aperture <= 4
        ? 'moderate depth of field'
        : 'deep focus, sharp throughout';

    return [
      bodyMap[body] || '',
      lensMap[lens] || '',
      focalMap[focalLength] || '',
      `f/${aperture} aperture, ${apertureDesc}`,
    ].filter(Boolean).join(', ');
  }

  private getWidth(ratio?: string, resolution?: string): number {
    const baseWidth = resolution === '4K' ? 3840 : resolution === '2K' ? 2048 : 1024;
    const ratioMap: Record<string, number> = {
      '16:9': 1.0,
      '9:16': 0.5625,
      '1:1': 0.75,
      '4:3': 0.875,
      '3:4': 0.75,
    };
    return Math.round(baseWidth * (ratioMap[ratio || '1:1'] || 1));
  }

  private getHeight(ratio?: string, resolution?: string): number {
    const baseHeight = resolution === '4K' ? 2160 : resolution === '2K' ? 1152 : 1024;
    const ratioMap: Record<string, number> = {
      '16:9': 0.5625,
      '9:16': 1.0,
      '1:1': 1.0,
      '4:3': 1.0,
      '3:4': 1.333,
    };
    return Math.round(baseHeight * (ratioMap[ratio || '1:1'] || 1));
  }

  async getStatus(taskId: string): Promise<TaskStatus> {
    const response = await fetch(`${API_BASE}/task/${taskId}`, {
      headers: { 'Authorization': `Bearer ${this.apiKey}` },
    });
    const data = await response.json();

    return {
      status: data.status,
      progress: data.progress || 0,
      message: data.message,
    };
  }

  async getResult(taskId: string): Promise<TaskResult> {
    const response = await fetch(`${API_BASE}/task/${taskId}/result`, {
      headers: { 'Authorization': `Bearer ${this.apiKey}` },
    });
    const data = await response.json();

    return {
      url: data.image_url,
      thumbnail_url: data.thumbnail_url,
      seed: data.seed,
      duration_ms: data.duration_ms,
    };
  }

  async cancel(taskId: string): Promise<void> {
    await fetch(`${API_BASE}/task/${taskId}/cancel`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${this.apiKey}` },
    });
  }
}
```

### 3. Hailuo 视频适配器

```typescript
// lib/adapters/hailuo.ts

import { GenerationAdapter, GenerationParams, TaskStatus, TaskResult } from './types';
import { CameraMovement } from '@/types/movement';

const API_BASE = 'https://api.hailuo.ai/v1';

export class HailuoAdapter implements GenerationAdapter {
  readonly name = 'Hailuo 2.3';
  readonly type = 'video' as const;
  readonly supportedModels = ['hailuo-2.3'];

  private apiKey: string;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  async generate(params: GenerationParams): Promise<string> {
    // 构建运镜指令
    const movementPrompt = this.buildMovementPrompt(params.camera_movement);
    const fullPrompt = movementPrompt
      ? `${params.prompt}. Camera: ${movementPrompt}`
      : params.prompt;

    const response = await fetch(`${API_BASE}/video/generate`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        prompt: fullPrompt,
        image_url: params.source_image,
        duration: params.duration || 6,
        resolution: params.resolution || '1080P',
        seed: params.seed,
      }),
    });

    const data = await response.json();
    return data.task_id;
  }

  private buildMovementPrompt(movement?: CameraMovement): string {
    if (!movement) return '';

    const parts: string[] = [];

    // 推拉类
    if (movement.zoom === 'in') parts.push('zoom in slowly');
    if (movement.zoom === 'out') parts.push('zoom out to reveal');

    // 摇摄类
    if (movement.pan === 'left') parts.push('pan left');
    if (movement.pan === 'right') parts.push('pan right');
    if (movement.tilt === 'up') parts.push('tilt up');
    if (movement.tilt === 'down') parts.push('tilt down');

    // 移摄类
    if (movement.truck === 'left') parts.push('truck left');
    if (movement.truck === 'right') parts.push('truck right');
    if (movement.pedestal === 'up') parts.push('crane up');
    if (movement.pedestal === 'down') parts.push('crane down');
    if (movement.dolly === 'in') parts.push('dolly in');
    if (movement.dolly === 'out') parts.push('dolly out');

    // 特殊类
    if (movement.special === 'follow') parts.push('follow the subject');
    if (movement.special === 'shake') parts.push('handheld camera shake');
    if (movement.special === 'static') parts.push('static shot, subtle movement');

    // 强度
    const intensityDesc = movement.intensity > 0.7
      ? 'dramatic'
      : movement.intensity > 0.4
        ? 'moderate'
        : 'subtle';

    return parts.length > 0
      ? `${intensityDesc} ${parts.join(', ')}`
      : '';
  }

  async getStatus(taskId: string): Promise<TaskStatus> {
    const response = await fetch(`${API_BASE}/task/${taskId}`, {
      headers: { 'Authorization': `Bearer ${this.apiKey}` },
    });
    const data = await response.json();

    return {
      status: data.status,
      progress: data.progress || 0,
      message: data.message,
    };
  }

  async getResult(taskId: string): Promise<TaskResult> {
    const response = await fetch(`${API_BASE}/task/${taskId}/result`, {
      headers: { 'Authorization': `Bearer ${this.apiKey}` },
    });
    const data = await response.json();

    return {
      url: data.video_url,
      thumbnail_url: data.thumbnail_url,
      seed: data.seed,
      duration_ms: data.duration_ms,
    };
  }

  async cancel(taskId: string): Promise<void> {
    await fetch(`${API_BASE}/task/${taskId}/cancel`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${this.apiKey}` },
    });
  }
}
```

### 4. 适配器工厂

```typescript
// lib/adapters/adapter-factory.ts

import { GenerationAdapter } from './types';
import { BananaProAdapter } from './banana-pro';
import { JimengAdapter } from './jimeng';
import { HailuoAdapter } from './hailuo';
import { KlingAdapter } from './kling';
import { ViduAdapter } from './vidu';

type ModelType = 'banana-pro' | 'jimeng-4.5' | 'hailuo-2.3' | 'kling-2.0' | 'vidu-2.0';

const adapters: Map<ModelType, GenerationAdapter> = new Map();

export function getAdapter(model: ModelType): GenerationAdapter {
  if (adapters.has(model)) {
    return adapters.get(model)!;
  }

  let adapter: GenerationAdapter;

  switch (model) {
    case 'banana-pro':
      adapter = new BananaProAdapter(process.env.BANANA_API_KEY!);
      break;
    case 'jimeng-4.5':
      adapter = new JimengAdapter(process.env.JIMENG_API_KEY!);
      break;
    case 'hailuo-2.3':
      adapter = new HailuoAdapter(process.env.HAILUO_API_KEY!);
      break;
    case 'kling-2.0':
      adapter = new KlingAdapter(process.env.KLING_API_KEY!);
      break;
    case 'vidu-2.0':
      adapter = new ViduAdapter(process.env.VIDU_API_KEY!);
      break;
    default:
      throw new Error(`Unknown model: ${model}`);
  }

  adapters.set(model, adapter);
  return adapter;
}

// 获取所有图片生成模型
export function getImageModels(): ModelType[] {
  return ['banana-pro', 'jimeng-4.5'];
}

// 获取所有视频生成模型
export function getVideoModels(): ModelType[] {
  return ['hailuo-2.3', 'kling-2.0', 'vidu-2.0'];
}
```

---

## 🌐 API 路由实现

### 1. 图片生成 API

```typescript
// app/api/generate/image/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { getAdapter } from '@/lib/adapters/adapter-factory';
import { ImageGenerationMeta } from '@/types/generation';

export async function POST(request: NextRequest) {
  try {
    const body: ImageGenerationMeta = await request.json();

    // 参数验证
    if (!body.prompt?.trim()) {
      return NextResponse.json({ error: 'Prompt is required' }, { status: 400 });
    }

    if (!['banana-pro', 'jimeng-4.5'].includes(body.model)) {
      return NextResponse.json({ error: 'Invalid model' }, { status: 400 });
    }

    // 获取适配器并生成
    const adapter = getAdapter(body.model);
    const taskId = await adapter.generate({
      prompt: body.prompt,
      negative_prompt: body.negative_prompt,
      model: body.model,
      ratio: body.ratio,
      resolution: body.resolution,
      seed: body.seed,
      ref_image: body.ref_image,
      camera_settings: body.camera_settings,
    });

    return NextResponse.json({
      success: true,
      task_id: taskId,
      model: body.model,
    });

  } catch (error) {
    console.error('[API] Image generation error:', error);
    return NextResponse.json({ error: 'Generation failed' }, { status: 500 });
  }
}
```

### 2. 视频生成 API

```typescript
// app/api/generate/video/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { getAdapter } from '@/lib/adapters/adapter-factory';
import { VideoGenerationMeta } from '@/types/generation';

export async function POST(request: NextRequest) {
  try {
    const body: VideoGenerationMeta = await request.json();

    // 参数验证
    if (!body.prompt?.trim()) {
      return NextResponse.json({ error: 'Prompt is required' }, { status: 400 });
    }

    if (!body.source_image) {
      return NextResponse.json({ error: 'Source image is required' }, { status: 400 });
    }

    if (!['hailuo-2.3', 'kling-2.0', 'vidu-2.0'].includes(body.model)) {
      return NextResponse.json({ error: 'Invalid model' }, { status: 400 });
    }

    // 获取适配器并生成
    const adapter = getAdapter(body.model);
    const taskId = await adapter.generate({
      prompt: body.prompt,
      model: body.model,
      source_image: body.source_image,
      duration: body.duration,
      resolution: body.resolution,
      camera_movement: body.camera_movement,
      seed: body.seed,
    });

    return NextResponse.json({
      success: true,
      task_id: taskId,
      model: body.model,
    });

  } catch (error) {
    console.error('[API] Video generation error:', error);
    return NextResponse.json({ error: 'Generation failed' }, { status: 500 });
  }
}
```

### 3. 任务状态查询 API

```typescript
// app/api/task/[taskId]/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { getAdapter } from '@/lib/adapters/adapter-factory';

// 任务模型映射 (实际应从数据库获取)
const taskModelMap = new Map<string, string>();

export async function GET(
  request: NextRequest,
  { params }: { params: { taskId: string } }
) {
  try {
    const { taskId } = params;
    const model = taskModelMap.get(taskId);

    if (!model) {
      return NextResponse.json({ error: 'Task not found' }, { status: 404 });
    }

    const adapter = getAdapter(model as any);
    const status = await adapter.getStatus(taskId);

    // 如果完成，获取结果
    let result = null;
    if (status.status === 'succeeded') {
      result = await adapter.getResult(taskId);
    }

    return NextResponse.json({
      task_id: taskId,
      ...status,
      result,
    });

  } catch (error) {
    console.error('[API] Task query error:', error);
    return NextResponse.json({ error: 'Query failed' }, { status: 500 });
  }
}

// 取消任务
export async function DELETE(
  request: NextRequest,
  { params }: { params: { taskId: string } }
) {
  try {
    const { taskId } = params;
    const model = taskModelMap.get(taskId);

    if (!model) {
      return NextResponse.json({ error: 'Task not found' }, { status: 404 });
    }

    const adapter = getAdapter(model as any);
    await adapter.cancel(taskId);

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('[API] Task cancel error:', error);
    return NextResponse.json({ error: 'Cancel failed' }, { status: 500 });
  }
}
```

---

## 🎨 核心前端组件

### 1. 生成控制弹窗 (GenerationPanel)

```typescript
// components/panels/GenerationPanel.tsx

'use client';

import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { PromptInput } from './PromptInput';
import { ModelSelector } from './ModelSelector';
import { AspectRatioSelector } from './AspectRatioSelector';
import { CameraControlPanel } from './CameraControlPanel';
import { MovementMatrixPanel } from './MovementMatrixPanel';
import { AdvancedSettings } from './AdvancedSettings';
import { ImageGenerationMeta, VideoGenerationMeta } from '@/types/generation';

interface GenerationPanelProps {
  isOpen: boolean;
  onClose: () => void;
  sourceNode?: {
    id: string;
    type: 'image' | 'video';
    imageUrl?: string;
  };
  onGenerate: (params: ImageGenerationMeta | VideoGenerationMeta) => void;
}

export function GenerationPanel({
  isOpen,
  onClose,
  sourceNode,
  onGenerate,
}: GenerationPanelProps) {
  const [mode, setMode] = useState<'image' | 'video'>('image');
  const [prompt, setPrompt] = useState('');
  const [model, setModel] = useState(mode === 'image' ? 'banana-pro' : 'hailuo-2.3');
  const [ratio, setRatio] = useState<string>('16:9');
  const [resolution, setResolution] = useState<string>('1K');
  const [batch, setBatch] = useState(1);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [showCamera, setShowCamera] = useState(false);
  const [showMovement, setShowMovement] = useState(false);

  // 高级参数
  const [seed, setSeed] = useState<number | undefined>();
  const [steps, setSteps] = useState(30);
  const [cfg, setCfg] = useState(7.5);

  // 摄影机参数
  const [cameraSettings, setCameraSettings] = useState<CameraSettings | undefined>();

  // 运镜参数
  const [cameraMovement, setCameraMovement] = useState<CameraMovement | undefined>();

  const handleGenerate = useCallback(() => {
    if (mode === 'image') {
      onGenerate({
        prompt,
        model: model as 'banana-pro' | 'jimeng-4.5',
        ratio: ratio as any,
        resolution: resolution as any,
        seed,
        steps,
        cfg,
        ref_image: sourceNode?.imageUrl,
        camera_settings: cameraSettings,
      });
    } else {
      onGenerate({
        prompt,
        model: model as 'hailuo-2.3' | 'kling-2.0' | 'vidu-2.0',
        source_image: sourceNode?.imageUrl!,
        duration: 6,
        resolution: resolution as any,
        camera_movement: cameraMovement,
        seed,
      });
    }
    onClose();
  }, [mode, prompt, model, ratio, resolution, seed, steps, cfg, cameraSettings, cameraMovement, sourceNode, onGenerate, onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          {/* 背景遮罩 */}
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={onClose}
          />

          {/* 弹窗主体 */}
          <motion.div
            className="relative w-[600px] max-h-[80vh] overflow-y-auto bg-gray-900/95 backdrop-blur-xl rounded-2xl border border-gray-700 shadow-2xl"
            initial={{ scale: 0.9, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.9, y: 20 }}
          >
            {/* 头部 - 模式切换 */}
            <div className="flex items-center gap-2 p-4 border-b border-gray-700">
              <button
                onClick={() => setMode('image')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  mode === 'image'
                    ? 'bg-indigo-500 text-white'
                    : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                }`}
              >
                🖼️ 生成图片
              </button>
              <button
                onClick={() => setMode('video')}
                disabled={!sourceNode?.imageUrl}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  mode === 'video'
                    ? 'bg-indigo-500 text-white'
                    : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                } disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                🎬 生成视频
              </button>
            </div>

            {/* 参考图预览 */}
            {sourceNode?.imageUrl && (
              <div className="p-4 border-b border-gray-700">
                <div className="flex items-center gap-4">
                  <img
                    src={sourceNode.imageUrl}
                    alt="Reference"
                    className="w-20 h-20 object-cover rounded-lg"
                  />
                  <div className="text-sm text-gray-400">
                    参考图片 · 将作为{mode === 'image' ? '风格参考' : '视频起始帧'}
                  </div>
                </div>
              </div>
            )}

            {/* Prompt 输入 */}
            <div className="p-4">
              <PromptInput
                value={prompt}
                onChange={setPrompt}
                placeholder={mode === 'image'
                  ? '描述你想生成的图片...'
                  : '描述视频中的动作和运镜...'
                }
              />
            </div>

            {/* 参数配置栏 */}
            <div className="flex items-center gap-3 px-4 py-3 border-t border-gray-700">
              <ModelSelector
                mode={mode}
                value={model}
                onChange={setModel}
              />

              <AspectRatioSelector
                value={ratio}
                onChange={setRatio}
              />

              <select
                value={resolution}
                onChange={(e) => setResolution(e.target.value)}
                className="px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white text-sm"
              >
                <option value="1K">1K</option>
                <option value="2K">2K</option>
                <option value="4K">4K</option>
              </select>

              {mode === 'image' && (
                <button
                  onClick={() => setShowCamera(!showCamera)}
                  className={`px-3 py-2 rounded-lg text-sm transition-colors ${
                    showCamera ? 'bg-indigo-500 text-white' : 'bg-gray-800 text-gray-400'
                  }`}
                >
                  📷 摄影机
                </button>
              )}

              {mode === 'video' && (
                <button
                  onClick={() => setShowMovement(!showMovement)}
                  className={`px-3 py-2 rounded-lg text-sm transition-colors ${
                    showMovement ? 'bg-indigo-500 text-white' : 'bg-gray-800 text-gray-400'
                  }`}
                >
                  🎥 运镜
                </button>
              )}
            </div>

            {/* 摄影机面板 */}
            {showCamera && mode === 'image' && (
              <CameraControlPanel
                value={cameraSettings}
                onChange={setCameraSettings}
              />
            )}

            {/* 运镜面板 */}
            {showMovement && mode === 'video' && (
              <MovementMatrixPanel
                value={cameraMovement}
                onChange={setCameraMovement}
              />
            )}

            {/* 高级设置 */}
            <AdvancedSettings
              isOpen={showAdvanced}
              onToggle={() => setShowAdvanced(!showAdvanced)}
              seed={seed}
              onSeedChange={setSeed}
              steps={steps}
              onStepsChange={setSteps}
              cfg={cfg}
              onCfgChange={setCfg}
              batch={batch}
              onBatchChange={setBatch}
            />

            {/* 底部操作栏 */}
            <div className="flex items-center justify-between p-4 border-t border-gray-700">
              <button
                onClick={onClose}
                className="px-4 py-2 text-gray-400 hover:text-white transition-colors"
              >
                取消
              </button>

              <button
                onClick={handleGenerate}
                disabled={!prompt.trim()}
                className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-400 hover:to-purple-400 text-white font-medium rounded-xl disabled:opacity-50 disabled:cursor-not-allowed transition-all hover:scale-105"
              >
                <span>✨</span>
                <span>生成 {batch > 1 ? `${batch}x` : ''}</span>
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
```

### 2. 运镜指令面板 (MovementMatrixPanel)

```typescript
// components/panels/MovementMatrixPanel.tsx

'use client';

import { CameraMovement, MOVEMENT_PRESETS } from '@/types/movement';

interface MovementMatrixPanelProps {
  value?: CameraMovement;
  onChange: (value: CameraMovement) => void;
}

export function MovementMatrixPanel({ value, onChange }: MovementMatrixPanelProps) {
  const handleSelect = (preset: keyof typeof MOVEMENT_PRESETS) => {
    onChange(MOVEMENT_PRESETS[preset] as CameraMovement);
  };

  const movements = [
    // 推拉类
    { key: 'dramatic_zoom', icon: '🔍', label: '拉近', category: 'zoom' },
    { key: 'reveal', icon: '🔭', label: '拉远', category: 'zoom' },
    // 摇摄类
    { key: 'pan_left', icon: '⬅️', label: '左摇', category: 'pan' },
    { key: 'pan_right', icon: '➡️', label: '右摇', category: 'pan' },
    { key: 'tilt_up', icon: '⬆️', label: '仰摄', category: 'tilt' },
    { key: 'tilt_down', icon: '⬇️', label: '俯摄', category: 'tilt' },
    // 移摄类
    { key: 'dolly_in', icon: '🎬', label: '推镜', category: 'dolly' },
    { key: 'dolly_out', icon: '🎥', label: '拉镜', category: 'dolly' },
    // 特殊类
    { key: 'follow_subject', icon: '🏃', label: '跟随', category: 'special' },
    { key: 'handheld', icon: '📱', label: '抖动', category: 'special' },
    { key: 'static_beauty', icon: '🖼️', label: '静止', category: 'special' },
  ];

  return (
    <div className="p-4 border-t border-gray-700">
      <div className="text-sm text-gray-400 mb-3">运镜指令</div>

      <div className="grid grid-cols-4 gap-2">
        {movements.map((m) => (
          <button
            key={m.key}
            onClick={() => handleSelect(m.key as any)}
            className={`flex flex-col items-center gap-1 p-3 rounded-lg transition-all ${
              value && JSON.stringify(value) === JSON.stringify(MOVEMENT_PRESETS[m.key as keyof typeof MOVEMENT_PRESETS])
                ? 'bg-indigo-500 text-white'
                : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
            }`}
          >
            <span className="text-xl">{m.icon}</span>
            <span className="text-xs">{m.label}</span>
          </button>
        ))}
      </div>

      {/* 强度滑块 */}
      <div className="mt-4">
        <div className="flex items-center justify-between text-sm text-gray-400 mb-2">
          <span>运镜强度</span>
          <span>{Math.round((value?.intensity || 0.5) * 100)}%</span>
        </div>
        <input
          type="range"
          min="0"
          max="100"
          value={(value?.intensity || 0.5) * 100}
          onChange={(e) => onChange({ ...value, intensity: parseInt(e.target.value) / 100 } as CameraMovement)}
          className="w-full"
        />
      </div>
    </div>
  );
}
```

### 3. 节点悬停菜单 (FloatingActionBar)

```typescript
// components/nodes/FloatingActionBar.tsx

'use client';

import { motion } from 'framer-motion';

interface FloatingActionBarProps {
  nodeId: string;
  nodeType: 'image' | 'video' | 'text';
  onEdit: () => void;
  onCopy: () => void;
  onDownload: () => void;
  onDelete: () => void;
  onInfo: () => void;
  onExpand: () => void;
}

export function FloatingActionBar({
  nodeId,
  nodeType,
  onEdit,
  onCopy,
  onDownload,
  onDelete,
  onInfo,
  onExpand,
}: FloatingActionBarProps) {
  const actions = [
    { icon: '✏️', label: '编辑', onClick: onEdit },
    { icon: '📋', label: '复制', onClick: onCopy },
    { icon: '⬇️', label: '下载', onClick: onDownload },
    { icon: 'ℹ️', label: '详情', onClick: onInfo },
    { icon: '🔍', label: '全屏', onClick: onExpand },
    { icon: '🗑️', label: '删除', onClick: onDelete, danger: true },
  ];

  return (
    <motion.div
      className="absolute -bottom-12 left-1/2 -translate-x-1/2 z-50"
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
    >
      <div className="flex items-center gap-1 px-2 py-1.5 bg-gray-800/95 backdrop-blur-lg rounded-xl border border-gray-700 shadow-xl">
        {actions.map((action) => (
          <button
            key={action.label}
            onClick={action.onClick}
            className={`flex items-center gap-1 px-2 py-1.5 rounded-lg text-sm transition-colors ${
              action.danger
                ? 'hover:bg-red-500/20 hover:text-red-400'
                : 'hover:bg-gray-700 text-gray-400 hover:text-white'
            }`}
            title={action.label}
          >
            <span>{action.icon}</span>
          </button>
        ))}
      </div>
    </motion.div>
  );
}
```

### 4. 右键菜单 (ContextMenu)

```typescript
// components/canvas/ContextMenu.tsx

'use client';

import { motion, AnimatePresence } from 'framer-motion';

interface ContextMenuProps {
  isOpen: boolean;
  position: { x: number; y: number };
  onClose: () => void;
  onUpload: () => void;
  onAddImage: () => void;
  onAddVideo: () => void;
  onAddText: () => void;
  onUndo: () => void;
  onRedo: () => void;
  onPaste: () => void;
}

export function ContextMenu({
  isOpen,
  position,
  onClose,
  onUpload,
  onAddImage,
  onAddVideo,
  onAddText,
  onUndo,
  onRedo,
  onPaste,
}: ContextMenuProps) {
  const menuItems = [
    { icon: '📤', label: '上传', shortcut: '', onClick: onUpload },
    { divider: true },
    { icon: '🖼️', label: '添加图片节点', shortcut: '', onClick: onAddImage },
    { icon: '🎬', label: '添加视频节点', shortcut: '', onClick: onAddVideo },
    { icon: '📝', label: '添加文本节点', shortcut: '', onClick: onAddText },
    { divider: true },
    { icon: '↩️', label: '撤销', shortcut: '⌘Z', onClick: onUndo },
    { icon: '↪️', label: '重做', shortcut: '⇧⌘Z', onClick: onRedo },
    { icon: '📋', label: '粘贴', shortcut: '⌘V', onClick: onPaste },
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* 点击外部关闭 */}
          <div className="fixed inset-0 z-40" onClick={onClose} />

          <motion.div
            className="fixed z-50 min-w-[200px] py-2 bg-gray-800/95 backdrop-blur-lg rounded-xl border border-gray-700 shadow-2xl"
            style={{ left: position.x, top: position.y }}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
          >
            {menuItems.map((item, index) => (
              item.divider ? (
                <div key={index} className="my-1 border-t border-gray-700" />
              ) : (
                <button
                  key={index}
                  onClick={() => { item.onClick?.(); onClose(); }}
                  className="flex items-center justify-between w-full px-4 py-2 text-sm text-gray-300 hover:bg-gray-700 hover:text-white transition-colors"
                >
                  <span className="flex items-center gap-2">
                    <span>{item.icon}</span>
                    <span>{item.label}</span>
                  </span>
                  {item.shortcut && (
                    <span className="text-xs text-gray-500">{item.shortcut}</span>
                  )}
                </button>
              )
            ))}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
```

---

## 📊 状态管理

### 1. 生成状态 Store

```typescript
// lib/store/generation-store.ts

import { create } from 'zustand';
import { GenerationTask } from '@/types/generation';

interface GenerationState {
  tasks: Map<string, GenerationTask>;
  activeTaskIds: string[];

  // Actions
  addTask: (task: GenerationTask) => void;
  updateTask: (taskId: string, updates: Partial<GenerationTask>) => void;
  removeTask: (taskId: string) => void;
  getTaskByNodeId: (nodeId: string) => GenerationTask | undefined;
}

export const useGenerationStore = create<GenerationState>((set, get) => ({
  tasks: new Map(),
  activeTaskIds: [],

  addTask: (task) => set((state) => {
    const newTasks = new Map(state.tasks);
    newTasks.set(task.task_id, task);
    return {
      tasks: newTasks,
      activeTaskIds: [...state.activeTaskIds, task.task_id],
    };
  }),

  updateTask: (taskId, updates) => set((state) => {
    const newTasks = new Map(state.tasks);
    const existing = newTasks.get(taskId);
    if (existing) {
      newTasks.set(taskId, { ...existing, ...updates });
    }

    // 如果任务完成，从活跃列表移除
    let activeTaskIds = state.activeTaskIds;
    if (updates.status === 'succeeded' || updates.status === 'failed') {
      activeTaskIds = activeTaskIds.filter(id => id !== taskId);
    }

    return { tasks: newTasks, activeTaskIds };
  }),

  removeTask: (taskId) => set((state) => {
    const newTasks = new Map(state.tasks);
    newTasks.delete(taskId);
    return {
      tasks: newTasks,
      activeTaskIds: state.activeTaskIds.filter(id => id !== taskId),
    };
  }),

  getTaskByNodeId: (nodeId) => {
    const tasks = get().tasks;
    for (const task of tasks.values()) {
      if (task.node_id === nodeId) return task;
    }
    return undefined;
  },
}));
```

### 2. 任务轮询 Hook

```typescript
// lib/hooks/useTaskPolling.ts

import { useEffect, useCallback } from 'react';
import { useGenerationStore } from '@/lib/store/generation-store';

const POLL_INTERVAL = 2000; // 2秒

export function useTaskPolling() {
  const { activeTaskIds, updateTask } = useGenerationStore();

  const pollTask = useCallback(async (taskId: string) => {
    try {
      const response = await fetch(`/api/task/${taskId}`);
      const data = await response.json();

      updateTask(taskId, {
        status: data.status,
        progress: data.progress,
        result: data.result,
        error: data.error,
      });

    } catch (error) {
      console.error(`[Polling] Error for task ${taskId}:`, error);
    }
  }, [updateTask]);

  useEffect(() => {
    if (activeTaskIds.length === 0) return;

    const interval = setInterval(() => {
      activeTaskIds.forEach(pollTask);
    }, POLL_INTERVAL);

    // 立即执行一次
    activeTaskIds.forEach(pollTask);

    return () => clearInterval(interval);
  }, [activeTaskIds, pollTask]);
}
```

---

## ⌨️ 快捷键系统

```typescript
// components/canvas/KeyboardShortcuts.tsx

'use client';

import { useEffect } from 'react';
import { useReactFlow } from 'reactflow';

interface KeyboardShortcutsProps {
  onUndo: () => void;
  onRedo: () => void;
  onDelete: () => void;
  onCopy: () => void;
  onPaste: () => void;
  onSelectAll: () => void;
}

export function KeyboardShortcuts({
  onUndo,
  onRedo,
  onDelete,
  onCopy,
  onPaste,
  onSelectAll,
}: KeyboardShortcutsProps) {
  const { fitView, zoomIn, zoomOut } = useReactFlow();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
      const cmdKey = isMac ? e.metaKey : e.ctrlKey;

      // 忽略输入框中的快捷键
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }

      // Cmd/Ctrl + Z: 撤销
      if (cmdKey && e.key === 'z' && !e.shiftKey) {
        e.preventDefault();
        onUndo();
      }

      // Cmd/Ctrl + Shift + Z: 重做
      if (cmdKey && e.key === 'z' && e.shiftKey) {
        e.preventDefault();
        onRedo();
      }

      // Delete/Backspace: 删除
      if (e.key === 'Delete' || e.key === 'Backspace') {
        e.preventDefault();
        onDelete();
      }

      // Cmd/Ctrl + C: 复制
      if (cmdKey && e.key === 'c') {
        e.preventDefault();
        onCopy();
      }

      // Cmd/Ctrl + V: 粘贴
      if (cmdKey && e.key === 'v') {
        e.preventDefault();
        onPaste();
      }

      // Cmd/Ctrl + A: 全选
      if (cmdKey && e.key === 'a') {
        e.preventDefault();
        onSelectAll();
      }

      // Cmd/Ctrl + 0: 适应画布
      if (cmdKey && e.key === '0') {
        e.preventDefault();
        fitView({ padding: 0.2, duration: 500 });
      }

      // Cmd/Ctrl + +: 放大
      if (cmdKey && (e.key === '=' || e.key === '+')) {
        e.preventDefault();
        zoomIn({ duration: 300 });
      }

      // Cmd/Ctrl + -: 缩小
      if (cmdKey && e.key === '-') {
        e.preventDefault();
        zoomOut({ duration: 300 });
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onUndo, onRedo, onDelete, onCopy, onPaste, onSelectAll, fitView, zoomIn, zoomOut]);

  return null;
}
```

---

## 📦 环境变量配置

```env
# .env.local

# 图片生成 API
BANANA_API_KEY=your_banana_api_key
JIMENG_API_KEY=your_jimeng_api_key

# 视频生成 API
HAILUO_API_KEY=your_hailuo_api_key
KLING_API_KEY=your_kling_api_key
VIDU_API_KEY=your_vidu_api_key

# Prompt 增强 (魔法棒)
OPENAI_API_KEY=your_openai_api_key

# WebSocket 协作
NEXT_PUBLIC_WS_URL=ws://localhost:1234

# 存储
R2_ACCOUNT_ID=your_r2_account_id
R2_ACCESS_KEY_ID=your_r2_access_key
R2_SECRET_ACCESS_KEY=your_r2_secret_key
R2_BUCKET_NAME=cineflow-assets
```

---

## 🚀 开发计划

### Phase 1: 核心生成流程 (3天)

| 任务 | 预计时间 | 优先级 |
|------|---------|--------|
| GenerationPanel 弹窗 | 4h | P0 |
| PromptInput 组件 | 1h | P0 |
| ModelSelector 组件 | 1h | P0 |
| AspectRatioSelector 组件 | 1h | P0 |
| Banana Pro 适配器 | 3h | P0 |
| 即梦 4.5 适配器 | 3h | P0 |
| 任务状态轮询 | 2h | P0 |
| 节点状态更新 | 2h | P0 |

### Phase 2: 节点系统 (3天)

| 任务 | 预计时间 | 优先级 |
|------|---------|--------|
| FloatingActionBar | 2h | P1 |
| VideoNode 组件 | 4h | P1 |
| ContextMenu 右键菜单 | 2h | P1 |
| MovementMatrixPanel | 3h | P1 |
| Hailuo 适配器 | 3h | P1 |
| 节点删除功能 | 1h | P1 |
| 节点下载功能 | 1h | P1 |

### Phase 3: 高级功能 (2天)

| 任务 | 预计时间 | 优先级 |
|------|---------|--------|
| KeyboardShortcuts | 2h | P2 |
| AdvancedSettings 面板 | 2h | P2 |
| Prompt 增强 (魔法棒) | 3h | P2 |
| 撤销/重做系统 | 4h | P2 |

### Phase 4: 视觉优化 (2天)

| 任务 | 预计时间 | 优先级 |
|------|---------|--------|
| CameraControlPanel | 3h | P3 |
| 磨砂玻璃 UI 效果 | 2h | P3 |
| 连线高亮动画 | 2h | P3 |
| Loading 动画优化 | 2h | P3 |

---

## ✅ 验收清单

### Phase 1 验收
- [ ] 点击节点可以唤起生成弹窗
- [ ] 可以输入 Prompt 并选择模型
- [ ] 点击生成后节点显示 Loading
- [ ] 生成完成后图片显示在节点中
- [ ] 新节点自动与父节点连线

### Phase 2 验收
- [ ] 悬停节点显示操作菜单
- [ ] 可以删除节点和连线
- [ ] 视频节点可以播放
- [ ] 右键菜单可以添加节点
- [ ] 运镜指令可以选择

### Phase 3 验收
- [ ] 快捷键正常工作
- [ ] 魔法棒可以优化 Prompt
- [ ] 高级参数可以调整
- [ ] 撤销/重做正常工作

### Phase 4 验收
- [ ] 虚拟摄影机参数可配置
- [ ] UI 动画流畅
- [ ] 整体视觉符合 Tapnow 风格