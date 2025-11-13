import React, { useState } from "react";

export default function ChatInput({ onSendMessage }) {
  const [inputValue, setInputValue] = useState("");

  const handleSend = () => {
    if (onSendMessage) {
      onSendMessage(inputValue);
      setInputValue(""); // 입력칸 초기화
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") handleSend();
  };

  return (
    <div className="chat-input-container">
      <div className="recommendation-area">
        <button className="recommend-btn" onClick={() => onSendMessage("오늘의 정책을 추천해줘.")}>
          오늘 정책 추천
        </button>
        <button className="recommend-btn" onClick={() => onSendMessage("가장 최근에 나온 정책을 보여줘. ")}>
          최신 정책 추천
        </button>
      </div>

      <div className="chat-input-box">
        <input
          type="text"
          placeholder="메시지를 입력하세요"
          className="chat-input"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
        />
        <button className="send-btn" onClick={handleSend}>
          {">"}
        </button>
      </div>
    </div>
  );
}