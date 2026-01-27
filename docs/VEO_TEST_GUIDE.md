# Veo 3.1 Fast 快速测试指南

## 🎯 测试目标
验证 Veo 3.1 Fast 视频生成功能是否正常工作

## 📋 测试前准备

### 1. 确认环境变量
```bash
# 检查 .env.local 文件
GOOGLE_CLOUD_PROJECT=fleet-blend-469520-n7
VERTEX_AI_LOCATION=us-central1
ARK_API_KEY=e4df5214-5735-49f2-9de4-fd243ea10384
```

### 2. 确认认证文件
```bash
# 确认 vertex-key.json 存在
ls vertex-key.json
```

### 3. 启动开发服务器
```bash
cd cineflow-mvp
npm run dev
```

## 🧪 测试用例

### 测试 1: Text-to-Video (纯文本生成)

#### 步骤
1. 打开 http://localhost:3000/canvas
2. 右键点击画布 → "添加视频节点"
3. 双击视频节点打开生成面板
4. 输入提示词：`小狗在草地上奔跑`
5. 选择模型：`⚡ Veo 3.1 Fast (Google)`
6. 设置时长：`6秒`
7. 点击"生成"

#### 预期结果
- ✅ 节点状态变为"生成中"
- ✅ 控制台显示翻译日志
- ✅ 控制台显示 Veo API 调用日志
- ✅ 30-60秒后节点显示视频
- ✅ 点击节点可以播放视频

#### 控制台日志示例
```
[Generation] Calling API with model: veo-3.1-fast
[Generation] Using endpoint: /api/generate/video
[Veo 3.1] Detected Chinese, translating to English via Doubao...
[Veo 3.1] ✅ Translated prompt: A puppy running on the grass
[Veo 3.1] 🎬 Final enhanced prompt: A puppy running on the grass, cinematic, high quality, smooth motion
[Veo 3.1] Response status: 200
[Veo 3.1] ✅ Success
```

---

### 测试 2: Image-to-Video (图片转视频)

#### 步骤
1. 先创建一个图片节点
2. 输入提示词：`宇航员站在月球上`
3. 选择模型：`🚀 Imagen 3 (Vertex AI)`
4. 生成图片
5. 等待图片生成完成
6. 悬停在图片节点上，看到四个锚点
7. 拖拽右侧锚点
8. 选择"🎬 生成视频"
9. 修改提示词：`宇航员开始奔跑`
10. 选择运镜：`推近` + `跟随`
11. 点击"生成"

#### 预期结果
- ✅ 生成面板自动填充参考图片
- ✅ 子节点自动创建在右侧
- ✅ 自动创建连接线
- ✅ 视频生成时保持宇航员的外观
- ✅ 视频包含运镜效果

---

### 测试 3: 运镜控制

#### 步骤
1. 创建视频节点
2. 输入提示词：`海浪拍打沙滩`
3. 选择运镜：
   - ✅ 推近 (zoom_in)
   - ✅ 俯摄 (tilt_down)
4. 点击生成

#### 预期结果
- ✅ 视频包含推近效果
- ✅ 视频包含俯视角度
- ✅ 运动平滑自然

---

### 测试 4: 批量生成

#### 步骤
1. 创建视频节点
2. 输入提示词：`烟花绽放`
3. 设置批次：`2x 批次`
4. 点击生成

#### 预期结果
- ✅ 创建 2 个子节点
- ✅ 两个节点垂直排列
- ✅ 都连接到父节点
- ✅ 同时开始生成

---

## 🐛 常见问题排查

### 问题 1: 翻译失败
**症状**: 控制台显示 `Translation failed`

**解决方案**:
```bash
# 检查豆包 API Key
echo $ARK_API_KEY

# 测试豆包 API
curl -X POST https://ark.cn-beijing.volces.com/api/v3/chat/completions \
  -H "Authorization: Bearer e4df5214-5735-49f2-9de4-fd243ea10384" \
  -H "Content-Type: application/json" \
  -d '{"model":"doubao-1-5-lite-32k-250115","messages":[{"role":"user","content":"测试"}]}'
```

### 问题 2: Veo API 认证失败
**症状**: `Failed to get access token`

**解决方案**:
```bash
# 检查认证文件
cat vertex-key.json

# 确认项目 ID
gcloud config get-value project
```

### 问题 3: 视频生成超时
**症状**: 长时间无响应

**解决方案**:
- 检查网络连接
- 查看 Vertex AI 配额
- 尝试减少视频时长

### 问题 4: 视频无法播放
**症状**: 节点显示视频但无法播放

**解决方案**:
- 检查浏览器控制台错误
- 确认 base64 格式正确
- 尝试下载视频文件

---

## 📊 性能基准

| 指标 | 预期值 |
|------|--------|
| 翻译时间 | < 2秒 |
| API 响应时间 | 30-60秒 |
| 视频大小 | 5-20MB |
| 视频分辨率 | 1920x1080 (16:9) |
| 视频帧率 | 24-30 fps |

---

## ✅ 测试检查清单

### 基础功能
- [ ] Text-to-Video 生成成功
- [ ] Image-to-Video 生成成功
- [ ] 中文提示词自动翻译
- [ ] 英文提示词直接使用

### 参数控制
- [ ] 视频时长设置生效
- [ ] 画幅比例正确
- [ ] 运镜控制生效
- [ ] 批量生成正常

### UI 交互
- [ ] 生成面板正确显示
- [ ] 参考图片正确填充
- [ ] 进度条正常更新
- [ ] 视频节点正确显示

### 节点系统
- [ ] 子节点自动创建
- [ ] 连接线自动生成
- [ ] 节点位置正确
- [ ] 父子关系正确

### 错误处理
- [ ] API 错误正确提示
- [ ] 翻译失败降级处理
- [ ] 网络错误重试
- [ ] 配额超限提示

---

## 🎬 测试视频示例

### 推荐测试提示词

#### 简单场景
- `小狗在草地上奔跑`
- `烟花在夜空中绽放`
- `海浪拍打沙滩`
- `云朵在天空中飘动`

#### 复杂场景
- `宇航员在月球表面行走，地球在背景中升起`
- `赛车在赛道上高速行驶，镜头跟随`
- `无人机俯拍城市夜景，灯光闪烁`
- `潜水员在珊瑚礁中游泳，鱼群环绕`

#### 运镜测试
- `推近：花朵特写，镜头缓慢推近`
- `拉远：从人物特写拉到全景`
- `跟随：跑步者奔跑，镜头跟随`
- `俯摄：鸟瞰城市街道，车辆穿梭`

---

## 📝 测试报告模板

```markdown
## 测试日期: YYYY-MM-DD
## 测试人员: [姓名]

### 测试环境
- Node版本: 
- 浏览器: 
- 操作系统: 

### 测试结果
| 测试用例 | 状态 | 备注 |
|---------|------|------|
| T2V 生成 | ✅/❌ |  |
| I2V 生成 | ✅/❌ |  |
| 中文翻译 | ✅/❌ |  |
| 运镜控制 | ✅/❌ |  |
| 批量生成 | ✅/❌ |  |

### 发现的问题
1. 
2. 
3. 

### 改进建议
1. 
2. 
3. 
```

---

**测试版本**: V1.0
**最后更新**: 2024

