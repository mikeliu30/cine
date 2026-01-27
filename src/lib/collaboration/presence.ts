'use client';

import { useCallback, useEffect, useState } from 'react';
import { Awareness } from 'y-protocols/awareness';
import { UserPresence } from '@/types';

// 随机颜色生成
const COLORS = [
  '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', 
  '#FFEAA7', '#DDA0DD', '#98D8C8', '#F7DC6F',
  '#BB8FCE', '#85C1E9', '#F8B500', '#00CED1',
];

function getRandomColor() {
  return COLORS[Math.floor(Math.random() * COLORS.length)];
}

export function usePresence(awareness: Awareness, userName: string) {
  const [users, setUsers] = useState<UserPresence[]>([]);
  const [localUser] = useState<UserPresence>(() => ({
    id: `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    name: userName,
    color: getRandomColor(),
    cursor: null,
    selectedNodeId: null,
  }));

  // 初始化本地用户状态
  useEffect(() => {
    awareness.setLocalState(localUser);

    const handleChange = () => {
      const states = Array.from(awareness.getStates().values()) as UserPresence[];
      // 过滤掉自己
      setUsers(states.filter((s) => s && s.id !== localUser.id));
    };

    awareness.on('change', handleChange);
    handleChange();

    return () => {
      awareness.off('change', handleChange);
    };
  }, [awareness, localUser]);

  // 更新光标位置
  const updateCursor = useCallback(
    (x: number, y: number) => {
      awareness.setLocalStateField('cursor', { x, y });
    },
    [awareness]
  );

  // 更新选中的节点
  const updateSelectedNode = useCallback(
    (nodeId: string | null) => {
      awareness.setLocalStateField('selectedNodeId', nodeId);
    },
    [awareness]
  );

  return {
    users,
    localUser,
    updateCursor,
    updateSelectedNode,
  };
}

