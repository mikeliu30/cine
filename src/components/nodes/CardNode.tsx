'use client';

import { memo, useState } from 'react';
import { Handle, Position, NodeProps, useReactFlow } from 'reactflow';
import { motion, AnimatePresence } from 'framer-motion';
import { CardNodeData } from '@/types';
import { NodeContextMenu } from '../canvas/NodeContextMenu';
import { NodeAnchor } from './NodeAnchor';

interface CardNodeProps extends NodeProps<CardNodeData> {
  onDoubleClick?: (nodeId: string) => void;
}

export const CardNode = memo(function CardNode({
  id,
  data,
  selected,
  xPos,
  yPos,
}: CardNodeProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [showInfo, setShowInfo] = useState(false);
  const [showLightbox, setShowLightbox] = useState(false);
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number } | null>(null);
  const [isDraggingAnchor, setIsDraggingAnchor] = useState(false);
  const { setNodes, setEdges, getNodes } = useReactFlow();

  const isGenerating = data.status === 'generating';

  // 根据 aspectRatio 动态计算卡片尺寸
  const getCardDimensions = () => {
    const aspectRatio = data.aspectRatio || '9:16'; // 默认竖屏
    const baseHeight = 384; // 基准高度 (h-96 = 24rem = 384px)

    // 解析比例
    const [widthRatio, heightRatio] = aspectRatio.split(':').map(Number);

    if (!widthRatio || !heightRatio) {
      // 如果解析失败，返回默认尺寸
      console.log('[CardNode] Failed to parse aspectRatio:', aspectRatio);
      return { width: 288, height: 384 };
    }

    // 根据基准高度计算宽度
    const width = Math.round(baseHeight * widthRatio / heightRatio);

    console.log('[CardNode]', data.shot_id, 'aspectRatio:', aspectRatio, 'dimensions:', { width, height: baseHeight });
    return { width, height: baseHeight };
  };

  const cardDimensions = getCardDimensions();

  // 锚点拖拽处理
  const handleAnchorDragStart = (position: 'top' | 'right' | 'bottom' | 'left') => {
    console.log('[CardNode] Anchor drag start:', position);
    setIsDraggingAnchor(true);
    window.dispatchEvent(new CustomEvent('anchor-drag-start', {
      detail: {
        nodeId: id,
        nodePosition: { x: xPos, y: yPos },
        anchorPosition: position,
        nodeData: data,
      }
    }));
  };

  const handleAnchorDragEnd = (mousePos: { x: number; y: number }) => {
    console.log('[CardNode] Anchor drag end, dispatching event:', mousePos);
    setIsDraggingAnchor(false);
    window.dispatchEvent(new CustomEvent('anchor-drag-end', {
      detail: {
        nodeId: id,
        mousePosition: mousePos,
        nodeData: data,
      }
    }));
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    setNodes((nodes) => nodes.filter((n) => n.id !== id));
    setEdges((edges) => edges.filter((e) => e.source !== id && e.target !== id));
    window.dispatchEvent(new CustomEvent('node-delete', { detail: { nodeId: id } }));
  };

  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    window.dispatchEvent(new CustomEvent('node-edit', {
      detail: { nodeId: id, imageUrl: data.imageUrl }
    }));
  };

  const handleCopy = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(JSON.stringify({ prompt: data.prompt, model: data.model, shot_id: data.shot_id }, null, 2));
  };

  const handleDownload = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (data.imageUrl) {
      const a = document.createElement('a');
      a.href = data.imageUrl;
      a.download = `${data.shot_id || 'image'}.png`;
      a.click();
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
        // 引用源节点信息
        sourceNodeId: id,
        sourceImageUrl: data.imageUrl,
        text: type === 'text' ? '' : undefined,
      },
    };

    // 添加新节点
    setNodes((nodes) => [...nodes, newNode]);

    // 添加连接线
    setEdges((edges) => [...edges, {
      id: `edge_${id}_${newNodeId}`,
      source: id,
      target: newNodeId,
      type: 'smoothstep',
      animated: true,
      style: { stroke: '#6366f1', strokeWidth: 2 },
    }]);

    // 返回新节点ID，用于后续操作
    return newNodeId;
  };

  // 打开生成面板（引用当前节点）
  const openGenerationPanel = (type: 'image' | 'video') => {
    window.dispatchEvent(new CustomEvent('open-generation-panel', {
      detail: {
        type,
        sourceNodeId: id,
        sourceImage: data.imageUrl,
        sourcePrompt: data.prompt,
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
    { icon: '✏️', label: '编辑/重绘', onClick: () => handleEdit({ stopPropagation: () => {} } as React.MouseEvent) },
    { icon: '📋', label: '复制参数', onClick: () => handleCopy({ stopPropagation: () => {} } as React.MouseEvent) },
    { icon: '💾', label: '下载图片', onClick: () => handleDownload({ stopPropagation: () => {} } as React.MouseEvent), disabled: !data.imageUrl },
    { icon: '🔍', label: '全屏预览', onClick: () => setShowLightbox(true), disabled: !data.imageUrl },
    { divider: true, icon: '', label: '' },
    { icon: '🗑️', label: '删除节点', onClick: () => handleDelete({ stopPropagation: () => {} } as React.MouseEvent), danger: true },
  ];

  return (
    <div
      className={`relative rounded-2xl overflow-visible bg-gradient-to-br from-gray-800 to-gray-900 border-3 transition-all duration-300 shadow-2xl cursor-pointer group
        ${selected ? 'border-indigo-500 shadow-indigo-500/40 scale-105' : 'border-gray-600'} hover:border-gray-400 hover:shadow-xl`}
      style={{
        width: `${cardDimensions.width}px`,
        height: `${cardDimensions.height}px`
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
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
        {(isHovered || selected) && !isGenerating && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute -top-12 left-1/2 -translate-x-1/2 flex items-center gap-1 px-2 py-1.5 bg-gray-800/95 backdrop-blur rounded-lg border border-gray-600 shadow-xl z-50"
          >
            <button onClick={handleEdit} className="p-1.5 text-blue-400 hover:text-blue-300 hover:bg-blue-500/20 rounded" title="编辑/重绘">✏️</button>
            <button onClick={handleCopy} className="p-1.5 text-gray-400 hover:text-white hover:bg-gray-600 rounded" title="复制参数">📋</button>
            <button onClick={handleDownload} className="p-1.5 text-gray-400 hover:text-white hover:bg-gray-600 rounded" title="下载">💾</button>
            <button onClick={(e) => { e.stopPropagation(); setShowInfo(true); }} className="p-1.5 text-gray-400 hover:text-white hover:bg-gray-600 rounded" title="查看详情">ℹ️</button>
            <button onClick={(e) => { e.stopPropagation(); if(data.imageUrl) setShowLightbox(true); }} className="p-1.5 text-gray-400 hover:text-white hover:bg-gray-600 rounded" title="全屏预览">🔍</button>
            <button onClick={handleDelete} className="p-1.5 text-red-400 hover:text-red-300 hover:bg-red-500/20 rounded" title="删除">🗑️</button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 呼吸灯边框 */}
      {isGenerating && (
        <motion.div
          className="absolute inset-0 rounded-2xl border-4 border-yellow-400 pointer-events-none z-10"
          animate={{ opacity: [0.3, 1, 0.3], scale: [1, 1.02, 1] }}
          transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
          style={{ boxShadow: '0 0 20px rgba(250, 204, 21, 0.5)' }}
        />
      )}

      {/* 左侧连接点 - 既可以输入也可以输出 */}
      <Handle
        type="target"
        position={Position.Left}
        id="left-target"
        className="!w-6 !h-6 !bg-indigo-500 !border-3 !border-indigo-300 !rounded-full hover:!bg-indigo-400 hover:!scale-150 !transition-all !cursor-crosshair !shadow-lg"
        style={{ left: -12, zIndex: 1000 }}
        isConnectable={true}
      />
      <Handle
        type="source"
        position={Position.Left}
        id="left-source"
        className="!w-6 !h-6 !bg-indigo-500 !border-3 !border-indigo-300 !rounded-full hover:!bg-indigo-400 hover:!scale-150 !transition-all !cursor-crosshair !shadow-lg"
        style={{ left: -12, zIndex: 1001 }}
        isConnectable={true}
      />

      {/* 右侧连接点 - 既可以输入也可以输出 */}
      <Handle
        type="source"
        position={Position.Right}
        id="right-source"
        className="!w-6 !h-6 !bg-indigo-500 !border-3 !border-indigo-300 !rounded-full hover:!bg-indigo-400 hover:!scale-150 !transition-all !cursor-crosshair !shadow-lg"
        style={{ right: -12, zIndex: 1000 }}
        isConnectable={true}
      />
      <Handle
        type="target"
        position={Position.Right}
        id="right-target"
        className="!w-6 !h-6 !bg-indigo-500 !border-3 !border-indigo-300 !rounded-full hover:!bg-indigo-400 hover:!scale-150 !transition-all !cursor-crosshair !shadow-lg"
        style={{ right: -12, zIndex: 1001 }}
        isConnectable={true}
      />

      {/* 节点锚点 - 用于拖拽创建子节点 */}
      {(isHovered || selected) && !isGenerating && (
        <>
          <NodeAnchor position="top" nodeId={id} onDragStart={handleAnchorDragStart} onDragEnd={handleAnchorDragEnd} />
          <NodeAnchor position="right" nodeId={id} onDragStart={handleAnchorDragStart} onDragEnd={handleAnchorDragEnd} />
          <NodeAnchor position="bottom" nodeId={id} onDragStart={handleAnchorDragStart} onDragEnd={handleAnchorDragEnd} />
          <NodeAnchor position="left" nodeId={id} onDragStart={handleAnchorDragStart} onDragEnd={handleAnchorDragEnd} />
        </>
      )}

      {/* 内容区域 */}
      <div className="relative h-full flex flex-col rounded-2xl overflow-hidden">
        <div className="flex-1 relative bg-gray-800/50">
          {data.imageUrl ? (
            <img src={data.imageUrl} alt="Card" className="w-full h-full object-contain" />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <div className="text-center text-gray-500">
                <div className="text-6xl mb-3">🎴</div>
                <div className="text-sm px-4 font-medium">{data.label || '双击生成'}</div>
              </div>
            </div>
          )}
          {isGenerating && (
            <div className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center">
              <div className="text-yellow-400 text-lg mb-3">✨ 炼金中...</div>
              <div className="w-3/4 h-2 bg-gray-700 rounded-full overflow-hidden">
                <motion.div className="h-full bg-gradient-to-r from-yellow-500 to-orange-500 rounded-full" initial={{ width: 0 }} animate={{ width: `${data.progress || 0}%` }} transition={{ duration: 0.3 }} />
              </div>
              <div className="text-yellow-400 text-sm mt-2">{data.progress || 0}%</div>
            </div>
          )}
        </div>
        <div className="p-3 bg-gray-900/95 backdrop-blur border-t border-gray-700">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-400 truncate max-w-[140px] font-mono">{data.shot_id}</span>
            <span className={`text-sm px-3 py-1 rounded-full font-medium ${data.status === 'idle' ? 'bg-gray-700 text-gray-300' : data.status === 'generating' ? 'bg-yellow-500/20 text-yellow-400' : data.status === 'success' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
              {data.status === 'idle' ? '双击生成' : data.status === 'generating' ? '⏳ 生成中' : data.status === 'success' ? '✓ 完成' : '✗ 失败'}
            </span>
          </div>
        </div>
      </div>

      {/* 详情弹窗 */}
      <AnimatePresence>
        {showInfo && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60" onClick={() => setShowInfo(false)}>
            <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0.9 }} className="bg-gray-900 rounded-xl p-6 max-w-md w-full mx-4 border border-gray-700" onClick={e => e.stopPropagation()}>
              <h3 className="text-lg font-semibold text-white mb-4">📋 节点详情</h3>
              <div className="space-y-3 text-sm">
                <div><span className="text-gray-400">ID:</span> <span className="text-white font-mono">{data.shot_id}</span></div>
                <div><span className="text-gray-400">状态:</span> <span className="text-white">{data.status}</span></div>
                <div><span className="text-gray-400">Prompt:</span> <span className="text-white">{data.prompt || '无'}</span></div>
                <div><span className="text-gray-400">模型:</span> <span className="text-white">{data.model || '无'}</span></div>
              </div>
              <button onClick={() => setShowInfo(false)} className="mt-4 w-full py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg">关闭</button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 全屏预览 */}
      <AnimatePresence>
        {showLightbox && data.imageUrl && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90" onClick={() => setShowLightbox(false)}>
            <motion.img initial={{ scale: 0.8 }} animate={{ scale: 1 }} exit={{ scale: 0.8 }} src={data.imageUrl} alt="Preview" className="max-w-[90vw] max-h-[90vh] object-contain rounded-lg" />
            <button className="absolute top-4 right-4 text-white text-2xl hover:text-gray-300" onClick={() => setShowLightbox(false)}>✕</button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
});

