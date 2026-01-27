# CineFlow API Nodes for ComfyUI
# 安装说明

## 快速安装

1. 将 `cineflow_api` 文件夹复制到 ComfyUI 的 `custom_nodes` 目录：
   ```bash
   cp -r cineflow_api /path/to/ComfyUI/custom_nodes/
   ```

2. 安装依赖：
   ```bash
   cd /path/to/ComfyUI/custom_nodes/cineflow_api
   pip install -r requirements.txt
   ```

3. 配置环境变量：
   ```bash
   # Google Cloud (Vertex AI)
   export GOOGLE_CLOUD_PROJECT="your-project-id"
   export GOOGLE_APPLICATION_CREDENTIALS="/path/to/vertex-key.json"

   # 火山方舟 (即梦)
   export ARK_API_KEY="your-ark-api-key"
   export ARK_ENDPOINT_ID="your-endpoint-id"  # 可选
   ```

4. 重启 ComfyUI

## 节点说明

### 🎨 Vertex AI Gemini
- 使用 Gemini 2.0 Flash 生成图片
- 支持自定义 temperature

### 🚀 Vertex AI Imagen 3
- 使用 Imagen 3 生成高质量图片
- 支持多种画幅比例
- 支持负面提示词

### 🎬 Vertex AI Veo 3.1
- 使用 Veo 3.1 / Veo 3.1 Fast 生成视频
- 支持 Image-to-Video (I2V)
- 支持 5-10 秒时长

### 🎨 火山方舟 即梦
- 使用即梦 4.5 生成图片
- 支持中文提示词
- 支持多种尺寸

## 工作流示例

在 ComfyUI 中创建工作流：

```
[Prompt 输入] → [CineFlow_VertexGemini] → [预览图片]
                      ↓
              [CineFlow_VertexVeo] → [保存视频]
```

## API 调用架构

```
CineFlow 前端
      ↓
Next.js API Route (/api/generate/workflow)
      ↓
ComfyUI Server (localhost:8188)
      ↓
CineFlow 自定义节点
      ↓
云端 API (Vertex AI / 火山方舟)
```
