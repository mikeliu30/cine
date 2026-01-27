'use client';

// 简单的 Inpaint 编辑器 - 遮罩绘制
import { useState, useRef, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface InpaintEditorProps {
  isOpen: boolean;
  onClose: () => void;
  imageUrl: string;
  onSubmit: (maskDataUrl: string, prompt: string) => void;
}

export function InpaintEditor({ isOpen, onClose, imageUrl, onSubmit }: InpaintEditorProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [brushSize, setBrushSize] = useState(30);
  const [prompt, setPrompt] = useState('');
  const [maskHistory, setMaskHistory] = useState<ImageData[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);

  // 初始化画布
  useEffect(() => {
    if (!isOpen || !canvasRef.current) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      ctx.drawImage(img, 0, 0);
      // 保存初始状态
      const initialState = ctx.getImageData(0, 0, canvas.width, canvas.height);
      setMaskHistory([initialState]);
      setHistoryIndex(0);
    };
    img.src = imageUrl;
  }, [isOpen, imageUrl]);

  // 绘制遮罩
  const draw = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing || !canvasRef.current) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const x = (e.clientX - rect.left) * scaleX;
    const y = (e.clientY - rect.top) * scaleY;

    ctx.globalCompositeOperation = 'source-over';
    ctx.fillStyle = 'rgba(255, 0, 0, 0.5)';
    ctx.beginPath();
    ctx.arc(x, y, brushSize, 0, Math.PI * 2);
    ctx.fill();
  }, [isDrawing, brushSize]);

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
    setIsDrawing(true);
    draw(e);
  };

  const stopDrawing = () => {
    if (isDrawing && canvasRef.current) {
      const ctx = canvasRef.current.getContext('2d');
      if (ctx) {
        const newState = ctx.getImageData(0, 0, canvasRef.current.width, canvasRef.current.height);
        const newHistory = maskHistory.slice(0, historyIndex + 1);
        newHistory.push(newState);
        setMaskHistory(newHistory);
        setHistoryIndex(newHistory.length - 1);
      }
    }
    setIsDrawing(false);
  };

  // 撤销
  const undo = () => {
    if (historyIndex > 0 && canvasRef.current) {
      const ctx = canvasRef.current.getContext('2d');
      if (ctx) {
        const newIndex = historyIndex - 1;
        ctx.putImageData(maskHistory[newIndex], 0, 0);
        setHistoryIndex(newIndex);
      }
    }
  };

  // 重做
  const redo = () => {
    if (historyIndex < maskHistory.length - 1 && canvasRef.current) {
      const ctx = canvasRef.current.getContext('2d');
      if (ctx) {
        const newIndex = historyIndex + 1;
        ctx.putImageData(maskHistory[newIndex], 0, 0);
        setHistoryIndex(newIndex);
      }
    }
  };

  // 清除遮罩
  const clearMask = () => {
    if (!canvasRef.current) return;
    const ctx = canvasRef.current.getContext('2d');
    if (!ctx || maskHistory.length === 0) return;
    ctx.putImageData(maskHistory[0], 0, 0);
    setMaskHistory([maskHistory[0]]);
    setHistoryIndex(0);
  };

  // 提交
  const handleSubmit = () => {
    if (!canvasRef.current || !prompt.trim()) return;
    const maskDataUrl = canvasRef.current.toDataURL('image/png');
    onSubmit(maskDataUrl, prompt);
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className="relative w-[90vw] max-w-4xl bg-gray-900 rounded-2xl border border-gray-700 overflow-hidden"
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0.9 }}
          >
            {/* 头部 */}
            <div className="flex items-center justify-between p-4 border-b border-gray-700">
              <h2 className="text-lg font-semibold text-white">🎨 编辑/重绘 (Inpaint)</h2>
              <button onClick={onClose} className="p-1 text-gray-400 hover:text-white">✕</button>
            </div>

            {/* 画布区域 */}
            <div className="p-4 flex justify-center bg-gray-950">
              <canvas
                ref={canvasRef}
                className="max-w-full max-h-[50vh] cursor-crosshair rounded-lg"
                onMouseDown={startDrawing}
                onMouseMove={draw}
                onMouseUp={stopDrawing}
                onMouseLeave={stopDrawing}
              />
            </div>

            {/* 工具栏 */}
            <div className="p-4 border-t border-gray-700 space-y-4">
              <div className="flex items-center gap-4">
                <span className="text-sm text-gray-400">画笔大小:</span>
                <input
                  type="range"
                  min="5"
                  max="100"
                  value={brushSize}
                  onChange={(e) => setBrushSize(Number(e.target.value))}
                  className="flex-1 max-w-[200px]"
                />
                <span className="text-sm text-white w-8">{brushSize}</span>
                
                <div className="flex gap-2 ml-auto">
                  <button onClick={undo} disabled={historyIndex <= 0}
                    className="px-3 py-1.5 bg-gray-700 rounded-lg text-sm disabled:opacity-50">↩️ 撤销</button>
                  <button onClick={redo} disabled={historyIndex >= maskHistory.length - 1}
                    className="px-3 py-1.5 bg-gray-700 rounded-lg text-sm disabled:opacity-50">↪️ 重做</button>
                  <button onClick={clearMask}
                    className="px-3 py-1.5 bg-gray-700 rounded-lg text-sm">🗑️ 清除</button>
                </div>
              </div>

              <div className="flex gap-3">
                <input
                  type="text"
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="描述要替换的内容..."
                  className="flex-1 px-4 py-2 bg-gray-800 border border-gray-600 rounded-xl text-white"
                />
                <button
                  onClick={handleSubmit}
                  disabled={!prompt.trim()}
                  className="px-6 py-2 bg-indigo-500 hover:bg-indigo-400 text-white rounded-xl disabled:opacity-50"
                >
                  ✨ 重绘
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

