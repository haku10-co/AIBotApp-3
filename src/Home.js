import React, { useState } from 'react';
import Chat from './Chat';
import Header from './Header'; // Headerコンポーネントのインポート
import './style/Home.css';

const Home = () => {
  const [contact, setContact] = useState({ name: '', email: '', message: '' });
  const [showChat, setShowChat] = useState(false);

  const handleChange = (e) => {
    setContact({ ...contact, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log(contact);
  };

  return (
    <div>
      <Header /> {/* Headerコンポーネントの追加 */}
      <h1>会社名</h1>
    <p>会社の説明文...</p>

    <h2>お問い合わせ</h2>
    <form onSubmit={handleSubmit}>
      <label>
        名前:
        <input type="text" name="name" onChange={handleChange} />
      </label>
      <label>
        メールアドレス:
        <input type="email" name="email" onChange={handleChange} />
      </label>
      <label>
        メッセージ:
        <textarea name="message" onChange={handleChange} />
      </label>
      <input type="submit" value="送信" />
    </form>

    {!showChat && (
      <button className="chat-button" onClick={() => setShowChat(!showChat)}>Chat</button>
    )}

    {showChat && (
    <div className={`sidebar ${showChat ? 'show' : ''}`}>
        <Chat setShowChat={setShowChat} />
    </div>
    )}
  </div>
);
};

export default Home;