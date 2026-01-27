// Veo 2 状态查询 API
// POST /api/generate/veo/status

import { NextRequest, NextResponse } from 'next/server';
import { GoogleAuth } from 'google-auth-library';
import * as path from 'path';

const VERTEX_AI_LOCATION = process.env.VERTEX_AI_LOCATION || 'us-central1';

async function getAccessToken() {
  let auth;

  if (process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON) {
    const credentials = JSON.parse(process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON);
    auth = new GoogleAuth({
      credentials,
      scopes: ['https://www.googleapis.com/auth/cloud-platform'],
    });
  } else {
    auth = new GoogleAuth({
      keyFilename: path.join(process.cwd(), 'vertex-key.json'),
      scopes: ['https://www.googleapis.com/auth/cloud-platform'],
    });
  }

  const client = await auth.getClient();
  const accessToken = await client.getAccessToken();
  
  if (!accessToken.token) {
    throw new Error('Failed to get access token');
  }
  
  return accessToken.token;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    console.log('[Veo Status API] Checking operation:', body.operationName);

    if (!body.operationName) {
      return NextResponse.json(
        { error: 'Missing required parameter: operationName' },
        { status: 400 }
      );
    }

    const accessToken = await getAccessToken();
    const endpoint = `https://${VERTEX_AI_LOCATION}-aiplatform.googleapis.com/v1/${body.operationName}`;

    const response = await fetch(endpoint, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
      },
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('[Veo Status API] Error:', error);
      throw new Error(`Veo status check error: ${response.status}`);
    }

    const result = await response.json();
    console.log('[Veo Status API] Status:', result.done ? 'DONE' : 'PROCESSING');

    if (result.done) {
      if (result.error) {
        return NextResponse.json({
          success: false,
          status: 'failed',
          error: result.error.message,
        });
      }

      // 提取视频数据
      const videoData = result.response?.generatedSamples?.[0]?.video?.bytesBase64Encoded;
      if (videoData) {
        return NextResponse.json({
          success: true,
          status: 'succeeded',
          videoUrl: `data:video/mp4;base64,${videoData}`,
        });
      }

      // 或者可能是 URI
      const videoUri = result.response?.generatedSamples?.[0]?.video?.uri;
      if (videoUri) {
        return NextResponse.json({
          success: true,
          status: 'succeeded',
          videoUrl: videoUri,
        });
      }

      throw new Error('No video data in response');
    }

    // 仍在处理中
    return NextResponse.json({
      success: true,
      status: 'processing',
      operationName: body.operationName,
    });

  } catch (error: any) {
    console.error('[Veo Status API] Error:', error);
    return NextResponse.json(
      { error: error.message || 'Status check failed' },
      { status: 500 }
    );
  }
}

