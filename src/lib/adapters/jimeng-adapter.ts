// 即梦 4.5 图片生成适配器
// 通过火山方舟 Ark API 调用
// 文档: https://www.volcengine.com/docs/82379

import { GenerationAdapter, GenerationParams } from '@/types/generation';
import { MockAdapter } from './mock-adapter';

interface ArkResponse {
  code?: number;
  message?: string;
  data?: {
    task_id?: string;
    status?: string;
    images?: Array<{
      url: string;
      seed?: number;
    }>;
  };
}

class JimengAdapterClass implements GenerationAdapter {
  readonly name = '即梦 4.5';
  private apiKey: string;
  private baseUrl = 'https://ark.cn-beijing.volces.com/api/v3';

  constructor() {
    this.apiKey = process.env.ARK_API_KEY || '';
  }

  // 画幅比例映射
  private mapAspectRatio(ratio: string): string {
    return ratio; // 直接使用 16:9, 9:16, 1:1, 4:3
  }

  async generate(params: GenerationParams): Promise<string> {
    // 如果没有配置 API Key，回退到 Mock
    if (!this.apiKey) {
      console.warn('[Jimeng] ARK_API_KEY not configured, falling back to Mock');
      return MockAdapter.generate(params);
    }

    try {
      const response = await fetch(`${this.baseUrl}/images/generations`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({
          model: 'jimeng-4.5-pro', // 即梦 4.5 Pro 模型
          prompt: params.prompt,
          size: this.getSizeFromRatio(params.ratio),
          n: 1,
          // 可选参数
          negative_prompt: params.negative_prompt,
          seed: params.seed,
        }),
      });

      if (!response.ok) {
        const error = await response.text();
        console.error('[Jimeng] API error:', error);
        // 回退到 Mock
        return MockAdapter.generate(params);
      }

      const data: ArkResponse = await response.json();

      // 如果直接返回图片 (同步模式)
      if (data.data?.images?.length) {
        const taskId = `jimeng_sync_${Date.now()}`;
        this.syncResults.set(taskId, {
          url: data.data.images[0].url,
          seed: data.data.images[0].seed || 0,
        });
        return taskId;
      }

      // 如果返回 task_id (异步模式)
      if (data.data?.task_id) {
        return data.data.task_id;
      }

      // 其他情况回退到 Mock
      console.warn('[Jimeng] Unexpected response, falling back to Mock');
      return MockAdapter.generate(params);

    } catch (error) {
      console.error('[Jimeng] Request failed:', error);
      return MockAdapter.generate(params);
    }
  }

  // 存储同步返回的结果
  private syncResults: Map<string, { url: string; seed: number }> = new Map();

  // 根据比例获取尺寸
  private getSizeFromRatio(ratio: string): string {
    const sizeMap: Record<string, string> = {
      '16:9': '1920x1080',
      '9:16': '1080x1920',
      '1:1': '1024x1024',
      '4:3': '1024x768',
    };
    return sizeMap[ratio] || '1920x1080';
  }

  async getStatus(taskId: string): Promise<{ status: string; progress: number }> {
    // 如果是同步结果
    if (taskId.startsWith('jimeng_sync_') || taskId.startsWith('mock_')) {
      return MockAdapter.getStatus(taskId);
    }

    // 异步任务查询
    try {
      const response = await fetch(`${this.baseUrl}/images/tasks/${taskId}`, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
        },
      });

      if (!response.ok) {
        return { status: 'failed', progress: 0 };
      }

      const data: ArkResponse = await response.json();

      const statusMap: Record<string, string> = {
        'pending': 'queued',
        'processing': 'processing',
        'succeeded': 'succeeded',
        'failed': 'failed',
      };

      return {
        status: statusMap[data.data?.status || ''] || 'processing',
        progress: data.data?.status === 'succeeded' ? 100 : 50,
      };
    } catch {
      return MockAdapter.getStatus(taskId);
    }
  }

  async getResult(taskId: string): Promise<{ url: string; seed: number } | null> {
    // 如果是同步结果
    if (taskId.startsWith('jimeng_sync_')) {
      return this.syncResults.get(taskId) || null;
    }

    if (taskId.startsWith('mock_')) {
      return MockAdapter.getResult(taskId);
    }

    // 异步任务结果
    try {
      const response = await fetch(`${this.baseUrl}/images/tasks/${taskId}`, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
        },
      });

      if (!response.ok) {
        return null;
      }

      const data: ArkResponse = await response.json();

      if (data.data?.images?.length) {
        return {
          url: data.data.images[0].url,
          seed: data.data.images[0].seed || 0,
        };
      }

      return null;
    } catch {
      return MockAdapter.getResult(taskId);
    }
  }
}

export const JimengAdapter = new JimengAdapterClass();

