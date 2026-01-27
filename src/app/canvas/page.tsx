'use client';

// 🔥 禁用服务端渲染
export const dynamic = 'force-dynamic';

import { useEffect, useState, useCallback, useMemo } from 'react';
import { ReactFlowProvider } from 'reactflow';
import { FlowCanvas } from '@/components/canvas/FlowCanvas';
import { FloatingToolbar } from '@/components/canvas/FloatingToolbar';
import { CursorOverlay } from '@/components/canvas/CursorOverlay';
import { ContextMenu, getCanvasMenuItems } from '@/components/canvas/ContextMenu';
import { GenerationPanelPro } from '@/components/panels/GenerationPanelPro';
import { ImageLightbox } from '@/components/nodes/ImageLightbox';
import { InpaintEditor } from '@/components/panels/InpaintEditor';
import { AssetLibrary } from '@/components/panels/AssetLibrary';
import { DragConnectionLine } from '@/components/nodes/DragConnectionLine';
import { NodeCreationMenu } from '@/components/nodes/NodeCreationMenu';
import { NodeEditPanel } from '@/components/panels/NodeEditPanel';
import { usePresence } from '@/lib/collaboration/presence';
import { useGenerationStore } from '@/lib/store/generation-store';
import { useCanvasPersistence } from '@/lib/hooks/useCanvasPersistence';
import {
  createCollaborationProvider,
  destroyCollaborationProvider,
} from '@/lib/collaboration/yjs-provider';
import { CollaborationState } from '@/types';
import { Node, Edge } from 'reactflow';
import { UndoManager } from 'yjs';

