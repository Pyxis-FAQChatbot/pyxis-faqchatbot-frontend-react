import React, { useState, useEffect } from 'react';
import { Moon, Sun, BatteryFull, Wifi } from 'lucide-react';

const MobileLayout = ({ children, enableScroll = true }) => {
    const [currentTime, setCurrentTime] = useState(new Date());
    const [isDarkMode, setIsDarkMode] = useState(false);

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

    const toggleTheme = () => {
        setIsDarkMode(!isDarkMode);
        if (!isDarkMode) {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
    };

    return (
        <div className="min-h-screen w-full flex items-center justify-center bg-white p-4 sm:p-8 transition-colors duration-300">
            {/* Mobile Frame */}
            <div className="relative w-full max-w-[400px] h-[850px] bg-white dark:bg-slate-950 rounded-[40px] shadow-2xl overflow-hidden border-[8px] border-slate-900 dark:border-slate-800 transition-colors duration-300 flex flex-col">
                {/* Status Bar */}
                <div className="absolute top-0 left-0 right-0 h-11 z-50 flex justify-between items-center px-6 text-xs font-medium text-slate-900 dark:text-white">
                    {/* Real-time Clock */}
                    <span className="font-semibold">{formatTime(currentTime)}</span>

                    <div className="flex items-center gap-3">
                        {/* Theme Toggle */}
                        <button
                            onClick={toggleTheme}
                            className="p-1 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                        >
                            {isDarkMode ? <Sun size={14} /> : <Moon size={14} />}
                        </button>

                        {/* macOS-style Dots */}
                        <div className="flex gap-1.5">
                            <Wifi size={16} />
                            <BatteryFull size={16} />
                        </div>
                    </div>
                </div>

                {/* Content Area */}
                <div className={`flex-1 overflow-x-hidden pt-11 scrollbar-hide bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors duration-300 ${enableScroll ? 'overflow-y-auto pb-6' : 'overflow-hidden'
                    }`}>
                    {children}
                </div>

                {/* Home Indicator */}
                <div className="absolute bottom-2 left-1/2 -translate-x-1/2 w-32 h-1 bg-slate-900/20 dark:bg-white/20 rounded-full"></div>
            </div>
        </div>
    );
};

export default MobileLayout;
