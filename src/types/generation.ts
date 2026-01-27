// 生成参数类型 - 完整版
export interface GenerationParams {
  prompt: string;
  model: 'mock' | 'banana-pro' | 'gemini-3-pro' | 'dall-e-3' | 'stable-diffusion' | 'jimeng-4.5' | 'vertex-ai' | 'veo-2' | 'runway-gen3' | 'veo-3.1-fast' | 'mock-video';
  ratio: '16:9' | '9:16' | '1:1' | '4:3';
  node_id: string;

  // 可选参数
  negative_prompt?: string;
  seed?: number;
  steps?: number;
  cfg_scale?: number;

  // 参考图 (img2img / i2v)
  reference_image?: string;
  ref_strength?: number;

  // 视频参数
  duration?: number;  // 视频时长（秒）
  camera_control?: {
    movement?: string;  // 运镜方向
    speed?: number;     // 运镜速度
  };

  // 虚拟摄影机参数
  camera?: {
    body?: 'digital' | 'sony-venice' | 'film';
    lens?: 'zeiss-ultra-prime' | 'canon-ef' | 'cooke-s4';
    focal_length?: number;  // 14, 24, 35, 50, 85
    aperture?: number;      // 1.4, 2.8, 4, 8
  };
}

// 生成任务
export interface GenerationTask {
  task_id: string;
  node_id: string;
  status: 'queued' | 'processing' | 'succeeded' | 'failed';
  progress: number;
  params: GenerationParams;
  result?: {
    url: string;
    seed?: number;
    duration?: number;  // 视频时长
  };
  error?: string;
  created_at: number;
}

// 适配器接口
export interface GenerationAdapter {
  readonly name: string;
  generate(params: GenerationParams): Promise<string>;
  getStatus(taskId: string): Promise<{ status: string; progress: number }>;
  getResult(taskId: string): Promise<{ url: string; seed: number } | null>;
}

