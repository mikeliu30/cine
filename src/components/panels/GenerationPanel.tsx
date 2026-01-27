'use client';

// 生成控制面板 - 完整版
// 支持图片/视频生成，引用源图片，运镜控制，摄影机参数

import { useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FEATURES, getAvailableImageModels, getAvailableVideoModels, getAvailableAspectRatios } from '@/config/features';

export interface GenerationPanelProps {
  isOpen: boolean;
  onClose: () => void;
  nodeId: string;
  sourceImage?: string;
  sourcePrompt?: string;
  generationType?: 'image' | 'video';
  onGenerate: (params: {
    prompt: string;
    negativePrompt?: string;
    model: string;
    ratio: string;
    node_id: string;
    sourceImage?: string;
    type: 'image' | 'video';
    duration?: number;
    camera_movements?: string[];
    camera_settings?: CameraSettings;
    advanced?: AdvancedSettings;
  }) => void;
}

// 摄影机设置
interface CameraSettings {
  body: string;
  lens: string;
  focalLength: string;
  aperture: string;
}

// 高级设置
interface AdvancedSettings {
  seed?: number;
  steps?: number;
  cfgScale?: number;
  sampler?: string;
}

const TOOLS = [
  { id: 'generate', name: '生成', icon: '✨' },
  { id: 'repaint', name: '重绘', icon: '🔄' },
  { id: 'erase', name: '擦除', icon: '🧹' },
  { id: 'enhance', name: '增强', icon: '💎' },
  { id: 'expand', name: '扩图', icon: '📐' },
  { id: 'cutout', name: '抠图', icon: '✂️' },
];

const STYLES = [
  { id: 'none', name: '无风格', preview: '➕' },
  { id: 'cinematic', name: '电影感', preview: '🎬' },
  { id: 'anime', name: '动漫', preview: '🎌' },
  { id: 'realistic', name: '写实', preview: '📷' },
  { id: 'artistic', name: '艺术', preview: '🎨' },
  { id: 'fantasy', name: '奇幻', preview: '🔮' },
];

// 运镜指令矩阵
const CAMERA_MOVEMENTS = {
  zoom: [
    { id: 'zoom_in', name: '拉近', icon: '🔍', desc: 'Zoom In' },
    { id: 'zoom_out', name: '拉远', icon: '🔭', desc: 'Zoom Out' },
  ],
  rotation: [
    { id: 'pan_left', name: '左摇', icon: '⬅️', desc: 'Pan Left' },
    { id: 'pan_right', name: '右摇', icon: '➡️', desc: 'Pan Right' },
    { id: 'tilt_up', name: '仰摄', icon: '⬆️', desc: 'Tilt Up' },
    { id: 'tilt_down', name: '俯摄', icon: '⬇️', desc: 'Tilt Down' },
  ],
  movement: [
    { id: 'truck_left', name: '左移', icon: '👈', desc: 'Truck Left' },
    { id: 'truck_right', name: '右移', icon: '👉', desc: 'Truck Right' },
    { id: 'pedestal_up', name: '上升', icon: '🚀', desc: 'Pedestal Up' },
    { id: 'pedestal_down', name: '下降', icon: '📉', desc: 'Pedestal Down' },
    { id: 'dolly_in', name: '推镜', icon: '🎯', desc: 'Dolly In' },
    { id: 'dolly_out', name: '拉镜', icon: '🎪', desc: 'Dolly Out' },
  ],
  special: [
    { id: 'follow', name: '跟随', icon: '🎯', desc: 'Follow' },
    { id: 'shake', name: '抖动', icon: '📳', desc: 'Shake' },
    { id: 'static', name: '静止', icon: '🧘', desc: 'Static' },
    { id: 'orbit', name: '环绕', icon: '🔄', desc: 'Orbit' },
  ],
};

