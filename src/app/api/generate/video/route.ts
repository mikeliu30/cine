// 视频生成 API Route
// POST /api/generate/video
// 使用 Google Veo 2.0 (异步生成)

import { NextRequest, NextResponse } from 'next/server';
import { GoogleAuth } from 'google-auth-library';
import * as path from 'path';

// 环境变量
const GOOGLE_CLOUD_PROJECT = process.env.GOOGLE_CLOUD_PROJECT || '';
const VERTEX_AI_LOCATION = process.env.VERTEX_AI_LOCATION || 'us-central1';
const ARK_API_KEY = process.env.ARK_API_KEY || '';

// 获取 Google Auth Token
async function getAccessToken() {
  const auth = new GoogleAuth({
    keyFilename: path.join(process.cwd(), 'vertex-key.json'),
    scopes: ['https://www.googleapis.com/auth/cloud-platform'],
  });
  const client = await auth.getClient();
  const accessToken = await client.getAccessToken();
  if (!accessToken.token) {
    throw new Error('Failed to get access token');
  }
  return accessToken.token;
}

// 翻译中文 prompt 到英文
async function translatePrompt(prompt: string): Promise<string> {
  const hasChinese = /[\u4e00-\u9fa5]/.test(prompt);
  if (!hasChinese || !ARK_API_KEY) {
    return prompt;
  }

  console.log('[Veo] Detected Chinese, translating to English via Doubao...');
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
          { role: 'system', content: 'You are a translator. Translate the Chinese video prompt to English. Output ONLY the English translation, nothing else.' },
          { role: 'user', content: prompt }
        ],
        temperature: 0.1,
        max_tokens: 256,
      }),
    });

    if (translateResponse.ok) {
      const translateResult = await translateResponse.json();
      const translatedText = translateResult.choices?.[0]?.message?.content;
      if (translatedText) {
        console.log('[Veo] ✅ Translated prompt:', translatedText.trim());
        return translatedText.trim();
      }
    }
  } catch (e) {
    console.log('[Veo] ❌ Translation error:', e);
  }
  return prompt;
}

// Veo 2.0 视频生成（异步 LRO）
async function generateWithVeo2(params: any) {
  console.log('[Veo2] Starting video generation');
  console.log('[Veo2] Project:', GOOGLE_CLOUD_PROJECT);
  console.log('[Veo2] Location:', VERTEX_AI_LOCATION);
  console.log('[Veo2] Prompt:', params.prompt);

  const accessToken = await getAccessToken();

  // 翻译并增强 prompt
  const translatedPrompt = await translatePrompt(params.prompt);
  const enhancedPrompt = `${translatedPrompt}, cinematic, high quality, smooth motion`;
  console.log('[Veo2] 🎬 Final enhanced prompt:', enhancedPrompt);

  // Veo 2.0 使用 predictLongRunning 端点（异步 LRO）
  // 注意：Veo 可能需要特定区域，如 us-central1
  const endpoint = `https://${VERTEX_AI_LOCATION}-aiplatform.googleapis.com/v1/projects/${GOOGLE_CLOUD_PROJECT}/locations/${VERTEX_AI_LOCATION}/publishers/google/models/veo-2.0-generate-001:predictLongRunning`;

  const requestBody: any = {
    instances: [{
      prompt: enhancedPrompt,
    }],
    parameters: {
      aspectRatio: params.ratio || '16:9',
      sampleCount: 1,
    },
  };

  // 如果有参考图片（Image-to-Video）
  if (params.reference_image) {
    console.log('[Veo2] Using reference image for I2V');
    const base64Data = params.reference_image.includes(',')
      ? params.reference_image.split(',')[1]
      : params.reference_image;
    requestBody.instances[0].image = {
      bytesBase64Encoded: base64Data,
    };
  }

  console.log('[Veo2] Request endpoint:', endpoint);

  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(requestBody),
  });

  console.log('[Veo2] Response status:', response.status);

  if (!response.ok) {
    const errorText = await response.text();
    console.error('[Veo2] ❌ Error:', errorText);
    throw new Error(`Veo API error: ${response.status} - ${errorText}`);
  }

  const result = await response.json();
  console.log('[Veo2] ✅ Operation started:', result.name);

  // 返回操作名称，前端需要轮询
  return {
    operationName: result.name,
    status: 'processing',
  };
}

// 检查操作状态
async function checkOperationStatus(operationName: string) {
  const accessToken = await getAccessToken();

  const endpoint = `https://${VERTEX_AI_LOCATION}-aiplatform.googleapis.com/v1/${operationName}`;

  const response = await fetch(endpoint, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
    },
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Operation check failed: ${response.status} - ${errorText}`);
  }

  const result = await response.json();
  console.log('[Veo2] Operation status:', result.done ? 'DONE' : 'PROCESSING');

  if (result.done) {
    if (result.error) {
      throw new Error(`Video generation failed: ${result.error.message}`);
    }

    // 提取视频数据
    const videoData = result.response?.generatedSamples?.[0]?.video?.bytesBase64Encoded;
    if (videoData) {
      return {
        status: 'succeeded',
        videoUrl: `data:video/mp4;base64,${videoData}`,
      };
    }

    // 或者可能是 URI
    const videoUri = result.response?.generatedSamples?.[0]?.video?.uri;
    if (videoUri) {
      return {
        status: 'succeeded',
        videoUrl: videoUri,
      };
    }

    throw new Error('No video data in response');
  }

  return {
    status: 'processing',
    operationName,
  };
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    console.log('[API] Video generation request:', body);

    // 验证必需参数
    if (!body.prompt) {
      return NextResponse.json(
        { error: 'Missing required parameter: prompt' },
        { status: 400 }
      );
    }

    // 检查是否是轮询操作状态
    if (body.operationName) {
      console.log('[API] Checking operation status:', body.operationName);
      const result = await checkOperationStatus(body.operationName);
      return NextResponse.json({
        success: true,
        ...result,
      });
    }

    // 🧪 Mock 模式 - 返回测试视频
    if (body.model === 'mock') {
      console.log('[API] Using mock video generation');
      return NextResponse.json({
        success: true,
        status: 'completed',
        video_url: 'https://storage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
        message: '🧪 Mock 模式：返回测试视频'
      });
    }

    // 使用 Veo 2.0 生成视频（异步）
    const result = await generateWithVeo2(body);

    return NextResponse.json({
      success: true,
      ...result,
    });

  } catch (error: any) {
    console.error('[API] Video generation error:', error);
    return NextResponse.json(
      { error: error.message || 'Video generation failed' },
      { status: 500 }
    );
  }
}