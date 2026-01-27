// 配额状态 API
// GET /api/quota/status

import { NextResponse } from 'next/server';
import { rateLimiter } from '@/lib/rateLimiter';

export async function GET() {
  const status = rateLimiter.getStatus();
  
  return NextResponse.json({
    success: true,
    data: status,
    message: status.queueLength > 10 
      ? '⚠️ 当前请求较多，可能需要等待'
      : '✅ 系统运行正常',
  });
}

