import React, { useState, useEffect, useRef } from "react";
import "../styles/ChatOverlay.css";
import { botRoomPath } from "../api/chatApi";

export default function ChatOverlay({ isOpen, onClose, onSelectRoom, onNewChat }) {
  const PAGE_SIZE = 10; // ✅ 한 번에 불러올 개수 상수 지정
  const [rooms, setRooms] = useState([]);
  const [page, setPage] = useState(0); // ✅ 현재 페이지
  const [hasMore, setHasMore] = useState(true); // ✅ 더 불러올 목록이 있는지
  const listRef = useRef(null);

  // ✅ 채팅방 목록 불러오기 함수
  const fetchRooms = async (pageNum) => {
    try {
      const res = await botRoomPath(pageNum, PAGE_SIZE);
      const newRooms = res.rooms;

      if (newRooms.length === 0) {
        setHasMore(false); // 더 이상 데이터 없음
        return;
      }

      const sorted = newRooms.sort(
        (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
      );

      // 기존 목록 + 새로 불러온 목록
      setRooms((prev) => [...prev, ...sorted]);
    } catch (err) {
      console.error("채팅방 목록 로드 실패:", err);
    }
  };

  // ✅ isOpen 시 첫 페이지 로드
  useEffect(() => {
    if (isOpen) {
      setRooms([]);
      setPage(0);
      setHasMore(true);
      fetchRooms(0);
    }
  }, [isOpen]);

  // ✅ 스크롤 감지해서 다음 페이지 로드
  const handleScroll = () => {
    const list = listRef.current;
    if (!list || !hasMore) return;

    // 스크롤이 맨 아래에 도달했을 때
    if (list.scrollTop + list.clientHeight >= list.scrollHeight - 10) {
      setPage((prevPage) => prevPage + 1);
    }
  };

  // ✅ page 변경 시 추가 데이터 로드
  useEffect(() => {
    if (page > 0 && hasMore) {
      fetchRooms(page);
    }
  }, [page]);

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

          <div
            className="chat-room-list"
            ref={listRef}
            onScroll={handleScroll}
            style={{ maxHeight: "400px" }} // 스크롤 영역
          >
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
