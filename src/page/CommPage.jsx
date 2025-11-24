/**
 * TODO: 뒤로가기했을때 scroll 위치 저장 생각할 것
 */

import React, { useState, useEffect, useRef } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import { Search } from "lucide-react";

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
  const searchRef = useRef(null);

  // 현재 화면 모드: list / write / detail
  const [viewMode, setViewMode] = useState("list");
  const [selectedPostId, setSelectedPostId] = useState(null);

  // LIST 모드에서 필요한 상태와 로직
  const [posts, setPosts] = useState([]);
  const [page, setPage] = useState(0);
  const [isLast, setIsLast] = useState(false);
  const [filterType, setFilterType] = useState("");
  const [currentPost, setCurrentPost] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const PAGE_SIZE = 8;

  // 검색창
  const [isSearchOpen, setIsSearchOpen] = useState(false);

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
    const path = location.pathname;

    // 1) EDIT 모드: /community/:postId/edit
    if (path.endsWith("/edit")) {
      if (!postId) return;   // postId가 null이면 실행 금지!
      setViewMode("edit");
      setSelectedPostId(Number(postId));
      return;
    }

    // 2) DETAIL 모드: /community/:postId
    if (postId != null) {  
      setViewMode("detail");
      setSelectedPostId(Number(postId));
      return;
    }

    // 3) WRITE 모드: /community/write
    if (path === "/community/write") {
      setViewMode("write");
      return;
    }

    // 4) LIST 모드
    setViewMode("list");
  }, [postId, location.pathname]);


  
  // 너비에 따른 좌우 여백 과 폰트사이즈 변경
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
      const res = await communityApi.postListPath(
        page,
        PAGE_SIZE,
        filterType || undefined,
        searchQuery || undefined
      );

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
    if (viewMode !== "list") return;
    setPosts([]);
    setPage(0);
    setIsLast(false);
    setSearchQuery("")
  }, [filterType]);

  useEffect(() => {
    if (viewMode !== "list") return;
    if (page !== 0 && posts.length !== 0) return; // 초기화 직후 첫 로딩을 허용하기 위한 조건

    fetchPosts();
  }, [page]);
  const handleSearchToggle = () => {
    // 검색창 열기
    if(!isSearchOpen){
      setIsSearchOpen(true);
  
      // 검색창이 열릴 위치로 부드럽게 스크롤
      setTimeout(() => {
        if (!searchRef.current) return;
        const headerHeight = 88; // 실제 헤더 높이(px)로 맞춰주세요
        const elementTop =
          searchRef.current.getBoundingClientRect().top + window.scrollY;
  
        window.scrollTo({
          top: elementTop - headerHeight - 16, // 약간 더 여유를 두기 위해 -10
          behavior: "smooth",
        });
      }, 50);
    } else {
      setIsSearchOpen(false);
    }
};

  const handleSearch = () => {
    setSearchQuery(searchInput);
    setPosts([]);      // 목록 초기화
    setPage(0);        // 첫 페이지로
    setIsLast(false);  // 다시 페이징 가능 상태로
    setFilterType(""); // 탭 상태 초기화 (검색 시 탭은 전체로)
    
    setSearchInput("");
    // fetchPosts()는 page가 0으로 바뀌면 자동으로 트리거됨
  };
  // -------------------------------------------
  // 📌 VIEW MODE: LIST
  // -------------------------------------------
  const renderListMode = () => (
    <main
      className="community-content"
      style={{ paddingLeft: sidePadding, paddingRight: sidePadding }}
    >
      {viewMode === "list" && (
        <div 
          ref={searchRef}
          className={`search-bar-wrapper ${isSearchOpen ? "open" : ""}`}
        >
          <input
            type="text"
            placeholder="검색어를 입력하세요"
            className="search-input"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
          />
          <button className="search-btn" onClick={handleSearch}>
            <Search color="#fff"/>
          </button>
        </div>
      )}
      {/* 상단 탭 */}
      <div className="community-tab" style={{ fontSize: `${textSize}px` }}>
        <button onClick={() => setFilterType("")}
          className={filterType === "" ? "active" : ""}>전체</button>

        <button onClick={() => setFilterType("DEFAULT")}
          className={filterType === "DEFAULT" ? "active" : ""}>일반</button>

        <button onClick={() => setFilterType("ANONYMOUS")}
          className={filterType === "ANONYMOUS" ? "active" : ""}>익명</button>
      </div>
      {posts.map((post) => (
        <div
          key={post.communityId}
          className="community-card"
          onClick={() => {
            navigate(`/community/${post.postId}`);
          }}
        >
          <div className="card-title" style={{ fontSize: `${titleSize}px` }}>
            {post.title}
          </div>

          <div className="card-info" style={{ fontSize: `${textSize}px` }}>
            <span>
              {post.postType === "DEFAULT" ? post.nickname : "익명"}
            </span>
            <span>조회수 : {post.viewCount}</span>
            <span>댓글 : {post.commentCount}</span>
            <span >{timeAgo(post.createdAt)}</span>
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
        mode={location.pathname.includes("/edit") ? "edit" : "write"}
        postId={selectedPostId}
        initialData={currentPost?.community}
        onBack={() => navigate(`/community/${selectedPostId}`)}
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
        onPostLoaded={(post) => setCurrentPost(post)}
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
        title = "커뮤니티 게시판"
        onMenuClick={
          viewMode === "list" 
            ? handleSearchToggle
            : goBack
        }
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

      <BottomNav active={"community"} />
    </div>
  );
}

