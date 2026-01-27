'use client';

// 视频节点组件 - Video Node
import { memo, useState, useRef } from 'react';
import { Handle, Position, NodeProps, useReactFlow } from 'reactflow';
import { motion, AnimatePresence } from 'framer-motion';
import { NodeContextMenu } from '../canvas/NodeContextMenu';

interface VideoNodeData {
  shot_id: string;
  label?: string;
  videoUrl?: string;
  thumbnailUrl?: string;
  duration?: number; // 秒
  status: 'idle' | 'generating' | 'success' | 'error';
  progress?: number;
}

interface VideoNodeProps extends NodeProps<VideoNodeData> {}

export const VideoNode = memo(function VideoNode({
  id,
  data,
  selected,
  xPos,
  yPos,
}: VideoNodeProps) {
  const [isHovering, setIsHovering] = useState(false);
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number } | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const { setNodes, setEdges } = useReactFlow();
  const isGenerating = data.status === 'generating';

  // 删除节点
  const handleDelete = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    setNodes((nodes) => nodes.filter((n) => n.id !== id));
    setEdges((edges) => edges.filter((e) => e.source !== id && e.target !== id));
    window.dispatchEvent(new CustomEvent('node-delete', { detail: { nodeId: id } }));
  };

  // 悬停播放
  const handleMouseEnter = () => {
    setIsHovering(true);
    if (videoRef.current && data.videoUrl) {
      videoRef.current.play().catch(() => {});
    }
  };

  const handleMouseLeave = () => {
    setIsHovering(false);
    if (videoRef.current) {
      videoRef.current.pause();
      videoRef.current.currentTime = 0;
    }
  };

  // 右键菜单
  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setContextMenu({ x: e.clientX, y: e.clientY });
  };

  // 引用生成新节点
  const createLinkedNode = (type: 'card' | 'video' | 'text') => {
    const newNodeId = `${type}_${Date.now()}`;
    const newNode = {
      id: newNodeId,
      type: type,
      position: { x: (xPos || 0) + 350, y: yPos || 0 },
      data: {
        shot_id: `${type}_${Date.now().toString(36)}`,
        status: type === 'text' ? 'success' : 'idle',
        progress: 0,
        label: type === 'video' ? '视频节点' : type === 'text' ? '文本节点' : '图片节点',
        sourceNodeId: id,
        sourceVideoUrl: data.videoUrl,
        text: type === 'text' ? '' : undefined,
      },
    };

    setNodes((nodes) => [...nodes, newNode]);
    setEdges((edges) => [...edges, {
      id: `edge_${id}_${newNodeId}`,
      source: id,
      target: newNodeId,
      type: 'smoothstep',
      animated: true,
      style: { stroke: '#a855f7', strokeWidth: 2 },
    }]);

    return newNodeId;
  };

  // 打开生成面板（引用当前节点）
  const openGenerationPanel = (type: 'image' | 'video') => {
    window.dispatchEvent(new CustomEvent('open-generation-panel', {
      detail: {
        type,
        sourceNodeId: id,
        sourceImage: data.thumbnailUrl || data.videoUrl,
        // 不预先创建节点，让 handleGenerate 来创建
      }
    }));
  };

  // 右键菜单项
  const contextMenuItems = [
    {
      icon: '🔗',
      label: '引用该节点生成',
      submenu: [
        { icon: '🖼️', label: '图片生成', onClick: () => openGenerationPanel('image') },
        { icon: '🎬', label: '视频生成', onClick: () => openGenerationPanel('video') },
      ],
    },
    { divider: true, icon: '', label: '' },
    { icon: '✏️', label: '编辑/重绘', onClick: () => window.dispatchEvent(new CustomEvent('node-edit', { detail: { nodeId: id } })) },
    { icon: '📋', label: '复制参数', onClick: () => navigator.clipboard.writeText(JSON.stringify({ shot_id: data.shot_id }, null, 2)) },
    { icon: '💾', label: '下载视频', onClick: () => { if (data.videoUrl) { const a = document.createElement('a'); a.href = data.videoUrl; a.download = `${data.shot_id}.mp4`; a.click(); }}, disabled: !data.videoUrl },
    { divider: true, icon: '', label: '' },
    { icon: '🗑️', label: '删除节点', onClick: () => handleDelete(), danger: true },
  ];

  return (
    <div
      className={`
        relative w-72 h-96 rounded-2xl overflow-visible
        bg-gradient-to-br from-purple-900/50 to-gray-900
        border-3 transition-all duration-300 shadow-2xl
        ${selected ? 'border-purple-500 shadow-purple-500/40 scale-105' : 'border-gray-600'}
        hover:border-gray-400 hover:shadow-xl
        cursor-pointer group
      `}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onContextMenu={handleContextMenu}
    >
      {/* 右键菜单 */}
      <NodeContextMenu
        isOpen={!!contextMenu}
        position={contextMenu || { x: 0, y: 0 }}
        onClose={() => setContextMenu(null)}
        items={contextMenuItems}
      />

      {/* 悬停操作栏 */}
      <AnimatePresence>
        {(isHovering || selected) && !isGenerating && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute -top-12 left-1/2 -translate-x-1/2 flex items-center gap-1 px-2 py-1.5 bg-gray-800/95 backdrop-blur rounded-lg border border-gray-600 shadow-xl z-50"
          >
            <button onClick={(e) => { e.stopPropagation(); window.dispatchEvent(new CustomEvent('node-edit', { detail: { nodeId: id } })); }} className="p-1.5 text-blue-400 hover:text-blue-300 hover:bg-blue-500/20 rounded" title="编辑/重绘">✏️</button>
            <button onClick={(e) => { e.stopPropagation(); navigator.clipboard.writeText(JSON.stringify({ shot_id: data.shot_id }, null, 2)); }} className="p-1.5 text-gray-400 hover:text-white hover:bg-gray-600 rounded" title="复制">📋</button>
            <button onClick={(e) => { e.stopPropagation(); if (data.videoUrl) { const a = document.createElement('a'); a.href = data.videoUrl; a.download = `${data.shot_id}.mp4`; a.click(); }}} className="p-1.5 text-gray-400 hover:text-white hover:bg-gray-600 rounded" title="下载">💾</button>
            <button onClick={() => handleDelete()} className="p-1.5 text-red-400 hover:text-red-300 hover:bg-red-500/20 rounded" title="删除">🗑️</button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 视频标识角标 */}
      <div className="absolute top-2 right-2 z-20 px-2 py-1 bg-purple-500/80 rounded-md text-xs text-white font-medium">
        🎬 视频
      </div>

      {/* 呼吸灯边框 - 生成中显示 */}
      {isGenerating && (
        <motion.div
          className="absolute inset-0 rounded-2xl border-4 border-purple-400 pointer-events-none z-10"
          animate={{
            opacity: [0.3, 1, 0.3],
            scale: [1, 1.02, 1],
          }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
          style={{
            boxShadow: '0 0 20px rgba(168, 85, 247, 0.5)',
          }}
        />
      )}

      {/* 左侧连接点 - 既可以接收也可以发出连线 */}
      <Handle
        type="target"
        position={Position.Left}
        id="left-target"
        className="!w-6 !h-6 !bg-blue-500 !border-3 !border-blue-300 !rounded-full hover:!bg-blue-400 hover:!scale-150 !transition-all !cursor-crosshair !shadow-lg"
        style={{ left: -12, zIndex: 1000 }}
        isConnectable={true}
      />
      <Handle
        type="source"
        position={Position.Left}
        id="left-source"
        className="!w-6 !h-6 !bg-blue-500 !border-3 !border-blue-300 !rounded-full hover:!bg-blue-400 hover:!scale-150 !transition-all !cursor-crosshair !shadow-lg !opacity-0 hover:!opacity-100"
        style={{ left: -12, zIndex: 1001 }}
        isConnectable={true}
      />

      {/* 右侧连接点 - 既可以接收也可以发出连线 */}
      <Handle
        type="source"
        position={Position.Right}
        id="right-source"
        className="!w-6 !h-6 !bg-green-500 !border-3 !border-green-300 !rounded-full hover:!bg-green-400 hover:!scale-150 !transition-all !cursor-crosshair !shadow-lg"
        style={{ right: -12, zIndex: 1000 }}
        isConnectable={true}
      />
      <Handle
        type="target"
        position={Position.Right}
        id="right-target"
        className="!w-6 !h-6 !bg-green-500 !border-3 !border-green-300 !rounded-full hover:!bg-green-400 hover:!scale-150 !transition-all !cursor-crosshair !shadow-lg !opacity-0 hover:!opacity-100"
        style={{ right: -12, zIndex: 1001 }}
        isConnectable={true}
      />

      {/* 内容区域 */}
      <div className="relative h-full flex flex-col rounded-2xl overflow-hidden">
        {/* 视频/缩略图区域 */}
        <div className="flex-1 relative bg-gray-800/50">
          {data.videoUrl ? (
            <>
              <video
                ref={videoRef}
                src={data.videoUrl}
                poster={data.thumbnailUrl}
                className="w-full h-full object-cover"
                muted
                loop
                playsInline
              />
              {/* 播放指示器 */}
              {!isHovering && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                  <div className="w-16 h-16 rounded-full bg-white/20 backdrop-blur flex items-center justify-center">
                    <span className="text-3xl ml-1">▶</span>
                  </div>
                </div>
              )}
              {/* 时长标签 */}
              {data.duration && (
                <div className="absolute bottom-2 right-2 px-2 py-1 bg-black/70 rounded text-xs text-white">
                  {Math.floor(data.duration / 60)}:{String(data.duration % 60).padStart(2, '0')}
                </div>
              )}
            </>
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <div className="text-center text-gray-500">
                <div className="text-6xl mb-3">🎬</div>
                <div className="text-sm px-4 font-medium">{data.label || '双击生成视频'}</div>
              </div>
            </div>
          )}

          {/* 生成中遮罩 */}
          {isGenerating && (
            <div className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center">
              <div className="text-purple-400 text-lg mb-3">🎬 渲染中...</div>
              <div className="w-3/4 h-2 bg-gray-700 rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${data.progress || 0}%` }}
                  transition={{ duration: 0.3 }}
                />
              </div>
              <div className="text-purple-400 text-sm mt-2">{data.progress || 0}%</div>
            </div>
          )}
        </div>

        {/* 底部信息栏 */}
        <div className="p-3 bg-gray-900/95 backdrop-blur border-t border-gray-700">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-400 truncate max-w-[140px] font-mono">
              {data.shot_id}
            </span>
            <span className={`text-sm px-3 py-1 rounded-full font-medium ${
              data.status === 'idle' ? 'bg-gray-700 text-gray-300' :
              data.status === 'generating' ? 'bg-purple-500/20 text-purple-400' :
              data.status === 'success' ? 'bg-green-500/20 text-green-400' :
              'bg-red-500/20 text-red-400'
            }`}>
              {data.status === 'idle' ? '双击生成' :
               data.status === 'generating' ? '⏳ 渲染中' :
               data.status === 'success' ? '✓ 完成' : '✗ 失败'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
});

