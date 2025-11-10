import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { chatApi } from "../api/chatApi"
import Header from "../components/Header";
import ChatOverlay from "../components/ChatOverlay";
import ChatInput from "../components/ChatInput";
import BottomNav from "../components/BottomNav";
import "../styles/ChatPage.css";


export default function ChatPage() {
  const navigate = useNavigate();
  const { chatId } = useParams(); // URL 파라미터로 chatId 추출
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isOverlayOpen, setIsOverlayOpen] = useState(false);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const chatContainerRef = useRef(null);
  const PAGE_SIZE = 20;

  // ✅ 메시지 불러오기 (페이지 단위)
  const fetchMessages = async (id, pageNum = 0) => {
    if (isLoading || pageNum >= totalPages) return;

    try {
      setIsLoading(true);
      // const res = await axios.get(
      //   `http://localhost:8080/api/v1/chatbot/${id}/message?page=${pageNum}&size=${PAGE_SIZE}`
      // );
      const res = await chatApi.botMsgLog(id, pageNum, PAGE_SIZE);

      const data = res.data;
      const fetched = data.messages || [];

      // 오래된 → 최신 순으로 변환 (최신이 아래로)
      const ordered = fetched.reverse();

      // 이전 메시지 위로 추가
      setMessages((prev) => [...ordered, ...prev]);
      setTotalPages(data.totalPages);
      setPage(pageNum + 1);

      // ✅ 첫 로드시 맨 아래로 스크롤
      if (pageNum === 0) {
        setTimeout(() => {
          const container = chatContainerRef.current;
          container.scrollTop = container.scrollHeight;
        }, 100);
      } else {
        // ✅ 추가 로드 시 스크롤 위치 유지
        const container = chatContainerRef.current;
        const prevHeight = container.scrollHeight;
        setTimeout(() => {
          const newHeight = container.scrollHeight;
          container.scrollTop = newHeight - prevHeight;
        }, 100);
      }
    } catch (error) {
      console.error("메시지 로드 실패:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // ✅ 스크롤이 맨 위일 때 이전 페이지 로드
  const handleScroll = () => {
    const container = chatContainerRef.current;
    if (container.scrollTop === 0 && !isLoading && page < totalPages) {
      fetchMessages(chatId, page);
    }
  };

  // ✅ 사용자 메시지 전송
  const handleSendMessage = async (userInput) => {
    if (!userInput.trim()) return;

    // 사용자 메시지 표시
    setMessages((prev) => [...prev, { sender: "user", text: userInput }]);

    try {
      setIsLoading(true);

      // ✅ chatId 없으면 새 방 생성
      if (!chatId) {
        const createRes = await chatApi.botCreatePath();

        const newChatId = createRes.botChatId;
        navigate(`/chatbot/${newChatId}`, { replace: true });
        return;
      }

      // ✅ 기존 방에 메시지 전송
      const response = await chatApi.botMsgPath(chatId,
        { userQuery: userInput }
      );

      const botReply = response.botResponse;

      // 봇 응답 표시
      setMessages((prev) => [...prev, { sender: "bot", text: botReply }]);

      // 새 메시지 전송 후 스크롤 맨 아래로 이동
      setTimeout(() => {
        const container = chatContainerRef.current;
        container.scrollTop = container.scrollHeight;
      }, 100);
    } catch (error) {
      console.error("API 요청 실패:", error);
      setMessages((prev) => [
        ...prev,
        { sender: "bot", text: "⚠️ 서버 통신 오류가 발생했습니다." },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  // ✅ 채팅방 입장 시 초기 메시지 로드
  useEffect(() => {
    if (chatId) {
      setMessages([]);
      setPage(0);
      fetchMessages(chatId, 0);
    }
  }, [chatId]);

  // ✅ 스크롤 이벤트 등록
  useEffect(() => {
    const container = chatContainerRef.current;
    if (!container) return;
    container.addEventListener("scroll", handleScroll);
    return () => container.removeEventListener("scroll", handleScroll);
  }, [page, totalPages, isLoading]);

  return (
    <div className="chat-page">
      <Header
        type="chat"
        title="봇 채팅창 제목"
        onMenuClick={() => setIsOverlayOpen(true)}
      />

      <main className="chat-content" ref={chatContainerRef}>
        {messages.length === 0 ? (
          <div className="welcome-screen">
            <div className="logo-placeholder">로고</div>
            <p className="welcome-text">무엇이 궁금하신가요?</p>
          </div>
        ) : (
          messages.map((msg, index) => (
            <div
              key={index}
              className={`chat-bubble ${
                msg.sender === "bot" || msg.role === "assistant" ? "bot" : "user"
              }`}
            >
              {msg.text || msg.content}
            </div>
          ))
        )}
      </main>

      <ChatInput onSendMessage={handleSendMessage} />
      <BottomNav active="chat" />
      <ChatOverlay
        isOpen={isOverlayOpen}
        onClose={() => setIsOverlayOpen(false)}
        onSelectRoom={(id) => {
          setIsOverlayOpen(false);
          navigate(`/chat/${id}`);
        }}
        onNewChat={async () => {
          try {
            const res = await chatApi.botCreatePath();
            const newChatId = res.botChatId;
            setIsOverlayOpen(false);
            navigate(`/chat/${newChatId}`);
          } catch (err) {
            console.error("새 채팅 생성 실패:", err);
          }
        }}
      />
    </div>
  );
}
