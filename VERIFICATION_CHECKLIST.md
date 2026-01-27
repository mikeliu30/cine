# ✅ 最终验证清单

## 🎯 修改总结

### 前端修改
- ✅ 默认模型: `banana` → `gemini-3-pro`
- ✅ 添加 tab 切换逻辑（自动更新模型）
- ✅ 图片选项: 只显示 3 个（Gemini 3 Pro, 即梦 4.5, Mock）
- ✅ 视频选项: 只显示 2 个（Veo 2, Mock）

### 后端修改
- ✅ 图片 API: 启用所有 11 个 model 值
- ✅ 视频 API: 启用 Veo 2 和 Mock
- ✅ 兼容旧节点数据

---

## 🧪 验证步骤

### 步骤 1: 清除缓存并重启

```powershell
# 1. 停止服务器 (Ctrl+C)

# 2. 清除 Next.js 缓存
Remove-Item -Recurse -Force .next

# 3. 重启服务器
npm run dev

# 4. 硬刷新浏览器
# Windows: Ctrl + Shift + R
# Mac: Cmd + Shift + R
```

### 步骤 2: 验证前端选项

#### 图片生成
1. 打开 http://localhost:3000/canvas
2. 右键 → 添加图片节点
3. 双击节点打开生成面板
4. 查看 "🤖 模型" 下拉菜单

**预期看到**：
```
✅ 🍌 Gemini 3 Pro  ← 默认选中
✅ ✨ 即梦 4.5
✅ 🧪 Mock (测试)
```

**不应该看到**：
```
❌ banana
❌ vertex-ai
❌ imagen-3
❌ gemini-2.0-flash
```

#### 视频生成
1. 点击 "视频" 标签
2. 查看 "🤖 模型" 下拉菜单

**预期看到**：
```
✅ 🎬 Veo 2  ← 自动选中
✅ 🧪 Mock (测试)
```

### 步骤 3: 测试图片生成

#### 测试 Gemini 3 Pro
1. 选择 "🍌 Gemini 3 Pro"
2. 输入提示词: `一只可爱的小猫`
3. 点击生成
4. 查看后端日志

**预期日志**：
```
[API] Generate image with model: gemini-3-pro
[Vertex Gemini] Using enterprise Gemini for image generation
[Vertex Gemini] Model: gemini-3-pro-image-preview
[Vertex Gemini] Location: global
✅ Image found! MIME type: image/png
[API] Image generated: ✅ Success
```

#### 测试即梦 4.5
1. 选择 "✨ 即梦 4.5"
2. 输入提示词: `一只可爱的小猫`
3. 点击生成
4. 查看后端日志

**预期日志**：
```
[API] Generate image with model: jimeng
[Jimeng] Generating image with Jimeng 4.5
✅ Image generated successfully
```

#### 测试 Mock
1. 选择 "🧪 Mock"
2. 输入提示词: `测试`
3. 点击生成

**预期结果**：
- 返回测试图片
- 日志显示 Mock 模式

### 步骤 4: 测试视频生成

#### 测试 Veo 2
1. 切换到 "视频" 标签
2. 确认模型自动切换到 "🎬 Veo 2"
3. 输入提示词: `一只小猫在玩耍`
4. 点击生成

**预期日志**：
```
[API] Generate video with model: veo-2
[Veo 2] Starting video generation
```

#### 测试 Mock
1. 选择 "🧪 Mock"
2. 点击生成

**预期结果**：
- 返回测试视频
- 日志显示 Mock 模式

### 步骤 5: 测试 Tab 切换

1. 在图片 Tab，确认模型是 "Gemini 3 Pro"
2. 切换到视频 Tab
3. **预期**: 模型自动变为 "Veo 2"
4. 切换回图片 Tab
5. **预期**: 模型自动变为 "Gemini 3 Pro"

### 步骤 6: 测试旧节点兼容性

#### 方法 1: 直接 API 调用
```javascript
// 在浏览器控制台运行
fetch('/api/generate/image', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    model: 'banana',  // 前端不显示，但后端支持
    prompt: '一只可爱的小猫',
    ratio: '16:9'
  })
}).then(r => r.json()).then(console.log)
```

**预期日志**：
```
[API] Generate image with model: banana
[Vertex Gemini] Model: gemini-3-pro-image-preview
✅ Image found!
```

#### 方法 2: 测试其他隐藏模型
```javascript
// 测试 imagen-3
fetch('/api/generate/image', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    model: 'imagen-3',
    prompt: 'a cute cat',
    ratio: '16:9'
  })
}).then(r => r.json()).then(console.log)
```

---

## 📊 验证结果表

| 测试项 | 预期结果 | 实际结果 | 状态 |
|-------|---------|---------|------|
| 图片选项数量 | 3 个 | | [ ] |
| 视频选项数量 | 2 个 | | [ ] |
| 图片默认模型 | gemini-3-pro | | [ ] |
| 视频默认模型 | veo-2 | | [ ] |
| Tab 切换自动更新 | ✅ | | [ ] |
| Gemini 3 Pro 生成 | ✅ | | [ ] |
| 即梦 4.5 生成 | ✅ | | [ ] |
| Veo 2 生成 | ✅ | | [ ] |
| Mock 模式 | ✅ | | [ ] |
| banana 兼容 | ✅ | | [ ] |
| imagen-3 兼容 | ✅ | | [ ] |

---

## 🐛 常见问题

### 问题 1: 前端仍然显示旧选项

**原因**: 浏览器缓存

**解决**:
```powershell
# 1. 清除 .next 缓存
Remove-Item -Recurse -Force .next

# 2. 重启服务器
npm run dev

# 3. 硬刷新浏览器
Ctrl + Shift + R
```

### 问题 2: 模型切换不生效

**原因**: React 状态没有更新

**解决**: 检查 useEffect 是否正确添加

### 问题 3: 后端返回 Mock 图片

**原因**: model 值不匹配

**解决**: 
1. 检查前端发送的 model 值（Network 标签）
2. 检查后端日志中的 model 值
3. 确认后端 case 已启用

---

## 📝 修改的文件清单

- [x] `src/components/panels/GenerationPanel.tsx` - 前端选项和默认值
- [x] `src/app/api/generate/image/route.ts` - 图片 API（全部启用）
- [x] `src/app/api/generate/video/route.ts` - 视频 API（启用 Veo 2）
- [x] `FRONTEND_MODEL_FIX.md` - 前端修复文档
- [x] `FINAL_CONFIGURATION.md` - 最终配置文档
- [x] `VERIFICATION_CHECKLIST.md` - 本验证清单

---

## 🎉 完成标准

所有以下条件都满足时，验证通过：

- ✅ 前端图片选项只显示 3 个
- ✅ 前端视频选项只显示 2 个
- ✅ 默认模型正确
- ✅ Tab 切换自动更新模型
- ✅ Gemini 3 Pro 生成成功
- ✅ 即梦 4.5 生成成功
- ✅ Veo 2 生成成功
- ✅ Mock 模式正常
- ✅ 旧节点（banana）兼容
- ✅ 直接 API 调用（imagen-3）兼容

---

🚀 **请按照上述步骤验证，确认所有功能正常！**

