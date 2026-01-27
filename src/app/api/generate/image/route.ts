// 图片生成 API Route
// POST /api/generate/image

import { NextRequest, NextResponse } from 'next/server';
import { GoogleAuth } from 'google-auth-library';
import * as path from 'path';
import { rateLimiter } from '@/lib/rateLimiter';

// 环境变量（服务端可访问）
const BANANA_API_KEY = process.env.BANANA_API_KEY || '';
const ARK_API_KEY = process.env.ARK_API_KEY || '';
const ARK_ENDPOINT_ID = process.env.ARK_ENDPOINT_ID || '';
const GOOGLE_CLOUD_PROJECT = process.env.GOOGLE_CLOUD_PROJECT || '';
const VERTEX_AI_LOCATION = process.env.VERTEX_AI_LOCATION || 'us-central1';

// Vertex AI Imagen 3 生成
async function generateWithVertexAI(params: any) {
  console.log('[Vertex AI] Using Imagen 3 for image generation');
  console.log('[Vertex AI] Project:', GOOGLE_CLOUD_PROJECT);
  console.log('[Vertex AI] Location:', VERTEX_AI_LOCATION);
  console.log('[Vertex AI] Original prompt:', params.prompt);

  // 获取认证 token
  // 支持两种方式：文件或环境变量
  let auth;

  if (process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON) {
    const credentials = JSON.parse(process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON);
    auth = new GoogleAuth({
      credentials,
      scopes: ['https://www.googleapis.com/auth/cloud-platform'],
    });
  } else {
    auth = new GoogleAuth({
      keyFilename: path.join(process.cwd(), 'vertex-key.json'),
      scopes: ['https://www.googleapis.com/auth/cloud-platform'],
    });
  }

  const client = await auth.getClient();
  const accessToken = await client.getAccessToken();

  if (!accessToken.token) {
    throw new Error('Failed to get access token');
  }

  // 检测是否包含中文，如果有则翻译成英文
  let finalPrompt = params.prompt;
  const hasChinese = /[\u4e00-\u9fa5]/.test(params.prompt);

  if (hasChinese && ARK_API_KEY) {
    console.log('[Vertex AI] Detected Chinese, translating to English via 豆包 API...');

    // 使用豆包 API 来翻译
    try {
      const arkUrl = 'https://ark.cn-beijing.volces.com/api/v3/chat/completions';

      const translateResponse = await fetch(arkUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${ARK_API_KEY}`,
        },
        body: JSON.stringify({
          model: 'doubao-1-5-lite-32k-250115',
          messages: [
            {
              role: 'system',
              content: 'You are a translator. Translate the Chinese image prompt to English. Output ONLY the English translation, nothing else.'
            },
            {
              role: 'user',
              content: params.prompt
            }
          ],
          temperature: 0.1,
          max_tokens: 256,
        }),
      });

      console.log('[Vertex AI] Translation response status:', translateResponse.status);

      if (translateResponse.ok) {
        const translateResult = await translateResponse.json();
        const translatedText = translateResult.choices?.[0]?.message?.content;
        if (translatedText) {
          finalPrompt = translatedText.trim();
          console.log('[Vertex AI] ✅ Translated prompt:', finalPrompt);
        }
      } else {
        const errorText = await translateResponse.text();
        console.log('[Vertex AI] ❌ Translation failed:', errorText);
      }
    } catch (e) {
      console.log('[Vertex AI] ❌ Translation error:', e);
    }
  }

  // 增强 prompt 以获得更好的效果
  const enhancedPrompt = `${finalPrompt}, high quality, detailed, professional photography, 8k resolution, sharp focus`;
  console.log('[Vertex AI] 🎨 Final enhanced prompt:', enhancedPrompt);

  // Vertex AI Imagen 3 端点
  const endpoint = `https://${VERTEX_AI_LOCATION}-aiplatform.googleapis.com/v1/projects/${GOOGLE_CLOUD_PROJECT}/locations/${VERTEX_AI_LOCATION}/publishers/google/models/imagen-3.0-generate-001:predict`;

  const requestBody = {
    instances: [{
      prompt: enhancedPrompt,
    }],
    parameters: {
      sampleCount: 1,
      aspectRatio: params.ratio === '16:9' ? '16:9' : params.ratio === '9:16' ? '9:16' : params.ratio === '4:3' ? '4:3' : '1:1',
      negativePrompt: params.negative_prompt || 'blurry, low quality, distorted, ugly, bad anatomy',
    },
  };

  console.log('[Vertex AI] Request:', JSON.stringify(requestBody, null, 2));

  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken.token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(requestBody),
  });

  const responseText = await response.text();
  console.log('[Vertex AI] Response status:', response.status);

  if (!response.ok) {
    throw new Error(`Vertex AI error (${response.status}): ${responseText}`);
  }

  const result = JSON.parse(responseText);

  // 解析 Vertex AI 响应
  if (result.predictions && result.predictions[0]?.bytesBase64Encoded) {
    return {
      success: true,
      data: {
        image_url: `data:image/png;base64,${result.predictions[0].bytesBase64Encoded}`,
      },
    };
  }

  throw new Error('No image in Vertex AI response: ' + responseText.substring(0, 500));
}

// Vertex AI Gemini 图片生成（企业级）
async function generateWithVertexGemini(params: any, modelName: string = 'gemini-2.0-flash-exp') {
  console.log('[Vertex Gemini] Using enterprise Gemini for image generation');
  console.log('[Vertex Gemini] Project:', GOOGLE_CLOUD_PROJECT);
  console.log('[Vertex Gemini] Model:', modelName);

  // 获取认证 token（使用服务账号）
  // 支持两种方式：
  // 1. 本地开发：使用 vertex-key.json 文件
  // 2. Vercel/生产环境：使用环境变量 GOOGLE_APPLICATION_CREDENTIALS_JSON
  let auth;

  if (process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON) {
    // Vercel 部署：从环境变量读取
    console.log('[Vertex Gemini] Using credentials from environment variable');
    const credentials = JSON.parse(process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON);
    auth = new GoogleAuth({
      credentials,
      scopes: ['https://www.googleapis.com/auth/cloud-platform'],
    });
  } else {
    // 本地开发：从文件读取
    console.log('[Vertex Gemini] Using credentials from file');
    auth = new GoogleAuth({
      keyFilename: path.join(process.cwd(), 'vertex-key.json'),
      scopes: ['https://www.googleapis.com/auth/cloud-platform'],
    });
  }

  const client = await auth.getClient();
  const accessToken = await client.getAccessToken();

  if (!accessToken.token) {
    throw new Error('Failed to get access token');
  }

  // 🔥 关键修复：Gemini 3 Pro 预览版模型必须使用 global 位置
  // gemini-3-pro-image-preview 只部署在全球端点，不支持区域端点
  const useGlobalLocation = modelName.includes('gemini-3-pro') || modelName.includes('preview');
  const location = useGlobalLocation ? 'global' : VERTEX_AI_LOCATION;

  console.log('[Vertex Gemini] Location:', location, useGlobalLocation ? '(using global for preview model)' : '');

  // Vertex AI Gemini 端点
  // 预览版模型使用全球端点：https://aiplatform.googleapis.com
  // 正式版模型使用区域端点：https://us-central1-aiplatform.googleapis.com
  const baseUrl = useGlobalLocation
    ? 'https://aiplatform.googleapis.com'
    : `https://${VERTEX_AI_LOCATION}-aiplatform.googleapis.com`;

  const endpoint = `${baseUrl}/v1/projects/${GOOGLE_CLOUD_PROJECT}/locations/${location}/publishers/google/models/${modelName}:generateContent`;

  // 🎨 构建 parts 数组（支持多模态输入）
  const parts: any[] = [];

  // 如果有参考图片，先添加图片
  if (params.reference_image) {
    console.log('[Vertex Gemini] 🖼️ Reference image provided, using image editing mode');

    // 解析 base64 图片数据
    // 格式: data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAA...
    const base64Match = params.reference_image.match(/^data:image\/(\w+);base64,(.+)$/);
    if (base64Match) {
      const mimeType = `image/${base64Match[1]}`;
      const base64Data = base64Match[2];

      parts.push({
        inlineData: {
          mimeType: mimeType,
          data: base64Data
        }
      });

      console.log('[Vertex Gemini] ✅ Reference image added (MIME:', mimeType, ')');
    } else {
      console.warn('[Vertex Gemini] ⚠️ Invalid reference image format, ignoring');
    }
  }

  // 🎨 增强提示词，确保模型理解这是图片生成请求
  let enhancedPrompt = params.prompt;

  if (params.reference_image) {
    // 如果有参考图片，使用编辑模式的提示词
    enhancedPrompt = `Based on the provided image, ${params.prompt}. Keep the overall style and composition, but make the requested changes.`;
    console.log('[Vertex Gemini] 🎨 Using image editing prompt');
  } else {
    // 检测是否是非常简短或对话式的提示词
    const isShortPrompt = params.prompt.length < 10;
    const isConversational = /^(你好|hello|hi|嗨|hey)/i.test(params.prompt.trim());

    if (isShortPrompt || isConversational) {
      // 将对话式提示词转换为图片生成提示词
      console.log('[Vertex Gemini] ⚠️ Detected conversational prompt, enhancing for image generation');
      enhancedPrompt = `Generate an image: ${params.prompt}. Create a beautiful, high-quality visual representation.`;
    }
  }

  console.log('[Vertex Gemini] Original prompt:', params.prompt);
  console.log('[Vertex Gemini] Enhanced prompt:', enhancedPrompt);

  // 添加文本提示词
  parts.push({
    text: enhancedPrompt
  });

  // 🔥 关键修复：强制只返回图片，不返回文本
  // 如果设置为 ['IMAGE', 'TEXT']，模型可能只返回文本而不生成图片
  const requestBody = {
    contents: [{
      role: 'user',
      parts: parts  // 使用构建好的 parts 数组（可能包含图片+文本）
    }],
    generationConfig: {
      responseModalities: ['IMAGE'],  // 只返回图片
      temperature: 1.0,
    }
  };

  console.log('[Vertex Gemini] Endpoint:', endpoint);
  console.log('[Vertex Gemini] Request:', JSON.stringify(requestBody, null, 2));

  // 🔥 使用速率限制器包装 API 调用
  const response = await rateLimiter.enqueue(async () => {
    console.log('[Vertex Gemini] 🚀 Sending request...');
    return fetch(endpoint, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken.token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });
  });

  const responseText = await response.text();
  console.log('[Vertex Gemini] Response status:', response.status);

  if (!response.ok) {
    throw new Error(`Vertex Gemini error (${response.status}): ${responseText}`);
  }

  const result = JSON.parse(responseText);

  // 解析 Gemini 响应，提取图片
  const candidates = result.candidates || [];
  if (candidates.length > 0) {
    const parts = candidates[0].content?.parts || [];
    for (const part of parts) {
      if (part.inlineData?.mimeType?.startsWith('image/')) {
        const base64Data = part.inlineData.data;
        const mimeType = part.inlineData.mimeType;

        // 计算图片大小（base64 解码后的大小）
        const sizeInBytes = Math.ceil(base64Data.length * 0.75);
        const sizeInMB = (sizeInBytes / (1024 * 1024)).toFixed(2);

        console.log('[Vertex Gemini] ✅ Image found! MIME type:', mimeType);
        console.log('[Vertex Gemini] 📦 Image size:', sizeInMB, 'MB');

        // ⚠️ 如果图片太大（超过 8MB），警告可能导致内存问题
        if (sizeInBytes > 8 * 1024 * 1024) {
          console.warn('[Vertex Gemini] ⚠️ Large image detected! This may cause memory issues.');
          console.warn('[Vertex Gemini] 💡 Consider using a lower resolution or compressing the image.');
        }

        return {
          success: true,
          data: {
            image_url: `data:${mimeType};base64,${base64Data}`
          }
        };
      }
    }
  }

  throw new Error('No image in Vertex Gemini response: ' + responseText.substring(0, 500));
}

