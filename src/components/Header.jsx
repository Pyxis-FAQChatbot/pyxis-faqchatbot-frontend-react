import React from "react";
import { useNavigate } from "react-router-dom";
import { Menu } from "lucide-react";
import { logoutPath } from "../api/loginApi";
import "../styles/header.css";

export default function Header({ type = "chat", title = "", onMenuClick }) {
  const navigate = useNavigate();

  // ✅ 로그아웃 요청 함수
  const handleLogout = async () => {
    try {
      // 백엔드 로그아웃 API 호출
      await logoutPath();

      // 토큰 제거 (로컬스토리지 또는 세션스토리지)
      localStorage.removeItem("token");
      sessionStorage.removeItem("token");

      // 로그인 페이지로 이동
      navigate("/");
    } catch (error) {
      console.error("로그아웃 실패:", error);
      alert("로그아웃 중 오류가 발생했습니다.");
    }
  };

  return (
    <header className="header">
      {type === "main" ? (
        <>
          <div className="header-logo"></div>
          <h1 className="header-title">Pyxis</h1>
        </>
      ) : (
        <>
          <button className="menu-button"onClick={onMenuClick}>
            <Menu size={24} />
          </button>
          <h1 className="header-title">{title}</h1>
        </>
      )}
      <button 
        className="logout-button" 
        onClick={handleLogout}>
        로그아웃
      </button>
    </header>
  );
}
