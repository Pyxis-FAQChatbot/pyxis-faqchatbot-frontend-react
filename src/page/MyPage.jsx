import React, { useEffect, useState } from "react";
import Header from "../components/Header";
import StoreForm from "../components/StoreForm";
import ProfileEditOverlay from "../components/ProfileEditOverlay";
import { useNavigate } from "react-router-dom";
import { botRoomPath } from "../api/chatApi";
import { timeAgo } from "../utils/timeAgo";
import { myInfoPath, myPostPath, myCommentPath } from "../api/authApi";
import { storeApi } from "../api/storeApi";
import Card from "../components/ui/Card";
import Button from "../components/ui/Button";
import { MapPin, Calendar, Store, Settings, MessageSquare, FileText, ChevronRight } from "lucide-react";

const TruncatedText = ({ label, value }) => {
  const [isOpen, setIsOpen] = useState(false);

  if (!value) return <span className="text-slate-800 dark:text-slate-200 font-medium text-sm">—</span>;

  // 라벨을 포함한 전체 길이 체크 (라벨: 값 형식)
  const displayText = `${label}: ${value}`;
  const isLong = displayText.length > 12;

  return (
    <div className="relative">
      <button
        onClick={() => isLong && setIsOpen(!isOpen)}
        className={`text-slate-800 dark:text-slate-200 font-medium text-sm truncate text-right max-w-[180px] transition-colors ${isLong ? 'cursor-pointer' : 'cursor-default'
          }`}
      >
        {value}
      </button>
      {isOpen && isLong && (
        <div className="absolute top-full right-0 mt-1 z-10 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg shadow-lg p-3 max-w-xs">
          <p className="text-sm text-slate-800 dark:text-slate-200 break-words">{value}</p>
          <button
            onClick={() => setIsOpen(false)}
            className="absolute top-1 right-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
          >
            ✕
          </button>
        </div>
      )}
    </div>
  );
};

