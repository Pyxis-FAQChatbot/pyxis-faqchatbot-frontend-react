import React, { useEffect, useState } from 'react';
import Header from "../components/Header";
import BottomNav from "../components/BottomNav";
import StoreForm from "../components/StoreFoam";
import '../styles/MainPage.css';

export default function MainPage() {
  const [showStoreForm, setShowStoreForm] = useState(false);
  useEffect(() => {
    const justSignedUp = localStorage.getItem("justSignedUp");
    if (justSignedUp === "true") {
      setShowModal(true);
      localStorage.removeItem("justSignedUp"); // ✅ 1회성
    }
  }, []);
  return (
    <div className="main-container">
      {showStoreForm && (
        <StoreForm onClose={() => setShowStoreForm(false)} />
      )}
      <Header type="main" />
      <main className="main-content">
        {/* 중앙 빈 공간 */}
      </main>
      <BottomNav active="home" />
    </div>
  );
}
