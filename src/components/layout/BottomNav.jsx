import React from 'react';
import { Home, MessageCircle, Users, User } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';

const BottomNav = () => {
    const navigate = useNavigate();
    const location = useLocation();

    const navItems = [
        { icon: Home, label: 'Home', path: '/main' },
        { icon: MessageCircle, label: 'Chat', path: '/chatbot' },
        { icon: Users, label: 'Community', path: '/community' },
        { icon: User, label: 'My', path: '/mypage' },
    ];

    // Don't show nav on login/signup
    if (['/', '/signup'].includes(location.pathname)) return null;

    return (
        <div className="absolute bottom-0 left-0 right-0 bg-white/80 backdrop-blur-md border-t border-slate-100 px-6 py-4 rounded-b-[32px]">
            <div className="flex justify-between items-center">
                {navItems.map((item) => {
                    const isActive = location.pathname.startsWith(item.path);
                    return (
                        <button
                            key={item.path}
                            onClick={() => navigate(item.path)}
                            className={`flex flex-col items-center gap-1 transition-all duration-300 ${isActive ? 'text-primary' : 'text-slate-400 hover:text-slate-600'
                                }`}
                        >
                            <div className={`p-2 rounded-xl transition-all ${isActive ? 'bg-primary/10 shadow-glow' : 'bg-transparent'
                                }`}>
                                <item.icon size={24} strokeWidth={isActive ? 2.5 : 2} />
                            </div>
                            <span className="text-[10px] font-medium">{item.label}</span>
                        </button>
                    );
                })}
            </div>
        </div>
    );
};

export default BottomNav;
