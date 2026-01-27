'use client';

import { UserPresence } from '@/types';
import { motion, AnimatePresence } from 'framer-motion';

interface CursorOverlayProps {
  users: UserPresence[];
}

export function CursorOverlay({ users }: CursorOverlayProps) {
  return (
    <div className="absolute inset-0 pointer-events-none z-50 overflow-hidden">
      <AnimatePresence>
        {users.map((user) => {
          if (!user.cursor) return null;
          
          return (
            <motion.div
              key={user.id}
              className="absolute"
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ 
                opacity: 1, 
                scale: 1,
                x: user.cursor.x,
                y: user.cursor.y,
              }}
              exit={{ opacity: 0, scale: 0.5 }}
              transition={{ 
                type: 'spring',
                damping: 30,
                stiffness: 500,
              }}
            >
              {/* 光标箭头 */}
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                style={{ 
                  filter: `drop-shadow(0 2px 4px rgba(0,0,0,0.3))`,
                }}
              >
                <path
                  d="M5.5 3.21V20.8c0 .45.54.67.85.35l4.86-4.86a.5.5 0 0 1 .35-.15h6.87c.48 0 .72-.58.38-.92L6.35 2.85a.5.5 0 0 0-.85.36Z"
                  fill={user.color}
                  stroke="white"
                  strokeWidth="1.5"
                />
              </svg>
              
              {/* 用户名标签 */}
              <div 
                className="absolute left-4 top-4 px-2 py-1 rounded-md text-xs font-medium text-white whitespace-nowrap"
                style={{ backgroundColor: user.color }}
              >
                {user.name}
              </div>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}

