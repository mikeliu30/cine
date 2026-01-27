'use client';

import * as Y from 'yjs';
import { WebsocketProvider } from 'y-websocket';
import { Node, Edge } from 'reactflow';
import { CollaborationState } from '@/types';

export function createCollaborationProvider(
  roomId: string,
  wsUrl: string = 'ws://localhost:1234'
): CollaborationState {
  const ydoc = new Y.Doc();
  
  // 创建 WebSocket Provider
  const provider = new WebsocketProvider(wsUrl, roomId, ydoc, {
    connect: true,
  });
  
  // 共享数据结构
  const yNodes = ydoc.getArray<Node>('nodes');
  const yEdges = ydoc.getArray<Edge>('edges');
  const awareness = provider.awareness;
  
  return {
    ydoc,
    provider,
    yNodes,
    yEdges,
    awareness,
  };
}

export function destroyCollaborationProvider(state: CollaborationState) {
  state.provider.disconnect();
  state.ydoc.destroy();
}

