import { myInfoPath, myEditApi } from "../api/authApi";

export default function UserEditOverlay({ mode, onClose, onUpdated }) {
  const [profileData, setProfileData] = useState({
    nickname: "",
    address: "",
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  // 🔥 최초 렌더링 시 유저 정보 가져오기 (프로필일 때만)
  useEffect(() => {
    if (mode === "profile") {
      fetchUserInfo();
    }
  }, [mode]);

  const fetchUserInfo = async () => {
    const res = await myInfoPath(); // 세션 기반 조회
    setProfileData({
      nickname: res.nickname,
      address: res.address,
    });
  };

  const submitProfile = async (e) => {
    e.preventDefault();
    await userApi.updateProfile(profileData);
    alert("내 정보가 수정되었습니다.");
    onUpdated();
    onClose();
  };

  const submitPassword = async (e) => {
    e.preventDefault();
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      alert("새 비밀번호가 일치하지 않습니다.");
      return;
    }
    await userApi.updatePassword(passwordData);
    alert("비밀번호가 변경되었습니다.");
    onClose();
  };

  return (
    <div className="overlay-container">
      <div className="overlay-box">

        {/* 🔥 mode에 따라 제목 변경 */}
        <h2>
          {mode === "profile" ? "내 정보 수정" : "비밀번호 변경"}
        </h2>

        {/* 🔥 프로필 수정 모드 */}
        {mode === "profile" && (
          <form onSubmit={submitProfile}>
            <label>닉네임</label>
            <input
              type="text"
              value={profileData.nickname}
              onChange={(e) =>
                setProfileData((prev) => ({ ...prev, nickname: e.target.value }))
              }
            />

            <label>주소</label>
            <input
              type="text"
              value={profileData.address}
              onChange={(e) =>
                setProfileData((prev) => ({ ...prev, address: e.target.value }))
              }
            />

            <button type="submit">저장</button>
          </form>
        )}

        {/* 🔥 비밀번호 변경 모드 */}
        {mode === "password" && (
          <form onSubmit={submitPassword}>
            <label>현재 비밀번호</label>
            <input
              type="password"
              value={passwordData.currentPassword}
              onChange={(e) =>
                setPasswordData((prev) => ({ ...prev, currentPassword: e.target.value }))
              }
            />

            <label>새 비밀번호</label>
            <input
              type="password"
              value={passwordData.newPassword}
              onChange={(e) =>
                setPasswordData((prev) => ({ ...prev, newPassword: e.target.value }))
              }
            />

            <label>새 비밀번호 확인</label>
            <input
              type="password"
              value={passwordData.confirmPassword}
              onChange={(e) =>
                setPasswordData((prev) => ({ ...prev, confirmPassword: e.target.value }))
              }
            />

            <button type="submit">변경하기</button>
          </form>
        )}

        <button className="close-btn" onClick={onClose}>닫기</button>
      </div>
    </div>
  );
}