export default function MyPage() {
  const navigate = useNavigate();
  const [recentChat, setRecentChat] = useState(null);
  const [myInfo, setMyInfo] = useState(null);
  const [myStore, setMyStore] = useState(null);
  const [myPosts, setMyPosts] = useState([]);
  const [myComments, setMyComments] = useState([]);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const size = 10;
  const cmtsize = 10;
  const [commentPage, setCommentPage] = useState(0);
  const [commentTotalPages, setCommentTotalPages] = useState(1);
  const [showStoreForm, setShowStoreForm] = useState(false);
  const [showOverlay, setShowOverlay] = useState(false);
  const [overlayMode, setOverlayMode] = useState("profile");

  const openProfileEdit = () => {
    setOverlayMode("profile");
    setShowOverlay(true);
  };

  const openPasswordEdit = () => {
    setOverlayMode("password");
    setShowOverlay(true);
  };

  const fetchRecentChat = async () => {
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
      const res = await myInfoPath();
      setMyInfo(res);
    } catch (err) {
      console.error("내 정보 불러오기 실패:", err);
    }
  };
  const fetchMyStore = async () => {
    try {
      const res = await storeApi.ViewPath();
      setMyStore(res);
    } catch (err) {
      console.log("사업장 정보 없음 또는 오류");
      setMyStore(null);
    }
  };
  const fetchMyPosts = async (pageNum = page) => {
    try {
      const res = await myPostPath(pageNum, size);
      setMyPosts(res?.items || []);
      setTotalPages(res?.totalPages || 1);
    } catch (err) {
      console.error("내가 쓴 글 조회 실패:", err);
    }
  };
  const fetchMyComments = async (pageNum = commentPage) => {
    try {
      const res = await myCommentPath(pageNum, cmtsize);
      setMyComments(res?.items || []);
      setCommentTotalPages(res?.totalPages || 1);
    } catch (err) {
      console.error("내가 쓴 댓글 조회 실패:", err);
    }
  };
  useEffect(() => {
    fetchMyInfo();
    fetchMyStore();
    fetchRecentChat();
    fetchMyPosts();
    fetchMyComments();
  }, []);

  const InfoItem = ({ icon: Icon, label, value }) => (
    <div className="flex items-center justify-between py-2 border-b border-slate-50 dark:border-slate-800 last:border-none gap-3">
      <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 text-sm flex-shrink-0 whitespace-nowrap">
        <Icon size={16} />
        <span>{label}</span>
      </div>
      <span className="text-slate-800 dark:text-slate-200 font-medium text-sm flex-1 text-right truncate">{value || "—"}</span>
    </div>
  );

  return (
    <div className="flex flex-col h-full bg-slate-50 dark:bg-slate-950 transition-colors duration-300">
      <Header type="main" />

      <main className="flex-1 overflow-y-auto p-6 space-y-6 pb-24 scrollbar-hide">
        {showStoreForm && (
          <StoreForm
            onClose={() => {
              setShowStoreForm(false);
              fetchMyStore()
            }}
          />
        )}
        {showOverlay && (
          <ProfileEditOverlay
            mode={overlayMode}
            onClose={() => setShowOverlay(false)}
            onUpdated={() => { fetchMyInfo() }}
          />
        )}

        {/* Profile Card */}
        <Card className="!p-0 overflow-hidden">
          <div className="bg-gradient-to-r from-primary/10 to-secondary/10 dark:from-primary/20 dark:to-secondary/20 p-6 pb-8">
            <div className="flex gap-4">
              <div className="w-16 h-16 rounded-full bg-white dark:bg-slate-800 shadow-md flex items-center justify-center text-2xl flex-shrink-0">
                {myInfo?.role === 'ADMIN' ? "👨🏼‍✈️" : "👤"}
              </div>
              <div className="flex-1 min-w-0">
                <h2 className="text-xl font-bold text-slate-900 dark:text-white">{myInfo?.nickname || "Guest"}</h2>
                <p className="text-sm text-slate-500 dark:text-slate-400 break-words">{myInfo?.loginId || ""}</p>
              </div>
            </div>
          </div>
          <div className="p-5 -mt-4 bg-white dark:bg-slate-900 rounded-t-3xl transition-colors duration-300">
            <InfoItem icon={MapPin} label="지역" value={myInfo?.addressMain} />
            <InfoItem icon={Calendar} label="가입일" value={myInfo?.createdAt?.slice(0, 10)} />

            <div className="mt-4 flex gap-2">
              <Button variant="secondary" onClick={openProfileEdit} className="text-xs !py-2 flex-1">
                정보 수정
              </Button>
              <Button variant="secondary" onClick={openPasswordEdit} className="text-xs !py-2 flex-1">
                비밀번호 변경
              </Button>
            </div>
          </div>
        </Card>

        {/* Store Card */}
        <Card className="!p-5">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Store size={20} className="text-primary" />
              내 사업장
            </h3>
            <button onClick={() => setShowStoreForm(true)} className="text-xs text-primary font-medium hover:underline">
              설정
            </button>
          </div>
          <div className="space-y-1">
            <div className="flex items-start justify-between py-2 border-b border-slate-50 dark:border-slate-800 last:border-none gap-3">
              <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 text-sm flex-shrink-0 min-w-[90px]">
                <FileText size={16} />
                <span>상호명</span>
              </div>
              <span className="text-slate-800 dark:text-slate-200 font-medium text-sm break-words">{myStore?.storeName || "—"}</span>
            </div>
            <div className="flex items-center justify-between py-2 border-b border-slate-50 dark:border-slate-800 last:border-none gap-3">
              <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 text-sm flex-shrink-0 min-w-[90px]">
                <Settings size={16} />
                <span>등록 코드</span>
              </div>
              <span className="text-slate-800 dark:text-slate-200 font-medium text-sm flex-1 text-right truncate">{myStore?.industryCode || "—"}</span>
            </div>
            <div className="flex items-start justify-between py-2 border-b border-slate-50 dark:border-slate-800 last:border-none gap-3">
              <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 text-sm flex-shrink-0 min-w-[90px]">
                <MapPin size={16} />
                <span>주소</span>
              </div>
              <span className="text-slate-800 dark:text-slate-200 font-medium text-sm break-words">{myStore?.address || "—"}</span>
            </div>
          </div>
        </Card>

        {/* Recent Chat */}
        <Card
          className="!p-5 cursor-pointer hover:scale-[1.02] transition-transform active:scale-95"
          onClick={() => recentChat && navigate(`/chatbot/${recentChat.botchatId}`)}
        >
          <h3 className="font-bold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
            <MessageSquare size={20} className="text-secondary" />
            최근 상담
          </h3>
          {recentChat ? (
            <div>
              <div className="flex justify-between items-center mb-1">
                <span className="font-medium text-slate-800 dark:text-slate-200">{recentChat.title || "챗봇 상담"}</span>
                <span className="text-xs text-slate-400">{timeAgo(recentChat.lastMessageAt || recentChat.createdAt)}</span>
              </div>
              <p className="text-sm text-slate-500 dark:text-slate-400 line-clamp-1">{recentChat.lasMessage || "메시지가 없습니다."}</p>
            </div>
          ) : (
            <p className="text-sm text-slate-400">최근 이용한 챗봇이 없습니다.</p>
          )}
        </Card>

        {/* My Posts */}
        <div className="space-y-4">
          <h3 className="font-bold text-slate-900 dark:text-white px-1">활동 내역</h3>

          <Card className="!p-0 overflow-hidden">
            <div className="p-4 bg-slate-50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-800 font-medium text-sm text-slate-700 dark:text-slate-300">
              내가 쓴 글
            </div>
            <div className="divide-y divide-slate-50 dark:divide-slate-800">
              {myPosts.length > 0 ? (
                myPosts.map(post => (
                  <div
                    key={post.postId}
                    onClick={() => navigate(`/community/${post.postId}`)}
                    className="p-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 cursor-pointer transition-colors flex justify-between items-center group"
                  >
                    <div className="flex-1 min-w-0 mr-4">
                      <div className="text-sm font-medium text-slate-800 dark:text-slate-200 truncate">{post.title}</div>
                      <div className="text-xs text-slate-400 mt-0.5 flex items-center gap-1">
                        <span>
                          {new Date(post.createdAt).toLocaleDateString('ko-KR', {
                            year: 'numeric',
                            month: '2-digit',
                            day: '2-digit'
                          })}
                        </span>
                        <span className="text-[10px] text-slate-300">
                          {new Date(post.createdAt).toLocaleTimeString('ko-KR', {
                            hour: '2-digit',
                            minute: '2-digit',
                            hour12: false
                          })}
                        </span>
                      </div>
                    </div>
                    <ChevronRight size={16} className="text-slate-300 dark:text-slate-600 group-hover:text-primary" />
                  </div>
                ))
              ) : (
                <div className="p-6 text-center text-sm text-slate-400">작성한 글이 없습니다.</div>
              )}
            </div>
            {totalPages > 1 && (
              <div className="p-3 flex justify-center gap-2 border-t border-slate-100 dark:border-slate-800">
                <button onClick={() => { setPage(p => Math.max(0, p - 1)); fetchMyPosts(Math.max(0, page - 1)); }} disabled={page === 0} className="px-3 py-1 text-xs rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 disabled:opacity-50">이전</button>
                <span className="text-xs py-1 text-slate-500">{page + 1} / {totalPages}</span>
                <button onClick={() => { setPage(p => Math.min(totalPages - 1, p + 1)); fetchMyPosts(Math.min(totalPages - 1, page + 1)); }} disabled={page >= totalPages - 1} className="px-3 py-1 text-xs rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 disabled:opacity-50">다음</button>
              </div>
            )}
          </Card>

          <Card className="!p-0 overflow-hidden">
            <div className="p-4 bg-slate-50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-800 font-medium text-sm text-slate-700 dark:text-slate-300">
              내가 쓴 댓글
            </div>
            <div className="divide-y divide-slate-50 dark:divide-slate-800">
              {myComments.length > 0 ? (
                myComments.map(cmt => (
                  <div
                    key={cmt.commentId}
                    onClick={() => navigate(`/community/${cmt.postId}`)}
                    className="p-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 cursor-pointer transition-colors flex justify-between items-center group"
                  >
                    <div className="flex-1 min-w-0 mr-4">
                      <div className="text-sm text-slate-800 dark:text-slate-200 truncate">
                        {cmt.parentId && <span className="text-slate-400 mr-1">↳</span>}
                        {cmt.content}
                      </div>
                      <div className="text-xs text-slate-400 mt-0.5 flex items-center gap-1">
                        <span>
                          {new Date(cmt.createdAt).toLocaleDateString('ko-KR', {
                            year: 'numeric',
                            month: '2-digit',
                            day: '2-digit'
                          })}
                        </span>
                        <span className="text-[10px] text-slate-300">
                          {new Date(cmt.createdAt).toLocaleTimeString('ko-KR', {
                            hour: '2-digit',
                            minute: '2-digit',
                            hour12: false
                          })}
                        </span>
                      </div>
                    </div>
                    <ChevronRight size={16} className="text-slate-300 dark:text-slate-600 group-hover:text-primary" />
                  </div>
                ))
              ) : (
                <div className="p-6 text-center text-sm text-slate-400">작성한 댓글이 없습니다.</div>
              )}
            </div>
            {commentTotalPages > 1 && (
              <div className="p-3 flex justify-center gap-2 border-t border-slate-100 dark:border-slate-800">
                <button onClick={() => { setCommentPage(p => Math.max(0, p - 1)); fetchMyComments(Math.max(0, commentPage - 1)); }} disabled={commentPage === 0} className="px-3 py-1 text-xs rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 disabled:opacity-50">이전</button>
                <span className="text-xs py-1 text-slate-500">{commentPage + 1} / {commentTotalPages}</span>
                <button onClick={() => { setCommentPage(p => Math.min(commentTotalPages - 1, p + 1)); fetchMyComments(Math.min(commentTotalPages - 1, commentPage + 1)); }} disabled={commentPage >= commentTotalPages - 1} className="px-3 py-1 text-xs rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 disabled:opacity-50">다음</button>
              </div>
            )}
          </Card>
        </div>

        <button className="w-full py-4 text-sm text-slate-400 hover:text-red-500 transition-colors">
          회원 탈퇴
        </button>
      </main>
    </div>
  );
}