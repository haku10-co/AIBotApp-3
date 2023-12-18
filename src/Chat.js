import React, { useState, useEffect } from 'react';
import io from 'socket.io-client';
import sendIcon from './style/ダウンロード.png';
const socket = io.connect('http://localhost:5002');

const Chat = ({ setShowChat }) => {
  const [message, setMessage] = useState('');
  const [chat, setChat] = useState([]);

  useEffect(() => {
    socket.on('message', (response) => {
      console.log('Received message from server:', response);
      setChat(prevChat => [...prevChat, String(response)]);
    });
  }, [socket]);

  const sendMessage = (event) => {
    event.preventDefault();
    console.log('Sending message:', message);
    socket.emit('message', message);
    setChat(prevChat => [...prevChat, message]);
    setMessage('');
  };

  return (
    <div className="chat-container">
      <button className="close-button" onClick={() => setShowChat(false)}>x</button>
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
            <img src={sendIcon} alt="Send" />
        </button>
        </form>
    </div>
  );
}

export default Chat;