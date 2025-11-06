import React, { useState } from "react";
import Header from "../components/Header";
import ChatInput from "../components/ChatInput";
import BottomNav from "../components/BottomNav";
import "../styles/ChatPage.css";
import axios from "axios";

export default function ChatPage() {
  const [messages, setMessages] = useState([]);

  // 사용자 입력 및 응답 처리 함수
  const handleSendMessage = async (userInput) => {
    if (!userInput.trim()) return;

    // 사용자 메시지 먼저 표시
    const newMessage = { sender: "user", text: userInput };
    setMessages((prev) => [...prev, newMessage]);

    try {
      // 백엔드 API 호출
      const response = await axios.post(
        "http://localhost:8080/api/v1/chatbot/*/message", {
        userQuery: userInput,
      });

      const botReply = response.data.botResponse;

      // 봇 응답 메시지 추가
      setMessages((prev) => [
        ...prev,
        { sender: "bot", text: botReply },
      ]);
    } catch (error) {
      console.error("API 요청 실패:", error);
      setMessages((prev) => [
        ...prev,
        { sender: "bot", text: "⚠️ 서버 통신 중 오류가 발생했습니다." },
      ]);
    }
  };
  return (
    <div className="chat-page">
      <Header type="chat" title="봇 채팅창 제목" 
        onMenuClick={() => console.log("메뉴 클릭")} />

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

      <ChatInput onSendMessage={handleSendMessage} />
      <BottomNav active="chat" />
    </div>
  );
}
