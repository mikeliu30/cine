// 生成状态管理 - 通过 API Route 调用
import { create } from 'zustand';
import { GenerationTask, GenerationParams } from '@/types/generation';
import { uploadImage } from '@/lib/firebase/storage';

interface GenerationState {
  // 任务列表
  tasks: Map<string, GenerationTask>;

  // 开始生成
  startGeneration: (params: GenerationParams) => Promise<string>;

  // 更新任务状态
  updateTask: (taskId: string, updates: Partial<GenerationTask>) => void;

  // 获取节点的任务
  getTaskByNodeId: (nodeId: string) => GenerationTask | undefined;
}

export const useGenerationStore = create<GenerationState>((set, get) => ({
  tasks: new Map(),

  startGeneration: async (params) => {
    const taskId = `task_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;

    // 创建任务
    const task: GenerationTask = {
      task_id: taskId,
      node_id: params.node_id,
      status: 'processing',
      progress: 0,
      params,
      created_at: Date.now(),
    };

    set((state) => {
      const newTasks = new Map(state.tasks);
      newTasks.set(taskId, task);
      return { tasks: newTasks };
    });

    // 模拟进度更新
    const progressInterval = setInterval(() => {
      const currentTask = get().tasks.get(taskId);
      if (currentTask && currentTask.status === 'processing') {
        const newProgress = Math.min(90, (currentTask.progress || 0) + 10);
        get().updateTask(taskId, { progress: newProgress });
      }
    }, 300);

    try {
      console.log(`[Generation] Calling API with model: ${params.model}`);

      // 判断是图片还是视频生成，以及是否使用 ComfyUI
      const isVideo = params.model?.includes('video') ||
                      params.model === 'veo-2' ||
                      params.model === 'veo-3.1-fast' ||
                      params.model === 'veo-3.1' ||
                      params.model === 'runway-gen3' ||
                      params.model === 'kling';

      const isComfyUI = params.model?.startsWith('comfyui');
      const isWorkflow = params.model?.startsWith('workflow-');

      let apiEndpoint: string;

      // 根据模型选择 API 端点
      if (isWorkflow) {
        apiEndpoint = '/api/generate/workflow';
      } else if (isComfyUI) {
        apiEndpoint = '/api/generate/comfyui';
      } else if (params.model === 'dall-e-3') {
        apiEndpoint = '/api/generate/dalle';
      } else if (params.model === 'stable-diffusion') {
        apiEndpoint = '/api/generate/sdxl';
      } else if (params.model === 'veo-2') {
        apiEndpoint = '/api/generate/veo';
      } else if (params.model === 'runway-gen3') {
        apiEndpoint = '/api/generate/runway';
      } else if (isVideo) {
        apiEndpoint = '/api/generate/video';
      } else {
        apiEndpoint = '/api/generate/image';
      }

      console.log(`[Generation] Using endpoint: ${apiEndpoint}`);

      // 调用 API Route
      const response = await fetch(apiEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: params.model,
          prompt: params.prompt,
          ratio: params.ratio,
          negative_prompt: params.negative_prompt,
          seed: params.seed,
          reference_image: params.reference_image,
          camera_control: params.camera_control,
          duration: params.duration || 6,
        }),
      });

      clearInterval(progressInterval);

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      const data = await response.json();
      console.log('[Generation] API response:', data);

      // 处理图片生成结果
      if (!isVideo && data.success && data.data?.image_url) {
        let finalUrl = data.data.image_url;

        // 如果是 base64 图片，上传到 Cloud Storage
        if (finalUrl.startsWith('data:image/')) {
          try {
            console.log('[Generation] Uploading image to Cloud Storage...');
            const base64Data = finalUrl.split(',')[1];
            finalUrl = await uploadImage(base64Data, params.node_id);
            console.log('[Generation] Image uploaded:', finalUrl);
          } catch (uploadError) {
            console.warn('[Generation] Upload failed, using base64:', uploadError);
            // 上传失败时继续使用 base64
          }
        }

        get().updateTask(taskId, {
          status: 'succeeded',
          progress: 100,
          result: {
            url: finalUrl,
            seed: data.data.seed || 0,
          },
        });
      }
      // 处理视频生成结果 - 同步返回
      else if (isVideo && data.success && data.videoUrl) {
        get().updateTask(taskId, {
          status: 'succeeded',
          progress: 100,
          result: {
            url: data.videoUrl,
            duration: data.duration,
          },
        });
      }
      // 处理视频生成结果 - 异步轮询（Veo 2.0）
      else if (isVideo && data.success && data.operationName) {
        console.log('[Generation] Video operation started, polling:', data.operationName);

        // 开始轮询操作状态
        const pollOperation = async () => {
          const maxAttempts = 120; // 最多轮询 120 次（约 4 分钟）
          let attempts = 0;

          while (attempts < maxAttempts) {
            attempts++;
            await new Promise(resolve => setTimeout(resolve, 2000)); // 每 2 秒轮询一次

            try {
              const pollResponse = await fetch('/api/generate/video', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  prompt: params.prompt, // 需要 prompt 来通过验证
                  operationName: data.operationName
                }),
              });

              const pollData = await pollResponse.json();
              console.log('[Generation] Poll result:', pollData);

              // 更新进度
              const progress = Math.min(90, 10 + attempts * 2);
              get().updateTask(taskId, { progress });

              if (pollData.status === 'succeeded' && pollData.videoUrl) {
                get().updateTask(taskId, {
                  status: 'succeeded',
                  progress: 100,
                  result: {
                    url: pollData.videoUrl,
                  },
                });
                return;
              }

              if (pollData.error) {
                throw new Error(pollData.error);
              }

            } catch (pollError) {
              console.error('[Generation] Poll error:', pollError);
              // 继续轮询，除非是明确的错误
            }
          }

          // 超时
          throw new Error('Video generation timeout');
        };

        // 异步执行轮询，不阻塞
        pollOperation().catch(error => {
          console.error('[Generation] Video polling failed:', error);
          get().updateTask(taskId, {
            status: 'failed',
            progress: 0,
            error: error instanceof Error ? error.message : 'Video generation failed',
          });
        });

      } else {
        throw new Error(data.error || 'No image/video returned');
      }

    } catch (error) {
      clearInterval(progressInterval);
      console.error('[Generation] Error:', error);
      get().updateTask(taskId, {
        status: 'failed',
        progress: 0,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }

    return taskId;
  },

  updateTask: (taskId, updates) => {
    set((state) => {
      const newTasks = new Map(state.tasks);
      const existing = newTasks.get(taskId);
      if (existing) {
        newTasks.set(taskId, { ...existing, ...updates });
      }
      return { tasks: newTasks };
    });
  },

  getTaskByNodeId: (nodeId) => {
    const tasks = get().tasks;
    for (const task of tasks.values()) {
      if (task.node_id === nodeId && task.status === 'processing') {
        return task;
      }
    }
    // 返回最新完成的任务
    let latestTask: GenerationTask | undefined;
    for (const task of tasks.values()) {
      if (task.node_id === nodeId) {
        if (!latestTask || task.created_at > latestTask.created_at) {
          latestTask = task;
        }
      }
    }
    return latestTask;
  },
}));

