const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const path = require('path');
const { run } = require('./OpenAI'); // OpenAI.jsからrun関数をインポート

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

require('web-streams-polyfill/ponyfill/es6');

app.use(express.static(path.join(__dirname, 'public')));

io.on('connection', (socket) => {
  console.log('New client connected');

  let ai;

  socket.on('message', async (message) => {
    console.log('Received message:', message);
    try {
      let response;
      if (!ai) {
        console.log('Initializing AI with message:', message);
        ai = run(message); // 初期入力を設定
        response = await ai.next(); // 最初の応答を生成
      } else {
        console.log('Sending message to AI:', message);
        response = await ai.next(message); // 2回目以降の応答を生成
      }
      if (response.done) {
        console.log('AI Generator is done');
        return; // ジェネレータが完了した場合は処理を終了
      }
      console.log('AI response:', response.value);
      io.emit('message', response.value); // イベント名を 'message' に統一
    } catch (error) {
      console.error('Error processing message:', error);
      io.emit('message', 'エラーが発生しました。');
    }
  });
  


  socket.on('disconnect', () => {
    console.log('Client disconnected');
  });
});

const port = process.env.PORT || 5001;
server.listen(port, () => console.log(`Server running on port ${port}`));