function CanvasContent({ collaboration }: { collaboration: CollaborationState }) {
  const { users } = usePresence(
    collaboration.awareness,
    `用户${Math.floor(Math.random() * 1000)}`
  );

  // 撤销/重做管理器
  const undoManager = useMemo(() => {
    return new UndoManager([collaboration.yNodes, collaboration.yEdges]);
  }, [collaboration.yNodes, collaboration.yEdges]);

  // 撤销
  const handleUndo = useCallback(() => {
    if (undoManager.canUndo()) {
      undoManager.undo();
    }
  }, [undoManager]);

  // 重做
  const handleRedo = useCallback(() => {
    if (undoManager.canRedo()) {
      undoManager.redo();
    }
  }, [undoManager]);

  // 键盘快捷键
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'z') {
        e.preventDefault();
        if (e.shiftKey) {
          handleRedo();
        } else {
          handleUndo();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleUndo, handleRedo]);

  // 生成弹窗状态
  const [showGenerationPanel, setShowGenerationPanel] = useState(false);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [selectedNodeType, setSelectedNodeType] = useState<'image' | 'video'>('image');
  const [sourceImage, setSourceImage] = useState<string | undefined>(undefined);
  const [sourcePrompt, setSourcePrompt] = useState<string | undefined>(undefined);
  const [shouldCreateChild, setShouldCreateChild] = useState(false); // 标记是否需要创建子节点

  // 右键菜单状态
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number } | null>(null);

  // 全屏预览状态
  const [lightboxImage, setLightboxImage] = useState<string | null>(null);

  // Inpaint 编辑器状态
  const [inpaintEditor, setInpaintEditor] = useState<{ nodeId: string; imageUrl: string } | null>(null);

  // 资产库状态
  const [showAssetLibrary, setShowAssetLibrary] = useState(false);

  // 拖拽连线状态
  const [dragConnection, setDragConnection] = useState<{
    isActive: boolean;
    startPos: { x: number; y: number };
    endPos: { x: number; y: number };
    sourceNodeId: string;
    sourceNodeData: any;
  } | null>(null);

  // 节点创建菜单状态
  const [creationMenu, setCreationMenu] = useState<{
    isVisible: boolean;
    position: { x: number; y: number };
    sourceNodeId: string;
    sourceNodeData: any;
  } | null>(null);

  // 节点编辑面板状态
  const [editPanel, setEditPanel] = useState<{
    nodeId: string;
    imageUrl?: string;
    prompt?: string;
  } | null>(null);

  // 生成状态管理
  const { startGeneration, getTaskByNodeId } = useGenerationStore();

  // 画布持久化（自动保存/加载）
  useCanvasPersistence({
    yNodes: collaboration.yNodes,
    yEdges: collaboration.yEdges,
    enabled: true,
    debounceMs: 2000,
  });

  // 双击节点打开编辑面板
  const handleNodeDoubleClick = useCallback((nodeId: string) => {
    const nodes = collaboration.yNodes.toArray();
    const node = nodes.find(n => n.id === nodeId);
    if (node) {
      setEditPanel({
        nodeId,
        imageUrl: node.data?.imageUrl,
        prompt: node.data?.prompt,
      });
    }
  }, [collaboration.yNodes]);

  // 右键菜单
  const handleContextMenu = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    setContextMenu({ x: e.clientX, y: e.clientY });
  }, []);

  // 添加节点的辅助函数
  const addNode = useCallback((type: 'card' | 'video' | 'text') => {
    const nodeId = `${type}_${Date.now()}`;
    const newNode: Node = {
      id: nodeId,
      type: type, // 直接使用 type，不再转换
      position: {
        x: (contextMenu?.x || 400) - 144,
        y: (contextMenu?.y || 300) - 192,
      },
      data: {
        shot_id: `${type}_${Date.now().toString(36)}`,
        status: type === 'text' ? 'success' : 'idle', // 文本节点默认成功状态
        progress: 0,
        label: type === 'video' ? '视频节点' : type === 'text' ? '文本节点' : '图片节点',
        text: type === 'text' ? '' : undefined, // 文本节点的内容
      },
    };
    collaboration.yNodes.push([newNode]);
    setContextMenu(null);

    // 非文本节点自动打开生成面板（不创建子节点）
    if (type !== 'text') {
      setSelectedNodeId(nodeId);
      setSelectedNodeType(type === 'video' ? 'video' : 'image');
      setShouldCreateChild(false); // ✅ 直接更新当前节点
      setShowGenerationPanel(true);
    }
  }, [collaboration.yNodes, contextMenu]);

  // 删除节点及其关联连线
  const deleteNode = useCallback((nodeId: string) => {
    // 删除节点
    const nodes = collaboration.yNodes.toArray();
    const nodeIndex = nodes.findIndex(n => n.id === nodeId);
    if (nodeIndex !== -1) {
      collaboration.yNodes.delete(nodeIndex, 1);
    }

    // 删除关联的连线
    const edges = collaboration.yEdges.toArray();
    const edgesToDelete = edges
      .map((e, i) => ({ edge: e, index: i }))
      .filter(({ edge }) => edge.source === nodeId || edge.target === nodeId)
      .reverse(); // 从后往前删除，避免索引错乱

    edgesToDelete.forEach(({ index }) => {
      collaboration.yEdges.delete(index, 1);
    });
  }, [collaboration.yNodes, collaboration.yEdges]);

  // 监听节点删除事件（从节点组件触发）
  useEffect(() => {
    const handleNodeDelete = (e: CustomEvent<{ nodeId: string }>) => {
      deleteNode(e.detail.nodeId);
    };
    const handleNodeEdit = (e: CustomEvent<{ nodeId: string; imageUrl?: string }>) => {
      // 如果有图片，打开 Inpaint 编辑器
      if (e.detail.imageUrl) {
        setInpaintEditor({ nodeId: e.detail.nodeId, imageUrl: e.detail.imageUrl });
      } else {
        // 否则打开生成面板（直接更新当前节点）
        const nodes = collaboration.yNodes.toArray();
        const node = nodes.find(n => n.id === e.detail.nodeId);
        setSelectedNodeId(e.detail.nodeId);
        setSelectedNodeType(node?.type === 'video' ? 'video' : 'image');
        // 传递节点的提示词和图片
        setSourcePrompt(node?.data?.prompt || '');
        setSourceImage(node?.data?.imageUrl || node?.data?.videoUrl || '');
        setShouldCreateChild(false); // ✅ 直接更新当前节点
        setShowGenerationPanel(true);
      }
    };
    const handleNodeExpand = (e: CustomEvent<{ imageUrl: string }>) => {
      setLightboxImage(e.detail.imageUrl);
    };

    // 监听打开生成面板事件（从节点右键菜单触发）
    const handleOpenGenerationPanel = (e: CustomEvent<{
      type: 'image' | 'video';
      sourceNodeId: string;
      sourceImage?: string;
      sourcePrompt?: string;
    }>) => {
      const { type, sourceNodeId, sourceImage: srcImg, sourcePrompt: srcPrompt } = e.detail;

      // 使用源节点ID作为父节点，生成时会创建子节点
      setSelectedNodeId(sourceNodeId);
      setSelectedNodeType(type);
      setSourceImage(srcImg);
      setSourcePrompt(srcPrompt);
      setShowGenerationPanel(true);
    };

    // 监听锚点拖拽开始
    const handleAnchorDragStart = (e: CustomEvent<{
      nodeId: string;
      nodePosition: { x: number; y: number };
      anchorPosition: string;
      nodeData: any;
    }>) => {
      const { nodeId, nodePosition, nodeData } = e.detail;
      // 计算节点在屏幕上的位置（需要考虑画布缩放和平移）
      const canvasElement = document.querySelector('.react-flow');
      const rect = canvasElement?.getBoundingClientRect();

      if (rect) {
        setDragConnection({
          isActive: true,
          startPos: {
            x: rect.left + nodePosition.x + 144, // 节点中心
            y: rect.top + nodePosition.y + 192,
          },
          endPos: {
            x: rect.left + nodePosition.x + 144,
            y: rect.top + nodePosition.y + 192,
          },
          sourceNodeId: nodeId,
          sourceNodeData: nodeData,
        });
      }
    };

    // 监听锚点拖拽结束
    const handleAnchorDragEnd = (e: CustomEvent<{
      nodeId: string;
      mousePosition: { x: number; y: number };
      nodeData: any;
    }>) => {
      const { nodeId, mousePosition, nodeData } = e.detail;

      // 显示创建菜单
      setCreationMenu({
        isVisible: true,
        position: mousePosition,
        sourceNodeId: nodeId,
        sourceNodeData: nodeData,
      });

      // 隐藏连线
      setDragConnection(null);
    };

    window.addEventListener('node-delete', handleNodeDelete as EventListener);
    window.addEventListener('node-edit', handleNodeEdit as EventListener);
    window.addEventListener('node-expand', handleNodeExpand as EventListener);
    window.addEventListener('open-generation-panel', handleOpenGenerationPanel as EventListener);
    window.addEventListener('anchor-drag-start', handleAnchorDragStart as EventListener);
    window.addEventListener('anchor-drag-end', handleAnchorDragEnd as EventListener);

    return () => {
      window.removeEventListener('node-delete', handleNodeDelete as EventListener);
      window.removeEventListener('node-edit', handleNodeEdit as EventListener);
      window.removeEventListener('node-expand', handleNodeExpand as EventListener);
      window.removeEventListener('open-generation-panel', handleOpenGenerationPanel as EventListener);
      window.removeEventListener('anchor-drag-start', handleAnchorDragStart as EventListener);
      window.removeEventListener('anchor-drag-end', handleAnchorDragEnd as EventListener);
    };
  }, [deleteNode, collaboration.yNodes]);

  // 监听鼠标移动以更新连线位置
  useEffect(() => {
    if (!dragConnection?.isActive) return;

    const handleMouseMove = (e: MouseEvent) => {
      setDragConnection(prev => prev ? {
        ...prev,
        endPos: { x: e.clientX, y: e.clientY }
      } : null);
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [dragConnection?.isActive]);

  // 处理节点创建菜单选择
  const handleCreationMenuSelect = useCallback((type: 'text' | 'image' | 'video' | 'editor') => {
    if (!creationMenu) return;

    const { sourceNodeId, sourceNodeData } = creationMenu;
    const nodes = collaboration.yNodes.toArray();
    const parentNode = nodes.find(n => n.id === sourceNodeId);

    if (!parentNode) return;

    // 获取源节点的 prompt（优先使用 data.prompt，其次使用 label）
    const parentPrompt = sourceNodeData.prompt || parentNode.data?.prompt || parentNode.data?.label || '';

    console.log('[CreationMenu] Selected type:', type);
    console.log('[CreationMenu] Source node:', sourceNodeId);
    console.log('[CreationMenu] Source data:', sourceNodeData);
    console.log('[CreationMenu] Parent prompt:', parentPrompt);

    if (type === 'image') {
      // 图片生成 → 创建子节点
      setSelectedNodeId(sourceNodeId);
      setSelectedNodeType('image');
      setSourceImage(sourceNodeData.imageUrl);
      setSourcePrompt(parentPrompt);
      setShouldCreateChild(true); // ✅ 创建子节点
      setShowGenerationPanel(true);
    } else if (type === 'video') {
      // 视频生成 → 创建子节点
      setSelectedNodeId(sourceNodeId);
      setSelectedNodeType('video');
      setSourceImage(sourceNodeData.imageUrl);
      setSourcePrompt(parentPrompt);
      setShouldCreateChild(true); // ✅ 创建子节点
      setShowGenerationPanel(true);
    } else if (type === 'text') {
      // 文本生成 → 更改当前节点（打开文本生成面板）
      // TODO: 可以打开一个文本生成面板
      setSelectedNodeId(sourceNodeId);
      setSourcePrompt(parentPrompt);
      setShouldCreateChild(false); // ✅ 更改当前节点
      // 暂时打开生成面板，后续可以改为专门的文本生成面板
      setShowGenerationPanel(true);
    } else if (type === 'editor') {
      // 图片编辑器 → 更改当前节点（打开编辑器）
      if (sourceNodeData.imageUrl) {
        setInpaintEditor({ nodeId: sourceNodeId, imageUrl: sourceNodeData.imageUrl });
      }
    }

    setCreationMenu(null);
  }, [creationMenu, collaboration.yNodes]);

  // 上传素材状态
  const fileInputRef = useCallback((input: HTMLInputElement | null) => {
    if (input) {
      input.onchange = async (e) => {
        const file = (e.target as HTMLInputElement).files?.[0];
        if (!file) return;

        // 创建本地预览 URL
        const localUrl = URL.createObjectURL(file);
        const isVideo = file.type.startsWith('video/');

        // 创建新节点
        const newNode: Node = {
          id: `upload_${Date.now()}`,
          type: isVideo ? 'video' : 'card',
          position: {
            x: (contextMenu?.x || 400) - 144,
            y: (contextMenu?.y || 300) - 192,
          },
          data: {
            shot_id: `upload_${Date.now().toString(36)}`,
            status: 'success',
            progress: 100,
            label: file.name,
            imageUrl: isVideo ? undefined : localUrl,
            videoUrl: isVideo ? localUrl : undefined,
            isUploaded: true,
          },
        };
        collaboration.yNodes.push([newNode]);
      };
    }
  }, [collaboration.yNodes, contextMenu]);

  // 触发文件上传
  const triggerUpload = useCallback(() => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*,video/*';
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;

      const localUrl = URL.createObjectURL(file);
      const isVideo = file.type.startsWith('video/');

      // 如果有右键菜单位置就用，否则放在画布中央
      const posX = contextMenu?.x ? contextMenu.x - 144 : Math.random() * 400 + 100;
      const posY = contextMenu?.y ? contextMenu.y - 192 : Math.random() * 300 + 100;

      const newNode: Node = {
        id: `upload_${Date.now()}`,
        type: isVideo ? 'video' : 'card',
        position: { x: posX, y: posY },
        data: {
          shot_id: `upload_${Date.now().toString(36)}`,
          status: 'success',
          progress: 100,
          label: file.name.slice(0, 20),
          imageUrl: isVideo ? undefined : localUrl,
          videoUrl: isVideo ? localUrl : undefined,
          isUploaded: true,
        },
      };
      collaboration.yNodes.push([newNode]);
      setContextMenu(null);
    };
    input.click();
  }, [collaboration.yNodes, contextMenu]);

  // 快速生成图片 - 使用随机提示词立即生成
  const quickGenerateImage = useCallback(() => {
    const randomPrompts = [
      'A beautiful sunset over mountains',
      'A cute cat sitting on a windowsill',
      'A futuristic city with flying cars',
      'A peaceful forest with sunlight filtering through trees',
      'A colorful abstract painting',
      'A cozy coffee shop interior',
      'A majestic dragon flying in the sky',
      'A serene beach with crystal clear water',
    ];

    const prompt = randomPrompts[Math.floor(Math.random() * randomPrompts.length)];

    // 创建节点
    const posX = contextMenu?.x ? contextMenu.x - 144 : Math.random() * 400 + 100;
    const posY = contextMenu?.y ? contextMenu.y - 192 : Math.random() * 300 + 100;

    const nodeId = `quick_img_${Date.now()}`;
    const newNode: Node = {
      id: nodeId,
      type: 'card',
      position: { x: posX, y: posY },
      data: {
        shot_id: `shot_${Date.now().toString(36)}`,
        status: 'generating',
        progress: 0,
        label: '快速生成',
        prompt: prompt,
        aspectRatio: '16:9', // 添加画幅比例
      },
    };

    collaboration.yNodes.push([newNode]);
    setContextMenu(null);

    // 立即开始生成（不创建子节点）
    handleGenerate({
      prompt,
      model: 'mock', // 使用 Mock 模式避免 API 配额限制
      ratio: '16:9',
      node_id: nodeId,
      shouldCreateChild: false, // ✅ 直接更新当前节点
    });
  }, [collaboration.yNodes, contextMenu]);

  // 快速生成视频 - 使用随机提示词立即生成
  const quickGenerateVideo = useCallback(() => {
    const randomPrompts = [
      'A dog running on the beach',
      'Fireworks exploding in the night sky',
      'Waves crashing on the shore',
      'A butterfly flying through a garden',
      'Rain falling on a city street',
      'A car driving through a tunnel',
    ];

    const prompt = randomPrompts[Math.floor(Math.random() * randomPrompts.length)];

    // 创建节点
    const posX = contextMenu?.x ? contextMenu.x - 144 : Math.random() * 400 + 100;
    const posY = contextMenu?.y ? contextMenu.y - 192 : Math.random() * 300 + 100;

    const nodeId = `quick_vid_${Date.now()}`;
    const newNode: Node = {
      id: nodeId,
      type: 'video',
      position: { x: posX, y: posY },
      data: {
        shot_id: `shot_${Date.now().toString(36)}`,
        status: 'generating',
        progress: 0,
        label: '快速生成',
        prompt: prompt,
      },
    };

    collaboration.yNodes.push([newNode]);
    setContextMenu(null);

    // 立即开始生成（不创建子节点）
    handleGenerate({
      prompt,
      model: 'veo-3.1-fast',
      ratio: '16:9',
      node_id: nodeId,
      duration: 6,
      shouldCreateChild: false, // ✅ 直接更新当前节点
    });
  }, [collaboration.yNodes, contextMenu]);

  const contextMenuItems = getCanvasMenuItems({
    onAddImageNode: () => addNode('card'),
    onAddVideoNode: () => addNode('video'),
    onAddTextNode: () => addNode('text'),
    onQuickGenerateImage: quickGenerateImage,
    onQuickGenerateVideo: quickGenerateVideo,
    onUpload: triggerUpload,
    onOpenAssetLibrary: () => setShowAssetLibrary(true),
    onUndo: handleUndo,
    onRedo: handleRedo,
    onPaste: () => console.log('Paste'),
  });

  // 处理生成 - 根据 shouldCreateChild 判断是更新当前节点还是创建子节点
  const handleGenerate = useCallback(async (params: {
    prompt: string;
    model: string;
    ratio: string;
    node_id: string;
    batch_count?: number;
    reference_image?: string;
    camera_control?: any;
    video_settings?: any;
    duration?: number;
    shouldCreateChild?: boolean;
  }) => {
    const parentNodeId = params.node_id;
    const batchCount = params.batch_count || 1;
    // 优先使用 params 中的值，确保从面板传递的值被使用
    const createChild = params.shouldCreateChild !== undefined ? params.shouldCreateChild : shouldCreateChild;

    console.log('[handleGenerate] params:', params);
    console.log('[handleGenerate] createChild:', createChild, '(from params:', params.shouldCreateChild, ', state:', shouldCreateChild, ')');

    // 获取父节点
    const nodes = collaboration.yNodes.toArray();
    const parentNode = nodes.find((n: Node) => n.id === parentNodeId);
    const parentX = parentNode?.position?.x || 0;
    const parentY = parentNode?.position?.y || 0;

    // 获取父节点的图片 URL（用于图生图/图生视频）
    const parentImageUrl = parentNode?.data?.imageUrl || parentNode?.data?.videoUrl;

    console.log('[handleGenerate] Parent node:', parentNodeId, parentNode?.data);
    console.log('[handleGenerate] Parent image URL:', parentImageUrl);

    // 判断是视频还是图片
    const isVideo = params.video_settings !== undefined || params.model?.includes('video') || params.model === 'veo-3.1-fast';

    // 确定参考图：优先使用传入的 reference_image，否则在创建子节点时使用父节点的图片
    let referenceImage = params.reference_image;
    if (createChild && !referenceImage && parentImageUrl) {
      referenceImage = parentImageUrl;
      console.log('[handleGenerate] Using parent node image as reference:', referenceImage);
    }

    // 如果不需要创建子节点，直接更新当前节点
    if (!createChild) {
      // 更新当前节点为生成中状态
      const parentIndex = nodes.findIndex((n: Node) => n.id === parentNodeId);
      if (parentIndex !== -1) {
        collaboration.yNodes.delete(parentIndex, 1);
        collaboration.yNodes.insert(parentIndex, [{
          ...parentNode,
          data: {
            ...parentNode.data,
            status: 'generating',
            progress: 0,
            prompt: params.prompt,
            model: params.model,
            aspectRatio: params.ratio, // 保存画幅比例
            label: parentNode.data.label || (isVideo ? '视频生成中' : '图片生成中'),
          },
        }]);
        console.log('[handleGenerate] Updated node with aspectRatio:', params.ratio);
      }

      // 开始生成任务
      await startGeneration({
        prompt: params.prompt,
        model: params.model as any,
        ratio: params.ratio as any,
        node_id: parentNodeId,
        duration: params.duration,
        reference_image: referenceImage,
        camera_control: params.camera_control,
      });

      // 轮询更新当前节点状态
      const pollInterval = setInterval(() => {
        const task = getTaskByNodeId(parentNodeId);
        if (!task) return;

        const currentNodes = collaboration.yNodes.toArray();
        const currentIndex = currentNodes.findIndex((n: Node) => n.id === parentNodeId);
        if (currentIndex !== -1) {
          const currentNode = currentNodes[currentIndex];
          const newUrl = task.result?.url || currentNode.data.imageUrl || currentNode.data.videoUrl;

          collaboration.yNodes.delete(currentIndex, 1);
          collaboration.yNodes.insert(currentIndex, [{
            ...currentNode,
            data: {
              ...currentNode.data,
              status: task.status === 'succeeded' ? 'success' : task.status === 'failed' ? 'error' : 'generating',
              progress: task.progress,
              imageUrl: isVideo ? undefined : newUrl,
              videoUrl: isVideo ? newUrl : undefined,
              prompt: params.prompt,
              model: params.model,
              aspectRatio: params.ratio, // 保存画幅比例
            },
          }]);
        }

        if (task.status === 'succeeded' || task.status === 'failed') {
          clearInterval(pollInterval);
        }
      }, 500);

      return;
    }

    // 否则创建子节点 - 并发生成
    const childNodeIds: string[] = [];
    const timestamp = Date.now();

    // 第一步：创建所有子节点和连线
    for (let i = 0; i < batchCount; i++) {
      const childNodeId = `child_${timestamp}_${i}`;
      childNodeIds.push(childNodeId);

      // 子节点位置：父节点右侧，垂直分布
      const childNode: Node = {
        id: childNodeId,
        type: isVideo ? 'video' : 'card',
        position: {
          x: parentX + 350,
          y: parentY + (i - (batchCount - 1) / 2) * 280,
        },
        data: {
          shot_id: `shot_${timestamp.toString(36)}_${i}`,
          status: 'generating',
          progress: 0,
          label: `生成 ${i + 1}/${batchCount}`,
          prompt: params.prompt,
          model: params.model,
          aspectRatio: params.ratio, // 保存画幅比例
          parentId: parentNodeId,
        },
      };

      collaboration.yNodes.push([childNode]);

      // 创建父子连线
      const edge: Edge = {
        id: `edge_${parentNodeId}_${childNodeId}`,
        source: parentNodeId,
        target: childNodeId,
        type: 'smoothstep',
        animated: true,
        style: { stroke: '#6366F1', strokeWidth: 2 },
      };
      collaboration.yEdges.push([edge]);
    }

    // 第二步：并发启动所有生成任务
    const generationPromises = childNodeIds.map((childNodeId) => {
      return startGeneration({
        prompt: params.prompt,
        model: params.model as any,
        ratio: params.ratio as any,
        node_id: childNodeId,
        duration: params.duration,
        reference_image: referenceImage, // 使用父节点图片作为参考
        camera_control: params.camera_control,
      });
    });

    // 不等待完成，立即启动所有任务
    Promise.all(generationPromises).catch(console.error);

    // 第三步：为每个子节点设置轮询
    childNodeIds.forEach((childNodeId) => {
      const pollInterval = setInterval(() => {
        const task = getTaskByNodeId(childNodeId);
        if (!task) return;

        const currentNodes = collaboration.yNodes.toArray();
        const currentIndex = currentNodes.findIndex((n: Node) => n.id === childNodeId);
        if (currentIndex !== -1) {
          const currentNode = currentNodes[currentIndex];
          const newImageUrl = task.result?.url || currentNode.data.imageUrl;

          collaboration.yNodes.delete(currentIndex, 1);
          collaboration.yNodes.insert(currentIndex, [{
            ...currentNode,
            data: {
              ...currentNode.data,
              status: task.status === 'succeeded' ? 'success' : task.status === 'failed' ? 'error' : 'generating',
              progress: task.progress,
              imageUrl: newImageUrl,
              videoUrl: isVideo ? newImageUrl : undefined,
              prompt: currentNode.data.prompt,
              model: currentNode.data.model,
              aspectRatio: params.ratio, // 保存画幅比例
            },
          }]);
        }

        if (task.status === 'succeeded' || task.status === 'failed') {
          clearInterval(pollInterval);

          const currentEdges = collaboration.yEdges.toArray();
          const edgeIndex = currentEdges.findIndex((e: any) => e.id === `edge_${parentNodeId}_${childNodeId}`);
          if (edgeIndex !== -1) {
            const currentEdge = currentEdges[edgeIndex];
            collaboration.yEdges.delete(edgeIndex, 1);
            collaboration.yEdges.insert(edgeIndex, [{
              ...currentEdge,
              animated: false,
              style: {
                stroke: task.status === 'succeeded' ? '#10B981' : '#EF4444',
                strokeWidth: 2
              },
            }]);
          }
        }
      }, 200);
    });

  }, [collaboration.yNodes, collaboration.yEdges, startGeneration, getTaskByNodeId, shouldCreateChild]);

  // 处理从 Handle 拖出连线后松开（在空白处）
  const handleConnectionEnd = useCallback((sourceNodeId: string, sourceNodeData: any, position: { x: number; y: number }) => {
    // 显示创建菜单
    setCreationMenu({
      isVisible: true,
      position,
      sourceNodeId,
      sourceNodeData,
    });
  }, []);

  return (
    <>
      {/* 主画布 */}
      <div className="h-full w-full" onContextMenu={handleContextMenu}>
        <FlowCanvas
          yNodes={collaboration.yNodes}
          yEdges={collaboration.yEdges}
          awareness={collaboration.awareness}
          onNodeDoubleClick={handleNodeDoubleClick}
          onDeleteNode={deleteNode}
          onConnectionEnd={handleConnectionEnd}
        />
      </div>

      {/* 悬浮工具栏 */}
      <FloatingToolbar yNodes={collaboration.yNodes} onUpload={triggerUpload} />

      {/* 多人光标层 */}
      <CursorOverlay users={users} />

      {/* 右键菜单 */}
      <ContextMenu
        isOpen={!!contextMenu}
        position={contextMenu || { x: 0, y: 0 }}
        onClose={() => setContextMenu(null)}
        items={contextMenuItems}
      />

      {/* 拖拽连线 */}
      {dragConnection && (
        <DragConnectionLine
          isVisible={dragConnection.isActive}
          startPos={dragConnection.startPos}
          endPos={dragConnection.endPos}
        />
      )}

      {/* 节点创建菜单 */}
      {creationMenu && (
        <NodeCreationMenu
          isVisible={creationMenu.isVisible}
          position={creationMenu.position}
          onSelect={handleCreationMenuSelect}
          onClose={() => setCreationMenu(null)}
        />
      )}

      {/* 生成弹窗 - 增强版 */}
      <GenerationPanelPro
        isOpen={showGenerationPanel}
        onClose={() => {
          setShowGenerationPanel(false);
          setSourceImage(undefined);
          setSourcePrompt(undefined);
          setShouldCreateChild(true); // 重置为默认值
        }}
        nodeId={selectedNodeId || ''}
        nodeType={selectedNodeType}
        sourceImage={sourceImage}
        sourcePrompt={sourcePrompt}
        shouldCreateChild={shouldCreateChild}
        onGenerate={handleGenerate}
      />

      {/* 全屏预览 */}
      <ImageLightbox
        isOpen={!!lightboxImage}
        onClose={() => setLightboxImage(null)}
        imageUrl={lightboxImage || ''}
      />

      {/* Inpaint 编辑器 */}
      <InpaintEditor
        isOpen={!!inpaintEditor}
        onClose={() => setInpaintEditor(null)}
        imageUrl={inpaintEditor?.imageUrl || ''}
        onSubmit={(maskDataUrl, prompt) => {
          // 处理 Inpaint 提交 - 创建新的生成任务
          if (inpaintEditor) {
            handleGenerate({
              prompt: `[INPAINT] ${prompt}`,
              model: 'mock', // 使用 mock 模式
              ratio: '16:9',
              node_id: inpaintEditor.nodeId,
              reference_image: maskDataUrl,
            });
          }
        }}
      />

      {/* 资产库 */}
      <AssetLibrary
        isOpen={showAssetLibrary}
        onClose={() => setShowAssetLibrary(false)}
        onSelect={(asset) => {
          // 从资产库添加节点
          const newNode: Node = {
            id: `asset_${Date.now()}`,
            type: asset.type === 'video' ? 'video' : 'card',
            position: {
              x: Math.random() * 400 + 100,
              y: Math.random() * 300 + 100,
            },
            data: {
              shot_id: `asset_${Date.now().toString(36)}`,
              status: 'success',
              progress: 100,
              label: asset.name,
              imageUrl: asset.type === 'image' ? asset.url : undefined,
              videoUrl: asset.type === 'video' ? asset.url : undefined,
              isFromLibrary: true,
            },
          };
          collaboration.yNodes.push([newNode]);
        }}
      />

      {/* 节点编辑面板 */}
      {editPanel && (
        <NodeEditPanel
          isOpen={!!editPanel}
          onClose={() => setEditPanel(null)}
          nodeId={editPanel.nodeId}
          imageUrl={editPanel.imageUrl}
          prompt={editPanel.prompt}
          onGenerate={(params) => {
            handleGenerate({
              ...params,
              shouldCreateChild: false,
            });
            setEditPanel(null);
          }}
          onToolAction={(tool, nodeId) => {
            if (tool === 'repaint' && editPanel.imageUrl) {
              setInpaintEditor({ nodeId, imageUrl: editPanel.imageUrl });
              setEditPanel(null);
            }
          }}
        />
      )}
    </>
  );
}

