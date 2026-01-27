# 🔌 API 配置状态

## 📊 当前启用的 API

### 图片生成

| API | 状态 | 说明 |
|-----|------|------|
| 🍌 Gemini 3 Pro | ✅ 已启用 | 使用 Vertex AI gemini-3-pro-image-preview |
| ✨ 即梦 4.5 | ✅ 已启用 | 使用火山方舟 API |
| 🧪 Mock (测试) | ✅ 已启用 | 本地测试模式 |

### 视频生成

| API | 状态 | 说明 |
|-----|------|------|
| 🧪 Mock (测试) | ✅ 已启用 | 本地测试模式 |

---

## 🚫 暂时禁用的 API

### 图片生成

| API | 状态 | 原因 | 如何启用 |
|-----|------|------|---------|
| 🎨 Imagen 3 | ⏸️ 已禁用 | 需要验证 Vertex AI 配置 | 见下方说明 |

### 视频生成

| API | 状态 | 原因 | 如何启用 |
|-----|------|------|---------|
| 🎬 Veo 2 | ⏸️ 已禁用 | 需要验证 Vertex AI 配置 | 见下方说明 |
| 🎥 可灵 | ⏸️ 已禁用 | 需要配置可灵 API | 见下方说明 |
| 🌊 海螺 | ⏸️ 已禁用 | 需要配置海螺 API | 见下方说明 |

---

## 🔧 如何启用禁用的 API

### 1. 启用即梦 4.5

**前提条件**：
- ✅ 已有火山方舟 API Key: `e4df5214-5735-49f2-9de4-fd243ea10384`

**测试步骤**：
```bash
# 1. 测试 API 是否可用
curl -X POST https://ark.cn-beijing.volces.com/api/v3/images/generations \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer e4df5214-5735-49f2-9de4-fd243ea10384" \
  -d '{
    "model": "doubao-seedream-3-0-t2i-250415",
    "prompt": "a cute cat",
    "size": "1024x1024",
    "n": 1
  }'
```

**启用方法**：
1. 验证 API 可用后，编辑 `src/components/panels/GenerationPanel.tsx`
2. 取消注释第 410 行：
   ```typescript
   <option value="jimeng">✨ 即梦 4.5</option>
   ```

### 2. 启用 Imagen 3

**前提条件**：
- ✅ 已有 Google Cloud 项目: `fleet-blend-469520-n7`
- ✅ 已有认证文件

**测试步骤**：
```bash
# 测试 Imagen 3 API
node -e "
const { GoogleAuth } = require('google-auth-library');
const auth = new GoogleAuth({
  keyFilename: './vertex-key.json',
  scopes: ['https://www.googleapis.com/auth/cloud-platform']
});
auth.getClient().then(client => {
  return client.getAccessToken();
}).then(token => {
  console.log('✅ Imagen 3 认证成功');
}).catch(err => {
  console.error('❌ 认证失败:', err.message);
});
"
```

**启用方法**：
1. 验证 API 可用后，编辑 `src/components/panels/GenerationPanel.tsx`
2. 取消注释第 411 行：
   ```typescript
   <option value="imagen-3">🎨 Imagen 3</option>
   ```

### 3. 启用 Veo 2

**前提条件**：
- ✅ 已有 Google Cloud 项目
- ✅ 已启用 Vertex AI API
- ⚠️ 需要验证 Veo 2 模型访问权限

**测试步骤**：
```bash
# 测试 Veo 2 API 访问
# 需要检查是否有 veo-2.0-generate-001 模型权限
```

**启用方法**：
1. 验证 API 可用后，编辑 `src/components/panels/GenerationPanel.tsx`
2. 取消注释第 417 行：
   ```typescript
   <option value="veo-2">🎬 Veo 2</option>
   ```

### 4. 启用可灵 / 海螺

**前提条件**：
- ❌ 需要获取 API Key
- ❌ 需要实现 API 集成代码

**状态**：暂未实现

---

## 📝 修改记录

### 2026-01-26

**修改文件**: `src/components/panels/GenerationPanel.tsx`

**修改内容**:
```typescript
// 图片生成 - 只保留已验证的 API
{activeTab === 'image' ? (
  <>
    <option value="banana">🍌 Banana Pro (Gemini 3)</option>
    {/* 暂时禁用未配置的 API */}
    {/* <option value="jimeng">✨ 即梦 4.5</option> */}
    {/* <option value="imagen-3">🎨 Imagen 3</option> */}
    <option value="mock">🧪 Mock (测试)</option>
  </>
) : (
  <>
    {/* 暂时禁用未配置的视频 API */}
    {/* <option value="veo-2">🎬 Veo 2</option> */}
    {/* <option value="kling">🎥 可灵</option> */}
    {/* <option value="hailuo">🌊 海螺</option> */}
    <option value="mock">🧪 Mock (测试)</option>
  </>
)}
```

**原因**：
- 避免用户选择未配置的 API 导致错误
- 专注于已修复的 Banana Pro (Gemini 3) API
- 简化用户体验

---

## 🎯 推荐使用

### 图片生成

#### 🍌 Gemini 3 Pro (推荐)
- ✅ 已完全修复
- ✅ 支持 4K 分辨率
- ✅ 高质量输出
- ✅ 10-30秒生成时间
- ✅ 适合：高质量、艺术风格、复杂场景

#### ✨ 即梦 4.5
- ✅ 火山方舟 API
- ✅ 快速生成
- ✅ 支持多种画幅
- ✅ 适合：快速迭代、中文提示词

### 视频生成
**推荐**: 🧪 Mock (测试)
- ⚠️ 视频 API 暂未验证
- 建议先使用 Mock 模式测试工作流

---

## 🔄 恢复所有 API

如果需要恢复所有 API 选项（风险自负）：

```bash
# 1. 备份当前文件
cp src/components/panels/GenerationPanel.tsx src/components/panels/GenerationPanel.tsx.backup

# 2. 使用 git 恢复原始版本
git checkout src/components/panels/GenerationPanel.tsx

# 3. 重启开发服务器
npm run dev
```

---

## 📚 相关文档

- [Banana Pro 修复说明](./GEMINI_3_PRO_FIX.md)
- [快速启动指南](../QUICK_START.md)
- [完整启动指南](./STARTUP_GUIDE.md)

---

## 💡 提示

当前配置专注于**已验证可用**的 API，确保用户体验流畅。

如需启用其他 API，请先完成测试验证，再取消相应的注释。

