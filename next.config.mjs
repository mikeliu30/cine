/** @type {import('next').NextConfig} */
const nextConfig = {
  // 根据环境变量决定输出模式
  // FIREBASE_BUILD=true 时使用 export（静态导出）
  // 否则使用 standalone（Cloud Run SSR）
  output: process.env.FIREBASE_BUILD === 'true' ? 'export' : 'standalone',

  eslint: {
    // 生产构建时忽略 ESLint 错误
    ignoreDuringBuilds: true,
  },
  typescript: {
    // 生产构建时忽略 TypeScript 错误
    ignoreBuildErrors: true,
  },

  // 静态导出时的配置
  ...(process.env.FIREBASE_BUILD === 'true' && {
    images: {
      unoptimized: true, // 静态导出不支持图片优化
    },
  }),
};

export default nextConfig;
