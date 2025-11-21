import React, { useEffect, useState } from "react";
import { timeAgo } from "../utils/timeAgo";
import {
  MessageSquare,
  MoreVertical,
  CornerDownRight,
} from "lucide-react";
import { useNavigate } from "react-router-dom"

export default function PostDetailView({
  postId,             // 게시글 번호
  api,                // API 객체 (post, comment) - 상위에서 전달
  onBack= () => {},   // 뒤로가기 필요 시
  onPostLoaded = () => {}
}) {
  const navigate = useNavigate();
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
  // 닉네임 익명설정
  const displayNick = (nick) => {
    if (!post) return nick;
    if (post.community.postType === "ANONYMOUS") return "익명";
    return nick;
  };

  // 1) 게시글 상세 조회
 
  const loadPost = async () => {
    try {
      const res = await api.postViewPath(postId); 
      const data = res.data || res;

      const extended = {
        ...data,
        isOwner: data.userId === currentUserId
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
      const mapped = data.items.map((c) => ({
        ...c,
        isMine: c.userId === currentUserId,
        isReplyOpen: false,
        replies: [],
      }));

      setComments(mapped);
    } catch (e) {
      console.error("댓글 조회 실패:", e);
    }
  };

  useEffect(() => {
  
    if (!postId) return
    loadPost();
    loadComments(0,PAGE_SIZE);
  }, [postId]);

  useEffect(() => {
    if (post) onPostLoaded(post);
  }, [post]);  

  // 3) 댓글 등록

  const submitComment = async () => {
    if (!commentText.trim()) return;

    try {
      await api.cmtCreatePath(postId, {
        parentId: null,
        content: commentText
      });

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
    navigate(`/community/${postId}/edit`);
  };

  const deletePost = async () => {
    const ok = window.confirm("정말 삭제할까요?");
    if (!ok) return;

    try {
      await api.postDeletePath(postId);
      onBack(); // 목록으로 돌아가기
    } catch (e) {
      console.error("게시글 삭제 실패:", e);
    }
  };
  // 6. 대댓글 조회
  const loadReplies = async (parentId, page, size) => {
  try {
    const res = await api.replyViewPath(postId, parentId, page, size);
    const data = res.data || res;

    const replyItems = data.items.map((r) => ({
      ...r,
      isMine: r.userId === currentUserId
    }));

    setComments((prev) =>
      prev.map((c) =>
        c.commentId === parentId
          ? { ...c, replies: replyItems }
          : c
      )
    );

  } catch (e) {
    console.error("대댓글 조회 실패:", e);
  }
};
  // 7. 대댓글 작성
  const submitReply = async (parentCommentId, text) => {
    if (!text.trim()) return;

    try {
      await api.cmtCreatePath(postId, {
        content: text,
        parentId: parentCommentId
      });

      loadReplies(parentCommentId, 0, PAGE_SIZE); // 등록 후 곧바로 대댓글 갱신

      setComments(prev =>   // 초기화
        prev.map(c =>
          c.commentId === parentCommentId
            ? { ...c, replyInput: "" }
            : c
        )
      );
    } catch (e) {
      console.error("대댓글 작성 실패:", e);
    }
  };
  // 8. 대댓글 트리거
  const toggleReplySection = (commentId) => {
    setComments((prev) => {
      const updated = prev.map((c) =>
        c.commentId === commentId
          ? { ...c, isReplyOpen: !c.isReplyOpen }
          : c
      );

      const target = updated.find((c) => c.commentId === commentId);

      if (target.isReplyOpen) {
        loadReplies(commentId, 0, PAGE_SIZE);
      }

      return updated;
    });
  };

  if (!post) return <div>로딩중...</div>;

  return (
    <div className="community-post-view">

      {/* 게시글 본문 */}
      <div className="community-post-card">
        <h2 className="community-post-title">{post.community.title}</h2>

        <div className="community-post-meta">
          <span className="meta-nickname">{
          displayNick(post.nickname)
          }</span>
          <span className="meta-time">{timeAgo(post.community.createdAt)}</span>
        </div>

        <div className="community-post-content">{post.community.content}</div>

        <div className="community-post-footer">
          <div className="post-stats">
            <div className="stat-item">
              <MessageSquare size={18} />
              <span>{post.community.viewCount}</span>
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
              <span className="comment-nickname">{displayNick(c.nickname)}</span>
              <span className="comment-time">{timeAgo(c.createdAt)}</span>

              {c.isMine && c.status === 'ACTIVE' &&
                <span
                  className="comment-delete"
                  onClick={() => deleteComment(c.commentId)}
                >
                  삭제
                </span>
              }
            </div>

            <div className="comment-content">{c.content}</div>

            <div 
              className="comment-reply-row"
            >
              <div className="reply-count">
                <CornerDownRight size={14} />
                <span>{c.childCommentCount ?? 0}</span>
              </div>
              <button
                className="reply-btn"
                onClick={() => toggleReplySection(c.commentId)}
              >
                {c.isReplyOpen ? "닫기" : (c.childCommentCount ? "답글 보기" : "답글 작성")}
              </button>
            </div>
            {/* 대댓글 목록 */}
            {c.isReplyOpen && (
              <div className="reply-wrapper">
                
                {c.replies.map((r) => (
                  <div key={r.commentId} className="reply-item">
                    <div className="reply-meta">
                      <span>
                        <span>{displayNick(r.nickname)}</span>
                        <span>{timeAgo(r.createdAt)}</span>
                      </span>

                      {r.isMine && r.status === 'ACTIVE' && (
                        <span className="reply-delete" onClick={() => deleteComment(r.commentId)}>삭제</span>
                      )}
                    </div>

                    <div className="reply-content">{r.content}</div>
                  </div>
                ))}
                {c.status === 'ACTIVE' &&
                  <div className="reply-input-row">
                    <input
                      className="reply-input"
                      placeholder="답글을 입력하세요"
                      value={c.replyInput || ""}
                      onChange={(e) =>
                        setComments((prev) =>
                          prev.map((c2) =>
                            c2.commentId === c.commentId
                              ? { ...c2, replyInput: e.target.value }
                              : c2
                          )
                        )
                      }
                    />
                    <button
                      className="reply-submit"
                      onClick={() => submitReply(c.commentId, c.replyInput)}
                    >
                      등록
                    </button>
                  </div>
                }

              </div>
            )}
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