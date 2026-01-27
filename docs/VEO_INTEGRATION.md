# Veo 3.1 Fast 视频生成集成文档

## ✅ 已完成的集成

### 1. 视频生成 API Route
**文件**: `src/app/api/generate/video/route.ts`

#### 功能特性
- ✅ 使用 Google Veo 3.1 Fast 模型
- ✅ 支持 Text-to-Video (T2V)
- ✅ 支持 Image-to-Video (I2V) - 通过 reference_image
- ✅ 中文提示词自动翻译（使用豆包 API）
- ✅ 运镜控制支持
- ✅ 自定义视频时长（默认 6 秒）

#### API 端点
```
POST /api/generate/video
```

#### 请求参数
```typescript
{
  prompt: string;              // 视频描述
  ratio?: string;              // 画幅比例 (16:9, 9:16, 1:1, 4:3)
  duration?: number;           // 视频时长（秒）
  reference_image?: string;    // 参考图片（base64）
  camera_control?: {           // 运镜控制
    movement?: string;         // 运镜方向
    speed?: number;            // 运镜速度
  };
}
```

#### 响应格式
```typescript
{
  success: true,
  videoUrl: string;   // base64 编码的视频
  duration: number;   // 视频时长
}
```

### 2. 生成状态管理更新
**文件**: `src/lib/store/generation-store.ts`

#### 更新内容
- ✅ 自动检测视频模型（包含 'video' 或 'veo-3.1-fast'）
- ✅ 根据模型类型选择 API 端点
- ✅ 支持视频生成参数传递
- ✅ 处理视频生成结果

#### 逻辑判断
```typescript
const isVideo = params.model?.includes('video') || params.model === 'veo-3.1-fast';
const apiEndpoint = isVideo ? '/api/generate/video' : '/api/generate/image';
```

### 3. 类型定义更新
**文件**: `src/types/generation.ts`

#### 新增模型类型
```typescript
model: 'mock' | 'banana-pro' | 'jimeng-4.5' | 'vertex-ai' | 'veo-3.1-fast' | 'mock-video';
```

#### 新增视频参数
```typescript
duration?: number;           // 视频时长（秒）
camera_control?: {
  movement?: string;         // 运镜方向
  speed?: number;            // 运镜速度
};
```

#### 更新任务结果
```typescript
result?: {
  url: string;
  seed?: number;
  duration?: number;  // 视频时长
};
```

### 4. 生成面板更新
**文件**: `src/components/panels/GenerationPanelPro.tsx`

#### 模型选项
```typescript
const videoModels = [
  { value: 'mock-video', label: '🧪 Mock (测试)' },
  { value: 'veo-3.1-fast', label: '⚡ Veo 3.1 Fast (Google)' },
  { value: 'kling-1.6', label: '🎬 可灵 1.6' },
  { value: 'hailuo', label: '🌊 海螺' },
];
```

#### 默认模型
- 图片节点: `vertex-ai` (Imagen 3)
- 视频节点: `veo-3.1-fast` (Veo 3.1 Fast)

#### 参数传递
```typescript
if (nodeType === 'video') {
  params.duration = videoDuration;
  
  // 运镜控制
  if (selectedMovements.length > 0) {
    params.camera_control = {
      movement: selectedMovements.join(', '),
    };
  }
}
```

## 🔑 环境变量配置

### 已配置
```env
# Google Cloud (用于 Veo 3.1 Fast)
GOOGLE_CLOUD_PROJECT=fleet-blend-469520-n7
GOOGLE_APPLICATION_CREDENTIALS=./fleet-blend-469520-n7-9cd71165921b.json
VERTEX_AI_LOCATION=us-central1

# 豆包 API (用于中文翻译)
ARK_API_KEY=e4df5214-5735-49f2-9de4-fd243ea10384
```

## 🎬 使用流程

