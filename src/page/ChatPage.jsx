import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { chatApi, botRoomPath } from "../api/chatApi"
import Header from "../components/Header";
import ChatOverlay from "../components/ChatOverlay";
import ChatInput from "../components/ChatInput";
import LoadingSpinner from "../components/LoadingSpinner";
import ChatBubble from "../components/ui/ChatBubble";
import { Sparkles } from "lucide-react";
import logo from "../assets/pyxis_logo.png";

export default function ChatPage() {
  const navigate = useNavigate();
  const { chatId } = useParams();
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isBotResponding, setIsBotResponding] = useState(false);
  const [isOverlayOpen, setIsOverlayOpen] = useState(false);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const chatContainerRef = useRef(null);
  const [chatTitle, setChatTitle] = useState("챗봇");
  const [deleteConfirmation, setDeleteConfirmation] = useState({ isOpen: false, roomId: null });
  const PAGE_SIZE = 20;
  const firstMessage = new URLSearchParams(window.location.search).get("firstMessage");

  const fetchMessages = async (id, pageNum = 0, currentIsLoading = false, currentTotalPages = 0) => {
    if (currentIsLoading || pageNum > currentTotalPages) return;

    try {
      setIsLoading(true);
      const res = await chatApi.botMsgLog(id, pageNum, PAGE_SIZE);
      const data = res.data ? res.data : res;
      const fetched = data.items;

      const converted = fetched.flatMap((m) => {
        const arr = [{
          sender: "user",
          text: m.userQuery,
          createdAt: m.createdAt,
          isNew: false // History messages are not new
        }];
        if (m.botResponse) {
          arr.push({
            sender: "bot",
            text: m.botResponse,
            createdAt: m.createdAt,
            sources: m.sourceData || [],
            followUpQuestions: m.followUpQuestions || [],
            isNew: false // History messages are not new
          });
        }
        return arr;
      });

      const convertedSorted = converted.sort(
        (a, b) => new Date(a.createdAt) - new Date(b.createdAt)
      );

      setMessages((prev) => [...prev, ...convertedSorted]);
      setTotalPages(data.totalPages);
      setPage(pageNum + 1);

      if (pageNum === 0) {
        setTimeout(() => {
          const container = chatContainerRef.current;
          if (container) container.scrollTop = container.scrollHeight;
        }, 100);
      } else {
        const container = chatContainerRef.current;
        if (container) {
          const prevHeight = container.scrollHeight;
          setTimeout(() => {
            const newHeight = container.scrollHeight;
            container.scrollTop = newHeight - prevHeight;
          }, 100);
        }
      }
    } catch (error) {
      console.error("메시지 로드 실패:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleScroll = (currentPage, currentTotalPages, currentIsLoading) => {
    const container = chatContainerRef.current;
    if (container && container.scrollTop === 0 && !currentIsLoading && currentPage < currentTotalPages) {
      fetchMessages(chatId, currentPage, currentIsLoading, currentTotalPages);
    }
  };

  const handleSendMessage = async (userInput) => {
    if (!userInput.trim()) return;

    // User message is new, but doesn't need streaming
    setMessages((prev) => [...prev, { sender: "user", text: userInput, isNew: true }]);

    try {
      setIsBotResponding(true);

      if (!chatId) {
        const createRes = await chatApi.botCreatePath();
        const newChatId = createRes.botChatId;
        navigate(`/chatbot/${newChatId}?firstMessage=${encodeURIComponent(userInput)}`);
        return;
      }

      const response = await chatApi.botMsgPath(chatId, { userQuery: userInput });
      const botReply = response.botResponse;
      const botsources = response.sourceData;
      const followUps = response.followUpQuestions || [];

      // Bot message is new, needs streaming
      setMessages((prev) => [...prev, {
        sender: "bot",
        text: botReply,
        sources: botsources,
        followUpQuestions: followUps,
        isNew: true
      }]);

      // Scroll is handled by ChatBubble's typing effect for new messages
    } catch (error) {
      console.error("API 요청 실패:", error);
      setMessages((prev) => [
        ...prev,
        { sender: "bot", text: "⚠️ 서버 통신 오류가 발생했습니다." },
      ]);
    } finally {
      setIsBotResponding(false);
      setIsLoading(false);
    }
  };

  const handleDeleteRoom = async (roomId) => {
    setDeleteConfirmation({ isOpen: true, roomId });
  };

  const confirmDeleteRoom = async () => {
    const roomId = deleteConfirmation.roomId;
    try {
      await chatApi.botDeletePath(roomId);
      if (String(roomId) === String(chatId)) {
        navigate("/chatbot");
      }
      setIsOverlayOpen(false);
      setTimeout(() => setIsOverlayOpen(true), 50);
    } catch (err) {
      console.error("채팅방 삭제 실패:", err);
      alert(err.response?.data?.message || "삭제 중 오류가 발생했습니다.");
    } finally {
      setDeleteConfirmation({ isOpen: false, roomId: null });
    }
  };

  const cancelDeleteRoom = () => {
    setDeleteConfirmation({ isOpen: false, roomId: null });
  };

  useEffect(() => {
    if (chatId) {
      setMessages([]);
      setPage(0);
      setTotalPages(0);
      fetchMessages(chatId, 0, false, 0);
    }
    if (firstMessage) {
      handleSendMessage(firstMessage);
      window.history.replaceState({}, "", `/chatbot/${chatId}`);
    }
  }, [chatId]);

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
        setChatTitle("새로운 챗봇");
      }
    }
    loadRoomTitle();
  }, [chatId]);

  useEffect(() => {
    const container = chatContainerRef.current;
    if (!container) return;
    
    const handleScrollEvent = () => handleScroll(page, totalPages, isLoading);
    container.addEventListener("scroll", handleScrollEvent);
    return () => container.removeEventListener("scroll", handleScrollEvent);
  }, [page, totalPages, isLoading, chatId]);

  // Auto-scroll to bottom when new messages are added (if not loading history)
  useEffect(() => {
    if (page <= 1 && !isLoading) {
      const container = chatContainerRef.current;
      if (container) {
        container.scrollTop = container.scrollHeight;
      }
    }
  }, [messages, isBotResponding]);

  const handleFollowUpClick = (question) => {
    handleSendMessage(question);
  };

  return (
    <div className="flex flex-col h-full bg-slate-50 dark:bg-slate-950 relative transition-colors duration-300">
      <Header
        type="menu"
        title={chatTitle}
        onMenuClick={() => setIsOverlayOpen(true)}
      />

      <main
        className="flex-1 overflow-y-auto px-4 py-6 scrollbar-hide pb-2"
        ref={chatContainerRef}
      >
        {!chatId || messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-slate-400 gap-4">
            <div className="w-20 h-20 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
              <img src={logo} alt="pyxis logo" className="w-16 h-16 object-contain" />
            </div>
            <p className="font-medium text-slate-500 dark:text-slate-400">무엇이 궁금하신가요?</p>
          </div>
        ) : (
          <>
            {messages.map((msg, index) => (
              <ChatBubble
                key={index}
                message={msg}
                isBot={msg.sender === "bot" || msg.role === "assistant"}
                isLatest={index === messages.length - 1}
                scrollToBottom={() => {
                  const container = chatContainerRef.current;
                  if (container) {
                    // Only scroll if user is near bottom (within 100px)
                    const isNearBottom = container.scrollHeight - container.scrollTop - container.clientHeight < 100;
                    if (isNearBottom) {
                      container.scrollTop = container.scrollHeight;
                    }
                  }
                }}
              />
            ))}

            {isBotResponding && (
              <div className="flex justify-start mb-4">
                <div className="bg-white dark:bg-slate-800 rounded-2xl rounded-tl-none px-4 py-3 border border-slate-100 dark:border-slate-700 shadow-sm">
                  <LoadingSpinner />
                </div>
              </div>
            )}
          </>
        )}

        {/* Follow-up Questions at Bottom */}
        {messages.length > 0 && messages[messages.length - 1]?.followUpQuestions?.length > 0 && (
          <div className="px-4 pb-4">
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 mb-2 flex items-center gap-1">
              <Sparkles size={12} className="text-primary" />
              추천 질문
            </p>
            <div className="flex flex-wrap gap-2">
              {messages[messages.length - 1].followUpQuestions.map((question, i) => (
                <button
                  key={i}
                  onClick={() => handleFollowUpClick(question)}
                  className="px-3 py-1.5 rounded-full bg-white dark:bg-slate-800 border border-primary/20 dark:border-primary/40 text-primary dark:text-primary/90 text-xs font-medium hover:bg-primary/5 dark:hover:bg-primary/20 transition-colors shadow-sm"
                >
                  {question}
                </button>
              ))}
            </div>
          </div>
        )}
      </main>

      <ChatInput onSendMessage={handleSendMessage} disabled={isBotResponding} showPrompts={!chatId || messages.length === 0} />

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

      {deleteConfirmation.isOpen && (
        <div className="fixed inset-0 z-[10001] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="w-full max-w-sm bg-white dark:bg-slate-900 rounded-[32px] shadow-2xl p-6 border border-slate-100 dark:border-slate-800">
            <div className="text-center py-4">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-2">
                정말 삭제하시겠습니까?
              </h2>
              <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">
                삭제된 채팅은 복구할 수 없습니다.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={cancelDeleteRoom}
                  className="flex-1 px-4 py-3 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white font-medium hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                >
                  취소
                </button>
                <button
                  onClick={confirmDeleteRoom}
                  className="flex-1 px-4 py-3 rounded-lg bg-red-500 text-white font-medium hover:bg-red-600 transition-colors"
                >
                  삭제
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
