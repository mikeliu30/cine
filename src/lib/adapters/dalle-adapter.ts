// DALL-E 3 适配器
// 使用 OpenAI API 生成图片

import { GenerationAdapter, GenerationParams } from '@/types/generation';

class DallEAdapterClass implements GenerationAdapter {
  readonly name = 'DALL-E 3';

  async generate(params: GenerationParams): Promise<string> {
    console.log('[DALL-E] Starting generation with params:', params);

    // 调用 API Route
    const response = await fetch('/api/generate/dalle', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        prompt: params.prompt,
        size: this.mapRatioToSize(params.ratio),
        quality: 'hd', // 使用高清质量
        style: 'vivid', // 生动风格
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`DALL-E API error: ${error}`);
    }

    const data = await response.json();
    
    if (!data.success || !data.imageUrl) {
      throw new Error('No image returned from DALL-E');
    }

    return data.imageUrl;
  }

  async getStatus(taskId: string): Promise<{ status: string; progress: number }> {
    // DALL-E 是同步生成，不需要轮询
    return { status: 'succeeded', progress: 100 };
  }

  async getResult(taskId: string): Promise<{ url: string; seed: number } | null> {
    // DALL-E 是同步生成，结果已在 generate 中返回
    return null;
  }

  // 映射画幅比例到 DALL-E 支持的尺寸
  private mapRatioToSize(ratio: string): string {
    const sizeMap: Record<string, string> = {
      '1:1': '1024x1024',
      '16:9': '1792x1024',
      '9:16': '1024x1792',
      '4:3': '1024x1024', // DALL-E 不支持 4:3，使用 1:1
    };
    return sizeMap[ratio] || '1024x1024';
  }
}

export const DallEAdapter = new DallEAdapterClass();

