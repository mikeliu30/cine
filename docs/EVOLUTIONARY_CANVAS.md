# 节点化演化画布 - 实现文档

## 🎯 已实现功能

### 1. 节点锚点系统 (Node Anchor System)
**文件**: `src/components/nodes/NodeAnchor.tsx`

- ✅ 在节点四周（上下左右）添加可拖拽的锚点
- ✅ 悬停时显示锚点，支持缩放动画
- ✅ 拖拽时触发全局事件，通知画布开始连线

**特性**:
- 锚点位置：top, right, bottom, left
- 视觉效果：圆形锚点，悬停放大，拖拽时发光
- 交互：鼠标按下开始拖拽，松开触发创建菜单

### 2. 拖拽连线组件 (Drag Connection Line)
**文件**: `src/components/nodes/DragConnectionLine.tsx`

- ✅ 实时显示从父节点到鼠标位置的贝塞尔曲线
- ✅ 渐变色连线（紫色到粉色）
- ✅ 箭头标记指示方向
- ✅ 动画点沿连线移动

**视觉效果**:
- 发光效果（模糊阴影）
- 平滑的贝塞尔曲线
- 动画路径绘制

### 3. 节点创建快捷菜单 (Node Creation Menu)
**文件**: `src/components/nodes/NodeCreationMenu.tsx`

- ✅ 拖拽结束后弹出菜单
- ✅ 三种节点类型选项：
  - **✨ 变换图片** (Evolution Node): 基于父节点生成新图片
  - **🎬 生成视频** (Video Node): 将图片转为动态视频
  - **📝 添加备注** (Note Node): 记录创作思路

**交互特性**:
- 弹簧动画进入
- 悬停时项目向右滑动
- 点击后自动关闭
- ESC 键取消

### 4. CardNode 集成锚点
**文件**: `src/components/nodes/CardNode.tsx`

- ✅ 导入 NodeAnchor 组件
- ✅ 在悬停或选中时显示四个锚点
- ✅ 处理锚点拖拽事件：
  - `handleAnchorDragStart`: 开始拖拽
  - `handleAnchorDragEnd`: 结束拖拽

### 5. Canvas 画布集成
**文件**: `src/app/canvas/page.tsx`

#### 状态管理
```typescript
// 拖拽连线状态
const [dragConnection, setDragConnection] = useState<{
  isActive: boolean;
  startPos: { x: number; y: number };
  endPos: { x: number; y: number };
  sourceNodeId: string;
  sourceNodeData: any;
} | null>(null);

// 节点创建菜单状态
const [creationMenu, setCreationMenu] = useState<{
  isVisible: boolean;
  position: { x: number; y: number };
  sourceNodeId: string;
  sourceNodeData: any;
} | null>(null);
```

#### 事件监听
- ✅ `anchor-drag-start`: 锚点开始拖拽
- ✅ `anchor-drag-end`: 锚点结束拖拽
- ✅ `mousemove`: 实时更新连线位置

#### 子节点创建逻辑
```typescript
const handleCreationMenuSelect = (type: 'evolution' | 'video' | 'note') => {
  // 根据类型创建不同的子节点
  // - evolution: 打开生成面板，继承父节点图片和提示词
  // - video: 打开视频生成面板
  // - note: 直接创建文本节点
}
```

## 🎨 用户体验流程

### 场景 1: 图片演化
1. 用户悬停在图片节点上
2. 四个锚点出现在节点边缘
3. 用户拖拽右侧锚点
4. 实时显示渐变连线跟随鼠标
5. 松开鼠标，弹出创建菜单
6. 选择"✨ 变换图片"
7. 打开生成面板，自动填充父节点的图片和提示词
8. 用户修改提示词（如"在跑步"）
9. 点击生成，创建子节点并自动连线

### 场景 2: 图片转视频
1. 用户拖拽节点锚点
2. 选择"🎬 生成视频"
3. 打开视频生成面板
4. 父节点图片作为参考图
5. 用户选择运镜方向（推拉摇移）
6. 生成视频子节点

### 场景 3: 添加备注
1. 用户拖拽节点锚点
2. 选择"📝 添加备注"
3. 立即创建文本节点
4. 自动连线到父节点
5. 用户可以记录创作思路

## 🔧 技术实现细节

