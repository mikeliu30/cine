// 节点数据类型
export interface CardNodeData {
  shot_id: string;
  imageUrl?: string;
  videoUrl?: string;
  status: 'idle' | 'generating' | 'success' | 'error';
  progress: number;
  label?: string;
  prompt?: string;        // 生成时使用的提示词
  model?: string;         // 使用的模型
  seed?: number;          // 随机种子
  parentNodeId?: string;  // 父节点 ID
  aspectRatio?: string;   // 画幅比例 (如 '16:9', '9:16', '1:1', '4:3')
}

// 用户光标状态
export interface UserPresence {
  id: string;
  name: string;
  color: string;
  cursor: { x: number; y: number } | null;
  selectedNodeId: string | null;
}

// 协作状态
export interface CollaborationState {
  ydoc: any;
  provider: any;
  yNodes: any;
  yEdges: any;
  awareness: any;
}

