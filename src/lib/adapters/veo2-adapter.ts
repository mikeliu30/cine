// Veo 2 视频生成适配器
// 使用 Google Vertex AI Veo 2 模型

import { GenerationAdapter, GenerationParams } from '@/types/generation';

interface VeoTask {
  operationName: string;
  status: 'processing' | 'succeeded' | 'failed';
  progress: number;
  result?: { url: string };
}

class Veo2AdapterClass implements GenerationAdapter {
  readonly name = 'Veo 2';
  private tasks: Map<string, VeoTask> = new Map();

  async generate(params: GenerationParams): Promise<string> {
    console.log('[Veo2] Starting video generation with params:', params);

    // 调用 API Route 启动异步生成
    const response = await fetch('/api/generate/veo', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        prompt: params.prompt,
        ratio: params.ratio,
        duration: params.duration || 6,
        reference_image: params.reference_image,
        camera_control: params.camera_control,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Veo API error: ${error}`);
    }

    const data = await response.json();
    
    if (!data.success || !data.operationName) {
      throw new Error('Failed to start Veo generation');
    }

    // 保存任务信息
    const taskId = data.operationName;
    this.tasks.set(taskId, {
      operationName: data.operationName,
      status: 'processing',
      progress: 0,
    });

    return taskId;
  }

  async getStatus(taskId: string): Promise<{ status: string; progress: number }> {
    const task = this.tasks.get(taskId);
    if (!task) {
      return { status: 'failed', progress: 0 };
    }

    // 如果已完成，直接返回
    if (task.status === 'succeeded' || task.status === 'failed') {
      return { status: task.status, progress: task.progress };
    }

    // 轮询 API 获取状态
    try {
      const response = await fetch('/api/generate/veo/status', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          operationName: task.operationName,
        }),
      });

      const data = await response.json();

      if (data.status === 'succeeded') {
        task.status = 'succeeded';
        task.progress = 100;
        task.result = { url: data.videoUrl };
      } else if (data.status === 'failed') {
        task.status = 'failed';
        task.progress = 0;
      } else {
        // 根据时间估算进度
        task.progress = Math.min(90, task.progress + 5);
      }

      this.tasks.set(taskId, task);
      return { status: task.status, progress: task.progress };
    } catch (error) {
      console.error('[Veo2] Status check error:', error);
      return { status: 'processing', progress: task.progress };
    }
  }

  async getResult(taskId: string): Promise<{ url: string; seed: number } | null> {
    const task = this.tasks.get(taskId);
    if (!task || !task.result) {
      return null;
    }
    return { url: task.result.url, seed: 0 };
  }
}

export const Veo2Adapter = new Veo2AdapterClass();

