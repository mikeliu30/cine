// Stable Diffusion XL 适配器
// 使用 Replicate API 或自建服务

import { GenerationAdapter, GenerationParams } from '@/types/generation';

class StableDiffusionAdapterClass implements GenerationAdapter {
  readonly name = 'Stable Diffusion XL';

  async generate(params: GenerationParams): Promise<string> {
    console.log('[SDXL] Starting generation with params:', params);

    // 调用 API Route
    const response = await fetch('/api/generate/sdxl', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        prompt: params.prompt,
        negative_prompt: params.negative_prompt || 'blurry, low quality, distorted',
        width: this.getWidth(params.ratio),
        height: this.getHeight(params.ratio),
        num_inference_steps: params.steps || 50,
        guidance_scale: params.cfg_scale || 7.5,
        seed: params.seed,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`SDXL API error: ${error}`);
    }

    const data = await response.json();
    
    if (!data.success || !data.imageUrl) {
      throw new Error('No image returned from SDXL');
    }

    return data.imageUrl;
  }

  async getStatus(taskId: string): Promise<{ status: string; progress: number }> {
    // 同步生成
    return { status: 'succeeded', progress: 100 };
  }

  async getResult(taskId: string): Promise<{ url: string; seed: number } | null> {
    return null;
  }

  // 根据画幅比例计算宽度
  private getWidth(ratio: string): number {
    const widthMap: Record<string, number> = {
      '16:9': 1344,
      '9:16': 768,
      '1:1': 1024,
      '4:3': 1024,
    };
    return widthMap[ratio] || 1024;
  }

  // 根据画幅比例计算高度
  private getHeight(ratio: string): number {
    const heightMap: Record<string, number> = {
      '16:9': 768,
      '9:16': 1344,
      '1:1': 1024,
      '4:3': 768,
    };
    return heightMap[ratio] || 1024;
  }
}

export const StableDiffusionAdapter = new StableDiffusionAdapterClass();

