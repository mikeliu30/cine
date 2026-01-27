// ComfyUI 后端包裹 API Route
// POST /api/generate/comfyui
// 支持本地 ComfyUI 服务器

import { NextRequest, NextResponse } from 'next/server';

// ComfyUI 服务器地址（默认本地）
const COMFYUI_URL = process.env.COMFYUI_URL || 'http://127.0.0.1:8188';

// 模型映射 - 将前端模型名映射到 ComfyUI checkpoint 文件名
const MODEL_MAP: Record<string, string> = {
  'comfyui-sdxl': 'sd_xl_base_1.0.safetensors',
  'comfyui-flux': 'flux1-dev.safetensors',
  'comfyui-sd15': 'v1-5-pruned-emaonly.safetensors',
};

// 获取实际的 checkpoint 文件名
function getCheckpointName(model?: string): string {
  if (!model) return MODEL_MAP['comfyui-sdxl'];
  return MODEL_MAP[model] || model;
}

// 基础文生图工作流模板
function createTxt2ImgWorkflow(params: {
  prompt: string;
  negative_prompt?: string;
  width: number;
  height: number;
  steps?: number;
  cfg?: number;
  seed?: number;
  model?: string;
}) {
  const seed = params.seed ?? Math.floor(Math.random() * 999999999);

  return {
    "3": {
      "inputs": {
        "seed": seed,
        "steps": params.steps || 20,
        "cfg": params.cfg || 7,
        "sampler_name": "euler",
        "scheduler": "normal",
        "denoise": 1,
        "model": ["4", 0],
        "positive": ["6", 0],
        "negative": ["7", 0],
        "latent_image": ["5", 0]
      },
      "class_type": "KSampler"
    },
    "4": {
      "inputs": {
        "ckpt_name": getCheckpointName(params.model)
      },
      "class_type": "CheckpointLoaderSimple"
    },
    "5": {
      "inputs": {
        "width": params.width,
        "height": params.height,
        "batch_size": 1
      },
      "class_type": "EmptyLatentImage"
    },
    "6": {
      "inputs": {
        "text": params.prompt,
        "clip": ["4", 1]
      },
      "class_type": "CLIPTextEncode"
    },
    "7": {
      "inputs": {
        "text": params.negative_prompt || "blurry, low quality, distorted",
        "clip": ["4", 1]
      },
      "class_type": "CLIPTextEncode"
    },
    "8": {
      "inputs": {
        "samples": ["3", 0],
        "vae": ["4", 2]
      },
      "class_type": "VAEDecode"
    },
    "9": {
      "inputs": {
        "filename_prefix": "CineFlow",
        "images": ["8", 0]
      },
      "class_type": "SaveImage"
    }
  };
}

// 图生图工作流模板
function createImg2ImgWorkflow(params: {
  prompt: string;
  negative_prompt?: string;
  image_base64: string;
  width: number;
  height: number;
  steps?: number;
  cfg?: number;
  denoise?: number;
  seed?: number;
  model?: string;
}) {
  const seed = params.seed ?? Math.floor(Math.random() * 999999999);

  return {
    "1": {
      "inputs": {
        "image": params.image_base64
      },
      "class_type": "LoadImageBase64"
    },
    "3": {
      "inputs": {
        "seed": seed,
        "steps": params.steps || 20,
        "cfg": params.cfg || 7,
        "sampler_name": "euler",
        "scheduler": "normal",
        "denoise": params.denoise || 0.75,
        "model": ["4", 0],
        "positive": ["6", 0],
        "negative": ["7", 0],
        "latent_image": ["10", 0]
      },
      "class_type": "KSampler"
    },
    "4": {
      "inputs": {
        "ckpt_name": getCheckpointName(params.model)
      },
      "class_type": "CheckpointLoaderSimple"
    },
    "6": {
      "inputs": {
        "text": params.prompt,
        "clip": ["4", 1]
      },
      "class_type": "CLIPTextEncode"
    },
    "7": {
      "inputs": {
        "text": params.negative_prompt || "blurry, low quality, distorted",
        "clip": ["4", 1]
      },
      "class_type": "CLIPTextEncode"
    },
    "8": {
      "inputs": {
        "samples": ["3", 0],
        "vae": ["4", 2]
      },
      "class_type": "VAEDecode"
    },
    "9": {
      "inputs": {
        "filename_prefix": "CineFlow",
        "images": ["8", 0]
      },
      "class_type": "SaveImage"
    },
    "10": {
      "inputs": {
        "pixels": ["1", 0],
        "vae": ["4", 2]
      },
      "class_type": "VAEEncode"
    }
  };
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
    const error = await response.text();
    throw new Error(`ComfyUI queue error: ${error}`);
  }

  const result = await response.json();
  return result.prompt_id;
}

