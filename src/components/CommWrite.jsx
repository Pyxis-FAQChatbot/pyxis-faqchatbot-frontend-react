import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Button from "./ui/Button";
import Input from "./ui/Input";
import { User, Ghost } from "lucide-react";

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
  const MAX_FILE_SIZE = 5 * 1024 * 1024;

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
      <div className="flex-1 p-6 space-y-4 overflow-y-auto">
        <Input
          placeholder="제목을 입력하세요"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="text-lg font-bold"
        />

        <textarea
          className="w-full h-[calc(100%-100px)] p-4 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 text-slate-800 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-primary/50 dark:focus:ring-primary/40 resize-none transition-colors"
          placeholder="내용을 입력하세요"
          value={content}
          onChange={(e) => setContent(e.target.value)}
        />
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
          }}
        />

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

        <Button onClick={handleSubmit}>
          {mode === "edit" ? "수정 완료" : "작성 완료"}
        </Button>
      </div>
    </div>
  );
}
