# Vertex AI Veo 3.1 视频生成节点

import os
import base64
import tempfile

class VertexVeoNode:
    """Vertex AI Veo 3.1 视频生成节点"""

    @classmethod
    def INPUT_TYPES(cls):
        return {
            "required": {
                "prompt": ("STRING", {"multiline": True, "default": "A cinematic scene"}),
                "model": (["veo-3.1-fast", "veo-3.1"], {"default": "veo-3.1-fast"}),
                "duration": ([5, 6, 8, 10], {"default": 6}),
                "aspect_ratio": (["16:9", "9:16", "1:1"], {"default": "16:9"}),
            },
            "optional": {
                "reference_image": ("IMAGE",),
                "project_id": ("STRING", {"default": ""}),
                "location": ("STRING", {"default": "us-central1"}),
            }
        }

    RETURN_TYPES = ("STRING",)
    RETURN_NAMES = ("video_path",)
    FUNCTION = "generate"
    CATEGORY = "CineFlow/API"
    OUTPUT_NODE = True

    def generate(self, prompt, model, duration, aspect_ratio,
                 reference_image=None, project_id="", location="us-central1"):
        from google.auth import default
        from google.auth.transport.requests import Request
        import requests
        import numpy as np
        from PIL import Image
        import io

        if not project_id:
            project_id = os.environ.get("GOOGLE_CLOUD_PROJECT", "")

        if not project_id:
            raise ValueError("GOOGLE_CLOUD_PROJECT not configured")

        credentials, _ = default(scopes=["https://www.googleapis.com/auth/cloud-platform"])
        credentials.refresh(Request())

        # 模型 ID 映射
        model_id = "veo-3.1-001" if model == "veo-3.1" else "veo-3.1-fast-001"

        endpoint = f"https://{location}-aiplatform.googleapis.com/v1/projects/{project_id}/locations/{location}/publishers/google/models/{model_id}:predict"

        request_body = {
            "instances": [{"prompt": prompt}],
            "parameters": {
                "sampleCount": 1,
                "aspectRatio": aspect_ratio,
                "duration": duration,
            }
        }

        # 如果有参考图片 (Image-to-Video)
        if reference_image is not None:
            img_array = (reference_image[0] * 255).astype(np.uint8)
            img = Image.fromarray(img_array)
            buffer = io.BytesIO()
            img.save(buffer, format="PNG")
            img_base64 = base64.b64encode(buffer.getvalue()).decode()
            request_body["instances"][0]["referenceImage"] = {
                "bytesBase64Encoded": img_base64
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
            raise Exception(f"Veo API error: {response.status_code} - {response.text}")

        result = response.json()
        predictions = result.get("predictions", [])

        if predictions and "bytesBase64Encoded" in predictions[0]:
            video_data = base64.b64decode(predictions[0]["bytesBase64Encoded"])

            # 保存到临时文件
            with tempfile.NamedTemporaryFile(suffix=".mp4", delete=False) as f:
                f.write(video_data)
                return (f.name,)

        raise Exception("No video in Veo response")