// 轮询获取结果
async function pollForResult(promptId: string, maxWait: number = 120000): Promise<any> {
  const startTime = Date.now();

  while (Date.now() - startTime < maxWait) {
    const response = await fetch(`${COMFYUI_URL}/history/${promptId}`);

    if (response.ok) {
      const history = await response.json();

      if (history[promptId]) {
        const outputs = history[promptId].outputs;

        // 查找 SaveImage 节点的输出
        for (const nodeId in outputs) {
          if (outputs[nodeId].images) {
            const image = outputs[nodeId].images[0];
            return {
              filename: image.filename,
              subfolder: image.subfolder || '',
              type: image.type || 'output'
            };
          }
        }
      }
    }

    // 等待 500ms 后重试
    await new Promise(resolve => setTimeout(resolve, 500));
  }

  throw new Error('ComfyUI generation timeout');
}

// 获取图片数据
async function getImage(filename: string, subfolder: string, type: string): Promise<string> {
  const params = new URLSearchParams({
    filename,
    subfolder,
    type
  });

  const response = await fetch(`${COMFYUI_URL}/view?${params}`);

  if (!response.ok) {
    throw new Error('Failed to fetch image from ComfyUI');
  }

  const buffer = await response.arrayBuffer();
  const base64 = Buffer.from(buffer).toString('base64');

  return `data:image/png;base64,${base64}`;
}

// 解析比例到宽高
function ratioToSize(ratio: string): { width: number; height: number } {
  const sizes: Record<string, { width: number; height: number }> = {
    '16:9': { width: 1344, height: 768 },
    '9:16': { width: 768, height: 1344 },
    '1:1': { width: 1024, height: 1024 },
    '4:3': { width: 1152, height: 896 },
  };
  return sizes[ratio] || sizes['16:9'];
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { prompt, negative_prompt, ratio, seed, steps, cfg, reference_image, model } = body;

    console.log('[ComfyUI] Generation request:', { prompt, ratio, model });

    if (!prompt) {
      return NextResponse.json(
        { error: 'Missing required parameter: prompt' },
        { status: 400 }
      );
    }

    // 检查 ComfyUI 服务器是否可用
    try {
      const healthCheck = await fetch(`${COMFYUI_URL}/system_stats`, {
        signal: AbortSignal.timeout(3000)
      });
      if (!healthCheck.ok) {
        throw new Error('ComfyUI server not responding');
      }
    } catch (e) {
      console.error('[ComfyUI] Server not available:', e);
      return NextResponse.json(
        { error: `ComfyUI server not available at ${COMFYUI_URL}. Please start ComfyUI first.` },
        { status: 503 }
      );
    }

    const size = ratioToSize(ratio || '16:9');
    let workflow;

    // 根据是否有参考图选择工作流
    if (reference_image) {
      // 图生图
      const imageBase64 = reference_image.includes(',')
        ? reference_image.split(',')[1]
        : reference_image;

      workflow = createImg2ImgWorkflow({
        prompt,
        negative_prompt,
        image_base64: imageBase64,
        width: size.width,
        height: size.height,
        steps,
        cfg,
        seed,
        model,
      });
    } else {
      // 文生图
      workflow = createTxt2ImgWorkflow({
        prompt,
        negative_prompt,
        width: size.width,
        height: size.height,
        steps,
        cfg,
        seed,
        model,
      });
    }

    console.log('[ComfyUI] Submitting workflow...');

    // 提交工作流
    const promptId = await queuePrompt(workflow);
    console.log('[ComfyUI] Prompt ID:', promptId);

    // 轮询等待结果
    console.log('[ComfyUI] Waiting for result...');
    const imageInfo = await pollForResult(promptId);
    console.log('[ComfyUI] Image info:', imageInfo);

    // 获取图片
    const imageUrl = await getImage(
      imageInfo.filename,
      imageInfo.subfolder,
      imageInfo.type
    );

    console.log('[ComfyUI] ✅ Generation complete');

    return NextResponse.json({
      success: true,
      data: {
        image_url: imageUrl,
        seed: seed || 0,
        prompt_id: promptId,
      },
    });

  } catch (error: any) {
    console.error('[ComfyUI] Error:', error);
    return NextResponse.json(
      { error: error.message || 'ComfyUI generation failed' },
      { status: 500 }
    );
  }
}
