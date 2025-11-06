import React from 'react';
import Header from "../components/Header";
import BottomNav from "../components/BottomNav";
import '../styles/MainPage.css';

function MainPage() {
  return (
    <div className="main-container">
      <Header type="main" />
      <main className="main-content">
        {/* 중앙 빈 공간 */}
      </main>
      <BottomNav active="home" />
    </div>
  );
}

export default MainPage;