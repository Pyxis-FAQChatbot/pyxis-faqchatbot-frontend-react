import React, { useState } from "react";
import { Send, Sparkles } from "lucide-react";

export default function ChatInput({ onSendMessage, disabled, showPrompts = false }) {
  const [inputValue, setInputValue] = useState("");

  const handleSend = () => {
    if (inputValue.trim() && onSendMessage) {
      onSendMessage(inputValue);
      setInputValue("");
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const QuickPrompt = ({ text }) => (
    <button
      onClick={() => onSendMessage(text)}
      className="px-3 py-1.5 rounded-full bg-white dark:bg-slate-800 border border-primary/20 dark:border-primary/40 text-primary dark:text-primary/90 text-xs font-medium hover:bg-primary/5 dark:hover:bg-primary/20 transition-colors flex items-center gap-1 whitespace-nowrap shadow-sm"
    >
      <Sparkles size={12} />
      {text}
    </button>
  );

  return (
    <div className="p-4 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-t border-slate-100 dark:border-slate-800 transition-colors">
      {/* Quick Prompts - Only show when chat is empty */}
      {showPrompts && (
        <div className="flex flex-col items-end gap-2 pb-3">
          <QuickPrompt text="오늘의 정책 추천해줘" />
          <QuickPrompt text="최신 정책 알려줘" />
          <QuickPrompt text="소상공인 지원금?" />
        </div>
      )}

      <div className="relative flex items-center">
        <input
          type="text"
          placeholder="메시지를 입력하세요..."
          className="w-full pl-5 pr-12 py-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 text-slate-800 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:bg-white dark:focus:bg-slate-700 transition-all"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={disabled}
        />
        <button
          className={`absolute right-2 p-2 rounded-xl transition-all ${inputValue.trim()
            ? 'bg-primary text-white shadow-glow hover:scale-105'
            : 'bg-slate-200 text-slate-400 cursor-not-allowed'
            }`}
          onClick={handleSend}
          disabled={!inputValue.trim() || disabled}
        >
          <Send size={18} />
        </button>
      </div>
    </div>
  );
}