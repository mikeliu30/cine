'use client';

// 画布右键菜单 - Context Menu
import { memo, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface MenuItem {
  icon: string;
  label: string;
  shortcut?: string;
  onClick: () => void;
  danger?: boolean;
  disabled?: boolean;
  divider?: boolean;
}

interface ContextMenuProps {
  isOpen: boolean;
  position: { x: number; y: number };
  onClose: () => void;
  items: MenuItem[];
}

export const ContextMenu = memo(function ContextMenu({
  isOpen,
  position,
  onClose,
  items,
}: ContextMenuProps) {
  const menuRef = useRef<HTMLDivElement>(null);

  // 点击外部关闭
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        onClose();
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleKeyDown);
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
        document.removeEventListener('keydown', handleKeyDown);
      };
    }
  }, [isOpen, onClose]);

  // 确保菜单不超出屏幕
  const adjustedPosition = {
    x: Math.min(position.x, window.innerWidth - 220),
    y: Math.min(position.y, window.innerHeight - 300),
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          ref={menuRef}
          className="fixed z-[200] min-w-[200px] py-2 bg-gray-800/95 backdrop-blur-xl rounded-xl border border-gray-600 shadow-2xl"
          style={{
            left: adjustedPosition.x,
            top: adjustedPosition.y,
          }}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          transition={{ duration: 0.1 }}
        >
          {items.map((item, index) => (
            item.divider ? (
              <div key={index} className="my-1 border-t border-gray-700" />
            ) : (
              <button
                key={index}
                onClick={() => {
                  if (!item.disabled) {
                    item.onClick();
                    onClose();
                  }
                }}
                disabled={item.disabled}
                className={`
                  w-full flex items-center justify-between px-3 py-2 text-sm
                  transition-colors
                  ${item.disabled 
                    ? 'text-gray-600 cursor-not-allowed' 
                    : item.danger 
                      ? 'text-red-400 hover:bg-red-500/20' 
                      : 'text-gray-200 hover:bg-gray-700'
                  }
                `}
              >
                <div className="flex items-center gap-3">
                  <span className="w-5 text-center">{item.icon}</span>
                  <span>{item.label}</span>
                </div>
                {item.shortcut && (
                  <span className="text-xs text-gray-500 font-mono">
                    {item.shortcut}
                  </span>
                )}
              </button>
            )
          ))}
        </motion.div>
      )}
    </AnimatePresence>
  );
});

// 预设菜单项
export const getCanvasMenuItems = (handlers: {
  onAddImageNode: () => void;
  onAddVideoNode: () => void;
  onAddTextNode: () => void;
  onQuickGenerateImage?: () => void;
  onQuickGenerateVideo?: () => void;
  onUpload: () => void;
  onOpenAssetLibrary: () => void;
  onUndo: () => void;
  onRedo: () => void;
  onPaste: () => void;
}): MenuItem[] => [
  { icon: '⚡', label: '快速生成图片', onClick: handlers.onQuickGenerateImage || (() => {}) },
  { icon: '🎬', label: '快速生成视频', onClick: handlers.onQuickGenerateVideo || (() => {}) },
  { divider: true, icon: '', label: '', onClick: () => {} },
  { icon: '🖼️', label: '添加图片节点', onClick: handlers.onAddImageNode },
  { icon: '🎥', label: '添加视频节点', onClick: handlers.onAddVideoNode },
  { icon: '📝', label: '添加文本节点', onClick: handlers.onAddTextNode },
  { divider: true, icon: '', label: '', onClick: () => {} },
  { icon: '📤', label: '上传素材', shortcut: 'Ctrl+U', onClick: handlers.onUpload },
  { icon: '📁', label: '从资产库添加', onClick: handlers.onOpenAssetLibrary },
  { divider: true, icon: '', label: '', onClick: () => {} },
  { icon: '↩️', label: '撤销', shortcut: 'Ctrl+Z', onClick: handlers.onUndo },
  { icon: '↪️', label: '重做', shortcut: 'Ctrl+Shift+Z', onClick: handlers.onRedo },
  { icon: '📋', label: '粘贴', shortcut: 'Ctrl+V', onClick: handlers.onPaste },
];

