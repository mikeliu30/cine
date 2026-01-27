'use client';

// 节点详情弹窗 - 显示生成参数
import { motion, AnimatePresence } from 'framer-motion';

interface NodeInfoModalProps {
  isOpen: boolean;
  onClose: () => void;
  nodeData: {
    shot_id: string;
    prompt?: string;
    model?: string;
    ratio?: string;
    seed?: number;
    imageUrl?: string;
    createdAt?: number;
  };
}

export function NodeInfoModal({ isOpen, onClose, nodeData }: NodeInfoModalProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          {/* 背景遮罩 */}
          <div 
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            onClick={onClose}
          />
          
          {/* 弹窗主体 */}
          <motion.div
            className="relative w-[600px] max-h-[80vh] bg-gray-900/95 backdrop-blur-xl rounded-2xl border border-gray-700 shadow-2xl overflow-hidden"
            initial={{ scale: 0.9, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.9, y: 20 }}
          >
            {/* 头部 */}
            <div className="flex items-center justify-between p-4 border-b border-gray-700">
              <h2 className="text-lg font-semibold text-white">📋 节点详情</h2>
              <button
                onClick={onClose}
                className="p-1 text-gray-400 hover:text-white transition-colors"
              >
                ✕
              </button>
            </div>
            
            {/* 内容 */}
            <div className="p-4 space-y-4 overflow-y-auto max-h-[60vh]">
              {/* 预览图 */}
              {nodeData.imageUrl && (
                <div className="rounded-xl overflow-hidden border border-gray-700">
                  <img 
                    src={nodeData.imageUrl} 
                    alt="Preview" 
                    className="w-full h-auto"
                  />
                </div>
              )}
              
              {/* 参数列表 */}
              <div className="space-y-3">
                <InfoRow label="节点 ID" value={nodeData.shot_id} mono />
                
                {nodeData.prompt && (
                  <InfoRow label="Prompt" value={nodeData.prompt} multiline />
                )}
                
                {nodeData.model && (
                  <InfoRow label="模型" value={nodeData.model} />
                )}
                
                {nodeData.ratio && (
                  <InfoRow label="画幅" value={nodeData.ratio} />
                )}
                
                {nodeData.seed !== undefined && nodeData.seed > 0 && (
                  <InfoRow label="Seed" value={String(nodeData.seed)} mono copyable />
                )}
                
                {nodeData.createdAt && (
                  <InfoRow 
                    label="创建时间" 
                    value={new Date(nodeData.createdAt).toLocaleString('zh-CN')} 
                  />
                )}
              </div>
            </div>
            
            {/* 底部 */}
            <div className="flex justify-end gap-2 p-4 border-t border-gray-700 bg-gray-800/50">
              <button
                onClick={onClose}
                className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
              >
                关闭
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// 信息行组件
function InfoRow({ 
  label, 
  value, 
  mono, 
  multiline,
  copyable 
}: { 
  label: string; 
  value: string; 
  mono?: boolean;
  multiline?: boolean;
  copyable?: boolean;
}) {
  const handleCopy = async () => {
    await navigator.clipboard.writeText(value);
  };

  return (
    <div className={`${multiline ? 'space-y-1' : 'flex items-center justify-between'}`}>
      <span className="text-gray-400 text-sm">{label}</span>
      <div className="flex items-center gap-2">
        <span className={`
          text-white 
          ${mono ? 'font-mono text-sm' : ''} 
          ${multiline ? 'block mt-1 text-sm leading-relaxed' : ''}
        `}>
          {value}
        </span>
        {copyable && (
          <button
            onClick={handleCopy}
            className="p-1 text-gray-500 hover:text-white transition-colors"
            title="复制"
          >
            📋
          </button>
        )}
      </div>
    </div>
  );
}

