// Runway Gen-3 视频生成 API
// POST /api/generate/runway

import { NextRequest, NextResponse } from 'next/server';

const RUNWAY_API_KEY = process.env.RUNWAY_API_KEY || '';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    console.log('[Runway API] Request:', body);

    if (!body.prompt) {
      return NextResponse.json(
        { error: 'Missing required parameter: prompt' },
        { status: 400 }
      );
    }

    // 检查 API Key
    if (!RUNWAY_API_KEY) {
      console.warn('[Runway API] No API key configured, using mock');
      return NextResponse.json({
        success: true,
        videoUrl: 'https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
        duration: body.duration || 5,
        message: '⚠️ Runway API key not configured, using mock video'
      });
    }

    // 调用 Runway API
    const response = await fetch('https://api.runwayml.com/v1/gen3/text-to-video', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${RUNWAY_API_KEY}`,
      },
      body: JSON.stringify({
        prompt: body.prompt,
        duration: body.duration || 5,
        ratio: body.ratio || '16:9',
        image: body.image, // 可选：Image-to-Video
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('[Runway API] Error:', error);
      throw new Error(`Runway API error: ${response.status}`);
    }

    const data = await response.json();
    console.log('[Runway API] Task started:', data.id);

    // 返回任务 ID，前端需要轮询
    return NextResponse.json({
      success: true,
      taskId: data.id,
      status: 'processing',
    });

  } catch (error: any) {
    console.error('[Runway API] Error:', error);
    
    // 降级到 mock
    return NextResponse.json({
      success: true,
      videoUrl: 'https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
      duration: 5,
      warning: error.message,
    });
  }
}

// GET /api/generate/runway/status?taskId=xxx
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const taskId = searchParams.get('taskId');

    if (!taskId) {
      return NextResponse.json(
        { error: 'Missing required parameter: taskId' },
        { status: 400 }
      );
    }

    if (!RUNWAY_API_KEY) {
      return NextResponse.json({
        success: true,
        status: 'succeeded',
        videoUrl: 'https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
      });
    }

    // 查询任务状态
    const response = await fetch(`https://api.runwayml.com/v1/tasks/${taskId}`, {
      headers: {
        'Authorization': `Bearer ${RUNWAY_API_KEY}`,
      },
    });

    if (!response.ok) {
      throw new Error(`Runway status check error: ${response.status}`);
    }

    const data = await response.json();

    if (data.status === 'SUCCEEDED') {
      return NextResponse.json({
        success: true,
        status: 'succeeded',
        videoUrl: data.output[0],
        progress: 100,
      });
    } else if (data.status === 'FAILED') {
      return NextResponse.json({
        success: false,
        status: 'failed',
        error: data.error,
      });
    } else {
      return NextResponse.json({
        success: true,
        status: 'processing',
        progress: data.progress || 50,
      });
    }

  } catch (error: any) {
    console.error('[Runway Status API] Error:', error);
    return NextResponse.json(
      { error: error.message || 'Status check failed' },
      { status: 500 }
    );
  }
}

