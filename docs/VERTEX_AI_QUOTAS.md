# Vertex AI Gemini 配额限制详解

## 📊 默认配额（Gemini 图片生成）

### Gemini 3 Pro Image Preview
```
模型：gemini-3-pro-image-preview
位置：global

默认限制：
- QPM (Queries Per Minute): 60 次/分钟
- RPD (Requests Per Day): 1,000 次/天
- TPM (Tokens Per Minute): 不适用（图片生成）
- 并发请求数: 10 个
```

### Gemini 2.0 Flash Exp
```
模型：gemini-2.0-flash-exp
位置：us-central1

默认限制：
- QPM: 300 次/分钟
- RPD: 10,000 次/天
- TPM: 4,000,000 tokens/分钟
- 并发请求数: 30 个
```

---

## ⚠️ 实际影响分析

### 场景 1：小型应用（< 10 用户）
```
假设：
- 每个用户每分钟生成 2 张图片
- 10 个用户同时使用

需求：20 QPM
配额：60 QPM
结论：✅ 足够使用
```

### 场景 2：中型应用（10-50 用户）
```
假设：
- 50 个用户
- 平均每人每小时生成 5 张图片
- 峰值：每分钟 20-30 个请求

需求：20-30 QPM（平均），峰值可能达到 50 QPM
配额：60 QPM
结论：⚠️ 峰值时可能触及限制
```

### 场景 3：大型应用（> 50 用户）
```
假设：
- 100 个用户
- 峰值：每分钟 60+ 个请求

需求：60+ QPM
配额：60 QPM
结论：❌ 需要申请提额
```

---

## 🔍 如何查看当前配额

### 方法 1：Google Cloud Console
```
1. 访问：https://console.cloud.google.com/
2. 导航到：IAM & Admin → Quotas
3. 搜索：Vertex AI API
4. 筛选：
   - Service: Vertex AI API
   - Location: global (或 us-central1)
   - Metric: Requests per minute
```

### 方法 2：gcloud 命令
```bash
# 查看所有配额
gcloud compute project-info describe --project=YOUR_PROJECT_ID

# 查看 Vertex AI 配额
gcloud alpha services quota list \
  --service=aiplatform.googleapis.com \
  --consumer=projects/YOUR_PROJECT_ID
```

---

## 📈 如何申请提额

### 步骤 1：评估需求
```
计算公式：
QPM 需求 = 峰值并发用户数 × 每用户每分钟请求数 × 1.5（安全系数）

示例：
- 100 个峰值用户
- 每人每分钟 2 个请求
- QPM 需求 = 100 × 2 × 1.5 = 300 QPM
```

### 步骤 2：提交申请
```
1. 访问 Google Cloud Console
2. 导航到：IAM & Admin → Quotas
3. 找到对应的配额指标
4. 点击 "EDIT QUOTAS"
5. 填写申请表：
   - 新的配额值
   - 业务理由
   - 预期使用量
6. 提交申请

审批时间：通常 2-5 个工作日
```

### 步骤 3：联系支持
```
如果需要大幅提额（如 1000+ QPM），建议：
1. 联系 Google Cloud 销售团队
2. 说明业务场景
3. 可能需要升级到企业支持计划
```

---

## 🛡️ 配额限制处理策略

### 策略 1：请求队列（推荐）
```typescript
// 实现请求队列
import PQueue from 'p-queue';

const queue = new PQueue({
  concurrency: 10,        // 最多 10 个并发
  interval: 60000,        // 每分钟
  intervalCap: 50,        // 每分钟最多 50 个请求（留 10 个缓冲）
});

async function generateImage(params: any) {
  return queue.add(() => callGeminiAPI(params));
}
```

### 策略 2：指数退避重试
```typescript
async function generateWithRetry(params: any, maxRetries = 3) {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await generateImage(params);
    } catch (error) {
      if (error.status === 429) {  // Rate limit exceeded
        const delay = Math.pow(2, i) * 1000;  // 1s, 2s, 4s
        console.log(`Rate limited, retrying in ${delay}ms...`);
        await sleep(delay);
      } else {
        throw error;
      }
    }
  }
  throw new Error('Max retries exceeded');
}
```

