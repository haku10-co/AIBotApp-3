const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const { run } = require('./OpenAI'); // OpenAI.jsからrun関数をインポート

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

io.on('connection', (socket) => {
  console.log('New client connected');

  socket.on('message', async (message) => {
    try {
      // botはasync generator関数
      const bot = run(message);

      // レスポンスを取得し、クライアントに送信
      for await (const response of bot) {
        io.emit('message', response);

        // メモリ使用量を確認し、必要に応じて対応
        const used = process.memoryUsage();
        if (used.heapUsed > 1000 * 1024 * 1024) {  // 1GB以上使用している場合
          console.log('High memory usage, consider freeing up resources');
          // 必要に応じて追加のメモリ管理処理をここに実装
        }
      }
    } catch (error) {
      console.error('Error processing message:', error);
      io.emit('error', 'エラーが発生しました');
    }
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected');
  });
});

const port = process.env.PORT || 5002;
server.listen(port, () => console.log(`Server running on port ${port}`));
