// Banana Pro 图片生成适配器
// API 文档: https://gateway.bananapro.site

import { GenerationAdapter, GenerationParams } from '@/types/generation';
import { MockAdapter } from './mock-adapter';

interface BananaProResponse {
  success?: boolean;
  task_id?: string;
  data?: {
    image_url?: string;
    images?: string[];
    seed?: number;
  };
  error?: string;
  status?: string;
  progress?: number;
}

class BananaProAdapterClass implements GenerationAdapter {
  readonly name = 'Banana Pro';
  private apiKey: string;
  private baseUrl = 'https://gateway.bananapro.site/api/v1';

  constructor() {
    this.apiKey = process.env.BANANA_API_KEY || '';
  }

  // 画幅比例映射
  private mapAspectRatio(ratio: string): string {
    const ratioMap: Record<string, string> = {
      '16:9': '16:9',
      '9:16': '9:16',
      '1:1': '1:1',
      '4:3': '4:3',
    };
    return ratioMap[ratio] || '16:9';
  }

  // 存储同步返回的结果
  private syncResults: Map<string, { url: string; seed: number }> = new Map();

  async generate(params: GenerationParams): Promise<string> {
    // 如果没有配置 API Key，回退到 Mock
    if (!this.apiKey) {
      console.warn('[BananaPro] API Key not configured, falling back to Mock');
      return MockAdapter.generate(params);
    }

    try {
      const response = await fetch(`${this.baseUrl}/images/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({
          model: 'nano-banana-pro',
          prompt: params.prompt,
          resolution: '2K',
          aspect_ratio: this.mapAspectRatio(params.ratio),
          negative_prompt: params.negative_prompt,
          seed: params.seed,
        }),
      });

      if (!response.ok) {
        const error = await response.text();
        console.error(`[BananaPro] API error: ${response.status} - ${error}`);
        console.warn('[BananaPro] Falling back to Mock');
        return MockAdapter.generate(params);
      }

      const data: BananaProResponse = await response.json();

      if (data.error) {
        console.error(`[BananaPro] Error: ${data.error}`);
        return MockAdapter.generate(params);
      }

      // 如果是同步返回图片
      if (data.data?.image_url || data.data?.images?.length) {
        const imageUrl = data.data.image_url || data.data.images?.[0];
        const taskId = `bp_sync_${Date.now()}`;
        this.syncResults.set(taskId, {
          url: imageUrl!,
          seed: data.data.seed || 0,
        });
        return taskId;
      }

      // 如果是异步返回 task_id
      if (data.task_id) {
        return data.task_id;
      }

      console.warn('[BananaPro] No task_id or image returned, falling back to Mock');
      return MockAdapter.generate(params);

    } catch (error) {
      console.error('[BananaPro] Request failed:', error);
      console.warn('[BananaPro] Falling back to Mock');
      return MockAdapter.generate(params);
    }
  }

  async getStatus(taskId: string): Promise<{ status: string; progress: number }> {
    // 如果是同步结果
    if (taskId.startsWith('bp_sync_')) {
      return { status: 'succeeded', progress: 100 };
    }

    // 如果是 Mock 任务
    if (taskId.startsWith('mock_')) {
      return MockAdapter.getStatus(taskId);
    }

    // 如果没有 API Key
    if (!this.apiKey) {
      return MockAdapter.getStatus(taskId);
    }

    try {
      const response = await fetch(`${this.baseUrl}/tasks/${taskId}`, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
        },
      });

      if (!response.ok) {
        return { status: 'failed', progress: 0 };
      }

      const data: BananaProResponse = await response.json();

      const statusMap: Record<string, string> = {
        'pending': 'queued',
        'processing': 'processing',
        'completed': 'succeeded',
        'success': 'succeeded',
        'failed': 'failed',
        'error': 'failed',
      };

      return {
        status: statusMap[data.status || ''] || 'processing',
        progress: data.progress || (data.status === 'completed' ? 100 : 50),
      };
    } catch (error) {
      console.error('[BananaPro] getStatus failed:', error);
      return { status: 'failed', progress: 0 };
    }
  }

  async getResult(taskId: string): Promise<{ url: string; seed: number } | null> {
    // 如果是同步结果
    if (taskId.startsWith('bp_sync_')) {
      return this.syncResults.get(taskId) || null;
    }

    // 如果是 Mock 任务
    if (taskId.startsWith('mock_')) {
      return MockAdapter.getResult(taskId);
    }

    // 如果没有 API Key
    if (!this.apiKey) {
      return MockAdapter.getResult(taskId);
    }

    try {
      const response = await fetch(`${this.baseUrl}/tasks/${taskId}`, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
        },
      });

      if (!response.ok) {
        return null;
      }

      const data: BananaProResponse = await response.json();

      if (data.data?.image_url || data.data?.images?.length) {
        return {
          url: data.data.image_url || data.data.images![0],
          seed: data.data.seed || 0,
        };
      }

      return null;
    } catch (error) {
      console.error('[BananaPro] getResult failed:', error);
      return null;
    }
  }
}

export const BananaProAdapter = new BananaProAdapterClass();

