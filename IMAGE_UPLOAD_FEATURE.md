# 📤 图片上传功能说明

## ✅ 已添加功能

为 `NodeEditPanel` 组件添加了完整的图片上传功能，支持 **Image-to-Image** 生成。

## 🎯 功能特性

### 1. **上传入口**（2个位置）

#### 位置 1：工具栏上传按钮
- 位置：顶部工具栏右侧
- 图标：📤 上传
- 适用：任何时候都可以点击上传

#### 位置 2：空状态上传按钮
- 位置：图片预览区域中央
- 显示：当没有图片时
- 提示：「上传参考图片以基于图片生成」

### 2. **上传流程**

```
用户点击上传按钮
    ↓
打开文件选择器
    ↓
选择图片文件
    ↓
验证文件类型和大小
    ↓
转换为 Base64
    ↓
显示预览
    ↓
输入提示词
    ↓
点击生成
    ↓
调用 API（带 reference_image 参数）
```

### 3. **文件验证**

- ✅ **支持格式**：所有图片格式（jpg, png, gif, webp 等）
- ✅ **大小限制**：最大 10MB
- ✅ **自动检查**：不符合要求会弹出提示

### 4. **UI 状态**

#### 无图片状态
```
┌─────────────────────────────┐
│  🖼️                         │
│  暂无图片                    │
│  上传参考图片以基于图片生成   │
│                             │
│  [📤 上传图片]              │
└─────────────────────────────┘
```

#### 已上传状态
```
┌─────────────────────────────┐
│  image          [✕ 清除]    │
│  ┌───────────────────────┐  │
│  │  [已上传]             │  │
│  │                       │  │
│  │  [图片预览]           │  │
│  │                       │  │
│  └───────────────────────┘  │
└─────────────────────────────┘
```

### 5. **功能按钮**

- **清除按钮**：删除已上传的图片
- **上传按钮**：随时可以替换图片

## 🔧 技术实现

### 状态管理
```typescript
const [uploadedImage, setUploadedImage] = useState<string | null>(null);
const fileInputRef = useRef<HTMLInputElement>(null);
```

### 上传处理
```typescript
const handleImageUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
  const file = e.target.files?.[0];
  if (!file) return;

  // 验证文件类型
  if (!file.type.startsWith('image/')) {
    alert('请上传图片文件');
    return;
  }

  // 验证文件大小（10MB）
  if (file.size > 10 * 1024 * 1024) {
    alert('图片大小不能超过 10MB');
    return;
  }

  // 转换为 Base64
  const reader = new FileReader();
  reader.onload = (event) => {
    const base64 = event.target?.result as string;
    setUploadedImage(base64);
  };
  reader.readAsDataURL(file);
}, []);
```

### 生成时传递参数
```typescript
onGenerate({
  prompt: prompt.trim(),
  model,
  ratio,
  node_id: nodeId,
  batch_count: batchCount,
  tool: activeTool || undefined,
  reference_image: uploadedImage || imageUrl, // 优先使用上传的图片
});
```

## 🎨 使用场景

### 场景 1：基于图片生成变体
1. 上传一张图片
2. 输入提示词：「将这张图片改成水彩画风格」
3. 点击生成
4. 获得基于原图的新图片

### 场景 2：图片风格转换
1. 上传人物照片
2. 输入提示词：「anime style, vibrant colors」
3. 点击生成
4. 获得动漫风格的图片

### 场景 3：图片增强
1. 上传低质量图片
2. 选择「增强」工具
3. 输入提示词：「high quality, detailed」
4. 点击生成
5. 获得增强后的图片

### 场景 4：图片扩展
1. 上传图片
2. 选择「扩图」工具
3. 输入提示词：「extend the background」
4. 点击生成
5. 获得扩展后的图片

## 📊 API 参数

生成时会传递以下参数：

```json
{
  "prompt": "用户输入的提示词",
  "model": "gemini-3-pro",
  "ratio": "16:9",
  "node_id": "节点ID",
  "batch_count": 1,
  "tool": "repaint",
  "reference_image": "data:image/png;base64,iVBORw0KG..." // Base64 格式
}
```

## ⚠️ 注意事项

### 1. 文件大小限制
- 前端限制：10MB
- 建议：上传前压缩大图片
- 原因：Base64 编码会增加约 33% 大小

### 2. 浏览器兼容性
- ✅ Chrome/Edge：完全支持
- ✅ Firefox：完全支持
- ✅ Safari：完全支持
- ⚠️ IE：不支持（但 Next.js 已不支持 IE）

### 3. 性能考虑
- 大图片转 Base64 可能需要几秒
- 建议添加加载状态提示
- 可以考虑压缩图片后再上传

### 4. 安全性
- Base64 数据存储在内存中
- 刷新页面会丢失
- 不会自动保存到服务器

## 🚀 后续优化建议

### 1. 添加加载状态
```typescript
const [isUploading, setIsUploading] = useState(false);

// 上传时显示加载动画
{isUploading && <div>上传中...</div>}
```

### 2. 图片压缩
```typescript
// 使用 canvas 压缩大图片
const compressImage = (file: File, maxWidth: number) => {
  // 压缩逻辑
};
```

### 3. 拖拽上传
```typescript
const handleDrop = (e: React.DragEvent) => {
  e.preventDefault();
  const file = e.dataTransfer.files[0];
  // 处理文件
};
```

### 4. 图片裁剪
```typescript
// 集成图片裁剪库
import Cropper from 'react-easy-crop';
```

### 5. 多图上传
```typescript
// 支持一次上传多张图片
const [uploadedImages, setUploadedImages] = useState<string[]>([]);
```

## ✅ 测试清单

- [ ] 上传 JPG 图片
- [ ] 上传 PNG 图片
- [ ] 上传 GIF 图片
- [ ] 上传 WebP 图片
- [ ] 上传超过 10MB 的图片（应该被拒绝）
- [ ] 上传非图片文件（应该被拒绝）
- [ ] 清除已上传的图片
- [ ] 替换已上传的图片
- [ ] 基于上传的图片生成新图片
- [ ] 检查 API 是否收到 reference_image 参数

## 📝 总结

现在 `NodeEditPanel` 组件已经支持：

1. ✅ **上传图片** - 两个入口，方便操作
2. ✅ **预览图片** - 实时显示上传的图片
3. ✅ **清除图片** - 可以删除重新上传
4. ✅ **替换图片** - 随时可以更换参考图
5. ✅ **传递参数** - 生成时自动传递 reference_image
6. ✅ **文件验证** - 类型和大小检查
7. ✅ **用户友好** - 清晰的提示和状态显示

**Image-to-Image 功能已完整实现！** 🎉

---

**更新时间**: 2024  
**组件**: NodeEditPanel.tsx  
**功能**: 图片上传 + Image-to-Image 生成

