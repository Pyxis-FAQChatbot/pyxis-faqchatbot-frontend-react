import React from "react";
import { useNavigate } from "react-router-dom";
import { Menu, Search, ArrowLeft, Sticker } from "lucide-react";
import { logoutPath } from "../api/loginApi";
import "../styles/header.css";

export default function Header({ type = "main", title = "", onMenuClick }) {
  const navigate = useNavigate();
  const ICON_SIZE = 28;
  // ✅ 로그아웃 요청 함수
  const handleLogout = async () => {
    try {
      // 백엔드 로그아웃 API 호출
      await logoutPath();

      // 토큰 제거 (로컬스토리지 또는 세션스토리지)
      sessionStorage.removeItem("userInfo");

      // 로그인 페이지로 이동
      navigate("/");
    } catch (error) {
      console.error("로그아웃 실패:", error);
      alert("로그아웃 중 오류가 발생했습니다.");
    }
  };
  const IconSwitch = ()=>{
    switch (type) {
      case "menu":
        return <Menu size={ICON_SIZE} />
      case "search":
        return <Search size={ICON_SIZE} />
      case "back":
        return <ArrowLeft size={ICON_SIZE} />
      default :
        return <Sticker size={ICON_SIZE} />
    }
  }

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
            {IconSwitch()}
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
