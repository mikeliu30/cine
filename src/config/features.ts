/**
 * 功能开关配置
 * 用于控制哪些功能在生产环境中可用
 * 
 * 使用方法：
 * import { FEATURES } from '@/config/features';
 * if (FEATURES.VIDEO_GENERATION) { ... }
 */

export const FEATURES = {
  // ===== 核心功能 =====
  /** 图片生成 - 已完成 ✅ */
  IMAGE_GENERATION: true,

  /** 视频生成 - 已完成 ✅ */
  VIDEO_GENERATION: true,

  // ===== 图片功能 =====
  /** 参考图上传 */
  REFERENCE_IMAGE: true,

  /** 批次生成 (1张以上) */
  BATCH_GENERATION: false,

  /** Prompt AI增强 */
  PROMPT_ENHANCEMENT: true,

  /** 摄影机控制 */
  CAMERA_CONTROL: true,

  /** 高级设置 (Seed, Steps, CFG等) */
  ADVANCED_SETTINGS: false,

  // ===== 模型选择 =====
  MODELS: {
    // 图片模型
    IMAGE: {
      'gemini-3-pro': true,   // Gemini 3 Pro - 主力模型
      'dall-e-3': true,        // DALL-E 3 - OpenAI
      'stable-diffusion': true, // Stable Diffusion XL
      'jimeng': false,         // 即梦 4.5 - 未接入
      'mock': true,            // Mock测试 - 保留用于测试
    },
    // 视频模型
    VIDEO: {
      'veo-2': true,           // Veo 2 - Google 视频生成
      'runway-gen3': true,     // Runway Gen-3
      'kling': false,          // 可灵 1.6 - 未接入
      'mock-video': true,      // Mock测试
    },
  },

  // ===== 画幅比例 =====
  ASPECT_RATIOS: {
    '16:9': true,
    '9:16': true,
    '1:1': true,
    '4:3': true,
  },
} as const;

/**
 * 获取可用的图片模型列表
 */
export function getAvailableImageModels() {
  const allModels = [
    { value: 'gemini-3-pro', label: '🍌 Gemini 3 Pro', desc: 'Google 最新图片生成模型' },
    { value: 'dall-e-3', label: '🎨 DALL-E 3', desc: 'OpenAI 高质量图片生成' },
    { value: 'stable-diffusion', label: '🖼️ Stable Diffusion XL', desc: '开源高质量模型' },
    { value: 'jimeng', label: '✨ 即梦 4.5', desc: '火山方舟图片生成' },
    { value: 'mock', label: '🧪 Mock (测试)', desc: '测试模式' },
  ];

  return allModels.filter(m => FEATURES.MODELS.IMAGE[m.value as keyof typeof FEATURES.MODELS.IMAGE]);
}

/**
 * 获取可用的视频模型列表
 */
export function getAvailableVideoModels() {
  const allModels = [
    { value: 'veo-2', label: '🎬 Veo 2', desc: 'Google 最新视频生成模型' },
    { value: 'runway-gen3', label: '🎥 Runway Gen-3', desc: '专业视频生成' },
    { value: 'kling', label: '🌟 可灵 1.6', desc: '快手视频生成' },
    { value: 'mock-video', label: '🧪 Mock (测试)', desc: '测试模式' },
  ];

  return allModels.filter(m => FEATURES.MODELS.VIDEO[m.value as keyof typeof FEATURES.MODELS.VIDEO]);
}

/**
 * 获取可用的画幅比例列表
 */
export function getAvailableAspectRatios() {
  const allRatios = [
    { value: '16:9', label: '📺 16:9', desc: '横屏 - 适合视频' },
    { value: '9:16', label: '📱 9:16', desc: '竖屏 - 适合手机' },
    { value: '1:1', label: '⬜ 1:1', desc: '方形 - 适合社交媒体' },
    { value: '4:3', label: '🖼️ 4:3', desc: '传统比例' },
  ];

  return allRatios.filter(r => FEATURES.ASPECT_RATIOS[r.value as keyof typeof FEATURES.ASPECT_RATIOS]);
}

/**
 * 获取批次数量选项
 */
export function getBatchCountOptions() {
  if (!FEATURES.BATCH_GENERATION) {
    return [1]; // 只允许单张
  }
  return [1, 2, 4, 6, 8, 10];
}

