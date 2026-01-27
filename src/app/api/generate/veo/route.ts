// Veo 2 视频生成 API
// POST /api/generate/veo

import { NextRequest, NextResponse } from 'next/server';
import { GoogleAuth } from 'google-auth-library';
import * as path from 'path';

const GOOGLE_CLOUD_PROJECT = process.env.GOOGLE_CLOUD_PROJECT || '';
const VERTEX_AI_LOCATION = process.env.VERTEX_AI_LOCATION || 'us-central1';
const ARK_API_KEY = process.env.ARK_API_KEY || '';

// 获取 Google Auth Token
async function getAccessToken() {
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
  
  return accessToken.token;
}

// 翻译中文提示词
async function translatePrompt(prompt: string): Promise<string> {
  const hasChinese = /[\u4e00-\u9fa5]/.test(prompt);
  if (!hasChinese || !ARK_API_KEY) {
    return prompt;
  }

  console.log('[Veo] Translating Chinese prompt...');
  
  try {
    const response = await fetch('https://ark.cn-beijing.volces.com/api/v3/chat/completions', {
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
            content: 'You are a translator. Translate the Chinese video prompt to English. Output ONLY the English translation, nothing else.' 
          },
          { role: 'user', content: prompt }
        ],
        temperature: 0.1,
        max_tokens: 256,
      }),
    });

    if (response.ok) {
      const data = await response.json();
      const translated = data.choices?.[0]?.message?.content;
      if (translated) {
        console.log('[Veo] Translated:', translated.trim());
        return translated.trim();
      }
    }
  } catch (error) {
    console.error('[Veo] Translation error:', error);
  }

  return prompt;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    console.log('[Veo API] Request:', body);

    if (!body.prompt) {
      return NextResponse.json(
        { error: 'Missing required parameter: prompt' },
        { status: 400 }
      );
    }

    // 检查是否配置了 Google Cloud
    if (!GOOGLE_CLOUD_PROJECT) {
      console.warn('[Veo API] No Google Cloud project configured, using mock');
      return NextResponse.json({
        success: true,
        videoUrl: 'https://storage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
        duration: body.duration || 6,
        message: '⚠️ Google Cloud not configured, using mock video'
      });
    }

    const accessToken = await getAccessToken();
    
    // 翻译并增强提示词
    const translatedPrompt = await translatePrompt(body.prompt);
    const enhancedPrompt = `${translatedPrompt}, cinematic, high quality, smooth motion`;
    
    console.log('[Veo API] Enhanced prompt:', enhancedPrompt);

    // Veo 2 端点
    const endpoint = `https://${VERTEX_AI_LOCATION}-aiplatform.googleapis.com/v1/projects/${GOOGLE_CLOUD_PROJECT}/locations/${VERTEX_AI_LOCATION}/publishers/google/models/veo-2.0-generate-001:predictLongRunning`;

    const requestBody: any = {
      instances: [{
        prompt: enhancedPrompt,
      }],
      parameters: {
        aspectRatio: body.ratio || '16:9',
        sampleCount: 1,
      },
    };

    // 如果有参考图片（Image-to-Video）
    if (body.reference_image) {
      console.log('[Veo API] Using reference image for I2V');
      const base64Data = body.reference_image.includes(',')
        ? body.reference_image.split(',')[1]
        : body.reference_image;
      requestBody.instances[0].image = {
        bytesBase64Encoded: base64Data,
      };
    }

    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('[Veo API] Error:', error);
      throw new Error(`Veo API error: ${response.status}`);
    }

    const result = await response.json();
    console.log('[Veo API] Operation started:', result.name);

    // 返回操作名称，前端需要轮询
    return NextResponse.json({
      success: true,
      operationName: result.name,
      status: 'processing',
    });

  } catch (error: any) {
    console.error('[Veo API] Error:', error);
    
    // 降级到 mock
    return NextResponse.json({
      success: true,
      videoUrl: 'https://storage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
      duration: 6,
      warning: error.message,
    });
  }
}

