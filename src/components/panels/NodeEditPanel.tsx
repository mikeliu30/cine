'use client';

// 节点编辑面板 - 选中节点时显示
// 包含：工具栏、图片预览、提示词输入、控制栏

import { useState, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export interface NodeEditPanelProps {
  isOpen: boolean;
  onClose: () => void;
  nodeId: string;
  imageUrl?: string;
  prompt?: string;
  onGenerate: (params: {
    prompt: string;
    model: string;
    ratio: string;
    node_id: string;
    batch_count: number;
    tool?: string;
    reference_image?: string;
  }) => void;
  onToolAction?: (tool: string, nodeId: string) => void;
}

// 顶部工具栏配置
const TOOLS = [
  { id: 'repaint', label: '重绘', icon: '🔄' },
  { id: 'erase', label: '擦除', icon: '◇' },
  { id: 'enhance', label: '增强', icon: '▣' },
  { id: 'expand', label: '扩图', icon: '⬜' },
  { id: 'cutout', label: '抠图', icon: '✂️' },
  { id: 'multiview', label: '多角度', icon: '◈' },
];

// 风格预设
const STYLES = [
  { id: 'none', label: '+ 风格', icon: '+' },
  { id: 'magic', label: '魔法棒', icon: '✨' },
];

// 模型选项
const MODELS = [
  { value: 'gemini-3-pro', label: 'Gemini 3 Pro' },
  { value: 'gemini-2.0-flash', label: 'Gemini 2.0 Flash' },
  { value: 'vertex-ai', label: 'Imagen 3' },
  { value: 'jimeng-4.5', label: '即梦' },
  { value: 'mock', label: 'Mock (测试)' },
];

// 比例选项
const RATIOS = [
  { value: '16:9', label: '16:9' },
  { value: '9:16', label: '9:16' },
  { value: '1:1', label: '1:1' },
  { value: '4:3', label: '4:3' },
];

export function NodeEditPanel({
  isOpen,
  onClose,
  nodeId,
  imageUrl,
  prompt: initialPrompt,
  onGenerate,
  onToolAction,
}: NodeEditPanelProps) {
  const [activeTool, setActiveTool] = useState<string | null>(null);
  const [prompt, setPrompt] = useState(initialPrompt || '');
  const [model, setModel] = useState('gemini-3-pro');
  const [ratio, setRatio] = useState('16:9');
  const [batchCount, setBatchCount] = useState(1);
  const [showCameraControl, setShowCameraControl] = useState(false);
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 处理工具点击
  const handleToolClick = useCallback((toolId: string) => {
    setActiveTool(toolId);
    onToolAction?.(toolId, nodeId);
  }, [nodeId, onToolAction]);

  // 处理图片上传
  const handleImageUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // 检查文件类型
    if (!file.type.startsWith('image/')) {
      alert('请上传图片文件');
      return;
    }

    // 检查文件大小（限制 10MB）
    if (file.size > 10 * 1024 * 1024) {
      alert('图片大小不能超过 10MB');
      return;
    }

    // 读取文件并转换为 base64
    const reader = new FileReader();
    reader.onload = (event) => {
      const base64 = event.target?.result as string;
      setUploadedImage(base64);
    };
    reader.readAsDataURL(file);
  }, []);

  // 触发文件选择
  const handleUploadClick = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  // 清除上传的图片
  const handleClearImage = useCallback(() => {
    setUploadedImage(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }, []);

  // 处理生成
  const handleGenerate = useCallback(() => {
    if (!prompt.trim()) return;

    onGenerate({
      prompt: prompt.trim(),
      model,
      ratio,
      node_id: nodeId,
      batch_count: batchCount,
      tool: activeTool || undefined,
      reference_image: uploadedImage || imageUrl, // 优先使用上传的图片
    });
  }, [prompt, model, ratio, nodeId, batchCount, activeTool, uploadedImage, imageUrl, onGenerate]);

  // 键盘事件
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleGenerate();
    }
    if (e.key === 'Escape') {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          {/* 背景遮罩 */}
          <div className="absolute inset-0 bg-black/40" onClick={onClose} />

          {/* 主面板 */}
          <motion.div
            className="relative w-[900px] max-w-[95vw] bg-gray-900/95 backdrop-blur-xl rounded-2xl border border-gray-700 shadow-2xl overflow-hidden"
            initial={{ scale: 0.95, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.95, y: 20 }}
          >
            {/* 顶部工具栏 */}
            <div className="flex items-center justify-center gap-2 p-3 border-b border-gray-800">
              {TOOLS.map((tool) => (
                <button
                  key={tool.id}
                  onClick={() => handleToolClick(tool.id)}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm transition-all ${
                    activeTool === tool.id
                      ? 'bg-gray-700 text-white'
                      : 'text-gray-400 hover:text-white hover:bg-gray-800'
                  }`}
                >
                  <span>{tool.icon}</span>
                  <span>{tool.label}</span>
                </button>
              ))}

              {/* 分隔线 */}
              <div className="w-px h-6 bg-gray-700 mx-2" />

              {/* 右侧工具 */}
              <button
                onClick={handleUploadClick}
                className="flex items-center gap-1.5 px-3 py-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-all"
                title="上传图片"
              >
                <span>📤</span>
                <span className="text-sm">上传</span>
              </button>
              <button className="p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg" title="画笔">
                ✏️
              </button>
              <button className="p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg" title="裁剪">
                ⬜
              </button>
              <button className="p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg" title="下载">
                ⬇️
              </button>
              <button className="p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg" title="全屏">
                ⛶
              </button>
            </div>

            {/* 图片预览区域 */}
            <div className="flex items-center justify-center p-8 min-h-[400px] bg-gray-950/50">
              {(uploadedImage || imageUrl) ? (
                <div className="relative">
                  {/* 左侧连接点 */}
                  <div className="absolute left-0 top-1/2 -translate-x-1/2 -translate-y-1/2 w-4 h-4 rounded-full border-2 border-gray-500 bg-gray-900 cursor-pointer hover:border-white" />

                  {/* 图片 */}
                  <div className="relative group">
                    <div className="text-xs text-indigo-400 mb-2 flex items-center justify-between">
                      <span>image</span>
                      {uploadedImage && (
                        <button
                          onClick={handleClearImage}
                          className="text-xs text-red-400 hover:text-red-300 px-2 py-1 rounded bg-red-500/10 hover:bg-red-500/20 transition-colors"
                        >
                          清除
                        </button>
                      )}
                    </div>
                    <img
                      src={uploadedImage || imageUrl}
                      alt="Preview"
                      className="max-h-[350px] rounded-lg border border-gray-700"
                    />
                    {uploadedImage && (
                      <div className="absolute top-2 left-2 px-2 py-1 bg-green-500/80 text-white text-xs rounded">
                        已上传
                      </div>
                    )}
                  </div>

                  {/* 右侧连接点 */}
                  <div className="absolute right-0 top-1/2 translate-x-1/2 -translate-y-1/2 w-4 h-4 rounded-full border-2 border-gray-500 bg-gray-900 cursor-pointer hover:border-white" />
                </div>
              ) : (
                <div className="text-center">
                  <div className="text-gray-500 mb-6">
                    <div className="text-6xl mb-4">🖼️</div>
                    <div className="mb-2">暂无图片</div>
                    <div className="text-sm text-gray-600">上传参考图片以基于图片生成</div>
                  </div>

                  <button
                    onClick={handleUploadClick}
                    className="inline-flex items-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg transition-colors"
                  >
                    <span>📤</span>
                    <span>上传图片</span>
                  </button>

                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                </div>
              )}
            </div>

            {/* 底部输入区域 */}
            <div className="p-4 border-t border-gray-800 bg-gray-900/80">
              {/* 风格选择 + 提示词 */}
              <div className="flex items-start gap-3 mb-4">
                {/* 风格按钮 */}
                <div className="flex gap-2">
                  {STYLES.map((style) => (
                    <button
                      key={style.id}
                      className="flex flex-col items-center justify-center w-12 h-12 rounded-lg bg-gray-800 border border-gray-700 text-gray-400 hover:text-white hover:border-gray-600 transition-all"
                    >
                      <span className="text-lg">{style.icon}</span>
                      <span className="text-[10px] mt-0.5">{style.label}</span>
                    </button>
                  ))}
                </div>

                {/* 提示词输入 */}
                <div className="flex-1 relative">
                  <textarea
                    ref={textareaRef}
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="描述你想要的效果..."
                    className="w-full h-12 px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white placeholder-gray-500 resize-none focus:outline-none focus:border-indigo-500 text-sm"
                  />
                </div>
              </div>

              {/* 底部控制栏 */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {/* 模型选择 */}
                  <div className="flex items-center gap-2 px-3 py-2 bg-gray-800 rounded-lg border border-gray-700">
                    <span className="text-green-500">G</span>
                    <select
                      value={model}
                      onChange={(e) => setModel(e.target.value)}
                      className="bg-transparent text-white text-sm focus:outline-none cursor-pointer"
                    >
                      {MODELS.map((m) => (
                        <option key={m.value} value={m.value} className="bg-gray-800">
                          {m.label}
                        </option>
                      ))}
                    </select>
                    <span className="text-gray-500">▼</span>
                  </div>

                  {/* 比例选择 */}
                  <div className="flex items-center gap-2 px-3 py-2 bg-gray-800 rounded-lg border border-gray-700">
                    <span className="text-gray-400">⬜</span>
                    <select
                      value={ratio}
                      onChange={(e) => setRatio(e.target.value)}
                      className="bg-transparent text-white text-sm focus:outline-none cursor-pointer"
                    >
                      {RATIOS.map((r) => (
                        <option key={r.value} value={r.value} className="bg-gray-800">
                          {r.label}
                        </option>
                      ))}
                    </select>
                    <span className="text-gray-500">▼</span>
                  </div>

                  {/* 摄影机控制 */}
                  <button
                    onClick={() => setShowCameraControl(!showCameraControl)}
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg border transition-all ${
                      showCameraControl
                        ? 'bg-orange-500/20 border-orange-500 text-orange-400'
                        : 'bg-gray-800 border-gray-700 text-gray-400 hover:text-white'
                    }`}
                  >
                    <span>🎬</span>
                    <span className="text-sm">摄影机控制</span>
                  </button>
                </div>

                {/* 右侧控制 */}
                <div className="flex items-center gap-3">
                  {/* 批次倍数 */}
                  <div className="flex items-center gap-2 text-gray-400">
                    <span className="text-sm">1x</span>
                    <span className="text-gray-600">▼</span>
                  </div>

                  {/* 批次数量 */}
                  <div className="flex items-center gap-2 px-3 py-2 bg-gray-800 rounded-lg border border-gray-700">
                    <span className="text-purple-400">⬡</span>
                    <span className="text-white text-sm">{batchCount}</span>
                  </div>

                  {/* 发送按钮 */}
                  <button
                    onClick={handleGenerate}
                    disabled={!prompt.trim()}
                    className="w-10 h-10 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 flex items-center justify-center text-white hover:scale-110 transition-transform disabled:opacity-50 disabled:hover:scale-100"
                  >
                    ↑
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
