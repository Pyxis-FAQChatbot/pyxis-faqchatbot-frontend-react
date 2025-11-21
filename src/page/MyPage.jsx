import React, { useEffect, useState } from "react";
import Header from "../components/Header";
import BottomNav from "../components/BottomNav";
import { useNavigate } from "react-router-dom";
import { botRoomPath } from "../api/chatApi";
import { timeAgo } from "../utils/timeAgo";
import "../styles/MyPage.css";

export default function MyPage() {
  const navigate = useNavigate();
  const [recentChat, setRecentChat] = useState(null);
  const [myInfo, setMyInfo] = useState([]);

  const fetchRecentChat = async () =>{
    try {
      const res = await botRoomPath(0, 1);
      if (res.items && res.items.length > 0) {
        setRecentChat(res.items[0]);
      } else {
        setRecentChat(null);
      }
    } catch (err) {
      console.error('채팅내역 로드 실패:', err);
    }
  };
  const fetchMyInfo = async () => {

  }
  useEffect(()=> {
    fetchRecentChat();
  }, []);
  return (
    <div className="mypage-container">
      <Header type = "main"/>

      <main className="mypage-content">
        <div>
          {/* 🔹 상단 좌우배치 영역 (750px 이상부터 적용) */}
          <div className="top-grid">

            {/* 핵심 계정 정보 */}
            <section className="profile-card card">
              <h3>계정 정보</h3>
              <div className="profile-item">
                <span className="label">닉네임</span>
                <span>NICKNAME</span>
              </div>
              <div className="profile-item">
                <span className="label">로그인 ID</span>
                <span>loginId</span>
              </div>
              <div className="profile-item">
                <span className="label">지역</span>
                <span>서울</span>
              </div>
              <div className="profile-item">
                <span className="label">가입일</span>
                <span>2025-11-04</span>
              </div>
            </section>

            {/* 설정 섹션 */}
            <section className="settings-card card">
              <h3>설정</h3>
              <div className="setting-item">
                비밀번호 변경
              </div>
              <div className="setting-item">
                알림 설정
              </div>
            </section>

          </div>

          {/* 🔹 활동 섹션 */}
          <section className="activity-section">

            {/* 최근 이용한 챗봇 */}
            <div
              className="recent-chat card pointer"
              onClick={() => navigate(`/chatbot/${recentChat.botchatId}`)}
            >
              {recentChat ? (
                <>
                  <div className="title-row">
                    <h3 className="chat-title">
                      {recentChat.title || "챗봇 상담"}
                    </h3>
                    <span className="chat-time-short">
                      {timeAgo(recentChat.lastMessageAt ||
                        recentChat.createdAt)}
                    </span>
                  </div>

                  <p className="chat-last-message">
                    {recentChat.lasMessage || "메시지가 없습니다."}
                  </p>
                </>
              ) : (
                <p>최근 이용한 챗봇이 없습니다.</p>
              )}
            </div>

            {/* 좌우 배치 (750px 이상) */}
            <div className="activity-grid">
              <div className="card">
                <h3>내가 쓴 글</h3>
                <p>등록된 글이 없습니다.</p>
              </div>
              <div className="card">
                <h3>내가 쓴 댓글</h3>
                <p>등록된 댓글이 없습니다.</p>
              </div>
            </div>

          </section>
        </div>

        {/* 맨 아래 회원 탈퇴 */}
        <div className="withdraw-box">
          <span className="withdraw">
            회원 탈퇴
          </span>
        </div>

      </main>

      <BottomNav active="mypage" />
    </div>
  );
}