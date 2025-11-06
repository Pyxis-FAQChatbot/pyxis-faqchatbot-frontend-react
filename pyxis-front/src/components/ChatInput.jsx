import React from "react";

export default function ChatInput() {
  return (
    <div className="chat-input-container">
      <div className="recommendation-area">
        <button className="recommend-btn">추천 질문 1</button>
        <button className="recommend-btn">추천 질문 2</button>
      </div>

      <div className="chat-input-box">
        <input
          type="text"
          placeholder="메시지를 입력하세요"
          className="chat-input"
        />
        <button className="send-btn">{">"}</button>
      </div>
    </div>
  );
}
