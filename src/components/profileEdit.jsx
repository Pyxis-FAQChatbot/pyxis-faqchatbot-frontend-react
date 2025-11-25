import React, { useEffect, useState } from "react";
import { myInfoPath, checkNickPath, myEditApi } from "../api/authApi";
import "../styles/overlay.css";

export default function UserEditOverlay({ mode, onClose, onUpdated }) {
  const [profileForm, setProfileForm] = useState({
    nickname: "",
    addressMain: "",
  });

  const [passwordForm, setPasswordForm] = useState({
    oldPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [originalData, setOriginalData] = useState("");
  const [nicknameChecked, setNicknameChecked] = useState(false);
  const fetchUserInfo = async () => {
    const res = await myInfoPath(); // 세션 기반 조회
    setOriginalData(res);
    setProfileForm({
      nickname: res.nickname,
      addressMain: res.addressMain,
    });
  };
  
  // 🔥 최초 렌더링 시 유저 정보 가져오기 (프로필일 때만)
  useEffect(() => {
    if (mode === "profile") {
      fetchUserInfo();
    }
  }, [mode]);
  const isChanged =
    originalData &&
    (originalData.nickname !== profileForm.nickname ||
      originalData.addressMain !== profileForm.addressMain);
  
  const submitProfile = async (e) => {
    e.preventDefault();
    if (profileForm.nickname !== originalData.nickname) {
      await myEditApi.nickPath({newNickname : profileForm.nickname});
    }
    if (profileForm.addressMain !== originalData.addressMain) {
      await myEditApi.addressPath({newAddress : profileForm.addressMain});
    }
    alert("내 정보가 수정되었습니다.");
    onUpdated();
    onClose();
  }

  const handleNicknameCheck = async () => {
    if (profileForm.nickname === originalData.nickname) {
      alert("닉네임이 변경되지 않았습니다.");
      return;
    }
  
    try {
      await checkNickPath(profileForm.nickname);
      alert("사용 가능한 닉네임입니다!");
      setNicknameChecked(true);
    } catch (err) {
      if (err.response && err.response.status === 400) {
        alert(err.response.data.message || "이미 사용 중인 닉네임입니다.");
        setNicknameChecked(false);
      } else {
        alert("닉네임 중복확인 중 오류가 발생했습니다.");
        console.error(err);
      }
    }
  };
  const submitPassword = async (e) => {
    e.preventDefault();
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      alert("새 비밀번호가 일치하지 않습니다.");
      return;
    }
    try {
      await myEditApi.pwPath({
        oldPassword: passwordForm.oldPassword,
        newPassword: passwordForm.newPassword,
      });
    } catch (err) {
      alert(err.message);
      console.error("비밀번호 에러", err);
      return;
    }
    alert("비밀번호가 변경되었습니다.");
    onClose();
  };
  
  return (
    <div className="editer-overlay overlay">
      <div className="popup-box">

        {/* 🔥 mode에 따라 제목 변경 */}
        <h2>
          {mode === "profile" ? "내 정보 수정" : "비밀번호 변경"}
        </h2>

        {/* 🔥 프로필 수정 모드 */}
        {mode === "profile" && (
          
          <form onSubmit={submitProfile}>
            <label>닉네임</label>
            <div className="editer-button-wrap">
              <input
                type="text"
                value={profileForm.nickname}
                onChange={(e) =>
                  setProfileForm((prev) => ({ ...prev, nickname: e.target.value }))
                }
              />
              <button
                type="button"
                onClick={handleNicknameCheck}
              >
                중복확인
              </button>
            </div>

            <label>주소</label>
            <select
              name="addressMain"
              value={profileForm.addressMain}
              onChange={(e) =>
                setProfileForm((prev) => ({ ...prev, addressMain: e.target.value }))
              }
            >
              {regions.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>

            <button 
              className="submit-btn" 
              onClick={submitProfile}
              disabled={!isChanged}
            >저장</button>
          </form>
        )}

        {/* 🔥 비밀번호 변경 모드 */}
        {mode === "password" && (
          <form onSubmit={submitPassword}>
            <label>현재 비밀번호</label>
            <input
              type="password"
              value={passwordForm.oldPassword}
              onChange={(e) =>
                setPasswordForm((prev) => ({ ...prev, oldPassword: e.target.value }))
              }
            />

            <label>새 비밀번호</label>
            <input
              type="password"
              value={passwordForm.newPassword}
              onChange={(e) =>
                setPasswordForm((prev) => ({ ...prev, newPassword: e.target.value }))
              }
            />

            <label>새 비밀번호 확인</label>
            <input
              type="password"
              value={passwordForm.confirmPassword}
              onChange={(e) =>
                setPasswordForm((prev) => ({ ...prev, confirmPassword: e.target.value }))
              }
            />

            <button type="submit" className="submit-btn" onClick={submitPassword}>변경하기</button>
          </form>
        )}

        <button className="close-btn" onClick={onClose}>닫기</button>
      </div>
    </div>
  );
}

const regions = [
  "서울",
  "부산",
  "대구",
  "인천",
  "광주",
  "대전",
  "울산",
  "세종",
  "제주",
  "경기도",
  "강원도",
  "경상남도",
  "경상북도",
  "전라남도",
  "전라북도",
  "충청남도",
  "충청북도"
];