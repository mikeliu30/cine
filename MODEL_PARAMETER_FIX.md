# 🔧 Model 参数问题修复

## 🐛 问题

日志显示收到的 model 是 `gemini-3-pro`，但前端已经改为 `banana`：

```
[API] Generate image with model: gemini-3-pro
```

但是后端的 `case 'gemini-3-pro'` 已经被注释了，所以走到了 `default` 分支，使用了 Mock 模式。

---

## 🔍 原因分析

### 可能原因 1: 浏览器缓存

前端代码已更新，但浏览器缓存了旧的 JavaScript 文件。

### 可能原因 2: 节点数据缓存

之前创建的节点保存了旧的 `model: 'gemini-3-pro'` 值，重新打开节点时使用了旧值。

### 可能原因 3: WebSocket 同步的旧数据

协作系统中保存了旧的节点数据。

---

## ✅ 解决方案

### 方法 1: 硬刷新浏览器（推荐）

```
Windows: Ctrl + Shift + R
Mac: Cmd + Shift + R
```

或者：
```
Windows: Ctrl + F5
Mac: Cmd + Option + R
```

### 方法 2: 清除浏览器缓存

1. 打开开发者工具（F12）
2. 右键点击刷新按钮
3. 选择"清空缓存并硬性重新加载"

### 方法 3: 删除旧节点，创建新节点

1. 删除画布上的所有节点
2. 刷新页面
3. 创建新的图片节点
4. 验证 model 参数

### 方法 4: 重启服务器

```powershell
# 停止服务器 (Ctrl+C)
# 清理缓存
Remove-Item -Recurse -Force .next

# 重启
npm run dev
```

---

## 🧪 验证步骤

### 1. 检查前端发送的参数

打开浏览器开发者工具（F12） → Network 标签：

1. 创建新的图片节点
2. 选择 "🍌 Gemini 3 Pro"
3. 输入提示词并生成
4. 查看 `/api/generate/image` 请求
5. 检查 Request Payload 中的 `model` 字段

**预期值**: `"model": "banana"`

### 2. 检查后端接收的参数

查看终端日志：

```
[API] Generate image with model: banana  ✅ 正确
```

如果显示：
```
[API] Generate image with model: gemini-3-pro  ❌ 错误（旧缓存）
```

说明需要清除缓存。

### 3. 检查 API 调用

正确的流程应该是：

```
前端选择: "🍌 Gemini 3 Pro" (value="banana")
    ↓
发送请求: { model: "banana", prompt: "..." }
    ↓
后端匹配: case 'banana' / case 'banana-pro'
    ↓
调用函数: generateWithVertexGemini(params, 'gemini-3-pro-image-preview')
    ↓
返回结果: 高质量图片
```

---

## 🔧 临时解决方案

如果清除缓存后仍然有问题，可以临时启用 `gemini-3-pro` case：

**文件**: `src/app/api/generate/image/route.ts`

取消注释第 414-424 行：

```typescript
case 'gemini-3-pro':
  // 企业级 Vertex AI Gemini (使用最新的图片生成模型)
  if (!GOOGLE_CLOUD_PROJECT) {
    console.warn('[API] GOOGLE_CLOUD_PROJECT not configured, using mock');
    result = await generateWithMock(params);
  } else {
    // 🔥 使用 Vertex AI 调用 gemini-3-pro-image-preview (Banana Pro - Gemini 3 全球预览版)
    // 注意：此模型仅在 global 端点可用，不支持区域端点
    result = await generateWithVertexGemini(params, 'gemini-3-pro-image-preview');
  }
  break;
```

**注意**: 这只是临时方案，建议还是清除缓存使用 `banana` 值。

---

## 📊 调试信息

### 检查当前 model 值

在浏览器控制台运行：

```javascript
// 检查 localStorage
console.log(localStorage);

// 检查 sessionStorage
console.log(sessionStorage);

// 清除所有存储
localStorage.clear();
sessionStorage.clear();
```

### 检查 WebSocket 数据

```javascript
// 在浏览器控制台
// 查看当前节点数据
console.log(document.querySelector('[data-id]'));
```

---

## ✅ 验证清单

- [ ] 硬刷新浏览器（Ctrl + Shift + R）
- [ ] 清除浏览器缓存
- [ ] 删除旧节点
- [ ] 创建新节点
- [ ] 验证 Network 请求中的 model 参数
- [ ] 验证后端日志中的 model 参数
- [ ] 确认图片生成成功

---

## 🎯 预期结果

清除缓存后，应该看到：

**浏览器 Network**:
```json
{
  "model": "banana",
  "prompt": "树妖奶奶",
  "ratio": "16:9"
}
```

**后端日志**:
```
[API] Generate image with model: banana
[Vertex Gemini] Using enterprise Gemini for image generation
[Vertex Gemini] Model: gemini-3-pro-image-preview
[Vertex Gemini] Location: global
✅ Image found! MIME type: image/png
```

---

## 💡 建议

1. **始终使用硬刷新** - 开发时经常使用 Ctrl + Shift + R
2. **清除旧节点** - 代码更新后删除旧节点
3. **检查 Network** - 验证发送的参数是否正确
4. **查看日志** - 确认后端接收的参数

---

🎉 **清除缓存后问题应该就解决了！**

