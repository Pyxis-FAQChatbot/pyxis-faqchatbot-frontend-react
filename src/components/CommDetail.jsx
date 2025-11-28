import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { timeAgo } from "../utils/timeAgo";
import { MessageSquare, Eye, MoreVertical, Send, Trash2 } from "lucide-react";
import Card from "./ui/Card";

export default function PostDetailView({
  postId,
  api,
  onBack = () => { },
  onPostLoaded = () => { }
}) {
  const navigate = useNavigate();
  const PAGE_SIZE = 10;
  const [post, setPost] = useState(null);
  const [comments, setComments] = useState([]);
  const [commentPage, setCommentPage] = useState(0);
  const [hasMoreComments, setHasMoreComments] = useState(false);
  const [commentText, setCommentText] = useState("");
  const [openMenu, setOpenMenu] = useState(false);
  const userInfo = JSON.parse(sessionStorage.getItem("userInfo") || "{}");
  const currentUserId = userInfo.id;

  const displayNick = (nick, type = null) => {
    if (type === "ANONYMOUS") return "익명";
    return nick;
  };

  const loadPost = async () => {
    try {
      const res = await api.postViewPath(postId);
      const data = res.data || res;
      // post 데이터 구조에 맞게 userId 확인
      const postUserId = data.community?.userId || data.userId;
      const extended = { ...data, isOwner: String(postUserId) === String(currentUserId) };
      setPost(extended);
    } catch (e) {
      console.error("게시글 조회 실패:", e);
    }
  };

  const loadComments = async (page, size, isLoadMore = false) => {
    try {
      const res = await api.cmtViewPath(postId, page, size);
      const data = res.data || res;
      const mapped = data.items.map((c) => ({
        ...c,
        isMine: String(c.userId) === String(currentUserId),
        isReplyOpen: false,
        replies: [],
        replyPage: 0,
        hasMoreReplies: false,
      }));

      if (isLoadMore) {
        setComments((prev) => [...prev, ...mapped]);
      } else {
        setComments(mapped);
      }

      setHasMoreComments(data.totalPages > page + 1);
    } catch (e) {
      console.error("댓글 조회 실패:", e);
    }
  };

  useEffect(() => {
    if (!postId) return;
    loadPost();
    loadComments(0, PAGE_SIZE);
    setCommentPage(0);
  }, [postId]);

  useEffect(() => {
    if (post) onPostLoaded(post);
  }, [post]);

  const submitComment = async () => {
    if (!commentText.trim()) return;
    try {
      await api.cmtCreatePath(postId, { parentId: null, content: commentText });
      setCommentText("");
      loadComments(0, PAGE_SIZE);
      setCommentPage(0);
    } catch (e) {
      console.error("댓글 작성 실패:", e);
    }
  };

  const deleteComment = async (commentId) => {
    try {
      await api.cmtDeletePath(postId, commentId);
      loadComments(0, PAGE_SIZE);
      setCommentPage(0);
    } catch (e) {
      console.error("댓글 삭제 실패:", e);
    }
  };

  const deletePost = async () => {
    if (!window.confirm("정말 삭제할까요?")) return;
    try {
      await api.postDeletePath(postId);
      onBack();
    } catch (e) {
      console.error("게시글 삭제 실패:", e);
    }
  };

  const loadReplies = async (parentId, page, size) => {
    try {
      const res = await api.replyViewPath(postId, parentId, page, size);
      const data = res.data || res;
      const replyItems = data.items.map((r) => ({ ...r, isMine: String(r.userId) === String(currentUserId) }));
      setComments((prev) =>
        prev.map((c) => c.commentId === parentId ? { 
          ...c, 
          replies: page === 0 ? replyItems : [...(c.replies || []), ...replyItems],
          replyPage: page + 1,
          hasMoreReplies: data.totalPages > page + 1
        } : c)
      );
    } catch (e) {
      console.error("대댓글 조회 실패:", e);
    }
  };

  const submitReply = async (parentCommentId, text) => {
    if (!text.trim()) return;
    try {
      await api.cmtCreatePath(postId, { content: text, parentId: parentCommentId });
      loadReplies(parentCommentId, 0, PAGE_SIZE);
      setComments(prev => prev.map(c => c.commentId === parentCommentId ? { ...c, replyInput: "" } : c));
    } catch (e) {
      console.error("대댓글 작성 실패:", e);
    }
  };

  const toggleReplySection = (commentId) => {
    setComments((prev) => {
      const updated = prev.map((c) => c.commentId === commentId ? { ...c, isReplyOpen: !c.isReplyOpen } : c);
      const target = updated.find((c) => c.commentId === commentId);
      if (target.isReplyOpen) loadReplies(commentId, 0, PAGE_SIZE);
      return updated;
    });
  };

  if (!post) return <div className="p-6 text-center text-slate-400 dark:text-slate-500">로딩중...</div>;

  return (
    <div className="flex flex-col h-full bg-slate-50 dark:bg-slate-950 transition-colors">
      <div className="flex-1 overflow-y-auto p-4 space-y-4 pb-36">
        {/* Post Content */}
        <Card className="!p-5 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800">
          <div className="flex justify-between items-start mb-3">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white leading-tight break-all">{post.community.title}</h2>
            {post.isOwner && (
              <div className="relative">
                <button onClick={() => setOpenMenu(!openMenu)} className="p-1 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 dark:text-slate-500 transition-colors">
                  <MoreVertical size={20} />
                </button>
                {openMenu && (
                  <div className="absolute right-0 top-8 w-32 bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-slate-100 dark:border-slate-700 overflow-hidden z-10 transition-colors">
                    <button onClick={() => navigate(`/community/${postId}/edit`)} className="w-full px-4 py-2 text-left text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors">수정하기</button>
                    <button onClick={deletePost} className="w-full px-4 py-2 text-left text-sm text-red-500 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors">삭제하기</button>
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 mb-4">
            <span className="font-medium text-slate-700 dark:text-slate-300">{displayNick(post.community?.nickname || post.nickname, post.community?.postType)}</span>
            <span>•</span>
            <span>{timeAgo(post.community.createdAt)}</span>
            <span>•</span>
            <span className="text-[10px]">{new Date(post.community.createdAt).toLocaleString('ko-KR', {
              year: 'numeric',
              month: '2-digit',
              day: '2-digit',
              hour: '2-digit',
              minute: '2-digit',
              second: '2-digit',
              hour12: false
            })}</span>
          </div>
          {post.community.imageUrl && (
            <div className="w-full mb-6">
              <img
                src={post.community.imageUrl}
                alt="post image"
                className="w-full max-h-[500px] object-contain rounded-xl bg-slate-100 dark:bg-slate-800"
              />
            </div>
          )}
          <div className="text-slate-800 dark:text-slate-200 whitespace-pre-wrap leading-relaxed mb-6 min-h-[100px] break-all">
            {post.community.content}
          </div>

          <div className="flex items-center gap-4 text-slate-400 dark:text-slate-500 text-sm border-t border-slate-100 dark:border-slate-800 pt-3">
            <div className="flex items-center gap-1">
              <Eye size={16} />
              <span>{post.community.viewCount}</span>
            </div>
            <div className="flex items-center gap-1">
              <MessageSquare size={16} />
              <span>{post.community.commentCount}</span>
            </div>
          </div>
        </Card>

        {/* Comments List */}
        <div className="space-y-3">
          {comments.map((c) => (
            <div key={c.commentId} className="bg-white dark:bg-slate-900 p-4 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 transition-colors">
              <div className="flex justify-between items-start mb-2">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-semibold text-sm text-slate-800 dark:text-slate-200">{c.status === 'DELETED' ? '(삭제됨)' : displayNick(c.nickname, c.postType)}</span>
                  <span className="text-xs text-slate-400 dark:text-slate-500">{timeAgo(c.createdAt)}</span>
                  <span className="text-[10px] text-slate-300">• {new Date(c.createdAt).toLocaleString('ko-KR', {
                    month: '2-digit',
                    day: '2-digit',
                    hour: '2-digit',
                    minute: '2-digit',
                    second: '2-digit',
                    hour12: false
                  })}</span>
                </div>
                {c.isMine && c.status === 'ACTIVE' && (
                  <button onClick={() => deleteComment(c.commentId)} className="text-slate-300 dark:text-slate-600 hover:text-red-500 dark:hover:text-red-400 transition-colors">
                    <Trash2 size={14} />
                  </button>
                )}
              </div>

              <p className={`text-sm mb-3 break-all ${c.status === 'BLOCKED' ? 'text-red-500' : 'text-slate-700 dark:text-slate-300'}`}>{c.content}</p>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => toggleReplySection(c.commentId)}
                  className="text-xs font-medium text-primary dark:text-primary/90 flex items-center gap-1 hover:bg-primary/5 dark:hover:bg-primary/20 px-2 py-1 rounded-lg transition-colors"
                >
                  <MessageSquare size={12} />
                  {c.isReplyOpen ? "답글 닫기" : (c.childCommentCount ? `답글 ${c.childCommentCount}개` : "답글 달기")}
                </button>
              </div>

              {/* Replies */}
              {c.isReplyOpen && (
                <div className="mt-3 pl-3 border-l-2 border-slate-100 dark:border-slate-700 space-y-3">
                  {c.replies.map((r) => (
                    <div key={r.commentId} className="bg-slate-50 dark:bg-slate-800/50 p-3 rounded-xl transition-colors">
                      <div className="flex justify-between items-start mb-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-medium text-xs text-slate-700 dark:text-slate-300">{r.status === 'DELETED' ? '(삭제됨)' : displayNick(r.nickname, r.postType)}</span>
                          <span className="text-[10px] text-slate-400 dark:text-slate-500">{timeAgo(r.createdAt)}</span>
                          <span className="text-[9px] text-slate-300">• {new Date(r.createdAt).toLocaleString('ko-KR', {
                            month: '2-digit',
                            day: '2-digit',
                            hour: '2-digit',
                            minute: '2-digit',
                            second: '2-digit',
                            hour12: false
                          })}</span>
                        </div>
                        {r.isMine && r.status === 'ACTIVE' && (
                          <button onClick={() => deleteComment(r.commentId)} className="text-slate-300 dark:text-slate-600 hover:text-red-500 dark:hover:text-red-400 transition-colors">
                            <Trash2 size={12} />
                          </button>
                        )}
                      </div>
                      <p className={`text-xs break-all ${r.status === 'BLOCKED' ? 'text-red-500' : 'text-slate-600 dark:text-slate-400'}`}>{r.content}</p>
                    </div>
                  ))}

                  {c.hasMoreReplies && (
                    <button
                      onClick={() => loadReplies(c.commentId, c.replyPage, PAGE_SIZE)}
                      className="text-xs text-slate-400 dark:text-slate-500 hover:text-primary dark:hover:text-primary/90 transition-colors font-medium"
                    >
                      답글 더보기
                    </button>
                  )}

                  {c.status === 'ACTIVE' && (
                    <div className="flex gap-2 mt-2">
                      <input
                        className="flex-1 px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-xs text-slate-800 dark:text-slate-200 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:border-primary dark:focus:border-primary transition-colors"
                        placeholder="답글 입력..."
                        value={c.replyInput || ""}
                        onChange={(e) => setComments(prev => prev.map(c2 => c2.commentId === c.commentId ? { ...c2, replyInput: e.target.value } : c2))}
                        onKeyPress={(e) => {
                          if (e.key === 'Enter' && !e.shiftKey) {
                            e.preventDefault();
                            submitReply(c.commentId, c.replyInput);
                          }
                        }}
                      />
                      <button
                        onClick={() => submitReply(c.commentId, c.replyInput)}
                        className="p-2 bg-primary text-white rounded-xl hover:bg-primary/90 transition-colors"
                      >
                        <Send size={14} />
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}

          {hasMoreComments && (
            <button
              onClick={() => {
                const nextPage = commentPage + 1;
                setCommentPage(nextPage);
                loadComments(nextPage, PAGE_SIZE, true);
              }}
              className="w-full py-3 text-sm text-slate-500 font-medium hover:text-primary transition-colors"
            >
              댓글 더보기
            </button>
          )}
        </div>
      </div>

      {/* Comment Input */}
      <div className="absolute bottom-0 left-0 right-0 p-4 bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800 transition-colors">
        <div className="flex gap-2">
          <input
            type="text"
            className="flex-1 px-4 py-3 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 text-slate-800 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-primary/50 dark:focus:ring-primary/40 transition-colors"
            placeholder="댓글을 입력하세요..."
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                submitComment();
              }
            }}
          />
          <button
            onClick={submitComment}
            className="p-3 bg-primary text-white rounded-2xl shadow-glow hover:scale-105 transition-all"
          >
            <Send size={20} />
          </button>
        </div>
      </div>
    </div>
  );
}