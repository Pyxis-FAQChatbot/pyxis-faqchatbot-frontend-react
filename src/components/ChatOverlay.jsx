import React, { useState, useEffect, useRef } from "react";
import { botRoomPath } from "../api/chatApi";
import { X, Plus, MessageSquare, Trash2 } from "lucide-react";

export default function ChatOverlay({ isOpen, onClose, onSelectRoom, onNewChat, onDeleteRoom }) {
  const PAGE_SIZE = 10;
  const [rooms, setRooms] = useState([]);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const listRef = useRef(null);

  const fetchRooms = async (pageNum) => {
    try {
      const res = await botRoomPath(pageNum, PAGE_SIZE);
      const newRooms = res.items || [];

      if (newRooms.length === 0) {
        setHasMore(false);
        return;
      }

      const sorted = newRooms.sort(
        (a, b) => new Date(b.lastMessageAt) - new Date(a.lastMessageAt)
      );

      setRooms((prev) => (pageNum === 0 ? sorted : [...prev, ...sorted]));
    } catch (err) {
      console.error("채팅방 목록 로드 실패:", err);
    }
  };

  useEffect(() => {
    if (isOpen) {
      setRooms([]);
      setPage(0);
      setHasMore(true);
      fetchRooms(0);
    }
  }, [isOpen]);

  const handleScroll = () => {
    const list = listRef.current;
    if (!list || !hasMore) return;
    if (list.scrollTop + list.clientHeight >= list.scrollHeight - 10) {
      setPage((prev) => prev + 1);
    }
  };

  useEffect(() => {
    if (page > 0 && hasMore) {
      fetchRooms(page);
    }
  }, [page]);

  return (
    <>
      {/* Backdrop */}
      <div
        className={`absolute inset-0 bg-slate-900/20 backdrop-blur-sm z-40 transition-opacity duration-300 ${isOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
          }`}
        onClick={onClose}
      ></div>

      {/* Drawer */}
      <div className={`absolute top-0 left-0 bottom-0 w-[80%] max-w-[320px] bg-white dark:bg-slate-900 z-40 shadow-2xl transition-transform duration-300 ease-out flex flex-col ${isOpen ? "translate-x-0" : "-translate-x-full"
        }`}>
        {/* Header */}
        <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50/50 dark:bg-slate-800/50 transition-colors">
          <div>
            <h2 className="text-xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">Pyxis</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">채팅 히스토리</p>
          </div>
          <button onClick={onClose} className="p-2 -mr-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors">
            <X size={20} />
          </button>
        </div>

        {/* New Chat Button */}
        <div className="p-4">
          <button
            onClick={onNewChat}
            className="w-full py-3 px-4 rounded-xl bg-primary/5 dark:bg-primary/10 text-primary dark:text-primary/90 font-semibold hover:bg-primary/10 dark:hover:bg-primary/20 transition-colors flex items-center justify-center gap-2"
          >
            <Plus size={20} />
            새로운 채팅 시작
          </button>
        </div>

        {/* Room List */}
        <div
          className="flex-1 overflow-y-auto px-4 pb-4 space-y-2"
          ref={listRef}
          onScroll={handleScroll}
        >
          {rooms.map((room) => (
            <div
              key={room.botchatId}
              className="group flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer border border-transparent hover:border-slate-100 dark:hover:border-slate-700 transition-all"
              onClick={() => onSelectRoom(room.botchatId)}
            >
              <div className="flex items-center gap-3 overflow-hidden">
                <div className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500 group-hover:bg-white dark:group-hover:bg-slate-700 group-hover:text-primary group-hover:shadow-sm transition-all">
                  <MessageSquare size={18} />
                </div>
                <span className="text-sm font-medium text-slate-700 dark:text-slate-300 truncate">
                  {room.title?.trim() ? room.title : "새로운 챗봇"}
                </span>
              </div>

              <button
                className="p-1.5 rounded-lg text-slate-300 hover:text-red-500 hover:bg-red-50 opacity-0 group-hover:opacity-100 transition-all"
                onClick={(e) => {
                  e.stopPropagation();
                  onDeleteRoom(room.botchatId);
                }}
              >
                <Trash2 size={16} />
              </button>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
