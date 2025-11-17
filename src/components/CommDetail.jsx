import React, { useEffect, useState } from "react";
import { timeAgo } from "../utils/timeAgo";
import {
  MessageSquare,
  MoreVertical,
  CornerDownRight,
} from "lucide-react";

export default function PostDetailView({
  postId,    // 게시글 번호
  onBack,    // 뒤로가기 필요 시
  api,       // API 객체 (post, comment) - 상위에서 전달
}) {
  const PAGE_SIZE = 5
  // 게시글
  const [post, setPost] = useState(null);
  // 댓글 리스트
  const [comments, setComments] = useState([]);
  // 댓글 입력
  const [commentText, setCommentText] = useState("");
  // 설정 메뉴 열림 여부
  const [openMenu, setOpenMenu] = useState(false);
  // 사용자 정보 불러오기
  const userInfo = JSON.parse(sessionStorage.getItem("userInfo") || "{}");
  const currentUserId = userInfo.userId;


  // 1) 게시글 상세 조회
 
  const loadPost = async () => {
    try {
      const res = await api.postViewPath(postId); 
      const data = res.data || res;

      const extended = {
        ...data,
        isOwner: data.writerId === currentUserId
      };

      setPost(extended); 
    } catch (e) {
      console.error("게시글 조회 실패:", e);
    }
  };

  // 2) 댓글 불러오기
  
  const loadComments = async (page, size) => {
    try {
      const res = await api.cmtViewPath(postId, page, size);
      const data = res.data || res;
      const items = data.items || [];
      const mapped = items.map((c) => ({
        ...c,
        isMine: c.writerId === currentUserId,
      }));

      setComments(mapped);
    } catch (e) {
      console.error("댓글 조회 실패:", e);
    }
  };

  useEffect(() => {
    loadPost();
    loadComments(0,PAGE_SIZE);
  }, [postId]);

  // 3) 댓글 등록

  const submitComment = async () => {
    if (!commentText.trim()) return;

    try {
      await api.writeComment(postId, commentText);

      setCommentText("");
      loadComments(0,PAGE_SIZE); // 새 댓글 반영
    } catch (e) {
      console.error("댓글 작성 실패:", e);
    }
  };

  // 4) 댓글 삭제

  const deleteComment = async (commentId) => {
    try {
      await api.cmtDeletePath(postId, commentId);
      loadComments(0,PAGE_SIZE);
    } catch (e) {
      console.error("댓글 삭제 실패:", e);
    }
  };

  // 5) 게시글 수정 / 삭제

  const editPost = () => {
    // 수정 모드로 전환 (상위 페이지로 알림)
    if (api.onEditPost) api.onEditPost(postId);
  };

  const deletePost = async () => {
    const ok = window.confirm("정말 삭제할까요?");
    if (!ok) return;

    try {
      await api.deletePost(postId);
      if (onBack) onBack(); // 목록으로 돌아가기
    } catch (e) {
      console.error("게시글 삭제 실패:", e);
    }
  };

  if (!post) return <div>로딩중...</div>;

  return (
    <div className="community-post-view">

      {/* 게시글 본문 */}
      <div className="community-post-card">
        <h2 className="community-post-title">{post.title}</h2>

        <div className="community-post-meta">
          <span className="meta-nickname">{post.nickname}</span>
          <span className="meta-time">{timeAgo(post.createdAt)}</span>
        </div>

        <div className="community-post-content">{post.content}</div>

        <div className="community-post-footer">
          <div className="post-stats">
            <div className="stat-item">
              <MessageSquare size={18} />
              <span>{viewCount}</span>
            </div>
          </div>

          {post.isOwner && (
            <div className="post-option">
              <MoreVertical
                size={22}
                className="option-icon"
                onClick={() => setOpenMenu((v) => !v)}
              />

              {openMenu && (
                <div className="post-option-menu">
                  <div className="option-item" onClick={editPost}>
                    수정하기
                  </div>
                  <div className="option-item delete" onClick={deletePost}>
                    삭제하기
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* 댓글 리스트 */}
      <div className="community-comment-section">

        {comments.length === 0 && (
          <div className="community-no-comment">댓글이 없습니다.</div>
        )}

        {comments.map((c) => (
          <div key={c.commentId} className="community-comment-item">

            <div className="comment-meta-row">
              <span className="comment-nickname">{c.nickname}</span>
              <span className="comment-time">{timeAgo(c.createdAt)}</span>

              {c.isMine && c.status !== 'DELETED' &&
                <span
                  className="comment-delete"
                  onClick={() => deleteComment(c.commentId)}
                >
                  삭제
                </span>
              }
            </div>

            <div className="comment-content">{c.content}</div>

            <div className="comment-reply-row">
              <div className="reply-count">
                <CornerDownRight size={14} />
                <span>{c.childCommentCount ?? 0}</span>
              </div>

              <button
                className="reply-btn"
                onClick={() => console.log("답글 작성 기능 준비됨")}
              >
                답글 작성
              </button>
            </div>
          </div>
        ))}

      </div>

      {/* 댓글 입력폼 */}
      <div className="community-comment-input-row">
        <input
          type="text"
          className="comment-input"
          placeholder="댓글을 입력하세요"
          value={commentText}
          onChange={(e) => setCommentText(e.target.value)}
        />
        <button className="comment-submit" onClick={submitComment}>
          등록
        </button>
      </div>

    </div>
  );
}