### 场景 1: Text-to-Video (纯文本生成视频)
1. 创建视频节点或从图片节点拖拽锚点选择"生成视频"
2. 输入提示词："A cute astronaut running on the moon"
3. 选择模型："⚡ Veo 3.1 Fast (Google)"
4. 设置时长：6 秒
5. 选择运镜：推近、跟随
6. 点击生成

### 场景 2: Image-to-Video (图片转视频)
1. 从已有图片节点拖拽锚点
2. 选择"🎬 生成视频"
3. 生成面板自动填充参考图片
4. 输入动作描述："running forward"
5. 选择运镜方向
6. 点击生成

## 🔄 数据流

```
用户输入
  ↓
GenerationPanelPro
  ↓ (onGenerate)
Canvas handleGenerate
  ↓ (创建子节点)
generation-store.startGeneration
  ↓ (检测模型类型)
/api/generate/video
  ↓ (翻译中文)
豆包 API
  ↓ (生成视频)
Veo 3.1 Fast API
  ↓ (返回结果)
更新节点状态
```

## 📊 API 调用示例

### 请求
```bash
POST /api/generate/video
Content-Type: application/json

{
  "prompt": "小狗在草地上奔跑",
  "ratio": "16:9",
  "duration": 6,
  "reference_image": "data:image/png;base64,...",
  "camera_control": {
    "movement": "zoom_in, follow"
  }
}
```

### 响应
```json
{
  "success": true,
  "videoUrl": "data:video/mp4;base64,...",
  "duration": 6
}
```

## 🎯 运镜控制选项

| 运镜类型 | ID | 描述 |
|---------|-----|------|
| 推近 | zoom_in | 镜头推近主体 |
| 拉远 | zoom_out | 镜头拉远 |
| 左摇 | pan_left | 水平向左移动 |
| 右摇 | pan_right | 水平向右移动 |
| 仰摄 | tilt_up | 向上倾斜 |
| 俯摄 | tilt_down | 向下倾斜 |
| 推镜 | dolly_in | 摄影机向前移动 |
| 拉镜 | dolly_out | 摄影机向后移动 |
| 跟随 | follow | 跟随主体移动 |
| 静止 | static | 固定镜头 |

## 🔍 调试日志

### 控制台输出
```
[Veo 3.1] Starting video generation
[Veo 3.1] Project: fleet-blend-469520-n7
[Veo 3.1] Location: us-central1
[Veo 3.1] Prompt: 小狗在草地上奔跑
[Veo 3.1] Detected Chinese, translating to English via Doubao...
[Veo 3.1] ✅ Translated prompt: A puppy running on the grass
[Veo 3.1] 🎬 Final enhanced prompt: A puppy running on the grass, cinematic, high quality, smooth motion
[Veo 3.1] Using reference image for I2V
[Veo 3.1] Camera control: { movement: 'zoom_in, follow' }
[Veo 3.1] Response status: 200
[Veo 3.1] ✅ Success
```

## ⚠️ 注意事项

1. **配额限制**: Veo 3.1 Fast 有 API 调用配额限制
2. **视频大小**: 返回的 base64 视频可能较大，注意内存使用
3. **生成时间**: 视频生成通常需要 30-60 秒
4. **参考图片**: I2V 模式下参考图片会影响生成质量

## 🚀 性能优化建议

1. **缓存翻译结果**: 相同的中文提示词可以缓存翻译结果
2. **进度反馈**: 添加更详细的生成进度提示
3. **错误重试**: 实现自动重试机制
4. **结果预览**: 生成完成后自动播放预览

## 📋 测试清单

- [x] Text-to-Video 生成
- [x] Image-to-Video 生成
- [x] 中文提示词翻译
- [x] 运镜控制传递
- [x] 视频时长设置
- [ ] 错误处理测试
- [ ] 配额超限处理
- [ ] 大文件处理

---

**集成日期**: 2024
**版本**: V1.0
**状态**: ✅ 核心功能已完成

