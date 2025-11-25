import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { useState } from 'react';
import Login from "./page/Login.jsx";
import Signup from './page/Signup.jsx';
import Chatbot from './page/ChatPage.jsx';
import Main from './page/MainPage.jsx';
import Community from './page/CommPage.jsx';
import MyPage from './page/MyPage.jsx'
import "./App.css";

function App() {
  return (
    <>
      <div id="background-layer">
        <div className="stars"></div>
        <div className="shooting-star"></div>
        <div className="shooting-star"></div>
        <div className="shooting-star"></div>
        <div className="shooting-star"></div>
        <div className="shooting-star"></div>
      </div>
      <Router>
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
      </Router>
    </>
  );
}

export default App;
