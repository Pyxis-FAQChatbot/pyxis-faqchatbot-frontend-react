import React, { useState, useEffect, useRef } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import { Search, MessageSquare, Eye } from "lucide-react";
import Header from "../components/Header";
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
  const placeholderImg =
  "data:image/svg+xml,%3Csvg width='80' height='80' xmlns='http://www.w3.org/2000/svg'%3E%3Crect width='100%25' height='100%25' fill='%23d1d5db'/%3E%3Cline x1='20' y1='20' x2='60' y2='60' stroke='white' stroke-width='6'/%3E%3Cline x1='60' y1='20' x2='20' y2='60' stroke='white' stroke-width='6'/%3E%3C/svg%3E";

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
      <div className="flex-1 overflow-y-auto p-4 space-y-4 pb-6">
        {/* Search Bar */}
        {isSearchOpen && (
          <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl shadow-lg mb-4 animate-float border border-slate-100 dark:border-slate-800 transition-colors">
            <div className="flex gap-2">
              <input
                type="text"
                className="flex-1 px-4 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 text-slate-800 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-colors"
                placeholder="검색어를 입력하세요"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              />
              <button onClick={handleSearch} className="p-2 bg-primary text-white rounded-xl hover:scale-105 transition-transform">
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
                : "bg-white dark:bg-slate-900 text-slate-500 dark:text-slate-400 border border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                }`}
            >
              {type === "" ? "전체" : type === "DEFAULT" ? "일반" : "익명"}
            </button>
          ))}
        </div>

        {/* Post List */}
        {posts.map((post) => {
          // Check if post is new (created within 1 hour)
          const postTime = new Date(post.createdAt);
          const now = new Date();
          const diffMinutes = (now - postTime) / (1000 * 60);
          const isNew = diffMinutes < 60;

          return (
            <Card
              key={post.communityId}
              className="!p-5 cursor-pointer hover:scale-[1.02] transition-transform active:scale-95 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800"
              onClick={() => navigate(`/community/${post.postId}`)}
            >
              <div className="flex gap-4">
                {/* Thumbnail */}
                <img
                  src={post.imageUrl || placeholderImg}
                  alt="thumbnail"
                  className="w-20 h-20 object-cover rounded-lg flex-shrink-0 bg-slate-200 dark:bg-slate-700"
                />

                {/* Right Content */}
                <div className="flex flex-col flex-1">
                  {/* Title + New Badge */}
                  <div className="flex items-start gap-2 mb-1">
                    <h3 className="font-bold text-slate-900 dark:text-white line-clamp-1 flex-1">
                      {post.title}
                    </h3>
                    {isNew && (
                      <div className="flex-shrink-0 w-5 h-5 rounded-full bg-red-500 flex items-center justify-center">
                        <span className="text-white text-xs font-bold">N</span>
                      </div>
                    )}
                  </div>

                  {/* Content Preview */}
                  <p className="text-sm text-slate-500 dark:text-slate-400 mb-2 line-clamp-2">
                    {post.content}
                  </p>

                  {/* Info Line */}
                  <div className="flex items-center justify-between text-xs text-slate-400 dark:text-slate-500">
                    <div className="flex items-center gap-3">
                      <span className="font-medium text-slate-600 dark:text-slate-300">
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
                </div>
              </div>
            </Card>

          );
        })}

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
    <div className="flex flex-col h-full bg-slate-50 dark:bg-slate-950 relative transition-colors duration-300">
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
