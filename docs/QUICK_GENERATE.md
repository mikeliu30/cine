# 快速生成功能说明

## 🎯 问题
之前点击"添加图片节点"或"添加视频节点"后，需要：
1. 手动双击节点打开生成面板
2. 输入提示词
3. 点击生成

这个流程比较繁琐，不够直观。

## ✨ 解决方案

我们实现了**三种生成方式**，满足不同场景需求：

### 1. ⚡ 快速生成（新增）
**使用场景**: 想要快速测试或获得灵感

**操作步骤**:
- 右键点击画布
- 选择"⚡ 快速生成图片"或"🎬 快速生成视频"
- 系统自动使用随机提示词立即开始生成

**特点**:
- ✅ 一键生成，无需输入
- ✅ 使用精选的随机提示词
- ✅ 立即开始生成，无需等待

**随机提示词库**:

图片提示词:
- A beautiful sunset over mountains
- A cute cat sitting on a windowsill
- A futuristic city with flying cars
- A peaceful forest with sunlight filtering through trees
- A colorful abstract painting
- A cozy coffee shop interior
- A majestic dragon flying in the sky
- A serene beach with crystal clear water

视频提示词:
- A dog running on the beach
- Fireworks exploding in the night sky
- Waves crashing on the shore
- A butterfly flying through a garden
- Rain falling on a city street
- A car driving through a tunnel

---

### 2. 🖼️ 添加节点 + 自动打开面板（改进）
**使用场景**: 想要自定义提示词

**操作步骤**:
- 右键点击画布
- 选择"🖼️ 添加图片节点"或"🎥 添加视频节点"
- 系统自动创建节点并打开生成面板
- 输入自定义提示词
- 点击生成

**特点**:
- ✅ 节点创建后自动打开面板
- ✅ 可以自定义所有参数
- ✅ 支持高级设置（运镜、摄影机等）

---

### 3. 📝 手动编辑节点
**使用场景**: 修改已有节点或重新生成

**操作步骤**:
- 双击已有节点
- 修改提示词或参数
- 点击生成

**特点**:
- ✅ 可以修改已有节点
- ✅ 支持重新生成
- ✅ 保留历史记录

---

## 🎨 右键菜单布局

```
┌─────────────────────────────┐
│ ⚡ 快速生成图片              │  ← 新增：一键生成
│ 🎬 快速生成视频              │  ← 新增：一键生成
├─────────────────────────────┤
│ 🖼️ 添加图片节点              │  ← 改进：自动打开面板
│ 🎥 添加视频节点              │  ← 改进：自动打开面板
│ 📝 添加文本节点              │
├─────────────────────────────┤
│ 📤 上传素材        Ctrl+U   │
│ 📁 从资产库添加              │
├─────────────────────────────┤
│ ↩️ 撤销            Ctrl+Z   │
│ ↪️ 重做      Ctrl+Shift+Z   │
│ 📋 粘贴            Ctrl+V   │
└─────────────────────────────┘
```

---

## 🔄 工作流程对比

### 之前的流程
```
右键 → 添加节点 → 双击节点 → 输入提示词 → 点击生成
                    ↑
                需要手动操作
```

### 现在的流程

**快速生成**:
```
右键 → 快速生成 → ✅ 完成！
```

**自定义生成**:
```
右键 → 添加节点 → 自动打开面板 → 输入提示词 → 点击生成
                      ↑
                  自动打开
```

---

## 💡 使用建议

### 场景 1: 快速原型设计
使用"快速生成"功能快速填充画布，获得灵感：
1. 右键 → 快速生成图片（多次）
2. 查看生成结果
3. 选择喜欢的继续演化

### 场景 2: 精确控制
使用"添加节点"功能精确控制每个元素：
1. 右键 → 添加图片节点
2. 输入详细的提示词
3. 调整参数（模型、比例、运镜等）
4. 生成

### 场景 3: 迭代优化
从已有节点继续演化：
1. 双击节点打开面板
2. 修改提示词
3. 重新生成

---

## 🎯 技术实现

### 快速生成函数

```typescript
// 快速生成图片
const quickGenerateImage = useCallback(() => {
  const randomPrompts = [
    'A beautiful sunset over mountains',
    // ... 更多提示词
  ];
  
  const prompt = randomPrompts[Math.floor(Math.random() * randomPrompts.length)];
  
  // 创建节点
  const nodeId = `quick_img_${Date.now()}`;
  const newNode: Node = {
    id: nodeId,
    type: 'card',
    position: { x: posX, y: posY },
    data: {
      status: 'generating',
      progress: 0,
      label: '快速生成',
      prompt: prompt,
    },
  };
  
  collaboration.yNodes.push([newNode]);
  
  // 立即开始生成
  handleGenerate({
    prompt,
    model: 'vertex-ai',
    ratio: '16:9',
    node_id: nodeId,
  });
}, [collaboration.yNodes, contextMenu]);
```

### 自动打开面板

```typescript
const addNode = useCallback((type: 'card' | 'video' | 'text') => {
  const nodeId = `${type}_${Date.now()}`;
  const newNode: Node = { /* ... */ };
  
  collaboration.yNodes.push([newNode]);
  setContextMenu(null);
  
  // 非文本节点自动打开生成面板
  if (type !== 'text') {
    setSelectedNodeId(nodeId);
    setSelectedNodeType(type === 'video' ? 'video' : 'image');
    setShowGenerationPanel(true);
  }
}, [collaboration.yNodes, contextMenu]);
```

---

## 📊 用户体验提升

| 指标 | 之前 | 现在 | 提升 |
|------|------|------|------|
| 快速生成步骤 | 5步 | 2步 | ⬇️ 60% |
| 自定义生成步骤 | 5步 | 4步 | ⬇️ 20% |
| 点击次数 | 3次 | 1-2次 | ⬇️ 50% |
| 学习成本 | 中 | 低 | ⬆️ 更直观 |

---

## 🚀 未来优化方向

1. **智能提示词**
   - 根据画布内容智能推荐提示词
   - 学习用户习惯

2. **批量快速生成**
   - 一次生成多个随机节点
   - 自动排列布局

3. **提示词模板**
   - 预设常用场景模板
   - 用户自定义模板库

4. **快捷键支持**
   - `Ctrl+Q`: 快速生成图片
   - `Ctrl+Shift+Q`: 快速生成视频

---

**更新日期**: 2024
**版本**: V1.0
**状态**: ✅ 已实现

