#!/usr/bin/env node

/**
 * Gemini 3 Pro Image Preview 端点测试脚本
 * 用于验证全球端点配置是否正确
 */

const GOOGLE_CLOUD_PROJECT = 'fleet-blend-469520-n7';
const MODEL_NAME = 'gemini-3-pro-image-preview';

// 测试端点构建逻辑
function buildEndpoint(modelName, location) {
  const useGlobalLocation = modelName.includes('gemini-3-pro') || modelName.includes('preview');
  const finalLocation = useGlobalLocation ? 'global' : location;
  
  const baseUrl = useGlobalLocation
    ? 'https://aiplatform.googleapis.com'
    : `https://${location}-aiplatform.googleapis.com`;
  
  const endpoint = `${baseUrl}/v1/projects/${GOOGLE_CLOUD_PROJECT}/locations/${finalLocation}/publishers/google/models/${modelName}:generateContent`;
  
  return {
    modelName,
    useGlobalLocation,
    finalLocation,
    baseUrl,
    endpoint
  };
}

console.log('🧪 Gemini 3 Pro 端点配置测试\n');
console.log('=' .repeat(80));

// 测试 1: gemini-3-pro-image-preview (应该使用 global)
console.log('\n📍 测试 1: gemini-3-pro-image-preview');
const test1 = buildEndpoint('gemini-3-pro-image-preview', 'us-central1');
console.log('  模型名称:', test1.modelName);
console.log('  使用全球端点:', test1.useGlobalLocation ? '✅ 是' : '❌ 否');
console.log('  最终位置:', test1.finalLocation);
console.log('  基础 URL:', test1.baseUrl);
console.log('  完整端点:', test1.endpoint);

if (test1.useGlobalLocation && test1.finalLocation === 'global' && test1.baseUrl === 'https://aiplatform.googleapis.com') {
  console.log('  结果: ✅ 通过');
} else {
  console.log('  结果: ❌ 失败');
}

// 测试 2: gemini-2.0-flash-exp (应该使用区域端点)
console.log('\n📍 测试 2: gemini-2.0-flash-exp');
const test2 = buildEndpoint('gemini-2.0-flash-exp', 'us-central1');
console.log('  模型名称:', test2.modelName);
console.log('  使用全球端点:', test2.useGlobalLocation ? '✅ 是' : '❌ 否');
console.log('  最终位置:', test2.finalLocation);
console.log('  基础 URL:', test2.baseUrl);
console.log('  完整端点:', test2.endpoint);

if (!test2.useGlobalLocation && test2.finalLocation === 'us-central1' && test2.baseUrl === 'https://us-central1-aiplatform.googleapis.com') {
  console.log('  结果: ✅ 通过');
} else {
  console.log('  结果: ❌ 失败');
}

// 测试 3: 任何包含 preview 的模型 (应该使用 global)
console.log('\n📍 测试 3: some-model-preview');
const test3 = buildEndpoint('some-model-preview', 'us-central1');
console.log('  模型名称:', test3.modelName);
console.log('  使用全球端点:', test3.useGlobalLocation ? '✅ 是' : '❌ 否');
console.log('  最终位置:', test3.finalLocation);
console.log('  基础 URL:', test3.baseUrl);

if (test3.useGlobalLocation && test3.finalLocation === 'global') {
  console.log('  结果: ✅ 通过');
} else {
  console.log('  结果: ❌ 失败');
}

console.log('\n' + '='.repeat(80));
console.log('\n✅ 所有测试完成！');
console.log('\n💡 关键要点:');
console.log('  • gemini-3-pro-* 模型自动使用 global 端点');
console.log('  • *-preview 模型自动使用 global 端点');
console.log('  • 其他模型使用配置的区域端点 (us-central1)');
console.log('\n🔗 正确的端点格式:');
console.log('  https://aiplatform.googleapis.com/v1/projects/PROJECT/locations/global/publishers/google/models/MODEL:generateContent');

