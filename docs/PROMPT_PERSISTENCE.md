# 节点提示词持久化 - 修复说明

## 🎯 问题描述

**之前的问题**:
1. 点击节点打开生成面板时，提示词显示为空
2. 节点生成后，再次点击节点看不到原来的提示词
3. 提示词和图片/视频没有一一对应关系

**用户期望**:
- 每个节点应该记住自己的提示词
- 点击节点时，生成面板应该显示该节点的提示词
- 提示词和生成的图片/视频应该一一对应

---

## ✅ 解决方案

### 1. 节点数据结构
确保每个节点保存完整的生成信息：

```typescript
node.data = {
  shot_id: string;
  status: 'idle' | 'generating' | 'success' | 'error';
  progress: number;
  label: string;
  prompt: string;        // ✅ 保存提示词
  model: string;         // ✅ 保存模型
  imageUrl?: string;     // 图片URL
  videoUrl?: string;     // 视频URL
  parentId?: string;     // 父节点ID
}
```

### 2. 打开面板时传递提示词

**修改位置**: `src/app/canvas/page.tsx` - `handleNodeEdit`

```typescript
const handleNodeEdit = (e: CustomEvent<{ nodeId: string; imageUrl?: string }>) => {
  if (e.detail.imageUrl) {
    setInpaintEditor({ nodeId: e.detail.nodeId, imageUrl: e.detail.imageUrl });
  } else {
    const nodes = collaboration.yNodes.toArray();
    const node = nodes.find(n => n.id === e.detail.nodeId);
    setSelectedNodeId(e.detail.nodeId);
    setSelectedNodeType(node?.type === 'video' ? 'video' : 'image');
    
    // ✅ 传递节点的提示词和图片
    setSourcePrompt(node?.data?.prompt || '');
    setSourceImage(node?.data?.imageUrl || node?.data?.videoUrl || '');
    
    setShowGenerationPanel(true);
  }
};
```

### 3. 生成时保存提示词

**修改位置**: `src/app/canvas/page.tsx` - `handleGenerate`

#### 3.1 创建节点时保存
```typescript
const childNode: Node = {
  id: childNodeId,
  type: isVideo ? 'video' : 'card',
  position: { x: parentX + 350, y: parentY + ... },
  data: {
    shot_id: `shot_${Date.now().toString(36)}_${i}`,
    status: 'generating',
    progress: 0,
    label: `生成 ${i + 1}`,
    prompt: params.prompt,  // ✅ 保存提示词
    model: params.model,    // ✅ 保存模型
    parentId: parentNodeId,
  },
};
```

#### 3.2 更新节点时保留
```typescript
collaboration.yNodes.insert(currentIndex, [{
  ...currentNode,
  data: {
    ...currentNode.data,
    status: task.status === 'succeeded' ? 'success' : ...,
    progress: task.progress,
    imageUrl: newImageUrl,
    videoUrl: isVideo ? newImageUrl : undefined,
    // ✅ 确保保留提示词和模型信息
    prompt: currentNode.data.prompt,
    model: currentNode.data.model,
  },
}]);
```

### 4. 智能生成逻辑

**新增功能**: 区分"更新当前节点"和"创建子节点"

```typescript
// 判断父节点是否为空（没有图片/视频）
const isParentEmpty = !parentNode?.data?.imageUrl && !parentNode?.data?.videoUrl;

// 如果父节点为空且只生成1个，直接在当前节点生成
if (isParentEmpty && batchCount === 1) {
  // ✅ 更新当前节点，不创建子节点
  // 保存提示词到当前节点
} else {
  // ✅ 创建子节点
  // 每个子节点保存自己的提示词
}
```

---

## 🔄 工作流程

### 场景 1: 新建节点并生成

```
1. 右键 → 添加图片节点
   ↓
2. 自动打开生成面板（提示词为空）
   ↓
3. 输入提示词: "A beautiful sunset"
   ↓
4. 点击生成
   ↓
5. 节点数据保存:
   {
     prompt: "A beautiful sunset",
     model: "vertex-ai",
     imageUrl: "data:image/png;base64,..."
   }
   ↓
6. 再次点击节点
   ↓
7. 生成面板显示: "A beautiful sunset" ✅
```

### 场景 2: 从已有节点演化

