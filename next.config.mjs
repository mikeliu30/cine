/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export', // 静态导出用于 Firebase Hosting
  images: {
    unoptimized: true, // 静态导出需要禁用图片优化
  },
  eslint: {
    // 生产构建时忽略 ESLint 错误
    ignoreDuringBuilds: true,
  },
  typescript: {
    // 生产构建时忽略 TypeScript 错误
    ignoreBuildErrors: true,
  },
};

export default nextConfig;
