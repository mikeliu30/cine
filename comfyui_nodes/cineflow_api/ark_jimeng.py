# 火山方舟 即梦 图片生成节点

import os
import base64
import numpy as np
from PIL import Image
import io

class ArkJimengNode:
    """火山方舟 即梦 4.5 图片生成节点"""

    @classmethod
    def INPUT_TYPES(cls):
        return {
            "required": {
                "prompt": ("STRING", {"multiline": True, "default": "一幅美丽的风景画"}),
                "size": (["1920x1080", "1080x1920", "1024x1024", "1024x768"], {"default": "1920x1080"}),
            },
            "optional": {
                "api_key": ("STRING", {"default": ""}),
                "endpoint_id": ("STRING", {"default": ""}),
            }
        }

    RETURN_TYPES = ("IMAGE",)
    RETURN_NAMES = ("image",)
    FUNCTION = "generate"
    CATEGORY = "CineFlow/API"

    def generate(self, prompt, size, api_key="", endpoint_id=""):
        import requests

        if not api_key:
            api_key = os.environ.get("ARK_API_KEY", "")

        if not api_key:
            raise ValueError("ARK_API_KEY not configured")

        if not endpoint_id:
            endpoint_id = os.environ.get("ARK_ENDPOINT_ID", "doubao-seedream-3-0-t2i-250415")

        response = requests.post(
            "https://ark.cn-beijing.volces.com/api/v3/images/generations",
            headers={
                "Content-Type": "application/json",
                "Authorization": f"Bearer {api_key}",
            },
            json={
                "model": endpoint_id,
                "prompt": prompt,
                "size": size,
                "n": 1,
            }
        )

        if not response.ok:
            raise Exception(f"Jimeng API error: {response.status_code} - {response.text}")

        result = response.json()
        data = result.get("data", [])

        if data:
            # 支持 URL 或 base64 格式
            if "url" in data[0]:
                img_response = requests.get(data[0]["url"])
                image = Image.open(io.BytesIO(img_response.content))
            elif "b64_json" in data[0]:
                image_data = base64.b64decode(data[0]["b64_json"])
                image = Image.open(io.BytesIO(image_data))
            else:
                raise Exception("Unknown response format")

            image_np = np.array(image).astype(np.float32) / 255.0
            if len(image_np.shape) == 2:
                image_np = np.stack([image_np] * 3, axis=-1)
            elif image_np.shape[-1] == 4:
                image_np = image_np[:, :, :3]
            return (np.expand_dims(image_np, 0),)

        raise Exception("No image in Jimeng response")
