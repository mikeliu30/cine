// Prompt 增强 API - 使用 AI 优化用户的提示词
import { NextRequest, NextResponse } from 'next/server';

const BANANA_API_KEY = process.env.BANANA_API_KEY || '';

export async function POST(request: NextRequest) {
  try {
    const { prompt, type, style } = await request.json();

    if (!prompt) {
      return NextResponse.json({ error: 'Prompt is required' }, { status: 400 });
    }

    console.log('[Enhance] Original prompt:', prompt);
    console.log('[Enhance] Type:', type, 'Style:', style);

    // 如果没有配置 API Key，使用本地增强
    if (!BANANA_API_KEY) {
      const enhanced = localEnhance(prompt, type, style);
      return NextResponse.json({ enhanced });
    }

    // 使用 Gemini API 增强
    const systemPrompt = type === 'video' 
      ? `You are an expert at writing prompts for AI video generation. 
         Enhance the user's prompt to be more detailed and cinematic.
         Add camera movements, lighting, atmosphere, and motion descriptions.
         Keep it concise but vivid. Output only the enhanced prompt, nothing else.`
      : `You are an expert at writing prompts for AI image generation.
         Enhance the user's prompt to be more detailed and visually rich.
         Add composition, lighting, color palette, and artistic style details.
         Keep it concise but vivid. Output only the enhanced prompt, nothing else.`;

    const styleHint = style && style !== 'none' ? `Style preference: ${style}` : '';

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${BANANA_API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: `${systemPrompt}\n\n${styleHint}\n\nOriginal prompt: "${prompt}"\n\nEnhanced prompt:`
            }]
          }],
          generationConfig: {
            maxOutputTokens: 300,
            temperature: 0.7,
          }
        }),
      }
    );

    if (!response.ok) {
      console.error('[Enhance] API error:', response.status);
      const enhanced = localEnhance(prompt, type, style);
      return NextResponse.json({ enhanced });
    }

    const data = await response.json();
    const enhanced = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || localEnhance(prompt, type, style);

    console.log('[Enhance] Enhanced prompt:', enhanced);
    return NextResponse.json({ enhanced });

  } catch (error) {
    console.error('[Enhance] Error:', error);
    return NextResponse.json({ error: 'Enhancement failed' }, { status: 500 });
  }
}

// 本地增强（无 API 时的 fallback）
function localEnhance(prompt: string, type: string, style: string): string {
  const imageEnhancements = [
    'highly detailed',
    'professional photography',
    'cinematic lighting',
    'sharp focus',
    '8K resolution',
    'masterpiece quality',
  ];

  const videoEnhancements = [
    'smooth camera movement',
    'cinematic',
    'professional cinematography',
    'dynamic lighting',
    'high production value',
  ];

  const styleMap: Record<string, string> = {
    cinematic: 'cinematic color grading, dramatic lighting, film grain',
    anime: 'anime style, vibrant colors, clean lines, Studio Ghibli inspired',
    realistic: 'photorealistic, natural lighting, lifelike details',
    artistic: 'artistic interpretation, painterly style, creative composition',
    fantasy: 'fantasy art style, magical atmosphere, ethereal lighting',
  };

  const enhancements = type === 'video' ? videoEnhancements : imageEnhancements;
  const randomEnhancements = enhancements.sort(() => Math.random() - 0.5).slice(0, 3);
  
  let enhanced = prompt.trim();
  
  if (style && style !== 'none' && styleMap[style]) {
    enhanced += `, ${styleMap[style]}`;
  }
  
  enhanced += `, ${randomEnhancements.join(', ')}`;
  
  return enhanced;
}

