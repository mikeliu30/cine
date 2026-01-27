'use client';

// 资产库面板 - Asset Library Panel
import { useState, memo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface Asset {
  id: string;
  type: 'image' | 'video';
  url: string;
  thumbnail: string;
  name: string;
  createdAt: string;
}

interface AssetLibraryProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (asset: Asset) => void;
}

// 模拟资产数据
const mockAssets: Asset[] = [
  { id: '1', type: 'image', url: 'https://picsum.photos/seed/asset1/800/600', thumbnail: 'https://picsum.photos/seed/asset1/200/150', name: '风景图1', createdAt: '2024-01-15' },
  { id: '2', type: 'image', url: 'https://picsum.photos/seed/asset2/800/600', thumbnail: 'https://picsum.photos/seed/asset2/200/150', name: '人物图1', createdAt: '2024-01-14' },
  { id: '3', type: 'image', url: 'https://picsum.photos/seed/asset3/800/600', thumbnail: 'https://picsum.photos/seed/asset3/200/150', name: '建筑图1', createdAt: '2024-01-13' },
  { id: '4', type: 'video', url: 'https://sample-videos.com/video321/mp4/720/big_buck_bunny_720p_1mb.mp4', thumbnail: 'https://picsum.photos/seed/asset4/200/150', name: '视频素材1', createdAt: '2024-01-12' },
  { id: '5', type: 'image', url: 'https://picsum.photos/seed/asset5/800/600', thumbnail: 'https://picsum.photos/seed/asset5/200/150', name: '抽象图1', createdAt: '2024-01-11' },
  { id: '6', type: 'image', url: 'https://picsum.photos/seed/asset6/800/600', thumbnail: 'https://picsum.photos/seed/asset6/200/150', name: '自然图1', createdAt: '2024-01-10' },
];

export const AssetLibrary = memo(function AssetLibrary({ isOpen, onClose, onSelect }: AssetLibraryProps) {
  const [filter, setFilter] = useState<'all' | 'image' | 'video'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredAssets = mockAssets.filter(asset => {
    if (filter !== 'all' && asset.type !== filter) return false;
    if (searchQuery && !asset.name.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
          
          <motion.div
            className="relative w-[700px] max-h-[80vh] bg-gray-900/95 backdrop-blur-xl rounded-2xl border border-gray-700 shadow-2xl overflow-hidden flex flex-col"
            initial={{ scale: 0.9, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.9, y: 20 }}
          >
            {/* 头部 */}
            <div className="flex items-center justify-between p-4 border-b border-gray-700">
              <h2 className="text-lg font-semibold text-white">📁 资产库</h2>
              <button onClick={onClose} className="p-1 text-gray-400 hover:text-white">✕</button>
            </div>

            {/* 搜索和筛选 */}
            <div className="p-4 border-b border-gray-700 flex gap-3">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="搜索资产..."
                className="flex-1 px-4 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-500"
              />
              <div className="flex gap-1">
                {(['all', 'image', 'video'] as const).map(f => (
                  <button
                    key={f}
                    onClick={() => setFilter(f)}
                    className={`px-3 py-2 rounded-lg text-sm transition-colors ${
                      filter === f ? 'bg-indigo-500 text-white' : 'bg-gray-800 text-gray-400 hover:text-white'
                    }`}
                  >
                    {f === 'all' ? '全部' : f === 'image' ? '🖼️ 图片' : '🎬 视频'}
                  </button>
                ))}
              </div>
            </div>

            {/* 资产网格 */}
            <div className="flex-1 overflow-y-auto p-4">
              <div className="grid grid-cols-4 gap-3">
                {filteredAssets.map(asset => (
                  <button
                    key={asset.id}
                    onClick={() => { onSelect(asset); onClose(); }}
                    className="group relative aspect-video bg-gray-800 rounded-lg overflow-hidden hover:ring-2 hover:ring-indigo-500 transition-all"
                  >
                    <img src={asset.thumbnail} alt={asset.name} className="w-full h-full object-cover" />
                    {asset.type === 'video' && (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-3xl opacity-80">▶️</span>
                      </div>
                    )}
                    <div className="absolute inset-x-0 bottom-0 p-2 bg-gradient-to-t from-black/80 to-transparent">
                      <p className="text-xs text-white truncate">{asset.name}</p>
                    </div>
                    <div className="absolute inset-0 bg-indigo-500/20 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </button>
                ))}
              </div>

              {filteredAssets.length === 0 && (
                <div className="text-center py-12 text-gray-500">
                  没有找到匹配的资产
                </div>
              )}
            </div>

            {/* 底部提示 */}
            <div className="p-3 border-t border-gray-700 text-center text-xs text-gray-500">
              点击资产添加到画布
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
});

