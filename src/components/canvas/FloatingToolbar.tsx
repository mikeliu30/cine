'use client';

import { useCallback } from 'react';
import { motion } from 'framer-motion';
import { useReactFlow } from 'reactflow';
import * as Y from 'yjs';
import { Node } from 'reactflow';

interface FloatingToolbarProps {
  yNodes: Y.Array<Node>;
  onUpload?: () => void;
}

export function FloatingToolbar({ yNodes, onUpload }: FloatingToolbarProps) {
  const { fitView, setViewport, zoomIn, zoomOut } = useReactFlow();

  // 添加卡牌节点
  const addCardNode = useCallback(() => {
    const newNode: Node = {
      id: `card_${Date.now()}`,
      type: 'card',
      position: {
        x: Math.random() * 400 + 100,
        y: Math.random() * 300 + 100,
      },
      data: {
        shot_id: `shot_${Date.now().toString(36)}`,
        status: 'idle',
        progress: 0,
        label: `卡牌 ${yNodes.length + 1}`,
      },
    };
    yNodes.push([newNode]);
  }, [yNodes]);

  // 添加视频节点
  const addVideoNode = useCallback(() => {
    const newNode: Node = {
      id: `video_${Date.now()}`,
      type: 'video',
      position: {
        x: Math.random() * 400 + 100,
        y: Math.random() * 300 + 100,
      },
      data: {
        shot_id: `vid_${Date.now().toString(36)}`,
        status: 'idle',
        progress: 0,
        label: `视频 ${yNodes.length + 1}`,
      },
    };
    yNodes.push([newNode]);
  }, [yNodes]);

  // 添加文本节点
  const addTextNode = useCallback(() => {
    const newNode: Node = {
      id: `text_${Date.now()}`,
      type: 'text',
      position: {
        x: Math.random() * 400 + 100,
        y: Math.random() * 300 + 100,
      },
      data: {
        shot_id: `txt_${Date.now().toString(36)}`,
        status: 'success',
        text: '',
        label: `文本 ${yNodes.length + 1}`,
      },
    };
    yNodes.push([newNode]);
  }, [yNodes]);

  // 回到原点
  const goToOrigin = useCallback(() => {
    setViewport({ x: 0, y: 0, zoom: 1 }, { duration: 500 });
  }, [setViewport]);

  // 适应所有节点
  const fitAllNodes = useCallback(() => {
    fitView({ padding: 0.2, duration: 500 });
  }, [fitView]);

  return (
    <motion.div
      className="absolute bottom-8 left-1/2 -translate-x-1/2 z-40"
      initial={{ y: 100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ delay: 0.3, type: 'spring', damping: 20 }}
    >
      <div className="flex items-center gap-2 px-4 py-3 bg-gray-800/90 backdrop-blur-lg rounded-2xl border border-gray-700 shadow-2xl">
        {/* 添加卡牌 */}
        <motion.button
          onClick={addCardNode}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-yellow-500 to-orange-500 text-white font-medium hover:scale-105 active:scale-95 transition-transform duration-200"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <span className="text-lg">🎴</span>
          <span className="text-sm">图片</span>
        </motion.button>

        {/* 添加视频节点 */}
        <motion.button
          onClick={addVideoNode}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 text-white font-medium hover:scale-105 active:scale-95 transition-transform duration-200"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <span className="text-lg">🎬</span>
          <span className="text-sm">视频</span>
        </motion.button>

        {/* 添加文本节点 */}
        <motion.button
          onClick={addTextNode}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-blue-500 to-cyan-500 text-white font-medium hover:scale-105 active:scale-95 transition-transform duration-200"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <span className="text-lg">📝</span>
          <span className="text-sm">文本</span>
        </motion.button>

        {/* 上传素材 */}
        {onUpload && (
          <motion.button
            onClick={onUpload}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-green-500 to-emerald-500 text-white font-medium hover:scale-105 active:scale-95 transition-transform duration-200"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <span className="text-lg">📤</span>
            <span className="text-sm">上传</span>
          </motion.button>
        )}

        {/* 分隔线 */}
        <div className="w-px h-8 bg-gray-600 mx-1" />

        {/* 视图控制按钮 */}
        <motion.button
          onClick={goToOrigin}
          className="flex items-center gap-1 px-3 py-2 rounded-lg bg-gray-700 hover:bg-gray-600 text-white text-sm transition-colors"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          title="回到原点"
        >
          <span>🏠</span>
          <span>原点</span>
        </motion.button>

        <motion.button
          onClick={fitAllNodes}
          className="flex items-center gap-1 px-3 py-2 rounded-lg bg-gray-700 hover:bg-gray-600 text-white text-sm transition-colors"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          title="适应所有节点"
        >
          <span>🔍</span>
          <span>全览</span>
        </motion.button>

        <motion.button
          onClick={() => zoomIn({ duration: 300 })}
          className="flex items-center justify-center w-9 h-9 rounded-lg bg-gray-700 hover:bg-gray-600 text-white text-lg transition-colors"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          title="放大"
        >
          +
        </motion.button>

        <motion.button
          onClick={() => zoomOut({ duration: 300 })}
          className="flex items-center justify-center w-9 h-9 rounded-lg bg-gray-700 hover:bg-gray-600 text-white text-lg transition-colors"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          title="缩小"
        >
          −
        </motion.button>
      </div>
    </motion.div>
  );
}

