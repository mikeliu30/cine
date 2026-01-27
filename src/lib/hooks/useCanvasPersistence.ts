/**
 * 画布持久化 Hook
 * 自动保存和加载画布数据
 */

import { useEffect, useRef, useCallback } from 'react';
import { Node, Edge } from 'reactflow';
import * as Y from 'yjs';
import { saveCanvas, loadCanvas } from '@/lib/firebase/firestore';

interface UseCanvasPersistenceOptions {
  yNodes: Y.Array<Node>;
  yEdges: Y.Array<Edge>;
  enabled?: boolean;
  debounceMs?: number;
}

export function useCanvasPersistence({
  yNodes,
  yEdges,
  enabled = true,
  debounceMs = 2000,
}: UseCanvasPersistenceOptions) {
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isLoadedRef = useRef(false);

  // 保存画布
  const save = useCallback(async () => {
    if (!enabled) return;

    try {
      const nodes = yNodes.toArray();
      const edges = yEdges.toArray();

      await saveCanvas({ nodes, edges });
      console.log('[Persistence] Canvas saved:', nodes.length, 'nodes,', edges.length, 'edges');
    } catch (error) {
      console.error('[Persistence] Save failed:', error);
    }
  }, [yNodes, yEdges, enabled]);

  // 防抖保存
  const debouncedSave = useCallback(() => {
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }
    saveTimeoutRef.current = setTimeout(save, debounceMs);
  }, [save, debounceMs]);

  // 加载画布
  const load = useCallback(async () => {
    if (!enabled || isLoadedRef.current) return;

    try {
      const data = await loadCanvas();

      if (data && data.nodes.length > 0) {
        // 清空当前数据
        yNodes.delete(0, yNodes.length);
        yEdges.delete(0, yEdges.length);

        // 加载保存的数据
        yNodes.push(data.nodes);
        yEdges.push(data.edges);

        console.log('[Persistence] Canvas loaded:', data.nodes.length, 'nodes,', data.edges.length, 'edges');
      }

      isLoadedRef.current = true;
    } catch (error) {
      console.error('[Persistence] Load failed:', error);
      isLoadedRef.current = true;
    }
  }, [yNodes, yEdges, enabled]);

  // 初始加载
  useEffect(() => {
    load();
  }, [load]);

  // 监听变化并自动保存
  useEffect(() => {
    if (!enabled || !isLoadedRef.current) return;

    const handleNodesChange = () => debouncedSave();
    const handleEdgesChange = () => debouncedSave();

    yNodes.observe(handleNodesChange);
    yEdges.observe(handleEdgesChange);

    return () => {
      yNodes.unobserve(handleNodesChange);
      yEdges.unobserve(handleEdgesChange);

      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, [yNodes, yEdges, enabled, debouncedSave]);

  // 页面关闭前保存
  useEffect(() => {
    if (!enabled) return;

    const handleBeforeUnload = () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
      // 同步保存（尽力而为）
      const nodes = yNodes.toArray();
      const edges = yEdges.toArray();
      navigator.sendBeacon?.('/api/canvas/save', JSON.stringify({ nodes, edges }));
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [yNodes, yEdges, enabled]);

  return { save, load };
}
