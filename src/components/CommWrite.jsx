import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import FloatButton from "../components/FloatButton";
import "../styles/CommunityListPage.css";

export default function CommunityWrite({
  api,
  mode = "write",      // write | edit
  postId = null,        // edit 모드일 때만 필요
  initialData = null,   // edit 모드일 때 기본 값
  onBack = () => {},    // 뒤로가기만 전달
}) {

  const navigate = useNavigate();

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [isAnonymous, setIsAnonymous] = useState(false);

  // 수정모드일 경우 initialData로 input 초기화
  useEffect(() => {
    if (mode === "edit" && initialData) {
      setTitle(initialData.title || "");
      setContent(initialData.content || "");
      setIsAnonymous(initialData.community.postType === "ANONYMOUS");
    }
  }, [mode, initialData]);

  const handleSubmit = async () => {
    if (!title.trim() || !content.trim()) {
      alert("제목과 내용을 모두 입력해주세요.");
      return;
    }

    const ok = window.confirm(
      mode === "edit" ? "게시글을 수정하시겠습니까?" : "게시글을 등록하시겠습니까?"
    );
    if (!ok) return;

    try {
      if (mode === "write") {

        // 게시글 작성 API
        const res = await api.postCreatePath({
          title,
          content,
          postType: isAnonymous ? "ANONYMOUS" : "DEFAULT"
        });

        const createdId = res.commPostyId;

        alert("게시글이 등록되었습니다.");
        navigate(`/community/${createdId}`); // 상세페이지로 바로 이동

      } else {
        // 수정 API
        await api.postEditPath(postId, {
          title,
          content,
          postType: isAnonymous ? "ANONYMOUS" : "DEFAULT"
        });

        alert("게시글이 수정되었습니다.");
        onBack();  // 기존 상세페이지 or 이전 화면으로 돌아가기
      }

    } catch (err) {
      console.error("게시글 저장 실패:", err);
      alert("게시글 저장 중 오류가 발생했습니다.");
    }
  };

  return (
    <div className="community-write-page">

      <div className="community-write-box">
        {/* 제목 */}
        <input
          type="text"
          className="community-write-title"
          placeholder="제목을 입력하세요"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />

        {/* 내용 */}
        <textarea
          className="community-write-content"
          placeholder="내용을 입력하세요"
          value={content}
          onChange={(e) => setContent(e.target.value)}
        />
      </div>
      <div className="write-complete-bar">
        <div className="write-type-select">
          <button 
            className={isAnonymous ? "" : "active"}
            onClick={() => setIsAnonymous(false)}
          >
            일반
          </button>
          <button
            className={isAnonymous ? "active" : ""}
            onClick={() => setIsAnonymous(true)}
          >
            익명
          </button>
        </div>
        <button
          onClick={handleSubmit}
        >
          작성
        </button>
      </div>
      {/* 작성/수정 버튼 */}
    </div>
  );
}
