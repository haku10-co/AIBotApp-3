import React, { useState, useEffect } from 'react';
import io from 'socket.io-client';

const socket = io.connect('http://localhost:5001');

function App() {
  const [message, setMessage] = useState('');
  const [chat, setChat] = useState([]);

  useEffect(() => {
    socket.on('message', (response) => {
      console.log('Received message from server:', response);
      setChat(prevChat => [...prevChat, response]);
    });
  }, [socket]); // socketを依存関係に追加

  const sendMessage = (event) => {
    event.preventDefault();
    console.log('Sending message:', message);
    socket.emit('message', message); // イベント名を 'message' に統一
    setChat(prevChat => [...prevChat, message]); // ここで自分のメッセージをチャットに追加
    setMessage('');
  };
  return (
    <div id="chat-container">
      <div id="message-container">
        {chat.map((message, index) => (
          <div key={index} className="message">{message}</div>
        ))}
      </div>
      <form id="send-container" onSubmit={sendMessage}>
        <input
          type="text"
          id="message-input"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
        />
        <button type="submit" id="send-button">
          Send
        </button>
      </form>
    </div>
  );
}

export default App;