import React, { useState } from "react";
import Header from "../components/Header";
import ChatInput from "../components/ChatInput";
import BottomNav from "../components/BottomNav";
import "../styles/ChatPage.css";

export default function ChatPage() {
  const [messages, setMessages] = useState([]);

  return (
    <div className="chat-page">
      <Header type="chat" title="봇 채팅창 제목" onMenuClick={() => console.log("메뉴 클릭")} />

      <main className="chat-content">
        {messages.length === 0 ? (
          <p className="welcome-text">환영합니다 👋</p>
        ) : (
          messages.map((msg, index) => (
            <div
              key={index}
              className={`chat-bubble ${
                msg.sender === "bot" ? "bot" : "user"
              }`}
            >
              {msg.text}
            </div>
          ))
        )}
      </main>

      <ChatInput />
      <BottomNav active="chat" />
    </div>
  );
}
