import React from 'react';
import './style/Header.css'; // スタイルシートのインポート
import logo from './style/スクリーンショット 2023-11-26 16.21.35.png'; // あなたのロゴ画像へのパス

function Header() {
    return (
        <header className="header">
            <div className="logo-container">
                <img src={logo} alt="Ultra Print Service Logo" />
            </div>
            <nav className="navigation">
                <ul>
                    <li><a href="/home">ホーム</a></li>
                    <li><a href="/services">サービス</a></li>
                    <li><a href="/about">会社情報</a></li>
                    <li><a href="/contact">お問い合わせ</a></li>
                </ul>
            </nav>
            <div className="contact-info">
                <div className="phone-number">
                    <p>フリーダイヤル</p>
                    <a href="tel:0120-954-257">0120-954-257</a>
                </div>
                <div className="inquiry-button">
                    <a href="/inquiry" className="inquiry-link">メールお問い合わせ</a>
                </div>
            </div>
        </header>
    );
}

export default Header;
