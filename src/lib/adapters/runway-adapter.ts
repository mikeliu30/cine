// Runway Gen-3 视频生成适配器
// 使用 Runway API

import { GenerationAdapter, GenerationParams } from '@/types/generation';

interface RunwayTask {
  taskId: string;
  status: 'processing' | 'succeeded' | 'failed';
  progress: number;
  result?: { url: string };
}

class RunwayGen3AdapterClass implements GenerationAdapter {
  readonly name = 'Runway Gen-3';
  private tasks: Map<string, RunwayTask> = new Map();

  async generate(params: GenerationParams): Promise<string> {
    console.log('[Runway] Starting video generation with params:', params);

    // 调用 API Route
    const response = await fetch('/api/generate/runway', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        prompt: params.prompt,
        duration: params.duration || 5,
        ratio: params.ratio,
        image: params.reference_image, // Image-to-Video
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Runway API error: ${error}`);
    }

    const data = await response.json();
    
    if (!data.success || !data.taskId) {
      throw new Error('Failed to start Runway generation');
    }

    // 保存任务信息
    const taskId = data.taskId;
    this.tasks.set(taskId, {
      taskId,
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

    if (task.status === 'succeeded' || task.status === 'failed') {
      return { status: task.status, progress: task.progress };
    }

    // 轮询状态
    try {
      const response = await fetch(`/api/generate/runway/status?taskId=${taskId}`);
      const data = await response.json();

      if (data.status === 'succeeded') {
        task.status = 'succeeded';
        task.progress = 100;
        task.result = { url: data.videoUrl };
      } else if (data.status === 'failed') {
        task.status = 'failed';
        task.progress = 0;
      } else {
        task.progress = data.progress || Math.min(90, task.progress + 10);
      }

      this.tasks.set(taskId, task);
      return { status: task.status, progress: task.progress };
    } catch (error) {
      console.error('[Runway] Status check error:', error);
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

export const RunwayGen3Adapter = new RunwayGen3AdapterClass();

