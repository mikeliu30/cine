// DALL-E 3 图片生成 API
// POST /api/generate/dalle

import { NextRequest, NextResponse } from 'next/server';

const OPENAI_API_KEY = process.env.OPENAI_API_KEY || '';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    console.log('[DALL-E API] Request:', body);

    if (!body.prompt) {
      return NextResponse.json(
        { error: 'Missing required parameter: prompt' },
        { status: 400 }
      );
    }

    // 检查 API Key
    if (!OPENAI_API_KEY) {
      console.warn('[DALL-E API] No API key configured, using mock');
      return NextResponse.json({
        success: true,
        imageUrl: `https://picsum.photos/seed/dalle${Date.now()}/1024/1024`,
        message: '⚠️ DALL-E API key not configured, using mock image'
      });
    }

    // 调用 OpenAI DALL-E 3 API
    const response = await fetch('https://api.openai.com/v1/images/generations', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'dall-e-3',
        prompt: body.prompt,
        n: 1,
        size: body.size || '1024x1024',
        quality: body.quality || 'hd',
        style: body.style || 'vivid',
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('[DALL-E API] Error:', error);
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    console.log('[DALL-E API] Success');

    return NextResponse.json({
      success: true,
      imageUrl: data.data[0].url,
      revisedPrompt: data.data[0].revised_prompt, // DALL-E 3 会优化提示词
    });

  } catch (error: any) {
    console.error('[DALL-E API] Error:', error);
    
    // 降级到 mock
    return NextResponse.json({
      success: true,
      imageUrl: `https://picsum.photos/seed/dalle-fallback${Date.now()}/1024/1024`,
      warning: error.message,
    });
  }
}

