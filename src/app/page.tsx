import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center">
      <div className="text-center max-w-2xl mx-auto px-4">
        <h1 className="text-5xl font-bold text-white mb-4">
          🎬 CineFlow SSR Lab
        </h1>
        <p className="text-gray-400 text-lg mb-8">
          多人实时协作画布 · AIGC 卡牌生成
        </p>

        {/* 功能状态提示 */}
        <div className="mb-8 p-4 bg-indigo-500/10 border border-indigo-500/30 rounded-xl">
          <div className="flex items-center justify-center gap-2 mb-2">
            <span className="text-2xl">✅</span>
            <span className="text-indigo-300 font-semibold">当前版本：图片生成功能</span>
          </div>
          <div className="text-sm text-gray-400 space-y-1">
            <p>✨ 支持 Gemini 3 Pro 图片生成</p>
            <p>📎 支持参考图上传</p>
            <p>🎨 支持多种风格预设</p>
            <p>📐 支持 16:9 / 9:16 / 1:1 画幅</p>
          </div>
          <div className="mt-3 text-xs text-gray-500">
            🚧 视频生成、批次生成等功能开发中...
          </div>
        </div>

        <Link
          href="/canvas"
          className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-yellow-500 to-orange-500 text-white font-bold text-lg rounded-xl hover:scale-105 transition-transform shadow-lg shadow-orange-500/30"
        >
          <span>✨</span>
          <span>进入画布</span>
        </Link>

        <div className="mt-12 text-gray-500 text-sm">
          <p className="mb-2">⚠️ 首次使用需要启动 WebSocket 服务器：</p>
          <code className="bg-gray-800 px-3 py-1 rounded text-yellow-400">
            npx y-websocket
          </code>
        </div>
      </div>
    </div>
  );
}
