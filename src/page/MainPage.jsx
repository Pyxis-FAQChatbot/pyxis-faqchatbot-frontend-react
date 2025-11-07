import React from 'react';
import Header from "../components/Header";
import BottomNav from "../components/BottomNav";
import StoreForm from "../components/StoreFoam";
import '../styles/MainPage.css';

export default function MainPage() {
  const [showStoreForm, setShowStoreForm] = useState(true);

  return (
    <div className="main-container">
      {showCompanyModal && (
        <CompanyInfoModal onClose={() => setShowCompanyModal(false)} />
      )}
      <Header type="main" />
      <main className="main-content">
        {/* 중앙 빈 공간 */}
      </main>
      <BottomNav active="home" />
    </div>
  );
}
