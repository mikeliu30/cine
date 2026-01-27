// 适配器统一入口
// 根据模型名称返回对应的适配器

import { GenerationAdapter, GenerationParams } from '@/types/generation';
import { MockAdapter } from './mock-adapter';
import { BananaProAdapter } from './banana-pro-adapter';
import { JimengAdapter } from './jimeng-adapter';
import { DallEAdapter } from './dalle-adapter';
import { StableDiffusionAdapter } from './stable-diffusion-adapter';
import { Veo2Adapter } from './veo2-adapter';
import { RunwayGen3Adapter } from './runway-adapter';

// 适配器注册表
const adapters: Record<string, GenerationAdapter> = {
  'mock': MockAdapter,
  'banana-pro': BananaProAdapter,
  'gemini-3-pro': BananaProAdapter, // 使用相同的适配器
  'jimeng-4.5': JimengAdapter,
  'dall-e-3': DallEAdapter,
  'stable-diffusion': StableDiffusionAdapter,
  'veo-2': Veo2Adapter,
  'runway-gen3': RunwayGen3Adapter,
  'mock-video': MockAdapter,
};

// 获取适配器
export function getAdapter(model: string): GenerationAdapter {
  const adapter = adapters[model];
  if (!adapter) {
    console.warn(`[Adapter] Unknown model: ${model}, falling back to mock`);
    return MockAdapter;
  }
  return adapter;
}

// 统一生成接口
export async function generateImage(params: GenerationParams): Promise<string> {
  const adapter = getAdapter(params.model);
  console.log(`[Generate] Using adapter: ${adapter.name}`);
  return adapter.generate(params);
}

// 统一状态查询
export async function getTaskStatus(
  model: string,
  taskId: string
): Promise<{ status: string; progress: number }> {
  const adapter = getAdapter(model);
  return adapter.getStatus(taskId);
}

// 统一结果获取
export async function getTaskResult(
  model: string,
  taskId: string
): Promise<{ url: string; seed: number } | null> {
  const adapter = getAdapter(model);
  return adapter.getResult(taskId);
}

// 导出所有适配器
export {
  MockAdapter,
  BananaProAdapter,
  JimengAdapter,
  DallEAdapter,
  StableDiffusionAdapter,
  Veo2Adapter,
  RunwayGen3Adapter,
};

