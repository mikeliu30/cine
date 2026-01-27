#!/usr/bin/env node

/**
 * 功能开关检查脚本
 * 用于验证当前启用/禁用的功能
 */

const fs = require('fs');
const path = require('path');

console.log('🔍 CineFlow 功能开关检查\n');
console.log('='.repeat(50));

// 读取功能配置文件
const featuresPath = path.join(__dirname, '../src/config/features.ts');

if (!fs.existsSync(featuresPath)) {
  console.error('❌ 找不到功能配置文件:', featuresPath);
  process.exit(1);
}

const content = fs.readFileSync(featuresPath, 'utf-8');

// 解析功能开关状态
const features = {
  '图片生成': /IMAGE_GENERATION:\s*true/.test(content),
  '视频生成': /VIDEO_GENERATION:\s*true/.test(content),
  '参考图上传': /REFERENCE_IMAGE:\s*true/.test(content),
  '批次生成': /BATCH_GENERATION:\s*true/.test(content),
  'Prompt增强': /PROMPT_ENHANCEMENT:\s*true/.test(content),
  '运镜控制': /CAMERA_CONTROL:\s*true/.test(content),
  '高级设置': /ADVANCED_SETTINGS:\s*true/.test(content),
};

const models = {
  'Gemini 3 Pro': /'gemini-3-pro':\s*true/.test(content),
  '即梦 4.5': /'jimeng':\s*true/.test(content),
  'Mock测试': /'mock':\s*true/.test(content),
};

const ratios = {
  '16:9': /'16:9':\s*true/.test(content),
  '9:16': /'9:16':\s*true/.test(content),
  '1:1': /'1:1':\s*true/.test(content),
  '4:3': /'4:3':\s*true/.test(content),
};

// 显示结果
console.log('\n📦 核心功能状态:');
console.log('-'.repeat(50));
Object.entries(features).forEach(([name, enabled]) => {
  const icon = enabled ? '✅' : '❌';
  const status = enabled ? '已启用' : '已禁用';
  console.log(`${icon} ${name.padEnd(15)} ${status}`);
});

console.log('\n🤖 可用模型:');
console.log('-'.repeat(50));
Object.entries(models).forEach(([name, enabled]) => {
  const icon = enabled ? '✅' : '❌';
  const status = enabled ? '可用' : '不可用';
  console.log(`${icon} ${name.padEnd(15)} ${status}`);
});

console.log('\n📐 支持画幅:');
console.log('-'.repeat(50));
Object.entries(ratios).forEach(([name, enabled]) => {
  const icon = enabled ? '✅' : '❌';
  const status = enabled ? '支持' : '不支持';
  console.log(`${icon} ${name.padEnd(15)} ${status}`);
});

// 统计
const enabledCount = Object.values(features).filter(Boolean).length;
const totalCount = Object.values(features).length;
const percentage = Math.round((enabledCount / totalCount) * 100);

console.log('\n📊 功能完成度:');
console.log('-'.repeat(50));
console.log(`已启用: ${enabledCount}/${totalCount} (${percentage}%)`);

// 部署建议
console.log('\n💡 部署建议:');
console.log('-'.repeat(50));

if (features['图片生成'] && !features['视频生成']) {
  console.log('✅ 适合部署 - 图片功能已就绪');
  console.log('📝 建议：在首页添加"仅支持图片生成"提示');
} else if (features['图片生成'] && features['视频生成']) {
  console.log('✅ 完整功能 - 可以全功能部署');
} else {
  console.log('⚠️  警告：核心功能未启用，不建议部署');
}

// 检查环境变量
console.log('\n🔐 环境变量检查:');
console.log('-'.repeat(50));

const envPath = path.join(__dirname, '../.env.local');
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf-8');
  const hasGeminiKey = /GEMINI_API_KEY=.+/.test(envContent);
  const hasWsUrl = /NEXT_PUBLIC_WS_URL=.+/.test(envContent);
  
  console.log(hasGeminiKey ? '✅ GEMINI_API_KEY 已配置' : '❌ GEMINI_API_KEY 未配置');
  console.log(hasWsUrl ? '✅ NEXT_PUBLIC_WS_URL 已配置' : '❌ NEXT_PUBLIC_WS_URL 未配置');
} else {
  console.log('⚠️  .env.local 文件不存在');
  console.log('💡 请复制 .env.example 并配置环境变量');
}

console.log('\n' + '='.repeat(50));
console.log('✨ 检查完成\n');

