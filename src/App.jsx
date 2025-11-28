import React from "react";
import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";
import { useState } from 'react';
import Login from "./page/Login.jsx";
import Signup from './page/Signup.jsx';
import Chatbot from './page/ChatPage.jsx';
import Main from './page/MainPage.jsx';
import Community from './page/CommPage.jsx';
import MyPage from './page/MyPage.jsx'
import MobileLayout from './components/layout/MobileLayout';
import BottomNav from './components/layout/BottomNav';

function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

function AppContent() {
  const location = useLocation();
  const isLoginPage = location.pathname === '/';
  const isSignupPage = location.pathname === '/signup';
  const isAuthPage = isLoginPage || isSignupPage;

  // Login page: No scroll.
  // Signup page: Scroll enabled.
  // Other pages: Scroll enabled.
  const enableScroll = !isLoginPage;

  return (
    <MobileLayout enableScroll={enableScroll}>
      <div className="h-full flex flex-col">
        <div className={`flex-1 ${isLoginPage ? 'overflow-hidden' : 'overflow-y-auto'}`}>
          <Routes>
            <Route path="/" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/chatbot" element={<Chatbot />} />
            <Route path="/chatbot/:chatId" element={<Chatbot />} />
            <Route path="/community" element={<Community />} />
            <Route path="/community/:postId" element={<Community />} />
            <Route path="/community/write" element={<Community />} />
            <Route path="/main" element={<Main />} />
            <Route path="/mypage" element={<MyPage />} />
          </Routes>
        </div>
        {!isAuthPage && <BottomNav />}
      </div>
    </MobileLayout>
  );
}

export default App;
