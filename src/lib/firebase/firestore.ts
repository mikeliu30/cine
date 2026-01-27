/**
 * Firestore 画布持久化服务
 * 最简方案：保存和加载画布数据
 */

import { db } from './config';
import {
  doc,
  getDoc,
  setDoc,
  serverTimestamp,
  Timestamp
} from 'firebase/firestore';
import type { Node, Edge } from '@xyflow/react';

// 默认项目 ID（最简方案使用固定 ID）
const DEFAULT_PROJECT_ID = 'default-project';

export interface CanvasData {
  nodes: Node[];
  edges: Edge[];
  viewport?: { x: number; y: number; zoom: number };
  updatedAt?: Timestamp;
}

/**
 * 保存画布数据到 Firestore
 */
export async function saveCanvas(
  data: CanvasData,
  projectId: string = DEFAULT_PROJECT_ID
): Promise<void> {
  const docRef = doc(db, 'projects', projectId, 'canvas', 'main');

  await setDoc(docRef, {
    nodes: data.nodes,
    edges: data.edges,
    viewport: data.viewport || { x: 0, y: 0, zoom: 1 },
    updatedAt: serverTimestamp(),
  });
}

/**
 * 从 Firestore 加载画布数据
 */
export async function loadCanvas(
  projectId: string = DEFAULT_PROJECT_ID
): Promise<CanvasData | null> {
  const docRef = doc(db, 'projects', projectId, 'canvas', 'main');
  const docSnap = await getDoc(docRef);

  if (docSnap.exists()) {
    return docSnap.data() as CanvasData;
  }

  return null;
}