### 策略 3：用户提示
```typescript
// 前端显示等待提示
if (queueLength > 10) {
  showNotification({
    type: 'info',
    message: `当前有 ${queueLength} 个请求在排队，预计等待 ${estimatedTime} 秒`,
  });
}
```

### 策略 4：多区域部署
```typescript
// 使用多个区域分散请求
const regions = ['us-central1', 'europe-west1', 'asia-east1'];
const region = regions[Math.floor(Math.random() * regions.length)];

// 注意：gemini-3-pro-image-preview 只在 global 可用
// 其他模型可以使用区域端点
```

---

## 💰 配额与定价

### 免费额度
```
Google Cloud 新用户：
- $300 免费额度（90 天）
- 可用于 Vertex AI

Vertex AI 免费层：
- 无永久免费层
- 所有请求都计费
```

### 定价（Gemini 图片生成）
```
Gemini 3 Pro Image Preview：
- 输入：$0.00125 / 1K characters
- 输出（图片）：$0.04 / image

示例成本：
- 提示词：50 字符 = $0.0000625
- 生成图片：1 张 = $0.04
- 总计：约 $0.04 / 张

月成本估算：
- 1,000 张/月：$40
- 10,000 张/月：$400
- 100,000 张/月：$4,000
```

---

## 📊 监控配额使用

### 实现配额监控
```typescript
// 记录 API 调用
let requestCount = 0;
let lastResetTime = Date.now();

async function trackAPICall() {
  const now = Date.now();
  
  // 每分钟重置计数
  if (now - lastResetTime > 60000) {
    console.log(`[Quota] Last minute: ${requestCount} requests`);
    requestCount = 0;
    lastResetTime = now;
  }
  
  requestCount++;
  
  // 警告阈值
  if (requestCount > 50) {
    console.warn(`[Quota] ⚠️ High usage: ${requestCount}/60 QPM`);
  }
}
```

### 使用 Google Cloud Monitoring
```typescript
// 发送自定义指标到 Cloud Monitoring
import { MetricServiceClient } from '@google-cloud/monitoring';

const client = new MetricServiceClient();

async function recordMetric(value: number) {
  const dataPoint = {
    interval: {
      endTime: { seconds: Date.now() / 1000 },
    },
    value: { int64Value: value },
  };
  
  await client.createTimeSeries({
    name: client.projectPath(projectId),
    timeSeries: [{
      metric: {
        type: 'custom.googleapis.com/vertex_ai/requests',
      },
      points: [dataPoint],
    }],
  });
}
```

---

## 🎯 最佳实践

### 1. 预估配额需求
```
公式：
QPM = 峰值用户数 × 每用户请求频率 × 1.5

示例：
- 预期 100 个峰值用户
- 每人每分钟 1-2 个请求
- 需要：100 × 2 × 1.5 = 300 QPM
```

### 2. 提前申请提额
```
建议时机：
- 产品上线前 2 周
- 预期流量增长前 1 周
- 营销活动前 1 周
```

### 3. 实现降级方案
```typescript
// 配额耗尽时的降级策略
async function generateImageWithFallback(params: any) {
  try {
    return await generateWithGemini(params);
  } catch (error) {
    if (error.status === 429) {
      // 降级到其他模型或返回占位图
      console.warn('Quota exceeded, using fallback');
      return generateWithMockModel(params);
    }
    throw error;
  }
}
```

---

## 📞 获取帮助

### Google Cloud 支持
- 文档：https://cloud.google.com/vertex-ai/docs/quotas
- 支持：https://cloud.google.com/support
- 社区：https://stackoverflow.com/questions/tagged/google-vertex-ai

### 配额相关链接
- 查看配额：https://console.cloud.google.com/iam-admin/quotas
- 定价计算器：https://cloud.google.com/products/calculator
- API 限制：https://cloud.google.com/vertex-ai/docs/quotas

---

## ✅ 总结

**默认配额**：60 QPM（Gemini 3 Pro Image）

**适用场景**：
- ✅ < 10 用户：足够
- ⚠️ 10-50 用户：可能需要提额
- ❌ > 50 用户：必须提额

**建议**：
1. 实现请求队列
2. 监控配额使用
3. 提前申请提额
4. 准备降级方案

