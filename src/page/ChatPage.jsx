import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { chatApi, botRoomPath } from "../api/chatApi"
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
  const [totalPages, setTotalPages] = useState(0);
  const chatContainerRef = useRef(null);
  const [chatTitle, setChatTitle] = useState("챗봇");
  const PAGE_SIZE = 20;
  const firstMessage = new URLSearchParams(window.location.search).get("firstMessage");

  // ✅ 메시지 불러오기 (페이지 단위)
  const fetchMessages = async (id, pageNum = 0) => {
    if (isLoading || pageNum > totalPages) return;

    try {
      setIsLoading(true);
      // const res = await axios.get(
      //   `http://localhost:8080/api/v1/chatbot/${id}/message?page=${pageNum}&size=${PAGE_SIZE}`
      // );
      const res = await chatApi.botMsgLog(id, pageNum, PAGE_SIZE);
      const data = res.data ? res.data : res;
      const fetched = data.items;

      // UI가 요구하는 형태로 변환
      const converted = fetched.flatMap((m) => {
        const arr = [{ 
          sender: "user", 
          text: m.userQuery, 
          createdAt: m.createdAt }];
        if (m.botResponse) {
          arr.push({ 
            sender: "bot", 
            text: m.botResponse,
            createdAt: m.createdAt, 
            sources: m.sourceData || [] });
        }
        return arr;
      });

      // 오래된 → 최신 순으로 변환 (최신이 아래로)
      const convertedSorted = converted.sort(
        (a, b) => new Date(a.createdAt) - new Date(b.createdAt)
      );

      // 이전 메시지 위로 추가
      setMessages((prev) => [...prev, ...convertedSorted]);
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
        console.log('새로운쳇 객체확인 : ',createRes.botChatId)
        const newChatId = createRes.botChatId;
        navigate(`/chatbot/${newChatId}?firstMessage=${encodeURIComponent(userInput)}`);
        return;
      }

      // ✅ 기존 방에 메시지 전송
      const response = await chatApi.botMsgPath(chatId,
        { userQuery: userInput }
      );

      const botReply = response.botResponse;
      const botsources = response.sourceData;

      // 봇 응답 표시
      setMessages((prev) => [...prev, { sender: "bot", text: botReply , sources:botsources }]);

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

  // 체팅페이지 삭제 핸들러
  const handleDeleteRoom = async (roomId) => {
    const confirmed = window.confirm("정말 삭제하시겠습니까?");
    if (!confirmed) return;

    try {
      await chatApi.botDeletePath(roomId);

      // 현재 페이지가 삭제한 방이라면 /chatbot 으로 이동
      if (String(roomId) === String(chatId)) {
        navigate("/chatbot");
      }

      // 오버레이 목록 갱신을 위해 닫았다가 다시 열기
      setIsOverlayOpen(false);
      setTimeout(() => setIsOverlayOpen(true), 50);
    } catch (err) {
      console.error("채팅방 삭제 실패:", err);
      alert(err.response?.data?.message || "삭제 중 오류가 발생했습니다.");
    }
  };

  // 채팅방 입장 시 초기 메시지 로드
  useEffect(() => {
    if (chatId) {
      setMessages([]);
      setPage(0);
      fetchMessages(chatId, 0);
      // firstMessage가 있을 경우 자동 전송
    if (firstMessage) {
      handleSendMessage(firstMessage);
      // URL에서 firstMessage를 제거해서 새로고침 시 중복 전송 방지
      window.history.replaceState({}, "", `/chatbot/${chatId}`);
    }
    }
  }, [chatId]);

  // 채팅방 제목 로드
  useEffect(() => {
    async function loadRoomTitle() {
      if (!chatId) {
        setChatTitle("새로운 챗봇");
        return;
      }

      try {
        const res = await botRoomPath(0, 100);
        const rooms = res.rooms || res.items || [];
        const room = rooms.find(r => String(r.botchatId) === String(chatId));

        if (room) setChatTitle(room.title);
        else setChatTitle("새로운 챗봇");
      } catch (e) {
        console.error("방 제목 로드 실패:", e);
        setChatTitle("새로운 챗봇");
      }
    }
    loadRoomTitle();
  }, [chatId]);

  // 스크롤 이벤트 등록
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
        title={chatTitle}
        onMenuClick={() => setIsOverlayOpen(true)}
      />

      <main className="chat-content" ref={chatContainerRef}>
        
        {!chatId ? (
          <div className="welcome-screen">
            <div className="logo-placeholder">로고</div>
            <p className="welcome-text">무엇이 궁금하신가요?</p>
          </div>
        ) : (
          messages.length === 0 ? (
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
                <div>{msg.text || msg.items}</div>

                {msg.sender === "bot" && msg.sources?.length > 0 && (
                  <div className="message-sources">
                    {msg.sources.map((src, i) => (
                      <div className="source-item" key={i}>
                        
                        {/* 제목 */}
                        <div className="source-title">{src.title}</div>
                        
                        {/* URL - 클릭 가능 링크 */}
                        <a className="source-url" href={src.url} target="_blank" rel="noopener noreferrer">
                          {src.url}
                        </a>

                        {/* snippet */}
                        <div className="source-snippet">{src.snippet}</div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))
          )
        )}
      </main>

      <ChatInput onSendMessage={handleSendMessage} />
      <BottomNav active="chat" />
      <ChatOverlay
        isOpen={isOverlayOpen}
        onClose={() => setIsOverlayOpen(false)}
        onSelectRoom={(id) => {
          navigate(`/chatbot/${id}`);
          setIsOverlayOpen(false);
        }}
        onNewChat={async () => {
          try {
            const res = await chatApi.botCreatePath();
            const newChatId = res.botChatId;
            setIsOverlayOpen(false);
            navigate(`/chatbot/${newChatId}`);
          } catch (err) {
            console.error("새 채팅 생성 실패:", err);
          }
        }}
        onDeleteRoom={handleDeleteRoom}
      />
    </div>
  );
}
