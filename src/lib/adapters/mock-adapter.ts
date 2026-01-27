// Mock 适配器 - MVP 版本
// 模拟 3 秒生成，返回假图片

import { GenerationAdapter, GenerationParams } from '@/types/generation';

interface MockTask {
  id: string;
  params: GenerationParams;
  status: 'queued' | 'processing' | 'succeeded' | 'failed';
  progress: number;
  startTime: number;
  result?: { url: string; seed: number };
}

// Mock 图片列表
const MOCK_IMAGES = [
  'https://picsum.photos/seed/card1/512/768',
  'https://picsum.photos/seed/card2/512/768',
  'https://picsum.photos/seed/card3/512/768',
  'https://picsum.photos/seed/card4/512/768',
  'https://picsum.photos/seed/card5/512/768',
];

const MOCK_DURATION = 3000; // 3秒生成时间

class MockAdapterClass implements GenerationAdapter {
  readonly name = 'Mock';
  private tasks: Map<string, MockTask> = new Map();

  async generate(params: GenerationParams): Promise<string> {
    const taskId = `mock_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
    
    const task: MockTask = {
      id: taskId,
      params,
      status: 'processing',
      progress: 0,
      startTime: Date.now(),
    };
    
    this.tasks.set(taskId, task);
    
    // 模拟进度更新
    this.simulateProgress(taskId);
    
    return taskId;
  }

  private simulateProgress(taskId: string): void {
    const task = this.tasks.get(taskId);
    if (!task) return;

    const interval = setInterval(() => {
      const elapsed = Date.now() - task.startTime;
      const progress = Math.min(100, Math.floor((elapsed / MOCK_DURATION) * 100));
      
      task.progress = progress;

      if (progress >= 100) {
        clearInterval(interval);
        task.status = 'succeeded';
        task.result = {
          url: MOCK_IMAGES[Math.floor(Math.random() * MOCK_IMAGES.length)],
          seed: Math.floor(Math.random() * 999999999),
        };
      }
    }, 100);
  }

  async getStatus(taskId: string): Promise<{ status: string; progress: number }> {
    const task = this.tasks.get(taskId);
    if (!task) {
      return { status: 'failed', progress: 0 };
    }
    return { status: task.status, progress: task.progress };
  }

  async getResult(taskId: string): Promise<{ url: string; seed: number } | null> {
    const task = this.tasks.get(taskId);
    return task?.result || null;
  }
}

// 单例
export const MockAdapter = new MockAdapterClass();