export default function CanvasPage() {
  const [collaboration, setCollaboration] = useState<CollaborationState | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [connectionError, setConnectionError] = useState<string | null>(null);

  useEffect(() => {
    // 🎯 智能模式：优先尝试 WebSocket，失败则自动切换到单人模式
    const roomId = new URLSearchParams(window.location.search).get('room') || 'default-room';
    const wsUrl = process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:1234';

    let connected = false;
    let fallbackTimeout: NodeJS.Timeout;

    // 创建本地 fallback 状态
    const createLocalState = () => {
      const Y = require('yjs');
      const doc = new Y.Doc();
      const { Awareness } = require('y-protocols/awareness');

      return {
        ydoc: doc,
        provider: null as any,
        awareness: new Awareness(doc),
        yNodes: doc.getArray('nodes'),
        yEdges: doc.getArray('edges'),
        doc,
      };
    };

    try {
      const state = createCollaborationProvider(roomId, wsUrl);
      setCollaboration(state);

      state.provider.on('status', ({ status }: { status: string }) => {
        connected = status === 'connected';
        setIsConnected(connected);
        if (connected) {
          setConnectionError(null);
          if (fallbackTimeout) clearTimeout(fallbackTimeout);
          console.log('✅ WebSocket 已连接 - 多人协作模式');
        }
      });

      // 3秒后如果还没连接，切换到单人模式
      fallbackTimeout = setTimeout(() => {
        if (!connected) {
          console.log('⚠️ WebSocket 连接超时，切换到单人模式');

          // 销毁 WebSocket provider
          if (state.provider) {
            state.provider.destroy();
          }

          // 切换到本地模式
          const localState = createLocalState();
          setCollaboration(localState);
          setIsConnected(true);
          setConnectionError(null); // 不显示错误，静默切换
        }
      }, 3000);

      return () => {
        if (fallbackTimeout) clearTimeout(fallbackTimeout);
        if (state.provider && connected) {
          destroyCollaborationProvider(state);
        }
      };
    } catch (error) {
      console.error('❌ WebSocket 初始化失败，使用单人模式:', error);
      // 直接使用本地模式
      const localState = createLocalState();
      setCollaboration(localState);
      setIsConnected(true);
      setConnectionError(null);
    }
  }, []);

  if (!collaboration) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-gray-900">
        <div className="text-center">
          <div className="text-white text-xl mb-4">正在初始化...</div>
          <div className="text-gray-500 text-sm animate-pulse">
            加载中
          </div>
        </div>
      </div>
    );
  }

  return (
    <ReactFlowProvider>
      <div className="h-screen w-screen relative bg-gray-900">
        {/* 连接状态指示器 */}
        <div className="absolute top-4 left-4 z-50 flex items-center gap-2 bg-gray-800/80 backdrop-blur px-3 py-2 rounded-lg">
          <div
            className={`w-2.5 h-2.5 rounded-full ${isConnected ? 'bg-green-500' : 'bg-yellow-500 animate-pulse'}`}
          />
          <span className="text-white text-sm">
            {isConnected ? '已连接' : '连接中...'}
          </span>
        </div>

        {/* 连接错误提示 */}
        {connectionError && (
          <div className="absolute top-4 left-1/2 -translate-x-1/2 z-50 bg-red-500/90 text-white px-4 py-2 rounded-lg text-sm">
            {connectionError}
          </div>
        )}

        {/* 使用说明 */}
        <div className="absolute top-4 right-4 z-50 bg-gray-800/80 backdrop-blur px-3 py-2 rounded-lg text-xs text-gray-400">
          <div>🖱️ 拖拽移动节点</div>
          <div>🔗 从圆点拖出连线</div>
          <div>🔍 滚轮缩放画布</div>
          <div>👆 <strong>双击节点生成图片</strong></div>
        </div>

        <CanvasContent collaboration={collaboration} />
      </div>
    </ReactFlowProvider>
  );
}

