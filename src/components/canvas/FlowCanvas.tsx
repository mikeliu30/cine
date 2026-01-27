'use client';

import { useCallback, useMemo, useEffect, useState, useRef } from 'react';
import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  Connection,
  BackgroundVariant,
  Node,
  Edge,
  ConnectionMode,
  ConnectionLineType,
  useReactFlow,
} from 'reactflow';
import * as Y from 'yjs';
import { Awareness } from 'y-protocols/awareness';
import 'reactflow/dist/style.css';

import { CardNode } from '@/components/nodes/CardNode';
import { VideoNode } from '@/components/nodes/VideoNode';
import { TextNode } from '@/components/nodes/TextNode';
import { useSyncedNodes } from '@/lib/collaboration/sync-nodes';
import { usePresence } from '@/lib/collaboration/presence';

interface FlowCanvasProps {
  yNodes: Y.Array<Node>;
  yEdges: Y.Array<Edge>;
  awareness: Awareness;
  onNodeDoubleClick?: (nodeId: string) => void;
  onDeleteNode?: (nodeId: string) => void;
  onConnectionEnd?: (sourceNodeId: string, sourceNodeData: any, position: { x: number; y: number }) => void;
}

export function FlowCanvas({ yNodes, yEdges, awareness, onNodeDoubleClick, onDeleteNode, onConnectionEnd }: FlowCanvasProps) {
  // 自定义节点类型
  const nodeTypes = useMemo(() => ({
    card: CardNode,
    video: VideoNode,
    text: TextNode,
  }), []);

  // 同步节点状态
  const {
    nodes,
    edges,
    onNodesChange,
    onEdgesChange,
    addEdge: addSyncedEdge,
  } = useSyncedNodes(yNodes, yEdges);

  // 多人光标
  const { updateCursor, updateSelectedNode } = usePresence(
    awareness,
    `用户${Math.floor(Math.random() * 1000)}`
  );

  // 记录连线开始的节点
  const connectingNodeRef = useRef<{ nodeId: string; handleType: string } | null>(null);

  // 处理连接开始
  const onConnectStart = useCallback((_: any, params: { nodeId: string | null; handleType: string | null }) => {
    if (params.nodeId) {
      connectingNodeRef.current = {
        nodeId: params.nodeId,
        handleType: params.handleType || 'source',
      };
    }
  }, []);

  // 处理连接结束（松开鼠标）
  const onConnectEnd = useCallback((event: MouseEvent | TouchEvent) => {
    // 检查是否有正在连接的节点
    if (!connectingNodeRef.current) {
      return;
    }

    const target = event.target as HTMLElement;

    // 检查目标是否是 Handle（连接点）- 如果是，说明连接到了另一个节点
    const isHandle = target?.classList?.contains('react-flow__handle') ||
                     target?.closest('.react-flow__handle');

    // 检查目标是否是节点内部
    const isNode = target?.closest('.react-flow__node');

    // 如果不是连接到 Handle，就认为是在空白处松开
    const isDroppedOnPane = !isHandle;

    console.log('[FlowCanvas] onConnectEnd:', {
      isHandle,
      isNode,
      isDroppedOnPane,
      targetClass: target?.className,
      connectingNode: connectingNodeRef.current,
    });

    if (isDroppedOnPane && connectingNodeRef.current) {
      // 没有连接到节点的 Handle，在空白处松开 - 触发创建菜单
      const { nodeId } = connectingNodeRef.current;
      const sourceNode = nodes.find(n => n.id === nodeId);

      if (sourceNode) {
        // 获取鼠标位置
        let clientX: number, clientY: number;
        if ('changedTouches' in event) {
          clientX = event.changedTouches[0].clientX;
          clientY = event.changedTouches[0].clientY;
        } else {
          clientX = event.clientX;
          clientY = event.clientY;
        }

        console.log('[FlowCanvas] Triggering creation menu at:', { x: clientX, y: clientY });

        // 触发回调，显示创建菜单
        onConnectionEnd?.(nodeId, sourceNode.data, { x: clientX, y: clientY });
      }
    }

    connectingNodeRef.current = null;
  }, [nodes, onConnectionEnd]);

  // 处理连接
  const onConnect = useCallback((connection: Connection) => {
    const edge: Edge = {
      id: `edge_${Date.now()}`,
      source: connection.source!,
      target: connection.target!,
      sourceHandle: connection.sourceHandle,
      targetHandle: connection.targetHandle,
      style: { stroke: '#6366F1', strokeWidth: 2 },
      type: 'smoothstep',
      animated: true,
    };
    addSyncedEdge(edge);
    connectingNodeRef.current = null; // 成功连接后清除
  }, [addSyncedEdge]);
  
  // 处理鼠标移动（更新光标位置）
  const onMouseMove = useCallback((event: React.MouseEvent) => {
    const bounds = event.currentTarget.getBoundingClientRect();
    const x = event.clientX - bounds.left;
    const y = event.clientY - bounds.top;
    updateCursor(x, y);
  }, [updateCursor]);
  
  // 处理节点选中
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);

  const onNodeClick = useCallback((_: React.MouseEvent, node: Node) => {
    updateSelectedNode(node.id);
    setSelectedNodeId(node.id);
  }, [updateSelectedNode]);

  // 处理节点双击 - 打开生成弹窗
  const handleNodeDoubleClick = useCallback((_: React.MouseEvent, node: Node) => {
    onNodeDoubleClick?.(node.id);
  }, [onNodeDoubleClick]);

  // 键盘删除支持
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.key === 'Delete' || e.key === 'Backspace') && selectedNodeId) {
        // 确保不是在输入框中
        if (document.activeElement?.tagName !== 'INPUT' &&
            document.activeElement?.tagName !== 'TEXTAREA') {
          onDeleteNode?.(selectedNodeId);
          setSelectedNodeId(null);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedNodeId, onDeleteNode]);

  return (
    <ReactFlow
      nodes={nodes}
      edges={edges}
      nodeTypes={nodeTypes}
      onNodesChange={onNodesChange}
      onEdgesChange={onEdgesChange}
      onConnect={onConnect}
      onConnectStart={onConnectStart}
      onConnectEnd={onConnectEnd}
      onMouseMove={onMouseMove}
      onNodeClick={onNodeClick}
      onNodeDoubleClick={handleNodeDoubleClick}
      fitView
      minZoom={0.1}
      maxZoom={4}
      defaultViewport={{ x: 0, y: 0, zoom: 1 }}
      className="bg-gray-900"
      // 启用连线功能
      connectionMode={ConnectionMode.Loose}
      connectionLineType={ConnectionLineType.SmoothStep}
      connectionLineStyle={{ stroke: '#6366F1', strokeWidth: 3 }}
      defaultEdgeOptions={{
        style: { stroke: '#6366F1', strokeWidth: 3 },
        type: 'smoothstep',
        animated: true,
      }}
      snapToGrid={true}
      snapGrid={[20, 20]}
      // 确保连接点可交互
      connectOnClick={false}
      nodesDraggable={true}
      nodesConnectable={true}
      elementsSelectable={true}
    >
      <Background
        variant={BackgroundVariant.Dots}
        gap={30}
        size={2}
        color="#374151"
      />
      <Controls
        className="!bg-gray-800 !border-gray-700 !rounded-lg [&>button]:!bg-gray-800 [&>button]:!border-gray-700 [&>button]:!text-gray-400 [&>button:hover]:!bg-gray-700"
        showZoom={true}
        showFitView={true}
        showInteractive={true}
      />
      <MiniMap
        className="!bg-gray-800 !border-gray-700 !rounded-lg"
        nodeColor="#6366F1"
        maskColor="rgba(0, 0, 0, 0.8)"
        zoomable
        pannable
      />
    </ReactFlow>
  );
}

