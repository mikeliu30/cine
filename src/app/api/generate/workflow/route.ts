// 通过 ComfyUI 工作流调用云端 API
// POST /api/generate/workflow
// 所有生成请求都经过 ComfyUI 节点化处理

import { NextRequest, NextResponse } from 'next/server';

const COMFYUI_URL = process.env.COMFYUI_URL || 'http://127.0.0.1:8188';

// CineFlow 节点工作流模板
function createGeminiWorkflow(params: {
  prompt: string;
  model?: string;
  temperature?: number;
}) {
  return {
    "1": {
      "inputs": {
        "prompt": params.prompt,
        "model": params.model || "gemini-2.0-flash-exp",
        "temperature": params.temperature || 1.0,
      },
      "class_type": "CineFlow_VertexGemini"
    },
    "2": {
      "inputs": {
        "filename_prefix": "CineFlow_Gemini",
        "images": ["1", 0]
      },
      "class_type": "SaveImage"
    }
  };
}

// Imagen 3 工作流
function createImagenWorkflow(params: {
  prompt: string;
  ratio?: string;
  negative_prompt?: string;
}) {
  return {
    "1": {
      "inputs": {
        "prompt": params.prompt,
        "aspect_ratio": params.ratio || "16:9",
        "negative_prompt": params.negative_prompt || "",
      },
      "class_type": "CineFlow_VertexImagen"
    },
    "2": {
      "inputs": {
        "filename_prefix": "CineFlow_Imagen",
        "images": ["1", 0]
      },
      "class_type": "SaveImage"
    }
  };
}

// Veo 3.1 视频工作流
function createVeoWorkflow(params: {
  prompt: string;
  model?: string;
  duration?: number;
  ratio?: string;
}) {
  return {
    "1": {
      "inputs": {
        "prompt": params.prompt,
        "model": params.model || "veo-3.1-fast",
        "duration": params.duration || 6,
        "aspect_ratio": params.ratio || "16:9",
      },
      "class_type": "CineFlow_VertexVeo"
    }
  };
}

// 即梦工作流
function createJimengWorkflow(params: {
  prompt: string;
  size?: string;
}) {
  return {
    "1": {
      "inputs": {
        "prompt": params.prompt,
        "size": params.size || "1920x1080",
      },
      "class_type": "CineFlow_ArkJimeng"
    },
    "2": {
      "inputs": {
        "filename_prefix": "CineFlow_Jimeng",
        "images": ["1", 0]
      },
      "class_type": "SaveImage"
    }
  };
}

// 比例转尺寸
function ratioToSize(ratio: string): string {
  const sizes: Record<string, string> = {
    '16:9': '1920x1080',
    '9:16': '1080x1920',
    '1:1': '1024x1024',
    '4:3': '1024x768',
  };
  return sizes[ratio] || '1920x1080';
}

// 提交工作流到 ComfyUI
async function queuePrompt(workflow: any): Promise<string> {
  const response = await fetch(`${COMFYUI_URL}/prompt`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      prompt: workflow,
      client_id: `cineflow_${Date.now()}`
    }),
  });

  if (!response.ok) {
    throw new Error(`ComfyUI error: ${await response.text()}`);
  }

  return (await response.json()).prompt_id;
}

// 轮询获取结果
async function pollForResult(promptId: string, maxWait = 120000): Promise<any> {
  const startTime = Date.now();

  while (Date.now() - startTime < maxWait) {
    const response = await fetch(`${COMFYUI_URL}/history/${promptId}`);

    if (response.ok) {
      const history = await response.json();
      if (history[promptId]?.outputs) {
        for (const nodeId in history[promptId].outputs) {
          const output = history[promptId].outputs[nodeId];
          if (output.images?.[0]) {
            return { type: 'image', data: output.images[0] };
          }
          if (output.video_path) {
            return { type: 'video', data: output.video_path };
          }
        }
      }
    }

    await new Promise(r => setTimeout(r, 500));
  }

  throw new Error('ComfyUI timeout');
}

// 获取图片数据
async function getImage(imageInfo: any): Promise<string> {
  const params = new URLSearchParams({
    filename: imageInfo.filename,
    subfolder: imageInfo.subfolder || '',
    type: imageInfo.type || 'output'
  });

  const response = await fetch(`${COMFYUI_URL}/view?${params}`);
  if (!response.ok) throw new Error('Failed to fetch image');

  const buffer = await response.arrayBuffer();
  return `data:image/png;base64,${Buffer.from(buffer).toString('base64')}`;
}

// POST 处理器
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { model, prompt, ratio, duration, negative_prompt } = body;

    console.log('[Workflow] Request:', { model, prompt, ratio });

    // 检查 ComfyUI 服务器
    try {
      await fetch(`${COMFYUI_URL}/system_stats`, { signal: AbortSignal.timeout(3000) });
    } catch {
      return NextResponse.json(
        { error: `ComfyUI not available at ${COMFYUI_URL}` },
        { status: 503 }
      );
    }

    let workflow: any;

    // 根据模型选择工作流（支持 workflow-* 前缀）
    const modelKey = model?.replace('workflow-', '') || '';

    switch (modelKey) {
      case 'gemini':
      case 'gemini-3-pro':
      case 'gemini-2.0-flash':
        workflow = createGeminiWorkflow({ prompt });
        break;

      case 'imagen':
      case 'vertex-ai':
      case 'imagen-3':
        workflow = createImagenWorkflow({ prompt, ratio, negative_prompt });
        break;

      case 'veo':
      case 'veo-3.1':
      case 'veo-3.1-fast':
        workflow = createVeoWorkflow({ prompt, model: modelKey, duration, ratio });
        break;

      case 'jimeng':
      case 'jimeng-4.5':
        workflow = createJimengWorkflow({ prompt, size: ratioToSize(ratio) });
        break;

      default:
        return NextResponse.json({ error: `Unknown model: ${model}` }, { status: 400 });
    }

    // 提交工作流
    const promptId = await queuePrompt(workflow);
    console.log('[Workflow] Prompt ID:', promptId);

    // 等待结果
    const result = await pollForResult(promptId);
    console.log('[Workflow] Result type:', result.type);

    if (result.type === 'image') {
      const imageUrl = await getImage(result.data);
      return NextResponse.json({ success: true, data: { image_url: imageUrl } });
    }

    if (result.type === 'video') {
      return NextResponse.json({ success: true, videoUrl: result.data });
    }

    throw new Error('Unknown result type');

  } catch (error: any) {
    console.error('[Workflow] Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
