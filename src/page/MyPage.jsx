import React, { useEffect, useState } from "react";
import Header from "../components/Header";
import BottomNav from "../components/BottomNav";
import StoreForm from "../components/StoreFoam";
import { useNavigate } from "react-router-dom";
import { botRoomPath } from "../api/chatApi";
import { timeAgo } from "../utils/timeAgo";
import { myInfoPath, myPostPath, myCommentPath } from "../api/authApi";
import "../styles/MyPage.css";

export default function MyPage() {
  const navigate = useNavigate();
  const [recentChat, setRecentChat] = useState(null);
  const [myInfo, setMyInfo] = useState([]);
  const [showStoreForm, setShowStoreForm] = useState(false);
  const [myPosts, setMyPosts] = useState([]);
  const [page, setPage] = useState(0);       // 현재 페이지
  const [totalPages, setTotalPages] = useState(1); // 전체 페이지
  const [myComments, setMyComments] = useState([]);
  const [commentPage, setCommentPage] = useState(0);
  const [commentTotalPages, setCommentTotalPages] = useState(1);
  const size = 5;
  const cmtsize = 8;

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
    try {
      const res = await myInfoPath(); // 👈 너가 만든 GET api 함수명으로 변경!
      setMyInfo(res);
    } catch (err) {
      console.error("내 정보 불러오기 실패:", err);
    }
  };
  const fetchMyPosts = async (pageNum = page) => {
    try {
      const res = await myPostPath(pageNum, size); // 너의 API 함수 이름
      setMyPosts(res.items);         // 게시글 목록
      setTotalPages(res.totalPages); // 전체 페이지 수
    } catch (err) {
      console.error("내가 쓴 글 조회 실패:", err);
    }
  };
  const fetchMyComments = async (pageNum = commentPage) => {
    try {
      const res = await myCommentPath(pageNum, cmtsize); 
      setMyComments(res.items);
      setCommentTotalPages(res.totalPages);
    } catch (err) {
      console.error("내가 쓴 댓글 조회 실패:", err);
    }
  };
  useEffect(()=> {
    fetchMyInfo();
    fetchRecentChat();
    fetchMyPosts();
    fetchMyComments();
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
              <div className="profile-wrap">
                <div>
                  <div className="profile-item">
                    <span className="label">닉네임</span>
                    <span>{myInfo?.nickname || "—"}</span>
                  </div>
                  <div className="profile-item">
                    <span className="label">로그인 ID</span>
                    <span>{myInfo?.loginId || "—"}</span>
                  </div>
                  <div className="profile-item">
                    <span className="label">지역</span>
                    <span>{myInfo?.addressMain || "—"}</span>
                  </div>
                  <div className="profile-item">
                    <span className="label">가입일</span>
                    <span>{myInfo?.createdAt?.slice(0, 10) || "—"}</span>
                  </div>
                </div>
              </div>
            </section>

            {/* 설정 섹션 */}
            <section className="settings-card card">
              <h3>설정</h3>
              <div className="setting-item">
                비밀번호 변경
              </div>
              <div
                onClick={() => setShowStoreForm(true)}
                className="setting-item"
              >
                사업장 설정
              </div>
              {showStoreForm && (
                <StoreForm onClose={() => setShowStoreForm(false)} />
              )}
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
              <div className="post-card card">
                <div>
                  <h3>내가 쓴 글</h3>
                  {myPosts.length > 0 ? (
                    myPosts.map(post => (
                      <div
                        key={post.postId}
                        className="post-item"
                        onClick={() => navigate(`/community/${post.postId}`)}
                      >
                        <div className="post-title">{post.title}</div>
                        <p>{post.content}</p>
                        <div className="post-date">
                          {post.createdAt.slice(0, 10)}
                        </div>
                      </div>
                    ))
                  ) : (
                    <p>작성한 글이 없습니다.</p>
                  )}
                </div>

                {/* 페이지네이션 버튼 */}
                <div className="pagination">
                  {page > 0 && (    // 맨앞으로
                    <button onClick={() => { setPage(0); fetchMyPosts(0); }}>
                      &laquo;&laquo;
                    </button>
                  )}
                  {page > 0 && (    // 이전 페이지
                    <button onClick={() => { setPage(page - 1); fetchMyPosts(page - 1); }}>
                      &laquo;
                    </button>
                  )}
                  <span className="page-number">{page + 1} / {totalPages}</span>

                  {page + 1 < totalPages && (   // 다음 페이지
                    <button onClick={() => { setPage(page + 1); fetchMyPosts(page + 1); }}>
                      &raquo;
                    </button>
                  )}
                  {page + 1 < totalPages && (   // 맨 뒤로
                    <button onClick={() => { setPage(totalPages - 1); fetchMyPosts(totalPages - 1); }}>
                      &raquo;&raquo;
                    </button>
                  )}
                </div>
              </div>
              <div className="post-card card">
                <div>
                  <h3>내가 쓴 댓글</h3>
                  {myComments.length > 0 ? (
                    myComments.map(cmt => (
                      <div 
                        key={cmt.commentId} 
                        className="post-item"
                        onClick={() => navigate(`/community/${cmt.postId}`)}
                      >
                        
                        <div className="post-title">
                          {cmt.parentId && ('\u21B3  ')}
                          {cmt.content}</div>
                        <div className="post-date">
                          {cmt.createdAt.slice(0, 10)}
                        </div>
                      </div>
                    ))
                  ) : (
                    <p>작성한 댓글이 없습니다.</p>
                  )}
                </div>

                {/* 페이지네이션 버튼 */}
                <div className="pagination">
                  {commentPage > 0 && (    // 맨앞으로
                    <button onClick={() => { setCommentPage(0); fetchMyComments(0); }}>
                      &laquo;&laquo;
                    </button>
                  )}
                  {commentPage > 0 && (    // 이전 페이지
                    <button onClick={() => { setCommentPage(commentPage - 1); fetchMyComments(commentPage - 1); }}>
                      &laquo;
                    </button>
                  )}
                  <span className="page-number">{commentPage + 1} / {commentTotalPages}</span>

                  {commentPage + 1 < commentTotalPages && (   // 다음 페이지
                    <button onClick={() => { setCommentPage(page + 1); fetchMyComments(page + 1); }}>
                      &raquo;
                    </button>
                  )}
                  {commentPage + 1 < commentTotalPages && (   // 맨 뒤로
                    <button onClick={() => { setCommentPage(commentTotalPages - 1);
                        fetchMyComments(commentTotalPages - 1); }}>
                      &raquo;&raquo;
                    </button>
                  )}
                </div>
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