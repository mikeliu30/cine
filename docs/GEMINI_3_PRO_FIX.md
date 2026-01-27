# Gemini 3 Pro Image Preview 404 错误修复

## 🐛 问题描述

在调用 Vertex AI 的 `gemini-3-pro-image-preview` 模型时遇到 404 错误：

```
404 Not Found: Method 'google.cloud.aiplatform.v1.PredictionService.GenerateContent' not found
```

## 🔍 根本原因

**预览版模型的区域限制问题**：

1. `gemini-3-pro-image-preview` (Banana Pro) 是全球预览版模型
2. 该模型**仅部署在 `global` 逻辑位置**，不支持区域端点（如 `us-central1`）
3. 之前的代码使用了错误的模型名 `gemini-2.5-flash-image`（该模型已于 2026-01-15 下线）
4. 即使代码中有全球端点逻辑，但因为模型名错误导致无法触发

## ✅ 修复方案

### 1. 修改模型名称

**文件**: `src/app/api/generate/image/route.ts`

**修改前** (第 389 行):
```typescript
result = await generateWithVertexGemini(params, 'gemini-2.5-flash-image');
```

**修改后**:
```typescript
result = await generateWithVertexGemini(params, 'gemini-3-pro-image-preview');
```

### 2. 自动端点切换逻辑

代码中已有的智能端点切换逻辑（第 157-171 行）：

```typescript
// 🔥 关键修复：Gemini 3 Pro 预览版模型必须使用 global 位置
const useGlobalLocation = modelName.includes('gemini-3-pro') || modelName.includes('preview');
const location = useGlobalLocation ? 'global' : VERTEX_AI_LOCATION;

// 预览版模型使用全球端点：https://aiplatform.googleapis.com
// 正式版模型使用区域端点：https://us-central1-aiplatform.googleapis.com
const baseUrl = useGlobalLocation
  ? 'https://aiplatform.googleapis.com'
  : `https://${VERTEX_AI_LOCATION}-aiplatform.googleapis.com`;

const endpoint = `${baseUrl}/v1/projects/${GOOGLE_CLOUD_PROJECT}/locations/${location}/publishers/google/models/${modelName}:generateContent`;
```

### 3. 端点对比

| 模型类型 | 位置 | 端点 URL |
|---------|------|----------|
| ❌ 区域端点 | `us-central1` | `https://us-central1-aiplatform.googleapis.com/v1/projects/.../locations/us-central1/...` |
| ✅ 全球端点 | `global` | `https://aiplatform.googleapis.com/v1/projects/.../locations/global/...` |

## 🧪 测试步骤

### 1. 重启开发服务器

```bash
cd cineflow-mvp
npm run dev
```

### 2. 测试图片生成

1. 打开 http://localhost:3000/canvas
2. 右键点击画布 → "添加图片节点"
3. 双击图片节点打开生成面板
4. 输入提示词：`一只可爱的小猫在花园里玩耍`
5. 选择模型：`🍌 Gemini 3 Pro (Vertex AI)`
6. 点击"生成"

### 3. 预期结果

**控制台日志应显示**：
```
[Vertex Gemini] Using enterprise Gemini for image generation
[Vertex Gemini] Project: fleet-blend-469520-n7
[Vertex Gemini] Model: gemini-3-pro-image-preview
[Vertex Gemini] Location: global (using global for preview model)
[Vertex Gemini] Endpoint: https://aiplatform.googleapis.com/v1/projects/fleet-blend-469520-n7/locations/global/publishers/google/models/gemini-3-pro-image-preview:generateContent
```

**成功标志**：
- ✅ 节点状态变为"生成中"
- ✅ 10-30秒后显示生成的图片
- ✅ 无 404 错误

## 📊 模型版本说明

| 模型名称 | 状态 | 可用性 | 端点类型 |
|---------|------|--------|---------|
| `gemini-2.5-flash-image-preview` | ❌ 已下线 (2026-01-15) | 不可用 | - |
| `gemini-3-pro-image-preview` | ✅ 全球预览版 | 可用 | 仅 global |
| `gemini-2.0-flash-exp` | ✅ 实验版 | 可用 | 区域/全球 |

## 🎯 关键要点

1. **预览版模型必须使用 global 端点**
2. **Gemini 2.5 系列已全面下线，使用 Gemini 3 系列**
3. **代码会自动检测模型名并切换端点**
4. **支持高达 4K 分辨率输出**

## 🔗 参考资料

- [Vertex AI Gemini API 文档](https://cloud.google.com/vertex-ai/docs/generative-ai/model-reference/gemini)
- [Gemini 3 Release Notes](https://cloud.google.com/vertex-ai/docs/generative-ai/release-notes)
- [全球端点说明](https://cloud.google.com/vertex-ai/docs/general/locations)

