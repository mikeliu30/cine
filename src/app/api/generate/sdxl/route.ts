// Stable Diffusion XL 图片生成 API
// POST /api/generate/sdxl
// 使用 Replicate API

import { NextRequest, NextResponse } from 'next/server';

const REPLICATE_API_KEY = process.env.REPLICATE_API_KEY || '';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    console.log('[SDXL API] Request:', body);

    if (!body.prompt) {
      return NextResponse.json(
        { error: 'Missing required parameter: prompt' },
        { status: 400 }
      );
    }

    // 检查 API Key
    if (!REPLICATE_API_KEY) {
      console.warn('[SDXL API] No API key configured, using mock');
      return NextResponse.json({
        success: true,
        imageUrl: `https://picsum.photos/seed/sdxl${Date.now()}/${body.width || 1024}/${body.height || 1024}`,
        message: '⚠️ Replicate API key not configured, using mock image'
      });
    }

    // 调用 Replicate SDXL API
    const response = await fetch('https://api.replicate.com/v1/predictions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Token ${REPLICATE_API_KEY}`,
      },
      body: JSON.stringify({
        version: 'stability-ai/sdxl:39ed52f2a78e934b3ba6e2a89f5b1c712de7dfea535525255b1aa35c5565e08b',
        input: {
          prompt: body.prompt,
          negative_prompt: body.negative_prompt || 'blurry, low quality, distorted',
          width: body.width || 1024,
          height: body.height || 1024,
          num_inference_steps: body.num_inference_steps || 50,
          guidance_scale: body.guidance_scale || 7.5,
          seed: body.seed,
        },
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('[SDXL API] Error:', error);
      throw new Error(`Replicate API error: ${response.status}`);
    }

    const prediction = await response.json();
    console.log('[SDXL API] Prediction started:', prediction.id);

    // Replicate 是异步的，需要轮询结果
    const result = await pollPrediction(prediction.id);

    return NextResponse.json({
      success: true,
      imageUrl: result.output[0], // 返回第一张图片
      seed: body.seed,
    });

  } catch (error: any) {
    console.error('[SDXL API] Error:', error);
    
    // 降级到 mock
    return NextResponse.json({
      success: true,
      imageUrl: `https://picsum.photos/seed/sdxl-fallback${Date.now()}/1024/1024`,
      warning: error.message,
    });
  }
}

// 轮询 Replicate 预测结果
async function pollPrediction(predictionId: string, maxAttempts = 60): Promise<any> {
  for (let i = 0; i < maxAttempts; i++) {
    const response = await fetch(`https://api.replicate.com/v1/predictions/${predictionId}`, {
      headers: {
        'Authorization': `Token ${REPLICATE_API_KEY}`,
      },
    });

    const prediction = await response.json();

    if (prediction.status === 'succeeded') {
      return prediction;
    }

    if (prediction.status === 'failed') {
      throw new Error('SDXL generation failed');
    }

    // 等待 2 秒后重试
    await new Promise(resolve => setTimeout(resolve, 2000));
  }

  throw new Error('SDXL generation timeout');
}

