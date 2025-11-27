import React from "react";

export default function LoadingSpinner() {
  return (
    <div className="flex items-center gap-2 p-2">
      <div className="flex gap-1">
        <div className="w-2 h-2 rounded-full bg-primary animate-bounce [animation-delay:-0.3s]"></div>
        <div className="w-2 h-2 rounded-full bg-primary animate-bounce [animation-delay:-0.15s]"></div>
        <div className="w-2 h-2 rounded-full bg-primary animate-bounce"></div>
      </div>
      <span className="text-xs text-slate-400 font-medium">답변 생성 중...</span>
    </div>
  );
}