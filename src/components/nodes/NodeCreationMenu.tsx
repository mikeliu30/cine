'use client';

// 节点创建快捷菜单 - 拖拽连线后弹出

import { motion, AnimatePresence } from 'framer-motion';

interface NodeCreationMenuProps {
  isVisible: boolean;
  position: { x: number; y: number };
  onSelect: (type: 'text' | 'image' | 'video' | 'editor') => void;
  onClose: () => void;
}

export function NodeCreationMenu({ isVisible, position, onSelect, onClose }: NodeCreationMenuProps) {
  if (!isVisible) return null;

  const menuItems = [
    {
      type: 'text' as const,
      icon: 'T',
      label: '文本生成',
      description: '脚本、广告词、品牌文案',
      color: 'from-gray-600 to-gray-700',
      createsChild: false, // 更改当前节点
    },
    {
      type: 'image' as const,
      icon: '🖼️',
      label: '图片生成',
      description: '基于当前节点生成新图片',
      color: 'from-purple-500 to-pink-500',
      createsChild: true, // 创建子节点
    },
    {
      type: 'video' as const,
      icon: '🎬',
      label: '视频生成',
      description: '将图片转为动态视频',
      color: 'from-blue-500 to-cyan-500',
      createsChild: true, // 创建子节点
    },
    {
      type: 'editor' as const,
      icon: '✂️',
      label: '图片编辑器',
      description: '重绘、擦除、扩图',
      color: 'from-green-500 to-teal-500',
      createsChild: false, // 更改当前节点
    },
  ];

  return (
    <AnimatePresence>
      {isVisible && (
        <>
          {/* 背景遮罩 */}
          <motion.div
            className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />

          {/* 菜单面板 */}
          <motion.div
            className="fixed z-50 bg-gray-900 rounded-2xl shadow-2xl border border-gray-700 p-2 min-w-[240px]"
            style={{
              left: position.x,
              top: position.y,
              transform: 'translate(-50%, -50%)',
            }}
            initial={{ scale: 0.8, opacity: 0, y: 10 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.8, opacity: 0, y: 10 }}
            transition={{ type: 'spring', damping: 20, stiffness: 300 }}
          >
            {/* 标题 */}
            <div className="px-3 py-2 border-b border-gray-700">
              <h3 className="text-sm font-semibold text-white">引用该节点生成</h3>
            </div>

            {/* 菜单项 */}
            <div className="py-1 space-y-1">
              {menuItems.map((item) => (
                <motion.button
                  key={item.type}
                  onClick={() => {
                    onSelect(item.type);
                    onClose();
                  }}
                  className="w-full flex items-start gap-3 px-3 py-2.5 rounded-lg hover:bg-gray-800 transition-colors text-left group"
                  whileHover={{ x: 4 }}
                  whileTap={{ scale: 0.98 }}
                >
                  {/* 图标 */}
                  <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${item.color} flex items-center justify-center text-xl flex-shrink-0 group-hover:scale-110 transition-transform`}>
                    {item.icon}
                  </div>

                  {/* 文字 */}
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-white">{item.label}</div>
                    <div className="text-xs text-gray-400 mt-0.5">{item.description}</div>
                  </div>

                  {/* 箭头 */}
                  <div className="text-gray-600 group-hover:text-gray-400 transition-colors self-center">
                    →
                  </div>
                </motion.button>
              ))}
            </div>

            {/* 提示 */}
            <div className="px-3 py-2 border-t border-gray-700 mt-1">
              <p className="text-xs text-gray-500">按 ESC 取消</p>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

