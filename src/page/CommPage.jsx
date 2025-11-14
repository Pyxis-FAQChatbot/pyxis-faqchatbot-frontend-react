import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../components/Header";
import BottomNav from "../components/BottomNav";
import FloatButton from "../components/FloatButton";
import "../styles/CommunityListPage.css";
import { communityApi } from "../api/commApi"; // get 목록 API (예: communityApi.getList(page,size))

export default function CommunityListPage() {
  const navigate = useNavigate();

  const [posts, setPosts] = useState([]);
  const [page, setPage] = useState(0);
  const [isLast, setIsLast] = useState(false);
  const PAGE_SIZE = 20;

  // 📌 반응형 패딩 계산
  const [sidePadding, setSidePadding] = useState("20px");
  const [titleSize, setTitleSize] = useState(16);
  const [textSize, setTextSize] = useState(14);

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

  // 📌 게시글 로드
  const fetchPosts = async () => {
    if (isLast) return;

    try {
      const res = await communityApi.postListPath(page, PAGE_SIZE); 
      const data = res.data ? res.data : res;

      const newPosts = data.content || data.posts || [];

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
    fetchPosts();
  }, []);

  return (
    <div className="community-page">
      <Header type="comm" title="커뮤니티 게시판" />

      <main className="community-content" style={{ paddingLeft: sidePadding, paddingRight: sidePadding }}>

        {posts.map((post) => (
          <div
            key={post.id}
            className="community-card"
            onClick={() => navigate(`/community/${post.communityId}`)}
          >
            <div className="card-title" style={{ fontSize: `${titleSize}px` }}>
              {post.title}
            </div>

            <div className="card-info" style={{ fontSize: `${textSize}px` }}>
              <span>{post.nickname}</span>
              <span>조회수 : {post.viewCount}</span>
              <span>{post.timeAgo || "방금 전"}</span>
            </div>
          </div>
        ))}

        {/* 📌 더보기 버튼 */}
        {!isLast && (
          <div className="load-more-wrapper">
            <button className="load-more-btn" onClick={fetchPosts}>
              더보기
            </button>
          </div>
        )}
      </main>
      <FloatButton
        onClick={() => navigate("/community")}
        icon="+"  // 기본값이 +라서 생략 가능
        size={60}
      />
      <BottomNav active="community" />
    </div>
  );
}