// Gemini 图片生成（个人版 - Google AI Studio）
async function generateWithGemini(params: any, modelName: string = 'gemini-2.0-flash-exp-image-generation') {
  console.log('[Gemini] Using model:', modelName);
  console.log('[Gemini] API Key:', BANANA_API_KEY.substring(0, 15) + '...');

  const requestBody = {
    contents: [{
      parts: [{
        text: params.prompt
      }]
    }],
    generationConfig: {
      responseModalities: ["IMAGE", "TEXT"],
    }
  };

  console.log('[Gemini] Request body:', JSON.stringify(requestBody, null, 2));

  const url = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${BANANA_API_KEY}`;
  console.log('[Gemini] URL:', url.replace(BANANA_API_KEY, 'API_KEY_HIDDEN'));

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(requestBody),
  });

  const responseText = await response.text();
  console.log('[Gemini] Response status:', response.status);

  if (!response.ok) {
    throw new Error(`Gemini API error (${response.status}): ${responseText}`);
  }

  const result = JSON.parse(responseText);

  // 解析 Gemini 响应，提取图片
  const candidates = result.candidates || [];
  if (candidates.length > 0) {
    const parts = candidates[0].content?.parts || [];
    for (const part of parts) {
      if (part.inlineData?.mimeType?.startsWith('image/')) {
        // 返回 base64 图片
        console.log('[Gemini] Image found! MIME type:', part.inlineData.mimeType);
        return {
          success: true,
          data: {
            image_url: `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`
          }
        };
      }
    }
  }

  throw new Error('No image generated in response. Full response: ' + responseText.substring(0, 500));
}

// 即梦 4.5 API (火山方舟)
async function generateWithJimeng(params: any) {
  const sizeMap: Record<string, string> = {
    '16:9': '1920x1080',
    '9:16': '1080x1920',
    '1:1': '1024x1024',
    '4:3': '1024x768',
  };

  // 火山方舟需要使用 Endpoint ID，不是模型名称
  // 如果没有配置 Endpoint ID，尝试使用通用模型名
  const modelOrEndpoint = ARK_ENDPOINT_ID || 'doubao-seedream-3-0-t2i-250415';

  console.log(`[Jimeng] Using model/endpoint: ${modelOrEndpoint}`);

  const response = await fetch('https://ark.cn-beijing.volces.com/api/v3/images/generations', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${ARK_API_KEY}`,
    },
    body: JSON.stringify({
      model: modelOrEndpoint,
      prompt: params.prompt,
      size: sizeMap[params.ratio] || '1024x1024',
      n: 1,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Jimeng error: ${error}`);
  }

  return response.json();
}

// Mock 生成（用于测试）
async function generateWithMock(params: any) {
  const mockImages = [
    'https://picsum.photos/seed/gen1/1024/576',
    'https://picsum.photos/seed/gen2/1024/576',
    'https://picsum.photos/seed/gen3/1024/576',
    'https://picsum.photos/seed/gen4/1024/576',
    'https://picsum.photos/seed/gen5/1024/576',
  ];

  // 模拟延迟
  await new Promise(resolve => setTimeout(resolve, 2000));

  return {
    success: true,
    data: {
      image_url: mockImages[Math.floor(Math.random() * mockImages.length)] + `?t=${Date.now()}`,
      seed: Math.floor(Math.random() * 999999999),
    },
  };
}

export async function POST(request: NextRequest) {
  try {
    const params = await request.json();
    const { model, prompt, ratio, negative_prompt, seed, reference_image } = params;

    console.log(`[API] Generate image with model: ${model}`);
    console.log(`[API] Prompt: ${prompt}`);
    console.log(`[API] Reference image: ${reference_image ? '✅ Provided' : '❌ None'}`);
    console.log(`[API] ARK_API_KEY configured: ${!!ARK_API_KEY}`);
    console.log(`[API] BANANA_API_KEY configured: ${!!BANANA_API_KEY}`);
    console.log(`[API] GOOGLE_CLOUD_PROJECT configured: ${!!GOOGLE_CLOUD_PROJECT}`);

    let result;

    switch (model) {
      case 'vertex-ai':
      case 'imagen-3':
        if (!GOOGLE_CLOUD_PROJECT) {
          console.warn('[API] GOOGLE_CLOUD_PROJECT not configured, using mock');
          result = await generateWithMock(params);
        } else {
          result = await generateWithVertexAI(params);
        }
        break;

      case 'banana':
      case 'banana-pro':
        // 🍌 Banana Pro = Gemini 3 Pro Image Preview (最新的图片生成模型)
        if (!GOOGLE_CLOUD_PROJECT) {
          console.warn('[API] GOOGLE_CLOUD_PROJECT not configured, using mock');
          result = await generateWithMock(params);
        } else {
          // 使用 Gemini 3 Pro 预览版（支持 4K 分辨率）
          result = await generateWithVertexGemini(params, 'gemini-3-pro-image-preview');
        }
        break;

      case 'gemini':
      case 'gemini-2.0-flash':
        // Gemini 2.0 Flash (实验版)
        if (!GOOGLE_CLOUD_PROJECT) {
          console.warn('[API] GOOGLE_CLOUD_PROJECT not configured, using mock');
          result = await generateWithMock(params);
        } else {
          result = await generateWithVertexGemini(params, 'gemini-2.0-flash-exp');
        }
        break;

      case 'gemini-3-pro':
        // 企业级 Vertex AI Gemini (使用最新的图片生成模型)
        if (!GOOGLE_CLOUD_PROJECT) {
          console.warn('[API] GOOGLE_CLOUD_PROJECT not configured, using mock');
          result = await generateWithMock(params);
        } else {
          // 🔥 使用 Vertex AI 调用 gemini-3-pro-image-preview (Banana Pro - Gemini 3 全球预览版)
          // 注意：此模型仅在 global 端点可用，不支持区域端点
          result = await generateWithVertexGemini(params, 'gemini-3-pro-image-preview');
        }
        break;

      case 'gemini-2.5-pro':
        // 企业级 Vertex AI Gemini 2.5 Pro (已下线，回退到 Gemini 3)
        if (!GOOGLE_CLOUD_PROJECT) {
          console.warn('[API] GOOGLE_CLOUD_PROJECT not configured, using mock');
          result = await generateWithMock(params);
        } else {
          // ⚠️ gemini-2.5-flash-image-preview 已于 2026-01-15 下线
          // 回退到 gemini-3-pro-image-preview
          console.warn('[API] gemini-2.5-flash-image is deprecated, using gemini-3-pro-image-preview instead');
          result = await generateWithVertexGemini(params, 'gemini-3-pro-image-preview');
        }
        break;

      case 'jimeng-4.5':
      case 'jimeng':
        if (!ARK_API_KEY) {
          console.warn('[API] ARK_API_KEY not configured, using mock');
          result = await generateWithMock(params);
        } else {
          result = await generateWithJimeng(params);
        }
        break;

      case 'mock':
      default:
        result = await generateWithMock(params);
        break;
    }

    // 只打印结果结构，不打印完整的 base64 数据
    console.log('[API] Result keys:', Object.keys(result || {}));

    // 统一返回格式 - 支持多种可能的格式
    let imageUrl = null;
    let seedValue = 0;

    // 格式1: result.data.image_url
    if (result.data?.image_url) {
      imageUrl = result.data.image_url;
      seedValue = result.data.seed || 0;
    }
    // 格式2: result.data.images[0].url
    else if (result.data?.images?.[0]?.url) {
      imageUrl = result.data.images[0].url;
      seedValue = result.data.images[0].seed || 0;
    }
    // 格式3: result.data.images[0] (直接是 URL 字符串)
    else if (typeof result.data?.images?.[0] === 'string') {
      imageUrl = result.data.images[0];
    }
    // 格式4: result.data[0].url (火山方舟格式)
    else if (result.data?.[0]?.url) {
      imageUrl = result.data[0].url;
      seedValue = result.data[0].seed || 0;
    }
    // 格式5: result.data[0].b64_json (base64 格式)
    else if (result.data?.[0]?.b64_json) {
      imageUrl = `data:image/png;base64,${result.data[0].b64_json}`;
    }

    console.log('[API] Image generated:', imageUrl ? '✅ Success' : '❌ Failed');

    if (!imageUrl) {
      console.error('[API] Could not parse image URL from result');
      // 返回 mock 图片作为 fallback
      imageUrl = `https://picsum.photos/seed/fallback${Date.now()}/1024/576`;
    }

    return NextResponse.json({
      success: true,
      data: {
        image_url: imageUrl,
        seed: seedValue,
      },
    });

  } catch (error) {
    console.error('[API] Generation error:', error);

    // 出错时返回 mock 图片
    const fallbackUrl = `https://picsum.photos/seed/error${Date.now()}/1024/576`;

    return NextResponse.json({
      success: true,
      data: {
        image_url: fallbackUrl,
        seed: 0,
      },
      warning: error instanceof Error ? error.message : 'Unknown error, using fallback image',
    });
  }
}

