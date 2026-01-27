'use client';

// 节点锚点组件 - 用于拖拽创建子节点
// 位置：节点四周（上下左右）

import { useState } from 'react';
import { motion } from 'framer-motion';

interface NodeAnchorProps {
  position: 'top' | 'right' | 'bottom' | 'left';
  nodeId: string;
  onDragStart: (position: 'top' | 'right' | 'bottom' | 'left') => void;
  onDragEnd: (position: { x: number; y: number }) => void;
}

export function NodeAnchor({ position, nodeId, onDragStart, onDragEnd }: NodeAnchorProps) {
  const [isDragging, setIsDragging] = useState(false);

  // 根据位置计算样式 - 增大点击区域，但 z-index 低于 Handle
  const getPositionStyle = () => {
    const baseStyle = 'absolute w-5 h-5 rounded-full bg-indigo-500 border-2 border-white cursor-crosshair z-[50]';

    switch (position) {
      case 'top':
        return `${baseStyle} top-0 left-1/2 -translate-x-1/2 -translate-y-1/2`;
      case 'right':
        // 右侧锚点偏移，避免与 Handle 重叠
        return `${baseStyle} right-0 top-1/4 translate-x-1/2 -translate-y-1/2`;
      case 'bottom':
        return `${baseStyle} bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2`;
      case 'left':
        // 左侧锚点偏移，避免与 Handle 重叠
        return `${baseStyle} left-0 top-1/4 -translate-x-1/2 -translate-y-1/2`;
    }
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    // 彻底阻止事件冒泡，防止触发节点拖拽
    e.stopPropagation();
    e.preventDefault();
    e.nativeEvent.stopImmediatePropagation();

    console.log('[NodeAnchor] Mouse down on anchor:', position);
    setIsDragging(true);
    onDragStart(position);

    const handleMouseMove = (moveEvent: MouseEvent) => {
      moveEvent.stopPropagation();
      moveEvent.preventDefault();
    };

    const handleMouseUp = (upEvent: MouseEvent) => {
      console.log('[NodeAnchor] Mouse up, triggering onDragEnd:', { x: upEvent.clientX, y: upEvent.clientY });
      setIsDragging(false);
      onDragEnd({ x: upEvent.clientX, y: upEvent.clientY });

      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  return (
    <motion.div
      className={getPositionStyle()}
      data-nodrag="true"
      onMouseDown={handleMouseDown}
      onPointerDown={(e) => {
        e.stopPropagation();
        e.preventDefault();
      }}
      whileHover={{ scale: 1.5, boxShadow: '0 0 15px rgba(99, 102, 241, 0.8)' }}
      animate={{
        scale: isDragging ? 1.5 : 1,
        boxShadow: isDragging ? '0 0 20px rgba(99, 102, 241, 0.8)' : '0 0 0px rgba(99, 102, 241, 0)',
      }}
      title={`从${position === 'top' ? '上方' : position === 'right' ? '右侧' : position === 'bottom' ? '下方' : '左侧'}创建子节点`}
    />
  );
}

