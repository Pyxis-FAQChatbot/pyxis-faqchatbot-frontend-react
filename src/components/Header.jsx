import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Menu, Search, ArrowLeft, Sticker, LogOut, Bell } from "lucide-react";
import { logoutPath } from "../api/loginApi";

export default function Header({ type = "main", title = "", onMenuClick }) {
  const navigate = useNavigate();
  const ICON_SIZE = 24;
  const [notificationCount, setNotificationCount] = useState(0);

  const handleLogout = async () => {
    try {
      await logoutPath();
      sessionStorage.removeItem("userInfo");
      navigate("/");
    } catch (error) {
      console.error("로그아웃 실패:", error);
      alert("로그아웃 중 오류가 발생했습니다.");
    }
  };

  const handleNotificationClick = () => {
    setNotificationCount((prev) => {
      if (prev >= 5) {
        return 0;
      }
      return prev + 1;
    });
  };

  const IconSwitch = () => {
    switch (type) {
      case "menu":
        return <Menu size={ICON_SIZE} />;
      case "search":
        return <Search size={ICON_SIZE} />;
      case "back":
        return <ArrowLeft size={ICON_SIZE} />;
      default:
        return <Sticker size={ICON_SIZE} />;
    }
  };

  return (
    <header className="sticky top-0 z-40 flex items-center justify-between px-6 py-4 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-100 dark:border-slate-800 transition-colors">
      <div className="flex items-center gap-3">
        {type === "main" ? (
          <button
            onClick={() => navigate("/main")}
            className="text-xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent hover:opacity-80 transition-opacity"
          >
            Pyxis
          </button>
        ) : (
          <div className="flex items-center gap-3">
            <button
              onClick={onMenuClick || (() => navigate(-1))}
              className="p-2 -ml-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-slate-700 dark:text-slate-300"
            >
              {IconSwitch()}
            </button>
            <h1 className="text-lg font-semibold text-slate-900 dark:text-white">{title}</h1>
          </div>
        )}
      </div>
      
      <div className="flex items-center gap-2">
        <button
          onClick={handleNotificationClick}
          className="p-2 -mr-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 dark:text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 transition-colors relative"
          title="알림"
        >
          <Bell size={20} />
          {notificationCount > 0 && notificationCount <= 5 && (
            <div className="absolute bottom-0 right-0 w-4 h-4 bg-red-500 rounded-full flex items-center justify-center leading-none">
              <span className="text-white text-[10px] font-bold">{notificationCount}</span>
            </div>
          )}
        </button>
        <button
          onClick={handleLogout}
          className="p-2 -mr-2 rounded-full hover:bg-red-50 dark:hover:bg-red-900/20 text-slate-400 dark:text-slate-500 hover:text-red-500 dark:hover:text-red-400 transition-colors"
          title="로그아웃"
        >
          <LogOut size={20} />
        </button>
      </div>
    </header>
  );
}
