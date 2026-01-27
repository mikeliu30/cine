'use client';

// 节点右键菜单 - 支持子菜单
import { memo, useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface SubMenuItem {
  icon: string;
  label: string;
  onClick: () => void;
}

interface NodeMenuItem {
  icon: string;
  label: string;
  onClick?: () => void;
  danger?: boolean;
  disabled?: boolean;
  divider?: boolean;
  submenu?: SubMenuItem[];
}

interface NodeContextMenuProps {
  isOpen: boolean;
  position: { x: number; y: number };
  onClose: () => void;
  items: NodeMenuItem[];
}

export const NodeContextMenu = memo(function NodeContextMenu({
  isOpen,
  position,
  onClose,
  items,
}: NodeContextMenuProps) {
  const menuRef = useRef<HTMLDivElement>(null);
  const [activeSubmenu, setActiveSubmenu] = useState<number | null>(null);

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

  // 关闭时重置子菜单
  useEffect(() => {
    if (!isOpen) setActiveSubmenu(null);
  }, [isOpen]);

  // 确保菜单不超出屏幕
  const adjustedPosition = {
    x: Math.min(position.x, (typeof window !== 'undefined' ? window.innerWidth : 1000) - 220),
    y: Math.min(position.y, (typeof window !== 'undefined' ? window.innerHeight : 800) - 400),
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          ref={menuRef}
          className="fixed z-[200] min-w-[220px] py-2 bg-gray-800/95 backdrop-blur-xl rounded-xl border border-gray-600 shadow-2xl"
          style={{ left: adjustedPosition.x, top: adjustedPosition.y }}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          transition={{ duration: 0.1 }}
        >
          {items.map((item, index) => (
            item.divider ? (
              <div key={index} className="my-1 border-t border-gray-700" />
            ) : (
              <div key={index} className="relative">
                <button
                  onMouseEnter={() => item.submenu && setActiveSubmenu(index)}
                  onMouseLeave={() => !item.submenu && setActiveSubmenu(null)}
                  onClick={() => {
                    if (!item.disabled && !item.submenu && item.onClick) {
                      item.onClick();
                      onClose();
                    }
                  }}
                  disabled={item.disabled}
                  className={`
                    w-full flex items-center justify-between px-3 py-2 text-sm transition-colors
                    ${item.disabled ? 'text-gray-600 cursor-not-allowed' 
                      : item.danger ? 'text-red-400 hover:bg-red-500/20' 
                      : 'text-gray-200 hover:bg-gray-700'}
                  `}
                >
                  <div className="flex items-center gap-3">
                    <span className="w-5 text-center">{item.icon}</span>
                    <span>{item.label}</span>
                  </div>
                  {item.submenu && <span className="text-gray-500">▶</span>}
                </button>

                {/* 子菜单 */}
                <AnimatePresence>
                  {item.submenu && activeSubmenu === index && (
                    <motion.div
                      className="absolute left-full top-0 ml-1 min-w-[180px] py-2 bg-gray-800/95 backdrop-blur-xl rounded-xl border border-gray-600 shadow-2xl"
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -10 }}
                      transition={{ duration: 0.1 }}
                      onMouseEnter={() => setActiveSubmenu(index)}
                      onMouseLeave={() => setActiveSubmenu(null)}
                    >
                      {item.submenu.map((subItem, subIndex) => (
                        <button
                          key={subIndex}
                          onClick={() => { subItem.onClick(); onClose(); }}
                          className="w-full flex items-center gap-3 px-3 py-2 text-sm text-gray-200 hover:bg-gray-700 transition-colors"
                        >
                          <span className="w-5 text-center">{subItem.icon}</span>
                          <span>{subItem.label}</span>
                        </button>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )
          ))}
        </motion.div>
      )}
    </AnimatePresence>
  );
});

