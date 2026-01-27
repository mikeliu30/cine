'use client';

// 节点悬停操作栏 - Floating Action Bar
// 功能：编辑/复制/下载/删除/详情/全屏

import { memo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface NodeActionBarProps {
  nodeId: string;
  imageUrl?: string;
  onEdit?: () => void;
  onCopy?: () => void;
  onDownload?: () => void;
  onDelete?: () => void;
  onInfo?: () => void;
  onExpand?: () => void;
}

export const NodeActionBar = memo(function NodeActionBar({
  nodeId,
  imageUrl,
  onEdit,
  onCopy,
  onDownload,
  onDelete,
  onInfo,
  onExpand,
}: NodeActionBarProps) {
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);

  const handleDownload = () => {
    if (!imageUrl) return;
    
    // 创建下载链接
    const link = document.createElement('a');
    link.href = imageUrl;
    link.download = `cineflow_${nodeId}_${Date.now()}.png`;
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    onDownload?.();
  };

  const handleCopy = async () => {
    if (!imageUrl) return;
    
    try {
      // 复制图片 URL 到剪贴板
      await navigator.clipboard.writeText(imageUrl);
      onCopy?.();
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const handleDelete = () => {
    if (showConfirmDelete) {
      onDelete?.();
      setShowConfirmDelete(false);
    } else {
      setShowConfirmDelete(true);
      // 3秒后自动取消确认状态
      setTimeout(() => setShowConfirmDelete(false), 3000);
    }
  };

  const actions = [
    { icon: '✏️', label: '编辑', onClick: onEdit, show: !!onEdit },
    { icon: '📋', label: '复制', onClick: handleCopy, show: !!imageUrl },
    { icon: '⬇️', label: '下载', onClick: handleDownload, show: !!imageUrl },
    { icon: 'ℹ️', label: '详情', onClick: onInfo, show: !!onInfo },
    { icon: '🔍', label: '全屏', onClick: onExpand, show: !!imageUrl },
    { 
      icon: showConfirmDelete ? '⚠️' : '🗑️', 
      label: showConfirmDelete ? '确认?' : '删除', 
      onClick: handleDelete, 
      show: !!onDelete,
      danger: true,
    },
  ].filter(a => a.show);

  return (
    <motion.div
      className="absolute -bottom-12 left-1/2 -translate-x-1/2 z-50"
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
    >
      <div className="flex items-center gap-1 px-2 py-1.5 bg-gray-800/95 backdrop-blur-xl rounded-xl border border-gray-600 shadow-2xl">
        {actions.map((action, index) => (
          <button
            key={index}
            onClick={action.onClick}
            className={`
              flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium
              transition-all duration-200 hover:scale-105 active:scale-95
              ${action.danger 
                ? 'hover:bg-red-500/20 text-red-400 hover:text-red-300' 
                : 'hover:bg-gray-700 text-gray-300 hover:text-white'
              }
            `}
            title={action.label}
          >
            <span>{action.icon}</span>
            <span className="hidden sm:inline">{action.label}</span>
          </button>
        ))}
      </div>
    </motion.div>
  );
});

