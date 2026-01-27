'use client';

// 拖拽连线组件 - 显示从父节点到鼠标位置的连线

import { motion, AnimatePresence } from 'framer-motion';

interface DragConnectionLineProps {
  isVisible: boolean;
  startPos: { x: number; y: number };
  endPos: { x: number; y: number };
}

export function DragConnectionLine({ isVisible, startPos, endPos }: DragConnectionLineProps) {
  if (!isVisible) return null;

  // 计算 SVG 路径（贝塞尔曲线）
  const dx = endPos.x - startPos.x;
  const dy = endPos.y - startPos.y;
  
  // 控制点偏移（创建平滑曲线）
  const controlOffset = Math.abs(dx) * 0.5;
  
  const path = `M ${startPos.x} ${startPos.y} C ${startPos.x + controlOffset} ${startPos.y}, ${endPos.x - controlOffset} ${endPos.y}, ${endPos.x} ${endPos.y}`;

  return (
    <AnimatePresence>
      <svg
        className="fixed top-0 left-0 w-full h-full pointer-events-none z-50"
        style={{ position: 'fixed' }}
      >
        <defs>
          <linearGradient id="lineGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#6366f1" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#ec4899" stopOpacity="0.8" />
          </linearGradient>
          
          {/* 箭头标记 */}
          <marker
            id="arrowhead"
            markerWidth="10"
            markerHeight="10"
            refX="9"
            refY="3"
            orient="auto"
          >
            <polygon points="0 0, 10 3, 0 6" fill="#ec4899" />
          </marker>
        </defs>
        
        {/* 发光效果 */}
        <motion.path
          d={path}
          stroke="url(#lineGradient)"
          strokeWidth="6"
          fill="none"
          opacity="0.3"
          filter="blur(4px)"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 0.3 }}
        />
        
        {/* 主连线 */}
        <motion.path
          d={path}
          stroke="url(#lineGradient)"
          strokeWidth="3"
          fill="none"
          markerEnd="url(#arrowhead)"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 0.3 }}
        />
        
        {/* 动画点 */}
        <motion.circle
          r="4"
          fill="#fff"
          initial={{ offsetDistance: '0%' }}
          animate={{ offsetDistance: '100%' }}
          transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
        >
          <animateMotion dur="1.5s" repeatCount="indefinite">
            <mpath href={`#path-${Date.now()}`} />
          </animateMotion>
        </motion.circle>
      </svg>
    </AnimatePresence>
  );
}

