'use client';

import { useCallback, useEffect, useState } from 'react';
import { Node, Edge, NodeChange, EdgeChange, applyNodeChanges, applyEdgeChanges } from 'reactflow';
import * as Y from 'yjs';

export function useSyncedNodes(yNodes: Y.Array<Node>, yEdges: Y.Array<Edge>) {
  const [nodes, setNodes] = useState<Node[]>([]);
  const [edges, setEdges] = useState<Edge[]>([]);

  // 监听 Yjs 变化，同步到本地状态
  useEffect(() => {
    const updateNodes = () => {
      setNodes(yNodes.toArray());
    };
    const updateEdges = () => {
      setEdges(yEdges.toArray());
    };

    // 初始化
    updateNodes();
    updateEdges();

    // 监听变化
    yNodes.observe(updateNodes);
    yEdges.observe(updateEdges);

    return () => {
      yNodes.unobserve(updateNodes);
      yEdges.unobserve(updateEdges);
    };
  }, [yNodes, yEdges]);

  // 处理节点变化（拖拽、选中等）
  const onNodesChange = useCallback(
    (changes: NodeChange[]) => {
      // 先应用到本地
      const newNodes = applyNodeChanges(changes, nodes);
      
      // 同步到 Yjs（只处理位置变化）
      changes.forEach((change) => {
        if (change.type === 'position' && change.position) {
          const index = yNodes.toArray().findIndex((n) => n.id === change.id);
          if (index !== -1) {
            const node = yNodes.get(index);
            if (node) {
              yNodes.delete(index, 1);
              yNodes.insert(index, [{ ...node, position: change.position }]);
            }
          }
        }
      });
      
      setNodes(newNodes);
    },
    [nodes, yNodes]
  );

  // 处理边变化
  const onEdgesChange = useCallback(
    (changes: EdgeChange[]) => {
      const newEdges = applyEdgeChanges(changes, edges);
      setEdges(newEdges);
    },
    [edges]
  );

  // 添加边
  const addEdge = useCallback(
    (edge: Edge) => {
      yEdges.push([edge]);
    },
    [yEdges]
  );

  // 更新节点数据
  const updateNode = useCallback(
    (nodeId: string, data: Partial<Node['data']>) => {
      const index = yNodes.toArray().findIndex((n) => n.id === nodeId);
      if (index !== -1) {
        const node = yNodes.get(index);
        if (node) {
          yNodes.delete(index, 1);
          yNodes.insert(index, [{ ...node, data: { ...node.data, ...data } }]);
        }
      }
    },
    [yNodes]
  );

  return {
    nodes,
    edges,
    onNodesChange,
    onEdgesChange,
    addEdge,
    updateNode,
  };
}

