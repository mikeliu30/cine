// 简化版 WebSocket 协作服务器
const WebSocket = require('ws');
const http = require('http');
const Y = require('yjs');
const syncProtocol = require('y-protocols/sync');
const awarenessProtocol = require('y-protocols/awareness');
const encoding = require('lib0/encoding');
const decoding = require('lib0/decoding');

const docs = new Map();
const PORT = process.env.PORT || 1234;

// 消息类型
const messageSync = 0;
const messageAwareness = 1;

function getYDoc(docName) {
  if (!docs.has(docName)) {
    const doc = new Y.Doc();
    docs.set(docName, { doc, conns: new Set(), awareness: new awarenessProtocol.Awareness(doc) });
  }
  return docs.get(docName);
}

const server = http.createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/plain' });
  res.end('CineFlow WebSocket Server Running');
});

const wss = new WebSocket.Server({
  server,
  maxPayload: 500 * 1024 * 1024, // 500MB - 支持大型数据同步
  perMessageDeflate: false, // 禁用压缩以避免内存问题
});

// 全局错误处理
wss.on('error', (error) => {
  console.error('❌ WebSocket Server Error:', error.message);
});

wss.on('connection', (ws, req) => {
  const docName = req.url?.slice(1) || 'default-room';
  const { doc, conns, awareness } = getYDoc(docName);

  conns.add(ws);
  console.log(`✅ 客户端连接到房间: ${docName} (当前 ${conns.size} 人)`);

  // 错误处理 - 防止单个连接错误导致服务器崩溃
  ws.on('error', (error) => {
    console.error(`❌ 连接错误 (${docName}):`, error.message);
    conns.delete(ws);
  });

  // 发送初始同步消息
  try {
    const encoder = encoding.createEncoder();
    encoding.writeVarUint(encoder, messageSync);
    syncProtocol.writeSyncStep1(encoder, doc);
    ws.send(encoding.toUint8Array(encoder));

    // 发送 awareness 状态
    const awarenessEncoder = encoding.createEncoder();
    encoding.writeVarUint(awarenessEncoder, messageAwareness);
    encoding.writeVarUint8Array(awarenessEncoder,
      awarenessProtocol.encodeAwarenessUpdate(awareness, Array.from(awareness.getStates().keys()))
    );
    ws.send(encoding.toUint8Array(awarenessEncoder));
  } catch (error) {
    console.error(`❌ 初始同步错误:`, error.message);
  }

  ws.on('message', (message) => {
    try {
      const data = new Uint8Array(message);
      const decoder = decoding.createDecoder(data);
      const messageType = decoding.readVarUint(decoder);

      switch (messageType) {
        case messageSync: {
          const encoder = encoding.createEncoder();
          encoding.writeVarUint(encoder, messageSync);
          const syncMessageType = syncProtocol.readSyncMessage(decoder, encoder, doc, null);
          if (encoding.length(encoder) > 1) {
            ws.send(encoding.toUint8Array(encoder));
          }
          // 广播给其他客户端
          if (syncMessageType === 2) {
            const broadcastEncoder = encoding.createEncoder();
            encoding.writeVarUint(broadcastEncoder, messageSync);
            syncProtocol.writeSyncStep2(broadcastEncoder, doc);
            const broadcastData = encoding.toUint8Array(broadcastEncoder);
            conns.forEach(conn => {
              if (conn !== ws && conn.readyState === WebSocket.OPEN) {
                try {
                  conn.send(broadcastData);
                } catch (e) {
                  console.error('广播错误:', e.message);
                }
              }
            });
          }
          break;
        }
        case messageAwareness: {
          const update = decoding.readVarUint8Array(decoder);
          awarenessProtocol.applyAwarenessUpdate(awareness, update, ws);
          // 广播 awareness 给其他客户端
          conns.forEach(conn => {
            if (conn !== ws && conn.readyState === WebSocket.OPEN) {
              try {
                conn.send(data);
              } catch (e) {
                console.error('Awareness 广播错误:', e.message);
              }
            }
          });
          break;
        }
      }
    } catch (error) {
      console.error(`❌ 消息处理错误:`, error.message);
    }
  });

  ws.on('close', () => {
    conns.delete(ws);
    console.log(`❌ 客户端断开: ${docName} (剩余 ${conns.size} 人)`);
  });
});

server.listen(PORT, () => {
  console.log('');
  console.log('🚀 ================================');
  console.log(`   WebSocket 服务器已启动`);
  console.log(`   地址: ws://localhost:${PORT}`);
  console.log('🚀 ================================');
  console.log('');
  console.log('等待客户端连接...');
});


