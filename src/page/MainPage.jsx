import React, { useEffect, useState } from 'react';
import Header from "../components/Header";
import StoreForm from "../components/StoreForm";
import Card from "../components/ui/Card";
import { MessageCircle, Users, User, ArrowRight, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

import { myInfoPath } from "../api/authApi";

export default function MainPage() {
  const [showStoreForm, setShowStoreForm] = useState(false);
  const navigate = useNavigate();
  const [userInfo, setUserInfo] = useState(null);

  useEffect(() => {
    const justSignedUp = sessionStorage.getItem("showSignupPopup");
    if (justSignedUp === "true") {
      setShowStoreForm(true);
      sessionStorage.removeItem("showSignupPopup");
    }

    const fetchUser = async () => {
      try {
        const res = await myInfoPath();
        setUserInfo(res);
        // Update session storage as well
        sessionStorage.setItem("userInfo", JSON.stringify(res));
      } catch (e) {
        console.error("Failed to fetch user info", e);
        // Fallback to session storage if API fails
        const storedUser = sessionStorage.getItem("userInfo");
        if (storedUser) {
          setUserInfo(JSON.parse(storedUser));
        }
      }
    };
    fetchUser();
  }, []);

  const QuickAction = ({ icon: Icon, label, desc, path, color }) => (
    <button
      onClick={() => navigate(path)}
      className="w-full text-left group"
    >
      <Card className="h-full bg-white dark:bg-slate-900 shadow-md hover:shadow-xl hover:scale-[1.02] transition-transform duration-300 !p-5 border-l-4" style={{ borderLeftColor: color }}>
        <div className="flex justify-between items-start mb-3">
          <div className={`p-3 rounded-2xl bg-slate-50 text-slate-900 group-hover:bg-primary/10 group-hover:text-primary transition-colors`}>
            <Icon size={24} />
          </div>
          <ArrowRight size={20} className="text-slate-300 group-hover:text-primary transition-colors" />
        </div>
        <h3 className="font-bold text-slate-900 mb-1">{label}</h3>
        <p className="text-xs text-slate-500">{desc}</p>
      </Card>
    </button>
  );

  return (
    <div className="min-h-full bg-slate-50/50">
      {showStoreForm && (
        <StoreForm onClose={() => setShowStoreForm(false)} />
      )}

      <Header type="main" />

      <main className="p-6 space-y-8">
        {/* Welcome Section */}
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-primary font-medium text-sm">
            <Sparkles size={16} />
            <span>Welcome back</span>
          </div>
          <h2 className="text-3xl font-bold text-slate-900">
            {userInfo?.nickname || 'Guest'}님,<br />
            안녕하세요!
          </h2>
        </div>

        {/* Quick Actions Grid */}
        <div className="grid grid-cols-2 gap-4">
          <QuickAction
            icon={MessageCircle}
            label="AI 채팅"
            desc="궁금한 점을 물어보세요"
            path="/chatbot"
            color="#6366f1"
          />
          <QuickAction
            icon={Users}
            label="커뮤니티"
            desc="다른 사장님들과 소통해요"
            path="/community"
            color="#ec4899"
          />
        </div>

        {/* Recent Activity / Banner */}
        <Card className="!bg-gradient-to-br !from-slate-900 !to-slate-800 !text-white !border-none overflow-hidden relative">
          <div className="relative z-10">
            <h3 className="text-lg font-bold mb-2">내 정보 관리</h3>
            <p className="text-slate-400 text-sm mb-4">
              사업장 정보를 등록하고<br />맞춤형 서비스를 받아보세요.
            </p>
            <button
              onClick={() => navigate('/mypage')}
              className="px-4 py-2 bg-white/10 hover:bg-white/20 backdrop-blur-md rounded-xl text-sm font-medium transition-colors"
            >
              관리하기
            </button>
          </div>

          {/* Decorative Circles */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-primary/30 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-secondary/30 rounded-full blur-2xl translate-y-1/2 -translate-x-1/2"></div>
        </Card>
      </main>
    </div>
  );
}
