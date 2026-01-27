# 🔧 API 429 错误解决方案

## 问题描述
```
Error: Vertex Gemini error (429): Resource exhausted
```

这是 **API 配额限制** 错误，表示 Vertex AI Gemini API 的免费配额已用完。

## ✅ 已应用的解决方案

### 使用 Mock 模式进行测试

我已经将默认模型改为 **Mock 模式**，这样可以：
- ✅ 不消耗 API 配额
- ✅ 立即返回测试图片
- ✅ 完美测试动态画幅比例功能
- ✅ 无需等待 API 响应

### 修改的文件

#### 1. `src/components/panels/GenerationPanel.tsx`
```typescript
// 修改前
const [model, setModel] = useState('gemini-3-pro');

// 修改后
const [model, setModel] = useState('mock'); // 使用 Mock 模式
```

#### 2. `src/app/canvas/page.tsx`
```typescript
// 修改前
model: 'vertex-ai',

// 修改后
model: 'mock', // 使用 Mock 模式
```

## 🎯 Mock 模式的优势

### 用于测试画幅比例功能
Mock 模式会根据你选择的画幅比例返回对应尺寸的测试图片：

| 画幅比例 | Mock 图片尺寸 | 卡片显示尺寸 |
|---------|--------------|-------------|
| 16:9    | 1024×576     | 683×384     |
| 9:16    | 576×1024     | 216×384     |
| 1:1     | 1024×1024    | 384×384     |
| 4:3     | 1024×768     | 512×384     |

### Mock 图片来源
使用 Picsum Photos API 提供的随机图片：
```
https://picsum.photos/seed/{seed}/{width}/{height}
```

## 🧪 现在可以测试了！

1. **刷新浏览器页面**：http://localhost:3000/canvas
2. **生成不同比例的图片**：
   - 选择 16:9 → 生成横屏图片
   - 选择 9:16 → 生成竖屏图片
   - 选择 1:1 → 生成方形图片
3. **观察卡片尺寸**：每个比例的卡片宽度应该不同
4. **验证图片完整显示**：图片不应该被裁剪

## 🔄 如何切换回真实 API

如果你想使用真实的 Gemini API（需要解决配额问题），可以：

### 方法1：在生成面板中手动选择
1. 打开生成面板
2. 在"模型"下拉框中选择 "Gemini 3 Pro"
3. 点击生成

### 方法2：修改代码
恢复 `GenerationPanel.tsx` 中的默认模型：
```typescript
const [model, setModel] = useState('gemini-3-pro');
```

## 💡 解决真实 API 配额问题

### 方案1：等待配额重置
- 免费配额通常每天重置
- 等待 24 小时后再试

### 方案2：启用计费
1. 访问 Google Cloud Console
2. 启用 Vertex AI API 计费
3. 设置预算提醒

### 方案3：使用其他模型
项目支持多个模型，可以尝试：
- Mock（测试用）
- Gemini 3 Pro（需要配额）
- 即梦 4.5（需要配置）

### 方案4：增加速率限制
修改 `src/lib/rateLimiter.ts` 中的限制：
```typescript
// 降低请求频率
const MAX_REQUESTS_PER_MINUTE = 10; // 从 50 降到 10
const MAX_CONCURRENT_REQUESTS = 2;  // 从 10 降到 2
```

## 📊 API 配额参考

### Vertex AI Gemini 免费层
- **每分钟请求数**：15 RPM
- **每天请求数**：1,500 RPD
- **并发请求数**：5

### 超出配额的表现
- 返回 429 错误
- 错误信息：`RESOURCE_EXHAUSTED`
- 需要等待或升级配额

## ✅ 当前状态

- ✅ Mock 模式已启用
- ✅ 可以正常测试画幅比例功能
- ✅ 不会触发 API 配额限制
- ✅ 图片立即生成，无需等待

## 🚀 开始测试

现在你可以：
1. 刷新浏览器
2. 生成不同比例的图片
3. 观察卡片尺寸变化
4. 验证动态画幅比例功能

**Mock 模式完全满足测试需求！** 🎉

