# Vertex AI Imagen 3 图片生成节点

import os
import base64
import numpy as np
from PIL import Image
import io

class VertexImagenNode:
    """Vertex AI Imagen 3 图片生成节点"""

    @classmethod
    def INPUT_TYPES(cls):
        return {
            "required": {
                "prompt": ("STRING", {"multiline": True, "default": "A beautiful landscape"}),
                "aspect_ratio": (["16:9", "9:16", "1:1", "4:3"], {"default": "16:9"}),
            },
            "optional": {
                "negative_prompt": ("STRING", {"multiline": True, "default": "blurry, low quality"}),
                "project_id": ("STRING", {"default": ""}),
                "location": ("STRING", {"default": "us-central1"}),
            }
        }

    RETURN_TYPES = ("IMAGE",)
    RETURN_NAMES = ("image",)
    FUNCTION = "generate"
    CATEGORY = "CineFlow/API"

    def generate(self, prompt, aspect_ratio, negative_prompt="", project_id="", location="us-central1"):
        from google.auth import default
        from google.auth.transport.requests import Request
        import requests

        if not project_id:
            project_id = os.environ.get("GOOGLE_CLOUD_PROJECT", "")

        if not project_id:
            raise ValueError("GOOGLE_CLOUD_PROJECT not configured")

        credentials, _ = default(scopes=["https://www.googleapis.com/auth/cloud-platform"])
        credentials.refresh(Request())

        endpoint = f"https://{location}-aiplatform.googleapis.com/v1/projects/{project_id}/locations/{location}/publishers/google/models/imagen-3.0-generate-001:predict"

        request_body = {
            "instances": [{"prompt": prompt}],
            "parameters": {
                "sampleCount": 1,
                "aspectRatio": aspect_ratio,
                "negativePrompt": negative_prompt or "blurry, low quality, distorted",
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
            raise Exception(f"Imagen API error: {response.status_code} - {response.text}")

        result = response.json()
        predictions = result.get("predictions", [])

        if predictions and "bytesBase64Encoded" in predictions[0]:
            image_data = base64.b64decode(predictions[0]["bytesBase64Encoded"])
            image = Image.open(io.BytesIO(image_data))
            image_np = np.array(image).astype(np.float32) / 255.0
            if len(image_np.shape) == 2:
                image_np = np.stack([image_np] * 3, axis=-1)
            elif image_np.shape[-1] == 4:
                image_np = image_np[:, :, :3]
            return (np.expand_dims(image_np, 0),)

        raise Exception("No image in Imagen response")
