import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "../styles/BottomNav.css";

export default function BottomNav() {
  const navigate = useNavigate();
  const location = useLocation();
  const currentPath = location.pathname;

  return (
    <nav className="bottom-nav">
      <button
        className={`nav-button home ${currentPath === "/main" ? "active" : ""}`}
        onClick={() => navigate("/main")}
      >
        <span>홈</span>
      </button>

      <button
        className={`nav-button chat ${currentPath === "/chat" ? "active" : ""}`}
        onClick={() => navigate("/chatbot")}
      >
        <span>채팅</span>
      </button>

      <button
        className={`nav-button community ${
          currentPath === "/community" ? "active" : ""
        }`}
        onClick={() => navigate("/community")}
      >
        <span>커뮤니티</span>
      </button>

      <button
        className={`nav-button trade ${currentPath === "/trade" ? "active" : ""}`}
        onClick={() => navigate("/trade")}
      >
        <span>거래</span>
      </button>

      <button
        className={`nav-button mypage ${
          currentPath === "/mypage" ? "active" : ""
        }`}
        onClick={() => navigate("/mypage")}
      >
        <span>마이페이지</span>
      </button>
    </nav>
  );
}