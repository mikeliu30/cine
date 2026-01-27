# 🔍 动态画幅比例调试指南

## 问题：前端宽度高度没有变化

### 可能的原因

1. **旧节点没有 aspectRatio 字段**
   - 画布上已存在的节点是在修改前创建的
   - 这些节点的 data 中没有 aspectRatio 字段
   - 会使用默认值 9:16

2. **浏览器缓存**
   - 浏览器可能缓存了旧的 JavaScript 代码
   - 需要强制刷新

3. **新节点没有正确保存 aspectRatio**
   - 生成时可能没有传递 ratio 参数
   - 或者传递了但没有保存到节点数据

## ✅ 解决步骤

### 步骤1：清除画布上的旧节点

**方法A：删除所有节点**
1. 在画布上选中所有节点（Ctrl+A 或框选）
2. 按 Delete 键删除
3. 或者右键 → 删除节点

**方法B：刷新页面**
1. 按 F5 刷新页面
2. 画布会重新加载

### 步骤2：强制刷新浏览器

**Windows/Linux:**
- `Ctrl + Shift + R` 或 `Ctrl + F5`

**Mac:**
- `Cmd + Shift + R`

这会清除缓存并重新加载所有资源。

### 步骤3：打开浏览器控制台

1. 按 `F12` 打开开发者工具
2. 切换到 **Console** 标签
3. 观察日志输出

### 步骤4：生成新的测试节点

#### 测试 16:9 横屏
1. 点击右侧生成面板（或双击画布）
2. 选择画幅：**📺 16:9**
3. 输入提示词：`test 16:9`
4. 点击"生成"

**预期控制台输出：**
```
[handleGenerate] Updated node with aspectRatio: 16:9
[CardNode] shot_xxx aspectRatio: 16:9 dimensions: { width: 683, height: 384 }
```

**预期视觉效果：**
- 卡片应该是横向矩形
- 宽度明显大于高度

#### 测试 9:16 竖屏
1. 选择画幅：**📱 9:16**
2. 输入提示词：`test 9:16`
3. 点击"生成"

**预期控制台输出：**
```
[handleGenerate] Updated node with aspectRatio: 9:16
[CardNode] shot_xxx aspectRatio: 9:16 dimensions: { width: 216, height: 384 }
```

**预期视觉效果：**
- 卡片应该是竖向矩形
- 宽度明显小于高度

#### 测试 1:1 方形
1. 选择画幅：**⬜ 1:1**
2. 输入提示词：`test 1:1`
3. 点击"生成"

**预期控制台输出：**
```
[handleGenerate] Updated node with aspectRatio: 1:1
[CardNode] shot_xxx aspectRatio: 1:1 dimensions: { width: 384, height: 384 }
```

**预期视觉效果：**
- 卡片应该是正方形
- 宽度等于高度

### 步骤5：检查元素

1. 右键点击卡片 → **检查**
2. 在 Elements 面板中找到卡片的 `<div>` 元素
3. 查看 `style` 属性

**应该看到：**
```html
<div style="width: 683px; height: 384px;" class="relative rounded-2xl ...">
```

## 🐛 调试检查清单

### 检查1：控制台是否有日志？

**如果没有日志：**
- 代码可能没有重新编译
- 尝试重启开发服务器：
  ```powershell
  # 停止服务器 (Ctrl+C)
  # 重新启动
  npm run dev
  ```

**如果有日志但 aspectRatio 是 undefined：**
- 检查生成面板是否正确传递了 ratio 参数
- 查看 `params.ratio` 的值

### 检查2：卡片尺寸是否改变？

**如果尺寸没变：**
- 检查 `style` 属性是否正确应用
- 查看是否有 CSS 覆盖了 inline style
- 检查浏览器是否支持 inline style

**如果尺寸改变但不正确：**
- 检查计算逻辑是否正确
- 验证 aspectRatio 的格式（应该是 "16:9" 而不是 "16/9"）

### 检查3：图片是否完整显示？

**如果图片被裁剪：**
- 检查 `<img>` 标签的 class
- 应该是 `object-contain` 而不是 `object-cover`

## 📊 预期结果对照表

| 画幅比例 | 控制台日志 width | 控制台日志 height | 视觉效果 |
|---------|-----------------|------------------|---------|
| 16:9    | 683             | 384              | 横向矩形 |
| 9:16    | 216             | 384              | 竖向矩形 |
| 1:1     | 384             | 384              | 正方形   |
| 4:3     | 512             | 384              | 横向矩形 |

## 🔧 快速测试脚本

在浏览器控制台中运行：

```javascript
// 测试尺寸计算
function testDimensions(aspectRatio) {
  const baseHeight = 384;
  const [widthRatio, heightRatio] = aspectRatio.split(':').map(Number);
  const width = Math.round(baseHeight * widthRatio / heightRatio);
  console.log(`${aspectRatio} → width: ${width}px, height: ${baseHeight}px`);
}

testDimensions('16:9');  // 应该输出: 16:9 → width: 683px, height: 384px
testDimensions('9:16');  // 应该输出: 9:16 → width: 216px, height: 384px
testDimensions('1:1');   // 应该输出: 1:1 → width: 384px, height: 384px
testDimensions('4:3');   // 应该输出: 4:3 → width: 512px, height: 384px
```

## ✅ 成功标志

当你看到以下情况时，说明功能正常工作：

1. ✅ 控制台有 `[CardNode]` 日志输出
2. ✅ 不同比例的卡片宽度不同
3. ✅ 16:9 卡片明显比 9:16 卡片宽
4. ✅ 1:1 卡片是正方形
5. ✅ 图片完整显示，无裁剪
6. ✅ 元素检查器显示正确的 width 和 height

## 🆘 还是不行？

如果按照上述步骤操作后仍然没有变化，请：

1. **截图控制台日志**
2. **截图元素检查器**
3. **截图画布上的卡片**
4. **告诉我具体的现象**

我会帮你进一步诊断问题！