```
1. 点击已有节点（有图片和提示词）
   ↓
2. 生成面板自动填充:
   - 提示词: "A beautiful sunset"
   - 参考图: [显示原图]
   ↓
3. 修改提示词: "A beautiful sunset with mountains"
   ↓
4. 点击生成（批次=2）
   ↓
5. 创建2个子节点，每个保存新提示词:
   {
     prompt: "A beautiful sunset with mountains",
     model: "vertex-ai",
     parentId: "parent_123"
   }
   ↓
6. 点击子节点
   ↓
7. 生成面板显示: "A beautiful sunset with mountains" ✅
```

### 场景 3: 快速生成

```
1. 右键 → 快速生成图片
   ↓
2. 系统随机选择提示词: "A cute cat sitting on a windowsill"
   ↓
3. 创建节点并立即生成
   ↓
4. 节点数据保存:
   {
     prompt: "A cute cat sitting on a windowsill",
     model: "vertex-ai",
     label: "快速生成"
   }
   ↓
5. 点击节点
   ↓
6. 生成面板显示: "A cute cat sitting on a windowsill" ✅
```

---

## 📊 数据流

```
用户输入提示词
    ↓
GenerationPanelPro
    ↓
onGenerate(params)
    ↓
handleGenerate
    ↓
创建/更新节点
    ↓
node.data.prompt = params.prompt  ← 保存提示词
    ↓
startGeneration
    ↓
API 生成
    ↓
更新节点状态
    ↓
保留 node.data.prompt  ← 确保不丢失
    ↓
用户点击节点
    ↓
handleNodeEdit
    ↓
setSourcePrompt(node.data.prompt)  ← 读取提示词
    ↓
GenerationPanelPro 显示提示词 ✅
```

---

## 🧪 测试用例

### 测试 1: 新节点生成后保留提示词
```
1. 创建图片节点
2. 输入提示词: "Test prompt 1"
3. 生成
4. 等待完成
5. 双击节点
6. ✅ 验证: 面板显示 "Test prompt 1"
```

### 测试 2: 子节点保留提示词
```
1. 从已有节点拖拽锚点
2. 选择"生成图片"
3. 输入提示词: "Test prompt 2"
4. 批次设为 2
5. 生成
6. 等待完成
7. 双击第一个子节点
8. ✅ 验证: 面板显示 "Test prompt 2"
9. 双击第二个子节点
10. ✅ 验证: 面板显示 "Test prompt 2"
```

### 测试 3: 快速生成保留提示词
```
1. 右键 → 快速生成图片
2. 等待完成
3. 双击节点
4. ✅ 验证: 面板显示随机提示词（如 "A beautiful sunset over mountains"）
```

### 测试 4: 修改提示词重新生成
```
1. 双击已有节点
2. 原提示词: "Old prompt"
3. 修改为: "New prompt"
4. 生成（批次=1，节点为空）
5. 等待完成
6. 双击节点
7. ✅ 验证: 面板显示 "New prompt"
```

---

## 🔍 调试技巧

### 查看节点数据
在浏览器控制台：
```javascript
// 获取所有节点
const nodes = window.__REACT_FLOW_NODES__;

// 查看特定节点的数据
console.log(nodes.find(n => n.id === 'your_node_id').data);

// 应该看到:
{
  prompt: "A beautiful sunset",
  model: "vertex-ai",
  imageUrl: "data:image/png;base64,...",
  status: "success",
  ...
}
```

### 检查生成面板状态
```javascript
// 在 GenerationPanelPro 组件中添加 console.log
useEffect(() => {
  console.log('sourcePrompt changed:', sourcePrompt);
  if (sourcePrompt) setPrompt(sourcePrompt);
}, [sourcePrompt]);
```

---

## 📋 修改文件清单

1. **`src/app/canvas/page.tsx`**
   - ✅ `handleNodeEdit`: 传递节点提示词
   - ✅ `handleGenerate`: 智能判断更新/创建节点
   - ✅ 节点更新时保留提示词

2. **`src/components/panels/GenerationPanelPro.tsx`**
   - ✅ 已正确处理 `sourcePrompt`
   - ✅ 面板打开时自动填充

---

## 🎯 核心改进

| 功能 | 之前 | 现在 |
|------|------|------|
| 提示词保存 | ❌ 不保存 | ✅ 保存到 node.data |
| 打开面板 | ❌ 显示空白 | ✅ 显示节点提示词 |
| 空节点生成 | ❌ 创建子节点 | ✅ 更新当前节点 |
| 子节点提示词 | ❌ 可能丢失 | ✅ 正确保留 |
| 快速生成 | ❌ 无提示词 | ✅ 保存随机提示词 |

---

**更新日期**: 2024
**版本**: V2.0
**状态**: ✅ 已修复

