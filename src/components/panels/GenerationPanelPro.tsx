'use client';

// 增强版生成控制台 - Generation Panel Pro
// 功能：Prompt + 参考图 + 模型选择 + 批次 + 摄影机控制

import { useState, useCallback, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface GenerationPanelProProps {
  isOpen: boolean;
  onClose: () => void;
  nodeId: string;
  nodeType: 'image' | 'video';
  referenceImage?: string; // 参考图 URL
  sourceImage?: string; // 引用的源图片
  sourcePrompt?: string; // 引用的源提示词
  shouldCreateChild?: boolean; // 是否创建子节点（而不是更新当前节点）
  onGenerate: (params: GenerationParams) => void;
}

export interface GenerationParams {
  prompt: string;
  model: string;
  ratio: string;
  node_id: string;
  batch_count: number;
  reference_image?: string;
  camera_control?: CameraControl;
  video_settings?: VideoSettings;
  shouldCreateChild?: boolean; // 是否创建子节点
}

interface CameraControl {
  camera_body: string;
  lens: string;
  focal_length: string;
  aperture: string;
}

interface VideoSettings {
  duration: number;
  resolution: string;
  camera_movement?: string[];
}

export function GenerationPanelPro({
  isOpen,
  onClose,
  nodeId,
  nodeType,
  referenceImage,
  sourceImage,
  sourcePrompt,
  shouldCreateChild = true, // 默认创建子节点
  onGenerate,
}: GenerationPanelProProps) {
  const [prompt, setPrompt] = useState(sourcePrompt || '');
  // 默认模型：图片用 gemini-3-pro，视频用 veo-2
  const [model, setModel] = useState(nodeType === 'video' ? 'veo-2' : 'gemini-3-pro');
  const [ratio, setRatio] = useState('16:9');
  const [batchCount, setBatchCount] = useState(1);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [showCameraControl, setShowCameraControl] = useState(false);

  // 摄影机参数
  const [cameraBody, setCameraBody] = useState('digital');
  const [lens, setLens] = useState('zeiss');
  const [focalLength, setFocalLength] = useState('35mm');
  const [aperture, setAperture] = useState('f/2.8');

  // 视频参数
  const [videoDuration, setVideoDuration] = useState(6);
  const [selectedMovements, setSelectedMovements] = useState<string[]>([]);

  // 高级设置参数
  const [seed, setSeed] = useState<number | undefined>(undefined);
  const [steps, setSteps] = useState(30);
  const [cfgScale, setCfgScale] = useState(7.5);
  const [negativePrompt, setNegativePrompt] = useState('');
  const [isEnhancing, setIsEnhancing] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  // 优先使用 sourceImage，其次是 referenceImage
  const [localRefImage, setLocalRefImage] = useState<string | undefined>(sourceImage || referenceImage);

  // 当 sourceImage 或 sourcePrompt 变化时更新
  useEffect(() => {
    if (sourceImage) setLocalRefImage(sourceImage);
  }, [sourceImage]);

  useEffect(() => {
    if (sourcePrompt) setPrompt(sourcePrompt);
  }, [sourcePrompt]);

  // 当面板打开时重置状态
  useEffect(() => {
    if (isOpen) {
      if (sourceImage) setLocalRefImage(sourceImage);
      if (sourcePrompt) setPrompt(sourcePrompt);
    }
  }, [isOpen, sourceImage, sourcePrompt]);

  const handleGenerate = useCallback(() => {
    if (!prompt.trim()) return;

    const params: any = {
      prompt: prompt.trim(),
      model,
      ratio,
      node_id: nodeId,
      batch_count: batchCount,
      reference_image: localRefImage,
      shouldCreateChild, // 传递是否创建子节点
    };

    // 视频参数
    if (nodeType === 'video') {
      params.video_settings = {
        duration: videoDuration,
        resolution: ratio === '16:9' ? '1920x1080' : '1080x1920',
        camera_movement: selectedMovements,
      };
      params.duration = videoDuration;

      // 运镜控制
      if (selectedMovements.length > 0) {
        params.camera_control = {
          movement: selectedMovements.join(', '),
        };
      }
    }

    // 摄影机控制（图片）
    if (showCameraControl && nodeType !== 'video') {
      params.camera_control = {
        camera_body: cameraBody,
        lens,
        focal_length: focalLength,
        aperture,
      };
    }

    console.log('[GenerationPanelPro] Generate params:', params);
    onGenerate(params);
    setPrompt('');
    onClose();
  }, [prompt, model, ratio, nodeId, batchCount, localRefImage, showCameraControl,
      cameraBody, lens, focalLength, aperture, nodeType, videoDuration, selectedMovements,
      shouldCreateChild, onGenerate, onClose]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleGenerate();
    }
    if (e.key === 'Escape') onClose();
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (ev) => {
        setLocalRefImage(ev.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // 魔法棒 Prompt 增强（本地规则增强，不调用 API）
  const handleEnhancePrompt = useCallback(() => {
    if (!prompt.trim()) return;
    setIsEnhancing(true);

    // 模拟增强延迟
    setTimeout(() => {
      const enhanced = enhancePromptLocally(prompt, nodeType);
      setPrompt(enhanced);
      setIsEnhancing(false);
    }, 800);
  }, [prompt, nodeType]);

  // 本地 Prompt 增强规则
  const enhancePromptLocally = (input: string, type: 'image' | 'video'): string => {
    let enhanced = input.trim();

    // 添加质量词
    const qualityTerms = ['high quality', '8K', 'detailed', 'professional'];
    const hasQuality = qualityTerms.some(t => enhanced.toLowerCase().includes(t.toLowerCase()));
    if (!hasQuality) {
      enhanced += ', high quality, detailed';
    }

    // 添加光影词
    const lightingTerms = ['lighting', 'light', 'shadow', 'illumination'];
    const hasLighting = lightingTerms.some(t => enhanced.toLowerCase().includes(t.toLowerCase()));
    if (!hasLighting) {
      enhanced += ', cinematic lighting';
    }

    // 图片特定增强
    if (type === 'image') {
      if (!enhanced.toLowerCase().includes('composition')) {
        enhanced += ', professional composition';
      }
    }

    // 视频特定增强
    if (type === 'video') {
      if (!enhanced.toLowerCase().includes('smooth')) {
        enhanced += ', smooth motion';
      }
      if (!enhanced.toLowerCase().includes('camera')) {
        enhanced += ', cinematic camera movement';
      }
    }

    return enhanced;
  };

  // 运镜按钮
  const cameraMovements = [
    { id: 'zoom_in', label: '推近', icon: '🔍' },
    { id: 'zoom_out', label: '拉远', icon: '🔭' },
    { id: 'pan_left', label: '左摇', icon: '⬅️' },
    { id: 'pan_right', label: '右摇', icon: '➡️' },
    { id: 'tilt_up', label: '仰摄', icon: '⬆️' },
    { id: 'tilt_down', label: '俯摄', icon: '⬇️' },
    { id: 'truck_left', label: '左移', icon: '👈' },
    { id: 'truck_right', label: '右移', icon: '👉' },
    { id: 'pedestal_up', label: '上升', icon: '🚀' },
    { id: 'pedestal_down', label: '下降', icon: '🪂' },
    { id: 'dolly_in', label: '推镜', icon: '🎥' },
    { id: 'dolly_out', label: '拉镜', icon: '📹' },
    { id: 'follow', label: '跟随', icon: '🏃' },
    { id: 'shake', label: '抖动', icon: '📳' },
    { id: 'static', label: '静止', icon: '🧘' },
  ];

  const toggleMovement = (id: string) => {
    setSelectedMovements(prev => 
      prev.includes(id) ? prev.filter(m => m !== id) : [...prev, id]
    );
  };

  const imageModels = [
    { value: 'gemini-3-pro', label: '🍌 Gemini 3 Pro' },
    { value: 'jimeng', label: '✨ 即梦 4.5' },
    { value: 'mock', label: '🧪 Mock (测试)' },
  ];

  const videoModels = [
    { value: 'veo-2', label: '🎬 Veo 2' },
    { value: 'mock', label: '🧪 Mock (测试)' },
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
          
          <motion.div
            className="relative w-[560px] max-h-[85vh] bg-gray-900/95 backdrop-blur-xl rounded-2xl border border-gray-700 shadow-2xl overflow-hidden flex flex-col"
            initial={{ scale: 0.9, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.9, y: 20 }}
          >
            {/* 头部 */}
            <div className="flex items-center justify-between p-4 border-b border-gray-700">
              <h2 className="text-lg font-semibold text-white">
                {nodeType === 'video' ? '🎬 生成视频' : '✨ 生成图片'}
              </h2>
              <button onClick={onClose} className="p-1 text-gray-400 hover:text-white">✕</button>
            </div>

            {/* 可滚动内容区 */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {/* 参考图区域 */}
              <div className="flex gap-3">
                {/* 参考图插槽 */}
                <div
                  className="w-20 h-20 rounded-xl border-2 border-dashed border-gray-600 flex items-center justify-center cursor-pointer hover:border-gray-500 transition-colors overflow-hidden"
                  onClick={() => fileInputRef.current?.click()}
                >
                  {localRefImage ? (
                    <img src={localRefImage} alt="Reference" className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-2xl text-gray-500">🖼️</span>
                  )}
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleImageUpload}
                />

                {/* Prompt 输入 */}
                <div className="flex-1">
                  <textarea
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder={nodeType === 'video' ? '描述视频内容和运动...' : '描述你想生成的图片...'}
                    className="w-full h-20 px-3 py-2 bg-gray-800 border border-gray-600 rounded-xl text-white placeholder-gray-500 resize-none focus:outline-none focus:border-indigo-500"
                    autoFocus
                  />
                </div>

                {/* 魔法棒按钮 */}
                <button
                  onClick={handleEnhancePrompt}
                  disabled={!prompt.trim() || isEnhancing}
                  className={`w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center transition-all ${
                    isEnhancing ? 'animate-pulse' : 'hover:scale-110'
                  } disabled:opacity-50`}
                  title="AI 优化 Prompt"
                >
                  {isEnhancing ? '⏳' : '✨'}
                </button>
              </div>

              {/* 参数配置栏 */}
              <div className="flex flex-wrap items-center gap-2">
                {/* 模型选择 */}
                <select
                  value={model}
                  onChange={(e) => setModel(e.target.value)}
                  className="px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white text-sm focus:outline-none focus:border-indigo-500"
                >
                  {(nodeType === 'video' ? videoModels : imageModels).map(m => (
                    <option key={m.value} value={m.value}>{m.label}</option>
                  ))}
                </select>

                {/* 画幅比例 */}
                <select
                  value={ratio}
                  onChange={(e) => setRatio(e.target.value)}
                  className="px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white text-sm focus:outline-none focus:border-indigo-500"
                >
                  <option value="16:9">📺 16:9</option>
                  <option value="9:16">📱 9:16</option>
                  <option value="1:1">⬜ 1:1</option>
                  <option value="4:3">🖼️ 4:3</option>
                </select>

                {/* 批次数量 */}
                <select
                  value={batchCount}
                  onChange={(e) => setBatchCount(Number(e.target.value))}
                  className="px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white text-sm focus:outline-none focus:border-indigo-500"
                >
                  {[1, 2, 4, 6, 8, 10].map(n => (
                    <option key={n} value={n}>{n}x 并发</option>
                  ))}
                </select>

                {/* 视频时长 */}
                {nodeType === 'video' && (
                  <select
                    value={videoDuration}
                    onChange={(e) => setVideoDuration(Number(e.target.value))}
                    className="px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white text-sm focus:outline-none focus:border-indigo-500"
                  >
                    <option value={5}>5秒</option>
                    <option value={10}>10秒</option>
                  </select>
                )}

                {/* 摄影机控制开关 */}
                <button
                  onClick={() => setShowCameraControl(!showCameraControl)}
                  className={`px-3 py-2 rounded-lg text-sm transition-colors ${
                    showCameraControl
                      ? 'bg-indigo-500 text-white'
                      : 'bg-gray-800 border border-gray-600 text-gray-400 hover:text-white'
                  }`}
                >
                  📷 摄影机
                </button>

                {/* 高级设置开关 */}
                <button
                  onClick={() => setShowAdvanced(!showAdvanced)}
                  className={`px-3 py-2 rounded-lg text-sm transition-colors ${
                    showAdvanced
                      ? 'bg-indigo-500 text-white'
                      : 'bg-gray-800 border border-gray-600 text-gray-400 hover:text-white'
                  }`}
                >
                  ⚙️ 高级
                </button>
              </div>

              {/* 视频运镜矩阵 */}
              {nodeType === 'video' && (
                <div className="space-y-2">
                  <div className="text-sm text-gray-400">运镜指令</div>
                  <div className="grid grid-cols-5 gap-2">
                    {cameraMovements.map(m => (
                      <button
                        key={m.id}
                        onClick={() => toggleMovement(m.id)}
                        className={`p-2 rounded-lg text-center transition-all ${
                          selectedMovements.includes(m.id)
                            ? 'bg-purple-500 text-white scale-105'
                            : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                        }`}
                      >
                        <div className="text-lg">{m.icon}</div>
                        <div className="text-xs mt-1">{m.label}</div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* 摄影机控制面板 */}
              {showCameraControl && (
                <div className="p-4 bg-gray-800/50 rounded-xl space-y-4">
                  <div className="text-sm text-gray-300 font-medium">🎥 虚拟摄影机</div>

                  <div className="grid grid-cols-2 gap-4">
                    {/* 机型 */}
                    <div>
                      <label className="text-xs text-gray-500 mb-1 block">机型模拟</label>
                      <select
                        value={cameraBody}
                        onChange={(e) => setCameraBody(e.target.value)}
                        className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white text-sm"
                      >
                        <option value="digital">Digital (数码)</option>
                        <option value="sony_venice">Sony Venice (电影)</option>
                        <option value="film">Film (胶片)</option>
                      </select>
                    </div>

                    {/* 镜头 */}
                    <div>
                      <label className="text-xs text-gray-500 mb-1 block">镜头组</label>
                      <select
                        value={lens}
                        onChange={(e) => setLens(e.target.value)}
                        className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white text-sm"
                      >
                        <option value="zeiss">Zeiss Ultra Prime</option>
                        <option value="canon_ef">Canon EF</option>
                        <option value="cooke">Cooke S4</option>
                      </select>
                    </div>

                    {/* 焦距 */}
                    <div>
                      <label className="text-xs text-gray-500 mb-1 block">焦距</label>
                      <select
                        value={focalLength}
                        onChange={(e) => setFocalLength(e.target.value)}
                        className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white text-sm"
                      >
                        <option value="14mm">14mm 超广角</option>
                        <option value="24mm">24mm 广角</option>
                        <option value="35mm">35mm 人文</option>
                        <option value="50mm">50mm 标准</option>
                        <option value="85mm">85mm 特写</option>
                      </select>
                    </div>

                    {/* 光圈 */}
                    <div>
                      <label className="text-xs text-gray-500 mb-1 block">光圈</label>
                      <select
                        value={aperture}
                        onChange={(e) => setAperture(e.target.value)}
                        className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white text-sm"
                      >
                        <option value="f/1.4">f/1.4 (浅景深)</option>
                        <option value="f/2.8">f/2.8</option>
                        <option value="f/4">f/4</option>
                        <option value="f/8">f/8 (深景深)</option>
                      </select>
                    </div>
                  </div>
                </div>
              )}

              {/* 高级设置面板 */}
              {showAdvanced && (
                <div className="p-4 bg-gray-800/50 rounded-xl space-y-4">
                  <div className="text-sm text-gray-300 font-medium">⚙️ 高级设置</div>

                  {/* 负面提示词 */}
                  <div>
                    <label className="text-xs text-gray-500 mb-1 block">负面提示词 (Negative Prompt)</label>
                    <textarea
                      value={negativePrompt}
                      onChange={(e) => setNegativePrompt(e.target.value)}
                      placeholder="不想出现的内容，如：blurry, low quality, watermark..."
                      className="w-full h-16 px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white text-sm placeholder-gray-500 resize-none focus:outline-none focus:border-indigo-500"
                    />
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    {/* Seed */}
                    <div>
                      <label className="text-xs text-gray-500 mb-1 block">Seed (随机种子)</label>
                      <div className="flex gap-1">
                        <input
                          type="number"
                          value={seed ?? ''}
                          onChange={(e) => setSeed(e.target.value ? Number(e.target.value) : undefined)}
                          placeholder="随机"
                          className="flex-1 px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white text-sm focus:outline-none focus:border-indigo-500"
                        />
                        <button
                          onClick={() => setSeed(Math.floor(Math.random() * 999999999))}
                          className="px-2 py-2 bg-gray-700 border border-gray-600 rounded-lg text-gray-400 hover:text-white text-sm"
                          title="随机生成"
                        >
                          🎲
                        </button>
                      </div>
                    </div>

                    {/* Steps */}
                    <div>
                      <label className="text-xs text-gray-500 mb-1 block">Steps (迭代步数): {steps}</label>
                      <input
                        type="range"
                        min="10"
                        max="50"
                        value={steps}
                        onChange={(e) => setSteps(Number(e.target.value))}
                        className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                      />
                    </div>

                    {/* CFG Scale */}
                    <div>
                      <label className="text-xs text-gray-500 mb-1 block">CFG Scale (提示词强度): {cfgScale}</label>
                      <input
                        type="range"
                        min="1"
                        max="20"
                        step="0.5"
                        value={cfgScale}
                        onChange={(e) => setCfgScale(Number(e.target.value))}
                        className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* 底部操作栏 */}
            <div className="flex items-center justify-between p-4 border-t border-gray-700 bg-gray-800/50">
              <span className="text-xs text-gray-500">
                Enter 生成 · Esc 关闭
              </span>

              <button
                onClick={handleGenerate}
                disabled={!prompt.trim()}
                className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-400 hover:to-purple-400 text-white font-medium rounded-xl disabled:opacity-50 disabled:cursor-not-allowed transition-all hover:scale-105 active:scale-95"
              >
                <span>✨</span>
                <span>生成 {batchCount > 1 ? `(${batchCount}张)` : ''}</span>
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