// 摄影机参数选项
const CAMERA_BODIES = [
  { id: 'digital', name: 'Digital', desc: '数码锐利' },
  { id: 'sony_venice', name: 'Sony Venice', desc: '电影感' },
  { id: 'arri_alexa', name: 'ARRI Alexa', desc: '好莱坞标准' },
  { id: 'red_komodo', name: 'RED Komodo', desc: '高动态' },
  { id: 'film_35mm', name: 'Film 35mm', desc: '胶片颗粒' },
];

const LENSES = [
  { id: 'zeiss_ultra', name: 'Zeiss Ultra Prime', desc: '蔡司电影头' },
  { id: 'canon_ef', name: 'Canon EF', desc: '佳能标准' },
  { id: 'cooke_s4', name: 'Cooke S4', desc: '柔和肤色' },
  { id: 'anamorphic', name: 'Anamorphic', desc: '变形宽银幕' },
];

const FOCAL_LENGTHS = ['14mm', '24mm', '35mm', '50mm', '85mm', '135mm', '200mm'];
const APERTURES = ['f/1.4', 'f/2', 'f/2.8', 'f/4', 'f/5.6', 'f/8', 'f/11'];

export function GenerationPanel({
  isOpen,
  onClose,
  nodeId,
  sourceImage,
  sourcePrompt,
  generationType = 'image',
  onGenerate,
}: GenerationPanelProps) {
  const [activeTab, setActiveTab] = useState<'image' | 'video'>(generationType);
  const [activeTool, setActiveTool] = useState('generate');
  const [prompt, setPrompt] = useState(sourcePrompt || '');
  const [negativePrompt, setNegativePrompt] = useState('');
  const [model, setModel] = useState('mock'); // 使用 Mock 模式避免 API 配额限制
  const [ratio, setRatio] = useState('16:9');
  const [selectedStyle, setSelectedStyle] = useState('none');
  const [showNegative, setShowNegative] = useState(false);
  const [isEnhancing, setIsEnhancing] = useState(false);

  // 视频参数
  const [videoDuration, setVideoDuration] = useState(6);
  const [selectedMovements, setSelectedMovements] = useState<string[]>([]);

  // 根据 tab 切换自动更新模型
  useEffect(() => {
    if (activeTab === 'image') {
      setModel('mock'); // 使用 Mock 模式测试
    } else {
      setModel('mock'); // 使用 Mock 模式测试
    }
  }, [activeTab]);

  // 摄影机参数
  const [showCameraSettings, setShowCameraSettings] = useState(false);
  const [cameraBody, setCameraBody] = useState('digital');
  const [lens, setLens] = useState('zeiss_ultra');
  const [focalLength, setFocalLength] = useState('50mm');
  const [aperture, setAperture] = useState('f/2.8');

  // 高级设置
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [seed, setSeed] = useState<number | undefined>(undefined);
  const [steps, setSteps] = useState(30);
  const [cfgScale, setCfgScale] = useState(7);
  const [sampler, setSampler] = useState('euler_a');

  // 同步外部参数
  useEffect(() => {
    if (sourcePrompt) setPrompt(sourcePrompt);
  }, [sourcePrompt]);

  useEffect(() => {
    setActiveTab(generationType);
  }, [generationType]);

  // 魔法棒 Prompt 增强
  const handleEnhancePrompt = useCallback(async () => {
    if (!prompt.trim() || isEnhancing) return;

    setIsEnhancing(true);
    try {
      const response = await fetch('/api/enhance-prompt', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: prompt.trim(),
          type: activeTab,
          style: selectedStyle,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.enhanced) {
          setPrompt(data.enhanced);
        }
      }
    } catch (error) {
      console.error('Prompt enhance failed:', error);
    } finally {
      setIsEnhancing(false);
    }
  }, [prompt, activeTab, selectedStyle, isEnhancing]);

  // 切换运镜选择
  const toggleMovement = (movementId: string) => {
    setSelectedMovements(prev =>
      prev.includes(movementId)
        ? prev.filter(m => m !== movementId)
        : [...prev, movementId]
    );
  };

  const handleGenerate = useCallback(() => {
    if (!prompt.trim()) return;

    let finalPrompt = prompt.trim();

    // 添加风格
    if (selectedStyle !== 'none') {
      finalPrompt += `, ${selectedStyle} style`;
    }

    // 添加摄影机参数到 prompt（图片模式）
    if (activeTab === 'image' && showCameraSettings) {
      const cameraDesc = `shot on ${CAMERA_BODIES.find(c => c.id === cameraBody)?.name || cameraBody}, ${LENSES.find(l => l.id === lens)?.name || lens} lens, ${focalLength}, ${aperture}`;
      finalPrompt += `, ${cameraDesc}`;
    }

    onGenerate({
      prompt: finalPrompt,
      negativePrompt: negativePrompt.trim() || undefined,
      model,
      ratio,
      node_id: nodeId,
      sourceImage,
      type: activeTab,
      duration: activeTab === 'video' ? videoDuration : undefined,
      camera_movements: activeTab === 'video' && selectedMovements.length > 0 ? selectedMovements : undefined,
      camera_settings: showCameraSettings ? { body: cameraBody, lens, focalLength, aperture } : undefined,
      advanced: showAdvanced ? { seed, steps, cfgScale, sampler } : undefined,
    });

    onClose();
  }, [prompt, negativePrompt, model, ratio, nodeId, sourceImage, activeTab, selectedStyle,
      videoDuration, selectedMovements, showCameraSettings, cameraBody, lens, focalLength,
      aperture, showAdvanced, seed, steps, cfgScale, sampler, onGenerate, onClose]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      handleGenerate();
    }
    if (e.key === 'Escape') {
      onClose();
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-[200] flex"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          {/* 背景遮罩 */}
          <div className="absolute inset-0 bg-black/60" onClick={onClose} />

          {/* 右侧面板 */}
          <motion.div
            className="relative ml-auto w-[520px] h-full bg-gray-900 border-l border-gray-700 flex flex-col overflow-hidden"
            initial={{ x: 520 }}
            animate={{ x: 0 }}
            exit={{ x: 520 }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
          >
            {/* 头部 Tab 切换 */}
            <div className="flex items-center justify-between p-4 border-b border-gray-700">
              <div className="flex items-center gap-2">
                {FEATURES.IMAGE_GENERATION && (
                  <button
                    onClick={() => setActiveTab('image')}
                    className={`px-4 py-2 rounded-lg font-medium transition-all ${
                      activeTab === 'image'
                        ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/30'
                        : 'text-gray-400 hover:text-white hover:bg-gray-800'
                    }`}
                  >
                    🖼️ 图片生成
                  </button>
                )}
                {FEATURES.VIDEO_GENERATION && (
                  <button
                    onClick={() => setActiveTab('video')}
                    className={`px-4 py-2 rounded-lg font-medium transition-all ${
                      activeTab === 'video'
                        ? 'bg-purple-600 text-white shadow-lg shadow-purple-500/30'
                        : 'text-gray-400 hover:text-white hover:bg-gray-800'
                    }`}
                  >
                    🎬 视频生成
                  </button>
                )}
              </div>
              <button onClick={onClose} className="p-2 text-gray-400 hover:text-white rounded-lg hover:bg-gray-700">
                ✕
              </button>
            </div>

            {/* 工具栏 */}
            <div className="flex items-center gap-1 p-3 border-b border-gray-800 bg-gray-800/30">
              {TOOLS.map((tool) => (
                <button
                  key={tool.id}
                  onClick={() => setActiveTool(tool.id)}
                  className={`flex items-center gap-1.5 px-3 py-2 text-sm rounded-lg whitespace-nowrap transition-all ${
                    activeTool === tool.id
                      ? 'bg-gray-700 text-white'
                      : 'text-gray-400 hover:text-white hover:bg-gray-700/50'
                  }`}
                >
                  <span>{tool.icon}</span>
                  <span>{tool.name}</span>
                </button>
              ))}
            </div>

            {/* 滚动内容区 */}
            <div className="flex-1 overflow-y-auto p-4 space-y-5">
              {/* 源图片预览 */}
              {sourceImage && (
                <div className="space-y-2">
                  <label className="text-sm text-gray-400 font-medium">📎 引用图片</label>
                  <div className="relative aspect-video rounded-xl overflow-hidden border border-gray-700 bg-gray-800">
                    <img src={sourceImage} alt="Source" className="w-full h-full object-cover" />
                    <div className="absolute bottom-2 right-2 px-2 py-1 bg-black/70 rounded text-xs text-gray-300">
                      参考图
                    </div>
                  </div>
                </div>
              )}

              {/* Prompt 输入 + 魔法棒 */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-sm text-gray-400 font-medium">✏️ 提示词</label>
                  {FEATURES.PROMPT_ENHANCEMENT && (
                    <button
                      onClick={handleEnhancePrompt}
                      disabled={!prompt.trim() || isEnhancing}
                      className="flex items-center gap-1.5 px-3 py-1.5 text-xs bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-lg hover:from-amber-400 hover:to-orange-400 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                      title="AI 优化提示词"
                    >
                      {isEnhancing ? (
                        <>
                          <span className="animate-spin">⏳</span>
                          <span>优化中...</span>
                        </>
                      ) : (
                        <>
                          <span>🪄</span>
                          <span>魔法增强</span>
                        </>
                      )}
                    </button>
                  )}
                </div>
                <textarea
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder={activeTab === 'image' ? '描述你想生成的图片...' : '描述你想生成的视频...'}
                  className="w-full h-28 px-4 py-3 bg-gray-800 border border-gray-600 rounded-xl text-white placeholder-gray-500 resize-none focus:outline-none focus:border-indigo-500 transition-colors"
                  autoFocus
                />
              </div>

              {/* 负面提示词 */}
              <div className="space-y-2">
                <button
                  onClick={() => setShowNegative(!showNegative)}
                  className="flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors"
                >
                  <span>{showNegative ? '▼' : '▶'}</span>
                  <span>负面提示词（可选）</span>
                </button>
                {showNegative && (
                  <textarea
                    value={negativePrompt}
                    onChange={(e) => setNegativePrompt(e.target.value)}
                    placeholder="不想出现的内容..."
                    className="w-full h-20 px-4 py-3 bg-gray-800 border border-gray-600 rounded-xl text-white placeholder-gray-500 resize-none focus:outline-none focus:border-indigo-500 transition-colors"
                  />
                )}
              </div>

              {/* 风格选择 */}
              <div className="space-y-3">
                <label className="text-sm text-gray-400 font-medium">🎨 风格</label>
                <div className="grid grid-cols-3 gap-2">
                  {STYLES.map((style) => (
                    <button
                      key={style.id}
                      onClick={() => setSelectedStyle(style.id)}
                      className={`flex flex-col items-center gap-2 p-3 rounded-xl border transition-all ${
                        selectedStyle === style.id
                          ? 'border-indigo-500 bg-indigo-500/20 text-white'
                          : 'border-gray-700 bg-gray-800/50 text-gray-400 hover:border-gray-600 hover:text-white'
                      }`}
                    >
                      <span className="text-2xl">{style.preview}</span>
                      <span className="text-xs">{style.name}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* 参数配置 */}
              <div className="grid grid-cols-2 gap-4">
                {/* 模型选择 */}
                <div className="space-y-2">
                  <label className="text-sm text-gray-400 font-medium">🤖 模型</label>
                  <select
                    value={model}
                    onChange={(e) => setModel(e.target.value)}
                    className="w-full px-3 py-2.5 bg-gray-800 border border-gray-600 rounded-xl text-white text-sm focus:outline-none focus:border-indigo-500 transition-colors"
                  >
                    {activeTab === 'image' ? (
                      <>
                        {getAvailableImageModels().map(m => (
                          <option key={m.value} value={m.value}>{m.label}</option>
                        ))}
                      </>
                    ) : (
                      <>
                        {getAvailableVideoModels().map(m => (
                          <option key={m.value} value={m.value}>{m.label}</option>
                        ))}
                      </>
                    )}
                  </select>
                </div>

                {/* 画幅比例 */}
                <div className="space-y-2">
                  <label className="text-sm text-gray-400 font-medium">📐 画幅</label>
                  <select
                    value={ratio}
                    onChange={(e) => setRatio(e.target.value)}
                    className="w-full px-3 py-2.5 bg-gray-800 border border-gray-600 rounded-xl text-white text-sm focus:outline-none focus:border-indigo-500 transition-colors"
                  >
                    {getAvailableAspectRatios().map(r => (
                      <option key={r.value} value={r.value}>{r.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* 视频时长（仅视频模式） */}
              {activeTab === 'video' && (
                <div className="space-y-2">
                  <label className="text-sm text-gray-400 font-medium">⏱️ 时长</label>
                  <div className="flex gap-2">
                    {[4, 6, 8, 10].map((d) => (
                      <button
                        key={d}
                        onClick={() => setVideoDuration(d)}
                        className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${
                          videoDuration === d
                            ? 'bg-purple-600 text-white'
                            : 'bg-gray-800 text-gray-400 hover:bg-gray-700 hover:text-white'
                        }`}
                      >
                        {d}s
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* 运镜控制矩阵（仅视频模式） */}
              {activeTab === 'video' && FEATURES.CAMERA_CONTROL && (
                <div className="space-y-3">
                  <label className="text-sm text-gray-400 font-medium">🎥 运镜控制</label>

                  {/* 推拉类 */}
                  <div className="space-y-2">
                    <span className="text-xs text-gray-500">推拉 (Zoom)</span>
                    <div className="flex gap-2">
                      {CAMERA_MOVEMENTS.zoom.map((m) => (
                        <button
                          key={m.id}
                          onClick={() => toggleMovement(m.id)}
                          className={`flex-1 flex flex-col items-center gap-1 p-2 rounded-lg border transition-all ${
                            selectedMovements.includes(m.id)
                              ? 'border-purple-500 bg-purple-500/20 text-white'
                              : 'border-gray-700 bg-gray-800/50 text-gray-400 hover:border-gray-600'
                          }`}
                        >
                          <span>{m.icon}</span>
                          <span className="text-xs">{m.name}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* 摇摄类 */}
                  <div className="space-y-2">
                    <span className="text-xs text-gray-500">摇摄 (Pan/Tilt)</span>
                    <div className="grid grid-cols-4 gap-2">
                      {CAMERA_MOVEMENTS.rotation.map((m) => (
                        <button
                          key={m.id}
                          onClick={() => toggleMovement(m.id)}
                          className={`flex flex-col items-center gap-1 p-2 rounded-lg border transition-all ${
                            selectedMovements.includes(m.id)
                              ? 'border-purple-500 bg-purple-500/20 text-white'
                              : 'border-gray-700 bg-gray-800/50 text-gray-400 hover:border-gray-600'
                          }`}
                        >
                          <span>{m.icon}</span>
                          <span className="text-xs">{m.name}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* 移摄类 */}
                  <div className="space-y-2">
                    <span className="text-xs text-gray-500">移摄 (Dolly/Truck)</span>
                    <div className="grid grid-cols-3 gap-2">
                      {CAMERA_MOVEMENTS.movement.map((m) => (
                        <button
                          key={m.id}
                          onClick={() => toggleMovement(m.id)}
                          className={`flex flex-col items-center gap-1 p-2 rounded-lg border transition-all ${
                            selectedMovements.includes(m.id)
                              ? 'border-purple-500 bg-purple-500/20 text-white'
                              : 'border-gray-700 bg-gray-800/50 text-gray-400 hover:border-gray-600'
                          }`}
                        >
                          <span>{m.icon}</span>
                          <span className="text-xs">{m.name}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* 特殊类 */}
                  <div className="space-y-2">
                    <span className="text-xs text-gray-500">特殊效果</span>
                    <div className="grid grid-cols-4 gap-2">
                      {CAMERA_MOVEMENTS.special.map((m) => (
                        <button
                          key={m.id}
                          onClick={() => toggleMovement(m.id)}
                          className={`flex flex-col items-center gap-1 p-2 rounded-lg border transition-all ${
                            selectedMovements.includes(m.id)
                              ? 'border-purple-500 bg-purple-500/20 text-white'
                              : 'border-gray-700 bg-gray-800/50 text-gray-400 hover:border-gray-600'
                          }`}
                        >
                          <span>{m.icon}</span>
                          <span className="text-xs">{m.name}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* 已选运镜 */}
                  {selectedMovements.length > 0 && (
                    <div className="flex flex-wrap gap-1 pt-2">
                      {selectedMovements.map((id) => {
                        const movement = [...CAMERA_MOVEMENTS.zoom, ...CAMERA_MOVEMENTS.rotation,
                          ...CAMERA_MOVEMENTS.movement, ...CAMERA_MOVEMENTS.special].find(m => m.id === id);
                        return (
                          <span key={id} className="px-2 py-1 bg-purple-500/30 text-purple-300 text-xs rounded-full">
                            {movement?.icon} {movement?.name}
                          </span>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}

              {/* 摄影机参数（图片模式） */}
              {activeTab === 'image' && FEATURES.CAMERA_CONTROL && (
                <div className="space-y-3">
                  <button
                    onClick={() => setShowCameraSettings(!showCameraSettings)}
                    className="flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors"
                  >
                    <span>{showCameraSettings ? '▼' : '▶'}</span>
                    <span>📷 虚拟摄影机</span>
                  </button>

                  {showCameraSettings && (
                    <div className="space-y-4 p-4 bg-gray-800/50 rounded-xl border border-gray-700">
                      {/* 机型模拟 */}
                      <div className="space-y-2">
                        <label className="text-xs text-gray-500">机型 (Camera Body)</label>
                        <div className="flex gap-2 overflow-x-auto pb-2">
                          {CAMERA_BODIES.map((body) => (
                            <button
                              key={body.id}
                              onClick={() => setCameraBody(body.id)}
                              className={`flex-shrink-0 px-3 py-2 rounded-lg border text-sm transition-all ${
                                cameraBody === body.id
                                  ? 'border-indigo-500 bg-indigo-500/20 text-white'
                                  : 'border-gray-700 bg-gray-800 text-gray-400 hover:border-gray-600'
                              }`}
                            >
                              <div className="font-medium">{body.name}</div>
                              <div className="text-xs opacity-70">{body.desc}</div>
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* 镜头组 */}
                      <div className="space-y-2">
                        <label className="text-xs text-gray-500">镜头 (Lens)</label>
                        <div className="flex gap-2 overflow-x-auto pb-2">
                          {LENSES.map((l) => (
                            <button
                              key={l.id}
                              onClick={() => setLens(l.id)}
                              className={`flex-shrink-0 px-3 py-2 rounded-lg border text-sm transition-all ${
                                lens === l.id
                                  ? 'border-indigo-500 bg-indigo-500/20 text-white'
                                  : 'border-gray-700 bg-gray-800 text-gray-400 hover:border-gray-600'
                              }`}
                            >
                              <div className="font-medium">{l.name}</div>
                              <div className="text-xs opacity-70">{l.desc}</div>
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* 焦距 & 光圈 */}
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <label className="text-xs text-gray-500">焦距 (Focal Length)</label>
                          <select
                            value={focalLength}
                            onChange={(e) => setFocalLength(e.target.value)}
                            className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm"
                          >
                            {FOCAL_LENGTHS.map((f) => (
                              <option key={f} value={f}>{f}</option>
                            ))}
                          </select>
                        </div>
                        <div className="space-y-2">
                          <label className="text-xs text-gray-500">光圈 (Aperture)</label>
                          <select
                            value={aperture}
                            onChange={(e) => setAperture(e.target.value)}
                            className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm"
                          >
                            {APERTURES.map((a) => (
                              <option key={a} value={a}>{a}</option>
                            ))}
                          </select>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* 高级设置 */}
              {FEATURES.ADVANCED_SETTINGS && (
                <div className="space-y-3">
                  <button
                    onClick={() => setShowAdvanced(!showAdvanced)}
                    className="flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors"
                  >
                    <span>{showAdvanced ? '▼' : '▶'}</span>
                    <span>⚙️ 高级设置</span>
                  </button>

                {showAdvanced && (
                  <div className="space-y-4 p-4 bg-gray-800/50 rounded-xl border border-gray-700">
                    {/* Seed */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <label className="text-xs text-gray-500">随机种子 (Seed)</label>
                        <button
                          onClick={() => setSeed(Math.floor(Math.random() * 999999999))}
                          className="text-xs text-indigo-400 hover:text-indigo-300"
                        >
                          🎲 随机
                        </button>
                      </div>
                      <input
                        type="number"
                        value={seed || ''}
                        onChange={(e) => setSeed(e.target.value ? parseInt(e.target.value) : undefined)}
                        placeholder="留空则随机"
                        className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm"
                      />
                    </div>

                    {/* Steps */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <label className="text-xs text-gray-500">采样步数 (Steps)</label>
                        <span className="text-xs text-gray-400">{steps}</span>
                      </div>
                      <input
                        type="range"
                        min="10"
                        max="50"
                        value={steps}
                        onChange={(e) => setSteps(parseInt(e.target.value))}
                        className="w-full accent-indigo-500"
                      />
                    </div>

                    {/* CFG Scale */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <label className="text-xs text-gray-500">提示词强度 (CFG Scale)</label>
                        <span className="text-xs text-gray-400">{cfgScale}</span>
                      </div>
                      <input
                        type="range"
                        min="1"
                        max="20"
                        value={cfgScale}
                        onChange={(e) => setCfgScale(parseInt(e.target.value))}
                        className="w-full accent-indigo-500"
                      />
                    </div>

                    {/* Sampler */}
                    <div className="space-y-2">
                      <label className="text-xs text-gray-500">采样器 (Sampler)</label>
                      <select
                        value={sampler}
                        onChange={(e) => setSampler(e.target.value)}
                        className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm"
                      >
                        <option value="euler_a">Euler A</option>
                        <option value="euler">Euler</option>
                        <option value="dpm_2">DPM++ 2M</option>
                        <option value="dpm_sde">DPM++ SDE</option>
                        <option value="ddim">DDIM</option>
                      </select>
                    </div>
                  </div>
                )}
              </div>
              )}
            </div>

            {/* 底部操作栏 */}
            <div className="p-4 border-t border-gray-700 bg-gray-800/50">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs text-gray-500">
                  Ctrl+Enter 生成 · Esc 关闭
                </span>
                {sourceImage && (
                  <span className="text-xs text-indigo-400">
                    🔗 已引用源图片
                  </span>
                )}
              </div>

              <button
                onClick={handleGenerate}
                disabled={!prompt.trim()}
                className={`w-full flex items-center justify-center gap-2 px-6 py-3 font-medium rounded-xl transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 ${
                  activeTab === 'image'
                    ? 'bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-400 hover:to-purple-400 text-white shadow-lg shadow-indigo-500/30'
                    : 'bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-400 hover:to-pink-400 text-white shadow-lg shadow-purple-500/30'
                }`}
              >
                <span>{activeTab === 'image' ? '✨' : '🎬'}</span>
                <span>生成{activeTab === 'image' ? '图片' : '视频'}</span>
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

