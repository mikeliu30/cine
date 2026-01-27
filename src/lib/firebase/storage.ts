/**
 * Cloud Storage 媒体存储服务
 * 最简方案：上传和获取生成的图片/视频
 */

import { storage } from './config';
import {
  ref,
  uploadBytes,
  uploadString,
  getDownloadURL,
} from 'firebase/storage';

const DEFAULT_PROJECT_ID = 'default-project';

/**
 * 上传 base64 图片到 Storage
 * @param base64Data - base64 编码的图片数据（不含 data:image/xxx;base64, 前缀）
 * @param nodeId - 节点 ID，用于命名文件
 * @returns 图片的永久下载 URL
 */
export async function uploadImage(
  base64Data: string,
  nodeId: string,
  projectId: string = DEFAULT_PROJECT_ID
): Promise<string> {
  const timestamp = Date.now();
  const path = `projects/${projectId}/images/${nodeId}_${timestamp}.png`;
  const storageRef = ref(storage, path);

  // 上传 base64 数据
  await uploadString(storageRef, base64Data, 'base64', {
    contentType: 'image/png',
  });

  // 获取下载 URL
  return getDownloadURL(storageRef);
}

/**
 * 上传视频文件到 Storage
 * @param videoBlob - 视频 Blob 数据
 * @param nodeId - 节点 ID
 * @returns 视频的永久下载 URL
 */
export async function uploadVideo(
  videoBlob: Blob,
  nodeId: string,
  projectId: string = DEFAULT_PROJECT_ID
): Promise<string> {
  const timestamp = Date.now();
  const path = `projects/${projectId}/videos/${nodeId}_${timestamp}.mp4`;
  const storageRef = ref(storage, path);

  await uploadBytes(storageRef, videoBlob, {
    contentType: 'video/mp4',
  });

  return getDownloadURL(storageRef);
}
