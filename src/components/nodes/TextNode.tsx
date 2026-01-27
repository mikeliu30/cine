'use client';

// Text Node - 纯文本提示词节点
// 用于在画布上显示文本/提示词，可作为创作起点

import { memo, useState, useCallback } from 'react';
import { Handle, Position, NodeProps, useReactFlow } from 'reactflow';
import { motion, AnimatePresence } from 'framer-motion';

interface TextNodeData {
  text: string;
  label?: string;
  isEditing?: boolean;
}

export const TextNode = memo(function TextNode({ id, data, selected }: NodeProps<TextNodeData>) {
  const [isEditing, setIsEditing] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [text, setText] = useState(data.text || '');
  const { setNodes, setEdges } = useReactFlow();

  // 删除节点
  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    setNodes((nodes) => nodes.filter((n) => n.id !== id));
    setEdges((edges) => edges.filter((e) => e.source !== id && e.target !== id));
    window.dispatchEvent(new CustomEvent('node-delete', { detail: { nodeId: id } }));
  };

  const handleDoubleClick = useCallback(() => {
    setIsEditing(true);
  }, []);

  const handleBlur = useCallback(() => {
    setIsEditing(false);
    // 这里可以触发保存到 yNodes
  }, []);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      setIsEditing(false);
    }
    if (e.key === 'Escape') {
      setIsEditing(false);
    }
  }, []);

  return (
    <motion.div
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      className={`
        relative min-w-[200px] max-w-[400px] p-4 rounded-xl
        bg-gradient-to-br from-gray-800 to-gray-900
        border-2 transition-all duration-200
        ${selected ? 'border-blue-500 shadow-lg shadow-blue-500/20' : 'border-gray-700'}
      `}
      onDoubleClick={handleDoubleClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* 悬停操作栏 */}
      <AnimatePresence>
        {(isHovered || selected) && !isEditing && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute -top-10 left-1/2 -translate-x-1/2 flex items-center gap-1 px-2 py-1 bg-gray-800/95 backdrop-blur rounded-lg border border-gray-600 shadow-xl z-50"
          >
            <button
              onClick={handleDelete}
              className="p-1 text-red-400 hover:text-red-300 hover:bg-red-500/20 rounded transition-colors text-sm"
              title="删除节点"
            >
              🗑️
            </button>
          </motion.div>
        )}
      </AnimatePresence>
      {/* 左侧连接点 - 既可以接收也可以发出连线 */}
      <Handle
        type="target"
        position={Position.Left}
        id="left-target"
        className="!w-4 !h-4 !bg-blue-500 !border-2 !border-gray-900 hover:!scale-150 !transition-all !cursor-crosshair"
        style={{ zIndex: 1000 }}
        isConnectable={true}
      />
      <Handle
        type="source"
        position={Position.Left}
        id="left-source"
        className="!w-4 !h-4 !bg-blue-500 !border-2 !border-gray-900 hover:!scale-150 !transition-all !cursor-crosshair !opacity-0 hover:!opacity-100"
        style={{ zIndex: 1001 }}
        isConnectable={true}
      />

      {/* 右侧连接点 - 既可以接收也可以发出连线 */}
      <Handle
        type="source"
        position={Position.Right}
        id="right-source"
        className="!w-4 !h-4 !bg-green-500 !border-2 !border-gray-900 hover:!scale-150 !transition-all !cursor-crosshair"
        style={{ zIndex: 1000 }}
        isConnectable={true}
      />
      <Handle
        type="target"
        position={Position.Right}
        id="right-target"
        className="!w-4 !h-4 !bg-green-500 !border-2 !border-gray-900 hover:!scale-150 !transition-all !cursor-crosshair !opacity-0 hover:!opacity-100"
        style={{ zIndex: 1001 }}
        isConnectable={true}
      />

      {/* 节点图标和标签 */}
      <div className="flex items-center gap-2 mb-2">
        <span className="text-lg">📝</span>
        <span className="text-xs text-gray-400 font-medium">
          {data.label || 'Text Node'}
        </span>
      </div>

      {/* 文本内容 */}
      {isEditing ? (
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
          autoFocus
          className="w-full min-h-[60px] p-2 bg-gray-700 border border-gray-600 rounded-lg 
                     text-white text-sm resize-none focus:outline-none focus:border-blue-500"
          placeholder="输入提示词..."
        />
      ) : (
        <div className="text-white text-sm leading-relaxed whitespace-pre-wrap">
          {text || (
            <span className="text-gray-500 italic">双击编辑文本...</span>
          )}
        </div>
      )}

      {/* 字数统计 */}
      <div className="mt-2 text-right text-xs text-gray-500">
        {text.length} 字
      </div>

      {/* 选中高亮效果 */}
      {selected && (
        <motion.div
          className="absolute inset-0 rounded-xl border-2 border-blue-400 pointer-events-none"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          layoutId="selection"
        />
      )}
    </motion.div>
  );
});

