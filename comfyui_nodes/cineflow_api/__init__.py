# CineFlow API Nodes for ComfyUI
# 将云端 AI API 封装为 ComfyUI 节点

from .vertex_gemini import VertexGeminiNode
from .vertex_imagen import VertexImagenNode
from .vertex_veo import VertexVeoNode
from .ark_jimeng import ArkJimengNode

# 节点映射
NODE_CLASS_MAPPINGS = {
    "CineFlow_VertexGemini": VertexGeminiNode,
    "CineFlow_VertexImagen": VertexImagenNode,
    "CineFlow_VertexVeo": VertexVeoNode,
    "CineFlow_ArkJimeng": ArkJimengNode,
}

# 节点显示名称
NODE_DISPLAY_NAME_MAPPINGS = {
    "CineFlow_VertexGemini": "🎨 Vertex AI Gemini (CineFlow)",
    "CineFlow_VertexImagen": "🚀 Vertex AI Imagen 3 (CineFlow)",
    "CineFlow_VertexVeo": "🎬 Vertex AI Veo 3.1 (CineFlow)",
    "CineFlow_ArkJimeng": "🎨 火山方舟 即梦 (CineFlow)",
}

__all__ = ['NODE_CLASS_MAPPINGS', 'NODE_DISPLAY_NAME_MAPPINGS']