### 父子节点继承
```typescript
// 在 handleCreationMenuSelect 中
setSourceImage(sourceNodeData.imageUrl);  // 继承图片
setSourcePrompt(sourceNodeData.prompt);   // 继承提示词
```

### 子节点位置计算
```typescript
const childX = parentNode.position.x + 350;  // 父节点右侧
const childY = parentNode.position.y;        // 保持Y轴对齐
```

### 自动连线
```typescript
const newEdge: Edge = {
  id: `edge_${sourceNodeId}_${newNode.id}`,
  source: sourceNodeId,
  target: newNode.id,
  type: 'smoothstep',
  animated: true,  // 动画效果
};
collaboration.yEdges.push([newEdge]);
```

## 📋 待实现功能 (Roadmap)

### V1.1 增强
- [ ] Seed 锁定功能（保证角色一致性）
- [ ] 批量演化（一次创建多个变体）
- [ ] 演化历史树可视化

### V1.2 高级功能
- [ ] 一键克隆工作流 (Remix)
- [ ] 工作流模板库
- [ ] 导出/导入工作流 JSON

### V1.3 优化
- [ ] 智能布局算法（自动排列子节点）
- [ ] 连线样式自定义
- [ ] 节点分组功能

## 🎯 核心优势

1. **直观的交互**: 拖拽锚点即可创建子节点，无需复杂操作
2. **视觉反馈**: 实时连线、动画菜单、平滑过渡
3. **自动继承**: 子节点自动继承父节点的视觉特征
4. **灵活扩展**: 支持多种节点类型，易于添加新类型

## 🚀 使用示例

### 创建角色演化链
```
[宇航员图片] 
    → 拖拽锚点 
    → 选择"变换图片" 
    → 输入"在跑步" 
    → [跑步的宇航员]
        → 拖拽锚点
        → 选择"生成视频"
        → 选择"镜头拉近"
        → [宇航员奔跑视频]
```

### 添加创作备注
```
[关键帧图片]
    → 拖拽锚点
    → 选择"添加备注"
    → [备注节点: "这个镜头需要强调情绪"]
```

## 📝 代码结构

```
src/
├── components/
│   ├── nodes/
│   │   ├── NodeAnchor.tsx           # 节点锚点
│   │   ├── DragConnectionLine.tsx   # 拖拽连线
│   │   ├── NodeCreationMenu.tsx     # 创建菜单
│   │   ├── CardNode.tsx             # 图片节点（已集成锚点）
│   │   └── VideoNode.tsx            # 视频节点（待集成）
│   └── canvas/
│       └── ...
└── app/
    └── canvas/
        └── page.tsx                  # 画布主页面（已集成）
```

## 🎨 视觉设计

### 锚点样式
- 大小: 12px (3rem)
- 颜色: 渐变紫色 (#6366f1)
- 边框: 2px 白色
- 悬停: 放大 1.5x
- 拖拽: 发光效果

### 连线样式
- 类型: 贝塞尔曲线
- 颜色: 渐变（紫色 → 粉色）
- 宽度: 3px
- 效果: 发光阴影 + 动画点

### 菜单样式
- 背景: 深灰色 (#111827)
- 圆角: 16px
- 阴影: 2xl
- 动画: 弹簧进入

## ✅ 测试清单

- [x] 锚点在悬停时显示
- [x] 拖拽时连线跟随鼠标
- [x] 松开鼠标弹出菜单
- [x] 选择菜单项创建子节点
- [x] 子节点继承父节点数据
- [x] 自动创建连接边
- [ ] 多层级演化测试
- [ ] 性能测试（大量节点）

## 🐛 已知问题

1. **坐标转换**: 需要考虑画布缩放和平移
   - 解决方案: 使用 `getBoundingClientRect()` 获取实际位置

2. **事件冲突**: 锚点拖拽可能与节点拖拽冲突
   - 解决方案: `e.stopPropagation()` 阻止事件冒泡

3. **性能优化**: 大量节点时锚点渲染可能卡顿
   - 解决方案: 只在悬停/选中时渲染锚点

## 📚 参考资料

- React Flow 文档: https://reactflow.dev/
- Framer Motion 动画: https://www.framer.com/motion/
- Yjs 协作: https://docs.yjs.dev/

---

**实现日期**: 2024
**版本**: V1.0 MVP
**状态**: ✅ 核心功能已完成

