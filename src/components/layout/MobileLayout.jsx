import React, { useState, useEffect } from 'react';

const MobileLayout = ({ children }) => {
    const [currentTime, setCurrentTime] = useState(new Date());

    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentTime(new Date());
        }, 1000);

        return () => clearInterval(timer);
    }, []);

    const formatTime = (date) => {
        return date.toLocaleTimeString('ko-KR', {
            hour: '2-digit',
            minute: '2-digit',
            hour12: false
        });
    };

    return (
        <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-2 font-sans">
            <div className="relative w-full max-w-[420px] h-[920px] bg-white rounded-[40px] shadow-2xl overflow-hidden border-[8px] border-slate-800 ring-2 ring-slate-700/50 flex flex-col">
                {/* Status Bar */}
                <div className="absolute top-0 left-0 right-0 h-11 z-50 flex justify-between items-center px-6 text-xs font-medium text-slate-900">
                    {/* Real-time Clock */}
                    <span className="font-semibold">{formatTime(currentTime)}</span>

                    {/* macOS-style Dots */}
                    <div className="flex gap-1.5">
                        <div className="w-3 h-3 rounded-full bg-red-500 hover:bg-red-600 transition-colors cursor-pointer"></div>
                        <div className="w-3 h-3 rounded-full bg-yellow-500 hover:bg-yellow-600 transition-colors cursor-pointer"></div>
                        <div className="w-3 h-3 rounded-full bg-green-500 hover:bg-green-600 transition-colors cursor-pointer"></div>
                    </div>
                </div>

                {/* Content Area */}
                <div className="flex-1 overflow-y-auto overflow-x-hidden pt-11 pb-6 scrollbar-hide">
                    {children}
                </div>

                {/* Home Indicator */}
                <div className="absolute bottom-2 left-1/2 -translate-x-1/2 w-32 h-1 bg-slate-900/20 rounded-full"></div>
            </div>
        </div>
    );
};

export default MobileLayout;
