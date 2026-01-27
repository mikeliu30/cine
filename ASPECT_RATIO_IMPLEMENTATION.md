# 动态画幅比例实现说明

## 概述
实现了根据图片实际比例动态调整卡片尺寸的功能，让不同比例的图片在画布上以正确的比例显示。

## 实现方案

### 1. 数据模型更新
在 `CardNodeData` 接口中添加了 `aspectRatio` 字段：
```typescript
export interface CardNodeData {
  // ... 其他字段
  aspectRatio?: string;   // 画幅比例 (如 '16:9', '9:16', '1:1', '4:3')
}
```

### 2. 卡片尺寸计算逻辑
在 `CardNode.tsx` 中实现了动态尺寸计算：

```typescript
const getCardDimensions = () => {
  const aspectRatio = data.aspectRatio || '9:16'; // 默认竖屏
  const baseHeight = 384; // 基准高度 (h-96 = 24rem = 384px)
  
  // 解析比例
  const [widthRatio, heightRatio] = aspectRatio.split(':').map(Number);
  
  // 根据基准高度计算宽度
  const width = Math.round(baseHeight * widthRatio / heightRatio);
  
  return { width, height: baseHeight };
};
```

### 3. 各比例对应的卡片尺寸

| 画幅比例 | 宽度 (px) | 高度 (px) | 说明 |
|---------|----------|----------|------|
| 16:9    | 683      | 384      | 横屏 - 适合风景、电影 |
| 9:16    | 216      | 384      | 竖屏 - 适合手机、人像 |
| 1:1     | 384      | 384      | 方形 - 适合社交媒体 |
| 4:3     | 512      | 384      | 标准 - 适合传统照片 |

### 4. 数据流

1. **用户选择画幅比例** → GenerationPanel
2. **传递给生成函数** → handleGenerate(params.ratio)
3. **保存到节点数据** → node.data.aspectRatio = params.ratio
4. **卡片渲染时计算尺寸** → getCardDimensions()
5. **应用动态样式** → style={{ width, height }}

### 5. 修改的文件

#### `src/types/index.ts`
- 添加 `aspectRatio?: string` 字段

#### `src/components/nodes/CardNode.tsx`
- 添加 `getCardDimensions()` 函数
- 将固定的 `w-72 h-96` 改为动态 `style={{ width, height }}`
- 保持 `object-contain` 以完整显示图片

#### `src/app/canvas/page.tsx`
- 在创建节点时保存 `aspectRatio: params.ratio`
- 在更新节点时保存 `aspectRatio: params.ratio`
- 在快速生成时添加 `aspectRatio: '16:9'`

## 优势

1. **真实比例显示**：图片按照实际比例显示，不会被裁剪或变形
2. **灵活适配**：支持任意比例（16:9, 9:16, 1:1, 4:3 等）
3. **向后兼容**：旧节点没有 aspectRatio 时使用默认值 9:16
4. **性能优化**：尺寸计算在渲染时进行，无需额外的图片加载

## 测试建议

1. 生成不同比例的图片，验证卡片尺寸是否正确
2. 检查画布上不同比例卡片的排列是否合理
3. 测试旧节点（没有 aspectRatio）是否正常显示
4. 验证连接线是否正确连接到不同尺寸的卡片

## 未来优化

1. **自动检测比例**：从生成的图片中自动检测实际比例
2. **最大/最小尺寸限制**：防止卡片过大或过小
3. **自适应布局**：根据画布缩放级别调整卡片尺寸
4. **比例锁定**：允许用户手动调整卡片尺寸但保持比例

