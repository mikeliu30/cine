# ✅ 最终配置：前端简化，后端全保留

## 🎯 配置策略

### 前端：只显示常用选项
- 简化用户选择
- 只显示即梦和 Gemini 3 Pro

### 后端：保留所有 API
- 支持所有 model 值
- 兼容旧节点和直接 API 调用
- 灵活扩展

---

## 📊 当前配置

### 前端选项（用户可见）

#### 图片生成
```typescript
<option value="gemini-3-pro">🍌 Gemini 3 Pro</option>
<option value="jimeng">✨ 即梦 4.5</option>
<option value="mock">🧪 Mock (测试)</option>
```

#### 视频生成
```typescript
<option value="veo-2">🎬 Veo 2</option>
<option value="mock">🧪 Mock (测试)</option>
```

---

### 后端支持（全部启用）

#### 图片生成 API

| Model 值 | 前端显示 | 后端支持 | 调用函数 |
|---------|---------|---------|---------|
| `gemini-3-pro` | ✅ 显示 | ✅ 支持 | `generateWithVertexGemini(..., 'gemini-3-pro-image-preview')` |
| `jimeng` | ✅ 显示 | ✅ 支持 | `generateWithJimeng(params)` |
| `mock` | ✅ 显示 | ✅ 支持 | `generateWithMock(params)` |
| `banana` | ❌ 不显示 | ✅ 支持 | `generateWithVertexGemini(..., 'gemini-3-pro-image-preview')` |
| `banana-pro` | ❌ 不显示 | ✅ 支持 | `generateWithVertexGemini(..., 'gemini-3-pro-image-preview')` |
| `vertex-ai` | ❌ 不显示 | ✅ 支持 | `generateWithVertexAI(params)` |
| `imagen-3` | ❌ 不显示 | ✅ 支持 | `generateWithVertexAI(params)` |
| `gemini` | ❌ 不显示 | ✅ 支持 | `generateWithVertexGemini(..., 'gemini-2.0-flash-exp')` |
| `gemini-2.0-flash` | ❌ 不显示 | ✅ 支持 | `generateWithVertexGemini(..., 'gemini-2.0-flash-exp')` |
| `gemini-2.5-pro` | ❌ 不显示 | ✅ 支持 | `generateWithVertexGemini(..., 'gemini-3-pro-image-preview')` |
| `jimeng-4.5` | ❌ 不显示 | ✅ 支持 | `generateWithJimeng(params)` |

#### 视频生成 API

| Model 值 | 前端显示 | 后端支持 | 调用函数 |
|---------|---------|---------|---------|
| `veo-2` | ✅ 显示 | ✅ 支持 | `generateWithVeo2(body)` |
| `mock` | ✅ 显示 | ✅ 支持 | 返回测试视频 |

---

## 🎨 架构说明

### 前端 → 后端流程

```
用户界面
├─ 图片生成
│  ├─ 🍌 Gemini 3 Pro (value="gemini-3-pro")
│  ├─ ✨ 即梦 4.5 (value="jimeng")
│  └─ 🧪 Mock (value="mock")
│
└─ 视频生成
   ├─ 🎬 Veo 2 (value="veo-2")
   └─ 🧪 Mock (value="mock")

后端 API (/api/generate/image)
├─ case 'gemini-3-pro'     ✅ 支持
├─ case 'jimeng'           ✅ 支持
├─ case 'mock'             ✅ 支持
├─ case 'banana'           ✅ 支持（隐藏）
├─ case 'banana-pro'       ✅ 支持（隐藏）
├─ case 'vertex-ai'        ✅ 支持（隐藏）
├─ case 'imagen-3'         ✅ 支持（隐藏）
├─ case 'gemini'           ✅ 支持（隐藏）
├─ case 'gemini-2.0-flash' ✅ 支持（隐藏）
├─ case 'gemini-2.5-pro'   ✅ 支持（隐藏）
└─ case 'jimeng-4.5'       ✅ 支持（隐藏）

后端 API (/api/generate/video)
├─ model === 'veo-2'       ✅ 支持
└─ model === 'mock'        ✅ 支持
```

---

