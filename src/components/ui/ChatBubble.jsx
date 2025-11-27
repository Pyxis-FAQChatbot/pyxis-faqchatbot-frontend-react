import React from 'react';
import { FileText, ExternalLink } from 'lucide-react';
import { useTypingEffect } from '../../hooks/useTypingEffect';

export default function ChatBubble({ message, isBot, onFollowUpClick }) {
    // Apply typing effect only to bot messages
    const displayText = useTypingEffect(message.text, 15, isBot);

    return (
        <div className={`flex ${isBot ? "justify-start" : "justify-end"} mb-4 animate-float`}>
            <div
                className={`max-w-[85%] px-4 py-3 rounded-2xl shadow-sm ${isBot
                    ? "bg-gradient-to-br from-white to-slate-50 text-slate-800 border border-slate-100"
                    : "bg-gradient-to-br from-primary to-secondary text-white shadow-glow"
                    }`}
            >
                <p className="text-sm leading-relaxed whitespace-pre-wrap break-words">
                    {displayText}
                    {isBot && displayText.length < message.text.length && (
                        <span className="inline-block w-1 h-4 ml-0.5 bg-slate-400 animate-pulse"></span>
                    )}
                </p>

                {/* Reference Materials */}
                {isBot && message.sources?.length > 0 && (
                    <div className="mt-3 pt-3 border-t border-slate-100/50">
                        <div className="flex items-center gap-1.5 mb-2">
                            <FileText size={11} className="text-primary/70" />
                            <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-wide">
                                참고 자료
                            </p>
                        </div>
                        <div className="space-y-1.5">
                            {message.sources.map((src, i) => (
                                <a
                                    key={i}
                                    href={src.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="block p-2.5 rounded-lg bg-gradient-to-br from-slate-50/80 to-slate-50/40 hover:from-primary/5 hover:to-primary/10 border border-slate-100/80 hover:border-primary/20 hover:shadow-sm transition-all duration-200 group"
                                >
                                    <div className="flex items-start gap-2">
                                        <div className="p-1 rounded bg-primary/5 group-hover:bg-primary/10 transition-colors">
                                            <ExternalLink size={11} className="text-primary group-hover:scale-110 transition-transform" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="text-[11px] font-medium text-slate-700 group-hover:text-primary transition-colors leading-snug line-clamp-2 mb-0.5">
                                                {src.title}
                                            </div>
                                            <div className="text-[9px] text-slate-400 truncate font-mono">
                                                {src.url.replace(/^https?:\/\//, '')}
                                            </div>
                                        </div>
                                    </div>
                                </a>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
