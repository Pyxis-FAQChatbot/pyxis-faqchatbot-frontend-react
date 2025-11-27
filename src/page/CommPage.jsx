import React, { useState, useEffect, useRef } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import { Search, MessageSquare, Eye } from "lucide-react";
import Header from "../components/Header";
import BottomNav from "../components/layout/BottomNav";
import FloatButton from "../components/FloatButton";
import CommDetail from "../components/CommDetail";
import CommWrite from "../components/CommWrite";
import { communityApi } from "../api/commApi";
import { timeAgo } from "../utils/timeAgo";
import Card from "../components/ui/Card";

export default function CommunityPage() {
  const navigate = useNavigate();
  const { postId } = useParams();
  const location = useLocation();
  const [viewMode, setViewMode] = useState("list");
  const [selectedPostId, setSelectedPostId] = useState(null);
  const [posts, setPosts] = useState([]);
  const [page, setPage] = useState(0);
  const [isLast, setIsLast] = useState(false);
  const [filterType, setFilterType] = useState("");
  const [currentPost, setCurrentPost] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const PAGE_SIZE = 8;

  const goBack = () => navigate(-1);

  useEffect(() => {
    const path = location.pathname;
    if (path.endsWith("/edit")) {
      if (!postId) return;
      setViewMode("edit");
      setSelectedPostId(Number(postId));
      return;
    }
    if (postId != null) {
      setViewMode("detail");
      setSelectedPostId(Number(postId));
      return;
    }
    if (path === "/community/write") {
      setViewMode("write");
      return;
    }

    // Check for refresh flag
    if (location.state?.refresh) {
      // Clear posts to force refetch
      setPosts([]);
      setPage(0);
      setIsLast(false);
      // Clear state to prevent infinite refresh loop if we navigate back and forth
      navigate(location.pathname, { replace: true, state: {} });
    }

    setViewMode("list");
  }, [postId, location.pathname, location.state]);

  const fetchPosts = async () => {
    if (isLast) return;
    try {
      const res = await communityApi.postListPath(page, PAGE_SIZE, filterType || undefined, searchQuery || undefined);
      const data = res.data ? res.data : res;
      const newPosts = data.items || [];
      setPosts((prev) => [...prev, ...newPosts]);
      setPage((prev) => prev + 1);
      if (data.last === true || newPosts.length < PAGE_SIZE) setIsLast(true);
    } catch (e) {
      console.error("게시글 로드 실패:", e);
    }
  };

  useEffect(() => {
    if (viewMode !== "list") return;
    setPosts([]);
    setPage(0);
    setIsLast(false);
    setSearchQuery("");
  }, [filterType]);

  useEffect(() => {
    if (viewMode !== "list") return;
    if (page !== 0 && posts.length !== 0) return;
    fetchPosts();
  }, [page]);

  const handleSearch = () => {
    setSearchQuery(searchInput);
    setPosts([]);
    setPage(0);
    setIsLast(false);
    setFilterType("");
    setSearchInput("");
    setIsSearchOpen(false);
  };

  const renderContent = () => {
    if (viewMode === "write" || viewMode === "edit") {
      return (
        <CommWrite
          api={communityApi}
          mode={viewMode}
          postId={selectedPostId}
          initialData={currentPost?.community}
          onBack={() => {
            if (viewMode === "write") {
              navigate("/community", { state: { refresh: true } });
            } else {
              navigate(`/community/${selectedPostId}`);
            }
          }}
        />
      );
    }
    if (viewMode === "detail") {
      return (
        <CommDetail
          postId={selectedPostId}
          api={communityApi}
          onBack={() => navigate("/community")}
          onPostLoaded={(post) => setCurrentPost(post)}
        />
      );
    }

    // List Mode
    return (
      <div className="flex-1 overflow-y-auto p-4 space-y-4 pb-24">
        {/* Search Bar */}
        {isSearchOpen && (
          <div className="bg-white p-4 rounded-2xl shadow-lg mb-4 animate-float">
            <div className="flex gap-2">
              <input
                type="text"
                className="flex-1 px-4 py-2 rounded-xl bg-slate-50 border border-slate-100 focus:outline-none focus:ring-2 focus:ring-primary/50"
                placeholder="검색어를 입력하세요"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              />
              <button onClick={handleSearch} className="p-2 bg-primary text-white rounded-xl">
                <Search size={20} />
              </button>
            </div>
          </div>
        )}

        {/* Tabs */}
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
          {["", "DEFAULT", "ANONYMOUS"].map((type) => (
            <button
              key={type}
              onClick={() => setFilterType(type)}
              className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${filterType === type
                ? "bg-primary text-white shadow-glow"
                : "bg-white text-slate-500 border border-slate-100 hover:bg-slate-50"
                }`}
            >
              {type === "" ? "전체" : type === "DEFAULT" ? "일반" : "익명"}
            </button>
          ))}
        </div>

        {/* Post List */}
        {posts.map((post) => (
          <Card
            key={post.communityId}
            className="!p-5 cursor-pointer hover:scale-[1.02] transition-transform active:scale-95"
            onClick={() => navigate(`/community/${post.postId}`)}
          >
            <h3 className="font-bold text-slate-900 mb-2 line-clamp-1">{post.title}</h3>
            <p className="text-sm text-slate-500 mb-4 line-clamp-2">{post.content}</p>

            <div className="flex items-center justify-between text-xs text-slate-400">
              <div className="flex items-center gap-3">
                <span className="font-medium text-slate-600">
                  {post.postType === "DEFAULT" ? post.nickname : "익명"}
                </span>
                <span>
                  {(() => {
                    const date = new Date(post.createdAt);
                    const now = new Date();
                    const isToday = date.toDateString() === now.toDateString();
                    return isToday ? timeAgo(post.createdAt) : date.toLocaleDateString('ko-KR', {
                      year: 'numeric',
                      month: '2-digit',
                      day: '2-digit'
                    });
                  })()}
                </span>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1">
                  <Eye size={14} />
                  <span>{post.viewCount}</span>
                </div>
                <div className="flex items-center gap-1">
                  <MessageSquare size={14} />
                  <span>{post.commentCount}</span>
                </div>
              </div>
            </div>
          </Card>
        ))}

        {!isLast && (
          <button
            onClick={fetchPosts}
            className="w-full py-3 text-sm text-slate-500 font-medium hover:text-primary transition-colors"
          >
            더보기
          </button>
        )}
      </div>
    );
  };

  return (
    <div className="flex flex-col h-full bg-slate-50 relative">
      <Header
        type={viewMode === "list" ? "search" : "back"}
        title={viewMode === "write" ? "나도 한마디" : viewMode === "detail" ? "사장님의 한마디" : "사장님 수다방"}
        onMenuClick={viewMode === "list" ? () => setIsSearchOpen(!isSearchOpen) : goBack}
      />

      {renderContent()}

      {viewMode === "list" && (
        <FloatButton onClick={() => navigate("/community/write")} />
      )}
    </div>
  );
}
