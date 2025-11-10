import React, { useState, useEffect } from "react";
import "../styles/ChatOverlay.css";
import {botRoomPath} from "../api/chatApi"

export default function ChatOverlay({ isOpen, onClose, onSelectRoom, onNewChat }) {
  const [rooms, setRooms] = useState([]);

  // ✅ 채팅방 목록 불러오기
  useEffect(() => {
    if (isOpen) { botRoomPath(page, size)
      .then((res) => {
        const sorted = res.data.rooms.sort(
          (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
        );
        setRooms(sorted);
      })
      .catch((err) => console.error("채팅방 목록 로드 실패:", err));
    }
  }, [isOpen]);

  return (
    <>
      {/* 반투명 배경 */}
      <div
        className={`overlay-backdrop ${isOpen ? "show" : ""}`}
        onClick={onClose}
      ></div>

      {/* 좌측 슬라이드 패널 */}
      <div className={`chat-overlay ${isOpen ? "open" : ""}`}>
        <div className="overlay-header">
          <div className="overlay-logo">
            <div className="overlay-placeholder">로고</div>
            <span className="overlay-title">Pyxis</span>
          </div>
          <button className="close-btn" onClick={onClose}>
            &lt;
          </button>
        </div>

        <div className="overlay-content">
          <button className="new-chat-btn" onClick={onNewChat}>
            💬 새 채팅
          </button>

          <div className="chat-room-list">
            {rooms.map((room) => (
              <div
                key={room.botChatId}
                className="chat-room-item"
                onClick={() => onSelectRoom(room.botChatId)}
              >
                {room.title}
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
