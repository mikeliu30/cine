# Vertex AI Gemini 图片生成节点
# 支持 Gemini 2.0 Flash 等模型

import os
import json
import base64
import numpy as np
from PIL import Image
import io

class VertexGeminiNode:
    """Vertex AI Gemini 图片生成节点"""

    @classmethod
    def INPUT_TYPES(cls):
        return {
            "required": {
                "prompt": ("STRING", {"multiline": True, "default": "A beautiful landscape"}),
                "model": (["gemini-2.0-flash-exp", "gemini-2.0-flash"], {"default": "gemini-2.0-flash-exp"}),
            },
            "optional": {
                "project_id": ("STRING", {"default": ""}),
                "location": ("STRING", {"default": "us-central1"}),
                "temperature": ("FLOAT", {"default": 1.0, "min": 0.0, "max": 2.0, "step": 0.1}),
            }
        }

    RETURN_TYPES = ("IMAGE",)
    RETURN_NAMES = ("image",)
    FUNCTION = "generate"
    CATEGORY = "CineFlow/API"

    def generate(self, prompt, model, project_id="", location="us-central1", temperature=1.0):
        from google.auth import default
        from google.auth.transport.requests import Request
        import requests

        # 获取项目 ID
        if not project_id:
            project_id = os.environ.get("GOOGLE_CLOUD_PROJECT", "")

        if not project_id:
            raise ValueError("GOOGLE_CLOUD_PROJECT not configured")

        # 获取认证
        credentials, _ = default(scopes=["https://www.googleapis.com/auth/cloud-platform"])
        credentials.refresh(Request())

        # 构建请求
        endpoint = f"https://{location}-aiplatform.googleapis.com/v1/projects/{project_id}/locations/{location}/publishers/google/models/{model}:generateContent"

        request_body = {
            "contents": [{
                "role": "user",
                "parts": [{"text": prompt}]
            }],
            "generationConfig": {
                "responseModalities": ["IMAGE", "TEXT"],
                "temperature": temperature,
            }
        }

        response = requests.post(
            endpoint,
            headers={
                "Authorization": f"Bearer {credentials.token}",
                "Content-Type": "application/json",
            },
            json=request_body
        )

        if not response.ok:
            raise Exception(f"Gemini API error: {response.status_code} - {response.text}")

        result = response.json()

        # 解析响应
        candidates = result.get("candidates", [])
        for candidate in candidates:
            parts = candidate.get("content", {}).get("parts", [])
            for part in parts:
                if "inlineData" in part:
                    mime_type = part["inlineData"].get("mimeType", "")
                    if mime_type.startswith("image/"):
                        image_data = base64.b64decode(part["inlineData"]["data"])
                        image = Image.open(io.BytesIO(image_data))
                        image_np = np.array(image).astype(np.float32) / 255.0
                        if len(image_np.shape) == 2:
                            image_np = np.stack([image_np] * 3, axis=-1)
                        elif image_np.shape[-1] == 4:
                            image_np = image_np[:, :, :3]
                        return (np.expand_dims(image_np, 0),)

        raise Exception("No image in Gemini response")
