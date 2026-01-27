# 动态画幅比例功能 - 快速参考

## 📋 功能概述
卡片节点现在会根据图片的实际比例（16:9, 9:16, 1:1, 4:3）动态调整显示尺寸，而不是强制所有图片显示为固定的 9:16 比例。

## 🎯 核心改动

### 1. 类型定义 (`src/types/index.ts`)
```typescript
export interface CardNodeData {
  // ... 其他字段
  aspectRatio?: string;   // 新增：画幅比例
}
```

### 2. 卡片组件 (`src/components/nodes/CardNode.tsx`)
```typescript
// 动态计算尺寸
const getCardDimensions = () => {
  const aspectRatio = data.aspectRatio || '9:16';
  const baseHeight = 384;
  const [widthRatio, heightRatio] = aspectRatio.split(':').map(Number);
  const width = Math.round(baseHeight * widthRatio / heightRatio);
  return { width, height: baseHeight };
};

// 应用动态样式
<div style={{ width: `${cardDimensions.width}px`, height: `${cardDimensions.height}px` }}>
```

### 3. 画布页面 (`src/app/canvas/page.tsx`)
```typescript
// 创建节点时保存比例
data: {
  // ... 其他字段
  aspectRatio: params.ratio,  // 新增
}

// 更新节点时保存比例
data: {
  // ... 其他字段
  aspectRatio: params.ratio,  // 新增
}
```

## 📐 尺寸对照表

| 比例  | 宽度   | 高度  | 用途           |
|-------|--------|-------|----------------|
| 16:9  | 683px  | 384px | 横屏、风景、电影 |
| 9:16  | 216px  | 384px | 竖屏、手机、人像 |
| 1:1   | 384px  | 384px | 方形、社交媒体   |
| 4:3   | 512px  | 384px | 标准、传统照片   |

## 🔧 关键技术点

1. **固定高度策略**：所有卡片高度统一为 384px，宽度根据比例计算
2. **向后兼容**：旧节点没有 aspectRatio 时默认使用 9:16
3. **图片显示**：使用 `object-contain` 确保图片完整显示，不裁剪
4. **动态样式**：使用 inline style 而不是 Tailwind 类，支持任意尺寸

## ✅ 测试检查清单

- [ ] 16:9 图片显示为横向矩形
- [ ] 9:16 图片显示为竖向矩形
- [ ] 1:1 图片显示为正方形
- [ ] 4:3 图片显示为横向矩形（比16:9窄）
- [ ] 图片完整显示，无裁剪
- [ ] 旧节点正常显示
- [ ] 连接线正确连接
- [ ] 性能无明显下降

## 🐛 常见问题

**Q: 为什么选择固定高度而不是固定宽度？**
A: 固定高度可以让横屏图片不会过宽，竖屏图片不会过窄，视觉上更协调。

**Q: 如果 aspectRatio 格式错误会怎样？**
A: 会返回默认尺寸 288x384 (9:16)，不会报错。

**Q: 支持自定义比例吗（如 21:9）？**
A: 支持！只要格式是 "宽:高"，计算逻辑会自动处理。

**Q: 旧节点会受影响吗？**
A: 不会。旧节点会使用默认比例 9:16，显示正常。

## 📝 相关文件

- `ASPECT_RATIO_IMPLEMENTATION.md` - 详细实现说明
- `ASPECT_RATIO_TESTING.md` - 完整测试指南
- `src/types/index.ts` - 类型定义
- `src/components/nodes/CardNode.tsx` - 卡片组件
- `src/app/canvas/page.tsx` - 画布逻辑

## 🚀 下一步优化

1. 自动检测图片实际比例
2. 添加最大/最小尺寸限制
3. 支持用户手动调整卡片尺寸
4. 根据画布缩放级别自适应调整

