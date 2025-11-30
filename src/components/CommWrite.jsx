import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import Button from "./ui/Button";
import Input from "./ui/Input";
import { User, Ghost, X } from "lucide-react";

export default function CommunityWrite({
  api,
  mode = "write",
  postId = null,
  initialData = null,
  onBack = () => { },
}) {
  const navigate = useNavigate();
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const titleRef = useRef(null);
  const textareaRef = useRef(null);
  const MAX_FILE_SIZE = 5 * 1024 * 1024;
  const MAX_TITLE_LENGTH = 100;
  const MAX_CONTENT_LENGTH = 255;

  useEffect(() => {
    if (mode === "edit" && initialData) {
      console.log("Editing with initialData:", initialData);
      setTitle(initialData.title || "");
      setContent(initialData.content || "");
      setIsAnonymous(initialData.postType === "ANONYMOUS");

      // Load existing image if available
      const imageUrl = initialData.imageURL || initialData.imageUrl;
      if (imageUrl) {
        setImagePreview(imageUrl);
      }
    }
  }, [mode, initialData]);

  // Auto-resize textarea
  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      textarea.style.height = `${textarea.scrollHeight}px`;
    }
  }, [content]);

  // Auto-resize title
  useEffect(() => {
    const titleTextarea = titleRef.current;
    if (titleTextarea) {
      titleTextarea.style.height = 'auto';
      titleTextarea.style.height = `${titleTextarea.scrollHeight}px`;
    }
  }, [title]);

  const handleSubmit = async () => {
    if (!title.trim() || !content.trim()) {
      alert("제목과 내용을 모두 입력해주세요.");
      return;
    }

    try {
      const formData = new FormData();

      // JSON 데이터
      const jsonData = {
        title,
        content,
        postType: isAnonymous ? "ANONYMOUS" : "DEFAULT"
      };

      // JSON을 Blob으로 변환 (명확하게 application/json 지정)
      const blob = new Blob([JSON.stringify(jsonData)], {
        type: 'application/json'
      });

      // 'data'라는 이름으로 추가 (파일명은 선택사항이지만 명시하는 게 안전)
      formData.append('data', blob, 'data.json');

      // 파일이 있는 경우만 추가
      if (imageFile) {
        formData.append('file', imageFile);
      }

      // API 호출
      if (mode === "write") {
        await api.postCreatePath(formData);
        alert("게시글이 등록되었습니다.");
        onBack();
      } else if (mode === "edit") {
        await api.postEditPath(postId, formData);
        alert("게시글이 수정되었습니다.");
        onBack();
      }

    } catch (err) {
      console.error("게시글 저장 실패:", err);
      alert(err.response?.data?.message || "게시글 저장 중 오류가 발생했습니다.");
    }
  };

  return (
    <div className="flex flex-col h-full bg-white dark:bg-slate-900 transition-colors">
      <div className="flex-1 p-6 space-y-4">
        {/* Title */}
        <div className="relative">
          <textarea
            ref={titleRef}
            placeholder="제목을 입력하세요"
            value={title}
            onChange={(e) => {
              if (e.target.value.length <= MAX_TITLE_LENGTH) {
                setTitle(e.target.value);
              }
            }}
            className="w-full min-h-[3rem] p-4 text-lg font-bold rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 text-slate-800 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-primary/50 dark:focus:ring-primary/40 resize-none transition-colors overflow-hidden"
            rows={1}
          />
          <div className={`absolute bottom-2 right-3 text-xs ${title.length >= MAX_TITLE_LENGTH ? 'text-red-500' :
            title.length >= 80 ? 'text-orange-500' :
              'text-slate-400'
            }`}>
            {title.length}/{MAX_TITLE_LENGTH}
          </div>
        </div>

        {/* Content */}
        <div className="relative">
          <textarea
            ref={textareaRef}
            className="w-full min-h-40 p-4 pb-8 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 text-slate-800 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-primary/50 dark:focus:ring-primary/40 resize-none transition-colors overflow-hidden"
            placeholder="내용을 입력하세요"
            value={content}
            onChange={(e) => {
              if (e.target.value.length <= MAX_CONTENT_LENGTH) {
                setContent(e.target.value);
              }
            }}
          />
          <div className={`absolute bottom-2 right-3 text-xs ${content.length >= MAX_CONTENT_LENGTH ? 'text-red-500' :
            content.length >= 200 ? 'text-orange-500' :
              'text-slate-400'
            }`}>
            {content.length}/{MAX_CONTENT_LENGTH}
          </div>
        </div>

        {/* 이미지 업로드 영역 */}
        <div
          className="w-full p-3 mt-2 mb-4 border border-slate-200 dark:border-slate-700 rounded-xl cursor-pointer bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300"
          onClick={() => document.getElementById("imageUploadInput").click()}
        >
          {imageFile ? (
            <span className="text-sm font-medium">📎 {imageFile.name}</span>
          ) : (
            <span className="text-sm text-slate-400">+ 이미지 업로드 (1개)</span>
          )}
        </div>

        <input
          id="imageUploadInput"
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (!file) return;

            // 파일 유형 체크
            if (!file.type.startsWith("image/")) {
              alert("이미지 파일만 업로드할 수 있습니다.");
              return;
            }

            // 용량 체크 (5MB 기준)
            if (file.size > MAX_FILE_SIZE) {
              alert("이미지 파일은 5MB 이하만 업로드할 수 있습니다.");
              return;
            }

            setImageFile(file);
            // Create preview URL
            const previewUrl = URL.createObjectURL(file);
            setImagePreview(previewUrl);
          }}
        />

        {/* Image Preview */}
        {imagePreview && (
          <div className="relative mt-4 w-32 h-32 group">
            <img
              src={imagePreview}
              alt="Preview"
              className="w-full h-full object-cover rounded-xl transition-transform duration-300 group-hover:scale-[1.02] group-hover:animate-subtle-wiggle"
            />
            <button
              onClick={() => {
                setImageFile(null);
                setImagePreview(null);
                URL.revokeObjectURL(imagePreview);
                document.getElementById("imageUploadInput").value = "";
              }}
              className="absolute -top-2 -right-2 p-1 bg-white dark:bg-slate-800 backdrop-blur-sm rounded-full shadow-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-all hover:scale-110 active:scale-95"
              title="이미지 삭제"
            >
              <X size={14} className="text-slate-700 dark:text-slate-200" />
            </button>
          </div>
        )}

      </div>

      <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 backdrop-blur-md transition-colors">
        <div className="flex items-center justify-between gap-4 mb-4">
          <div className="flex bg-slate-100 dark:bg-slate-800 rounded-xl p-1 transition-colors">
            <button
              onClick={() => setIsAnonymous(false)}
              className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${!isAnonymous ? "bg-white dark:bg-slate-700 text-primary shadow-sm" : "text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300"
                }`}
            >
              <User size={14} />
              일반
            </button>
            <button
              onClick={() => setIsAnonymous(true)}
              className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${isAnonymous ? "bg-white dark:bg-slate-700 text-primary shadow-sm" : "text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300"
                }`}
            >
              <Ghost size={14} />
              익명
            </button>
          </div>
        </div>

        {mode === "edit" ? (
          <div className="flex gap-2">
            <button
              onClick={onBack}
              className="flex-1 px-4 py-3 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-medium hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
            >
              취소
            </button>
            <Button
              onClick={handleSubmit}
              className="flex-1"
            >
              수정
            </Button>
          </div>
        ) : (
          <Button onClick={handleSubmit}>
            작성 완료
          </Button>
        )}
      </div>
    </div>
  );
}
