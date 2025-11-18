/**
 * TODO: 뒤로가기했을때 scroll 위치 저장 생각할 것
 */

import React, { useState, useEffect } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";

import Header from "../components/Header";
import BottomNav from "../components/BottomNav";
import FloatButton from "../components/FloatButton";
import CommDetail from "../components/CommDetail"
import CommWrite from "../components/CommWrite";

import "../styles/CommunityListPage.css";

import { communityApi } from "../api/commApi";
import { timeAgo } from "../utils/timeAgo";

/*  
  CommunityPage = 레이아웃 + 모드 전환 + 각 기능 컴포넌트 출력(디폴트로 목록 출력)  
*/

export default function CommunityPage() {
  const navigate = useNavigate();
  const { postId } = useParams();
  const location = useLocation();

  // 현재 화면 모드: list / write / detail
  const [viewMode, setViewMode] = useState("list");
  const [selectedPostId, setSelectedPostId] = useState(null);

  // LIST 모드에서 필요한 상태와 로직
  const [posts, setPosts] = useState([]);
  const [page, setPage] = useState(0);
  const [isLast, setIsLast] = useState(false);
  const PAGE_SIZE = 20;

  // 반응형 패딩 / 폰트
  const [sidePadding, setSidePadding] = useState("20px");
  const [titleSize, setTitleSize] = useState(16);
  const [textSize, setTextSize] = useState(14);
  // 뒤로가기
  const goBack = () => {
    navigate(-1);
  };
  // url에 따른 viewMode
  useEffect(() => {
    if (postId) {
      // /community/:postId 형태면 DETAIL 모드
      setViewMode("detail");
      setSelectedPostId(Number(postId));
    
    } else if (location.pathname === "/community/write") {
      // 작성 URL이면 WRITE 모드
      setViewMode("write");
    
    } else {
      // 기본적으로 LIST 모드
      setViewMode("list");
    }
  }, [postId, location.pathname]);

  const handleResize = () => {
    const w = window.innerWidth;

    if (w > 1000) {
      setSidePadding("10%");
      setTitleSize(20);
      setTextSize(16);
    } else if (w > 500) {
      setSidePadding("5%");
      setTitleSize(16);
      setTextSize(14);
    } else {
      setSidePadding("20px");
      setTitleSize(16);
      setTextSize(14);
    }
  };

  useEffect(() => {
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // 📌 게시글 목록 불러오기
  const fetchPosts = async () => {
    if (isLast) return;

    try {
      const res = await communityApi.postListPath(page, PAGE_SIZE);
      const data = res.data ? res.data : res;

      const newPosts = data.items || [];

      setPosts((prev) => [...prev, ...newPosts]);
      setPage((prev) => prev + 1);

      if (data.last === true || newPosts.length < PAGE_SIZE) {
        setIsLast(true);
      }
    } catch (e) {
      console.error("게시글 로드 실패:", e);
    }
  };

  useEffect(() => {
    if (!postId && location.pathname === "/community") {
      fetchPosts();
    }
  }, [postId, location.pathname]);
  // -------------------------------------------
  // 📌 VIEW MODE: LIST
  // -------------------------------------------
  const renderListMode = () => (
    <main
      className="community-content"
      style={{ paddingLeft: sidePadding, paddingRight: sidePadding }}
    >
      {posts.map((post) => (
        <div
          key={post.communityId}
          className="community-card"
          onClick={() => {
            navigate(`/community/${post.communityId}`);
          }}
        >
          <div className="card-title" style={{ fontSize: `${titleSize}px` }}>
            {post.title}
          </div>

          <div className="card-info" style={{ fontSize: `${textSize}px` }}>
            <span>{post.nickname}</span>
            <span>조회수 : {post.viewCount}</span>
            <span>{timeAgo(post.createdAt)}</span>
          </div>
        </div>
      ))}

      {!isLast && (
        <div className="load-more-wrapper">
          <button className="load-more-btn" onClick={fetchPosts}>
            더보기
          </button>
        </div>
      )}
    </main>
  );

  // -------------------------------------------
  // VIEW MODE: WRITE
  // -------------------------------------------
  const renderWriteMode = () => (
    <main 
      className="community-content"
      style={{ paddingLeft: sidePadding, paddingRight: sidePadding }}
      >
      <CommWrite
        api={communityApi}
        mode="write"
        onBack={() => navigate("/community")}
      />
    </main>
  );

  // -------------------------------------------
  // IEW MODE: DETAIL 
  // -------------------------------------------
  const renderDetailMode = () => (
    <main 
      className="community-content"
      style={{ paddingLeft: sidePadding, paddingRight: sidePadding }}
    >
      <CommDetail
        postId={selectedPostId}
        api={communityApi}
        onBack={() => navigate("/community")}
      />
    </main>
  );

  // -------------------------------------------
  // 📌 viewMode에 따른 컴포넌트 출력
  // -------------------------------------------
  const renderContent = () => {
    if (viewMode === "write") return renderWriteMode();
    if (viewMode === "detail") return renderDetailMode();
    return renderListMode(); // 기본: 목록
  };

  return (
    <div className="community-page">
      <Header 
        type = {viewMode === "list" ? "search":"back"}
        title="커뮤니티 게시판"
        onMenuClick={viewMode === "list" ? undefined : goBack}
      />
      {renderContent()}

      {/* 작성 버튼: WRITE 모드로 전환 */}
      {viewMode === "list" && (
        <FloatButton
          onClick={() => navigate("/community/write")}
          icon="+"
          size={60}
        />
      )}

      <BottomNav active="community" />
    </div>
  );
}

