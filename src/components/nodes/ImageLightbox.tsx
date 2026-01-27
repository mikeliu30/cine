'use client';

// 全屏预览弹窗 - Lightbox
import { motion, AnimatePresence } from 'framer-motion';
import { useEffect } from 'react';

interface ImageLightboxProps {
  isOpen: boolean;
  onClose: () => void;
  imageUrl: string;
  title?: string;
}

export function ImageLightbox({ isOpen, onClose, imageUrl, title }: ImageLightboxProps) {
  // ESC 关闭
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
      return () => window.removeEventListener('keydown', handleKeyDown);
    }
  }, [isOpen, onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-[100] flex items-center justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          {/* 背景遮罩 */}
          <div 
            className="absolute inset-0 bg-black/90"
            onClick={onClose}
          />
          
          {/* 关闭按钮 */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 z-10 p-3 bg-gray-800/80 hover:bg-gray-700 text-white rounded-full transition-colors"
          >
            ✕
          </button>
          
          {/* 标题 */}
          {title && (
            <div className="absolute top-4 left-4 z-10 px-4 py-2 bg-gray-800/80 rounded-lg text-white text-sm">
              {title}
            </div>
          )}
          
          {/* 图片 */}
          <motion.img
            src={imageUrl}
            alt="Full preview"
            className="relative max-w-[90vw] max-h-[90vh] object-contain rounded-lg shadow-2xl"
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0.8 }}
          />
          
          {/* 底部提示 */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-gray-400 text-sm">
            按 ESC 或点击背景关闭
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