## 💡 设计优势

### 1. 用户体验简化
- ✅ 前端只显示 2-3 个常用选项
- ✅ 避免选择困难
- ✅ 清晰的功能定位

### 2. 后端灵活性
- ✅ 支持所有 model 值
- ✅ 兼容旧节点数据
- ✅ 支持直接 API 调用
- ✅ 易于扩展新功能

### 3. 向后兼容
- ✅ 旧节点（如 `banana`）仍然可用
- ✅ 直接 API 调用不受影响
- ✅ 不需要数据迁移

### 4. 灵活扩展
- ✅ 需要时可以快速添加前端选项
- ✅ 后端已经支持，无需修改
- ✅ 测试和开发更方便

---

## 🧪 使用示例

### 示例 1: 通过前端界面（推荐）

1. 打开画布：http://localhost:3000/canvas
2. 创建图片节点
3. 选择 "🍌 Gemini 3 Pro" 或 "✨ 即梦 4.5"
4. 输入提示词并生成

**发送的请求**：
```json
{
  "model": "gemini-3-pro",  // 或 "jimeng"
  "prompt": "一只可爱的小猫",
  "ratio": "16:9"
}
```

### 示例 2: 直接调用 API（高级用户）

```javascript
// 使用隐藏的 banana 模型
fetch('/api/generate/image', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    model: 'banana',  // 前端不显示，但后端支持
    prompt: '一只可爱的小猫',
    ratio: '16:9'
  })
})

// 使用 Imagen 3
fetch('/api/generate/image', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    model: 'imagen-3',  // 前端不显示，但后端支持
    prompt: 'a cute cat',
    ratio: '16:9'
  })
})
```

### 示例 3: 旧节点自动工作

```javascript
// 旧节点保存的数据
{
  model: 'banana',  // 旧值
  prompt: '...'
}

// 后端自动处理
case 'banana':  // ✅ 匹配成功
  result = await generateWithVertexGemini(params, 'gemini-3-pro-image-preview');
```

---

## 📝 修改的文件

### 1. 前端选项
**文件**: `src/components/panels/GenerationPanel.tsx`

**图片生成**（第 406-411 行）：
```typescript
<option value="gemini-3-pro">🍌 Gemini 3 Pro</option>
<option value="jimeng">✨ 即梦 4.5</option>
<option value="mock">🧪 Mock (测试)</option>
```

**视频生成**（第 412-417 行）：
```typescript
<option value="veo-2">🎬 Veo 2</option>
<option value="mock">🧪 Mock (测试)</option>
```

### 2. 后端图片 API
**文件**: `src/app/api/generate/image/route.ts`

**所有 case 都已启用**（第 377-434 行）：
- ✅ `case 'vertex-ai'` / `case 'imagen-3'`
- ✅ `case 'banana'` / `case 'banana-pro'`
- ✅ `case 'gemini'` / `case 'gemini-2.0-flash'`
- ✅ `case 'gemini-3-pro'`
- ✅ `case 'gemini-2.5-pro'`
- ✅ `case 'jimeng-4.5'` / `case 'jimeng'`
- ✅ `case 'mock'`

### 3. 后端视频 API
**文件**: `src/app/api/generate/video/route.ts`

**已启用**（第 213-230 行）：
- ✅ `model === 'mock'` - Mock 模式
- ✅ `generateWithVeo2(body)` - Veo 2

---

## ✅ 验证清单

- [x] 前端只显示 gemini-3-pro 和 jimeng
- [x] 后端支持所有 model 值
- [x] 旧节点（banana）仍然可用
- [x] 直接 API 调用可用
- [x] 视频生成已启用
- [x] Mock 模式可用

---

## 🎉 总结

**前端**：
- ✅ 简化为 2 个主要选项（Gemini 3 Pro + 即梦 4.5）
- ✅ 1 个测试选项（Mock）
- ✅ 视频生成（Veo 2 + Mock）

**后端**：
- ✅ 保留所有 API 支持
- ✅ 兼容所有 model 值
- ✅ 灵活扩展

🚀 **完美的平衡：简单的用户界面 + 强大的后端支持！**

