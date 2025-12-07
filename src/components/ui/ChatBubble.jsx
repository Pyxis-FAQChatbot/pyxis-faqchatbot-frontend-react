import React from 'react';
import { FileText, ExternalLink } from 'lucide-react';
import { useTypingEffect } from '../../hooks/useTypingEffect';
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

export default function ChatBubble({ message, isBot, isLatest, scrollToBottom, onTypingComplete }) {
    // Apply typing effect only to bot messages AND if it's a NEW message (not history)
    const shouldType = isBot && message.isNew;
    // 25ms per character typing speed
    const displayText = useTypingEffect(message.text, 25, shouldType);

    // If not typing, use full text
    const finalDisplay = shouldType ? displayText : message.text;
    
    // 타이핑 완료 여부 판정
    const isTypingComplete = !shouldType || (displayText.length === message.text.length);

    // Notify parent when typing is complete
    React.useEffect(() => {
        if (isTypingComplete && onTypingComplete) {
            onTypingComplete();
        }
    }, [isTypingComplete, onTypingComplete]);

    // Auto-scroll when text updates
    const cursorRef = React.useRef(null);
    React.useEffect(() => {
        if (shouldType && cursorRef.current) {
            cursorRef.current.scrollIntoView({ block: "nearest", behavior: "smooth" });
        }
    }, [displayText, shouldType]);

    return (
        <div className={`flex ${isBot ? "justify-start" : "justify-end"} mb-4 animate-float`}>
            <div
                className={`max-w-[85%] px-4 py-3 rounded-2xl shadow-sm transition-colors duration-300 ${isBot
                    ? "bg-gradient-to-br from-white to-slate-50 dark:from-slate-800 dark:to-slate-900 text-slate-800 dark:text-slate-100 border border-slate-100 dark:border-slate-700"
                    : "bg-gradient-to-br from-primary to-secondary text-white shadow-glow"
                    }`}
            >
                <div className={`text-sm leading-relaxed whitespace-pre-wrap break-words ${isBot ? "markdown-body" : ""}`}>
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                        {finalDisplay}
                    </ReactMarkdown>
                </div>

                {shouldType && finalDisplay.length < message.text.length && (
                    <span ref={cursorRef} className="inline-block w-1 h-4 ml-0.5 bg-slate-400 animate-pulse"></span>
                )}

                {/* Reference Materials */}
                {isBot && message.sources?.length > 0 && isTypingComplete && (
                    <div className="mt-3 pt-3 border-t border-slate-100/50 dark:border-slate-700/50">
                        <div className="flex items-center gap-1.5 mb-2">
                            <FileText size={11} className="text-primary/70" />
                            <p className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">
                                참고 자료
                            </p>
                        </div>
                        <div className="space-y-1.5">
                            {message.sources.map((src, i) => {
                                const isUnavailable = src.url === "N/A" || !src.url;
                                
                                if (isUnavailable) {
                                    return (
                                        <div
                                            key={i}
                                            className="block p-2.5 rounded-lg bg-gradient-to-br from-slate-50/80 to-slate-50/40 dark:from-slate-800 dark:to-slate-800/50 border border-slate-100/80 dark:border-slate-700 transition-all duration-200 opacity-50 cursor-not-allowed"
                                        >
                                            <div className="flex items-start gap-2">
                                                <div className="p-1 rounded bg-primary/5 transition-colors">
                                                    <ExternalLink size={11} className="text-primary" />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <div className="text-[11px] font-medium text-slate-700 dark:text-slate-200 transition-colors leading-snug line-clamp-2 mb-0.5">
                                                        {src.title}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                }
                                
                                return (
                                    <a
                                        key={i}
                                        href={src.url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="block p-2.5 rounded-lg bg-gradient-to-br from-slate-50/80 to-slate-50/40 dark:from-slate-800 dark:to-slate-800/50 hover:from-primary/5 hover:to-primary/10 border border-slate-100/80 dark:border-slate-700 hover:border-primary/20 hover:shadow-sm transition-all duration-200 group"
                                    >
                                        <div className="flex items-start gap-2">
                                            <div className="p-1 rounded bg-primary/5 group-hover:bg-primary/10 transition-colors">
                                                <ExternalLink size={11} className="text-primary group-hover:scale-110 transition-transform" />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="text-[11px] font-medium text-slate-700 dark:text-slate-200 group-hover:text-primary transition-colors leading-snug line-clamp-2 mb-0.5">
                                                    {src.title}
                                                </div>
                                                <div className="text-[9px] text-slate-400 truncate font-mono">
                                                    {src.url.replace(/^https?:\/\//, '')}
                                                </div>
                                            </div>
                                        </div>
                                    </a>
                                );
                            })}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
