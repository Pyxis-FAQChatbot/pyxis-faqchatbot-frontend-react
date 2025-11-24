import React, { useEffect, useState } from "react";
import Header from "../components/Header";
import BottomNav from "../components/BottomNav";
import StoreForm from "../components/StoreFoam";
import { useNavigate } from "react-router-dom";
import { botRoomPath } from "../api/chatApi";
import { timeAgo } from "../utils/timeAgo";
import { myInfoPath, myPostPath, myCommentPath } from "../api/authApi";
import { storeApi } from "../api/storeApi";
import "../styles/MyPage.css";

export default function MyPage() {
  const navigate = useNavigate();
  const [recentChat, setRecentChat] = useState(null);
  const [myInfo, setMyInfo] = useState([]);
  const [myStore, setMyStore] = useState([]);
  const [myPosts, setMyPosts] = useState([]);
  const [myComments, setMyComments] = useState([]);
  const [page, setPage] = useState(0);       // 현재 페이지
  const [totalPages, setTotalPages] = useState(1); // 전체 페이지
  const [commentPage, setCommentPage] = useState(0);
  const [commentTotalPages, setCommentTotalPages] = useState(1);
  const [showStoreForm, setShowStoreForm] = useState(false);
  const [showOverlay, setShowOverlay] = useState(false);
  const [overlayMode, setOverlayMode] = useState(null); 

  const size = 5;
  const cmtsize = 8;
  const openProfileEdit = () => {
    setOverlayMode("profile");
    setShowOverlay(true);
  };

  const openPasswordEdit = () => {
    setOverlayMode("password");
    setShowOverlay(true);
  };

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
    const fetchMyStore = async () => {
    try {
      const res = await storeApi.ViewPath(); // 👈 너가 만든 GET api 함수명으로 변경!
      setMyStore(res);
    } catch (err) {
      console.log("사업장 정보 없음 또는 오류");
      setStoreInfo(null);
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
    fetchMyStore();
    fetchRecentChat();
    fetchMyPosts();
    fetchMyComments();
  }, []);

  return (
    <div className="mypage-container">
      <Header type = "main"/>

      <main className="mypage-content">
        {showStoreForm && (
          <StoreForm 
            onClose={() => {
              setShowStoreForm(false);
              fetchMyStore()
            }} 
          />
        )}
        {showOverlay && (
          <UserEditOverlay
            mode={overlayMode}
            onClose={() => setShowOverlay(false)}
            onUpdated={() => {/* 수정 후 마이페이지 데이터 갱신용 */}}
          />
        )}
        <div>
          {/* 🔹 상단 좌우배치 영역 (750px 이상부터 적용) */}
          <div className="top-grid">

            {/* 핵심 계정 정보 */}
            <section className="profile-card card">
              <h3>계정 정보</h3>
              <div>
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
                <div></div>
              </div>
            </section>
            <section className="profile-card card">
              <h3>내 사업장</h3>
              <div className="profile-item">
                <span className="label">상호명</span>
                <span>{myStore?.storeName || "—"}</span>
              </div>
              <div className="profile-item">
                <span className="label">등록 코드</span>
                <span>{myStore?.industryCode || "—"}</span>
              </div>
              <div className="profile-item">
                <span className="label">주소</span>
                <span>{myStore?.address || "—"}</span>
              </div>
            </section>
          </div>
          {/* 설정 바 */}
          <section className="settings-bar">
            <button
              onClick={() => setShowStoreForm(true)}
              className="setting-item card"
            >
              사업장 설정
            </button>
            <button
              onClick={openProfileEdit}
              className="setting-item card"
            >
              비밀번호 변경
            </button>
            <button
              onClick={openPasswordEdit}
              className="setting-item card"
            >
              닉네임 및 지역 변경
            </button>
          </section>

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