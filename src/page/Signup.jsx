import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { checkIdPath, checkNickPath, registerPath, myInfoPath } from "../api/authApi";
import { loginPath } from "../api/loginApi";
import "../styles/Signup.css";

const Signup = () => {
  const navigate = useNavigate();

  // 상태 정의
  const [formData, setFormData] = useState({
    userId: "",
    password: "",
    checkPassword: "",
    nickname: "",
    addressMain: "",
    gender: "",
    birthYear: "",
    birthMonth: "",
    birthDay: "",
  });

  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [idChecked, setIdChecked] = useState(false);
  const [nicknameChecked, setNicknameChecked] = useState(false);
  
  // 입력값 변경 핸들러
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  // 유효성 검사
  const validateForm = () => {
    const newErrors = {};

    if (!formData.userId.trim()) {
      newErrors.userId = "아이디를 입력해주세요.";
    } else if (!/^[a-zA-Z0-9]+$/.test(formData.userId)) {
      newErrors.userId = "아이디는 영문자와 숫자만 사용 가능합니다.";
    }

    if (!formData.password.trim()) {
      newErrors.password = "비밀번호를 입력해주세요.";
    }

    if (formData.password !== formData.checkPassword) {
      newErrors.checkPassword = "비밀번호가 일치하지 않습니다.";
    }

    if (!formData.nickname.trim()) {
      newErrors.nickname = "닉네임을 입력해주세요.";
    } else if (formData.nickname.length < 2 && formData.nickname.length > 21) {
      newErrors.nickname = "닉네임은 2자 이상, 20자 이하 이어야 합니다.";
    }

    if (!formData.birthYear || !formData.birthMonth || !formData.birthDay) {
      newErrors.birth = "생년월일을 모두 선택해주세요.";
    }

    if (!formData.addressMain) {
      newErrors.addressMain = "지역을 선택해주세요.";
    }

    if (!formData.gender) {
      newErrors.gender = "성별을 선택해주세요.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // 아이디/닉네임 중복확인
  const handleIdCheck = async () => {
    if (!formData.userId.trim()) {
      alert("아이디를 입력해주세요.");
      return;
    }
    try {
      await checkIdPath(formData.userId);
      alert("사용 가능한 아이디입니다!");
      setIdChecked(true);
    } catch (err) {
      if (err.response && err.response.status === 400) {
        alert(err.response.data.message || "이미 사용 중인 아이디입니다.");
        setIdChecked(false);
      } else {
        alert("아이디 중복확인 중 오류가 발생했습니다.");
        console.error(err);
      }
    }
  };

  const handleNicknameCheck = async () => {
    if (!formData.nickname.trim()) {
      alert("닉네임을 입력해주세요.");
      return;
    }
  
    try {
      await checkNickPath(formData.nickname);
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

  // 회원가입 처리
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    setIsLoading(true);

    try {
      const birthMonth = formData.birthMonth.padStart(2, "0");
      const birthDay = formData.birthDay.padStart(2, "0");

      const requestData = {
        loginId: formData.userId,
        password: formData.password,
        checkPassword: formData.checkPassword,
        nickname: formData.nickname,
        addressMain: formData.addressMain,
        gender: formData.gender,
        birthday: `${formData.birthYear}-${birthMonth}-${birthDay}`,
      };
    // 1. 가입요청
      const signupRes = await registerPath(requestData);

      console.log("회원가입 성공:", signupRes);
      // 2. 자동 로그인 처리
      const loginRes = await loginPath ({
        loginId: formData.userId,
        password: formData.password,
      },{ withCredentials: true });

      const profile = await myInfoPath();

  // 3. 프론트 세션에 사용자 정보 저장
      sessionStorage.setItem(
        "userInfo",
        JSON.stringify({
          userId: profile.id,
          loginId: profile.loginId,
          nickname: profile.nickname,
          role: profile.role,
        })
      );

    // 4. 1회성 팝업 플래그 저장 (메인에서 확인 예정)
      sessionStorage.setItem("showSignupPopup", "true");
      
      // 5. 메인 페이지로 이동
      navigate("/main", { replace: true });
    } catch (error) {
      console.error("회원가입 또는 자동 로그인 실패:", error);
      const message =
        error.response?.message ||
        "회원가입 중 문제가 발생했습니다. 다시 시도해주세요.";
      setErrors({ general: message });
    } finally {
      setIsLoading(false);
    }
  };

  // 로그인 페이지로 돌아가기
  const handleBackToLogin = () => {
    navigate("/");
  };

  return (
    <div className="page-wrapper">
      <div className="signup-container">
        <h2 className="signup-title">회원가입</h2>

        <form className="signup-form" onSubmit={handleSubmit}>
          {errors.general && (
            <div className="error-text text-center">{errors.general}</div>
          )}

          {/* 아이디 */}
          <div className="form-row">
            <label>아이디</label>
            <div className="input-with-btn">
              <input
                type="text"
                name="userId"
                value={formData.userId}
                onChange={handleChange}
                placeholder="아이디 입력"
                required
                disabled={isLoading}
                className={errors.userId ? "error" : ""}
              />
              <button type="button" onClick={handleIdCheck} disabled={isLoading}>
                중복확인
              </button>
            </div>
            {errors.userId && <div className="error-text">{errors.userId}</div>}
          </div>

          {/* 비밀번호 */}
          <div className="form-row">
            <label>비밀번호</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="비밀번호 입력"
              required
              disabled={isLoading}
              className={errors.password ? "error" : ""}
            />
            {errors.password && (
              <div className="error-text">{errors.password}</div>
            )}
          </div>

          {/* 비밀번호 확인 */}
          <div className="form-row">
            <label>비밀번호 확인</label>
            <input
              type="password"
              name="checkPassword"
              value={formData.checkPassword}
              onChange={handleChange}
              placeholder="비밀번호 재입력"
              required
              disabled={isLoading}
              className={errors.checkPassword ? "error" : ""}
            />
            {errors.checkPassword && (
              <div className="error-text">{errors.checkPassword}</div>
            )}
          </div>

          {/* 닉네임 */}
          <div className="form-row">
            <label>닉네임</label>
            <div className="input-with-btn">
              <input
                type="text"
                name="nickname"
                value={formData.nickname}
                onChange={handleChange}
                placeholder="닉네임 입력"
                required
                disabled={isLoading}
                className={errors.nickname ? "error" : ""}
              />
              <button
                type="button"
                onClick={handleNicknameCheck}
                disabled={isLoading}
              >
                중복확인
              </button>
            </div>
            {errors.nickname && (
              <div className="error-text">{errors.nickname}</div>
            )}
          </div>

          {/* 생년월일 */}
          <div className="form-row">
            <label>생년월일</label>
            <div className="birth-group">
              <select
                name="birthYear"
                value={formData.birthYear}
                onChange={handleChange}
                disabled={isLoading}
                required
              >
                <option value="">년도</option>
                {[...Array(100)].map((_, i) => (
                  <option key={2025 - i} value={2025 - i}>
                    {2025 - i}
                  </option>
                ))}
              </select>
              <select
                name="birthMonth"
                value={formData.birthMonth}
                onChange={handleChange}
                disabled={isLoading}
                required
              >
                <option value="">월</option>
                {[...Array(12)].map((_, i) => (
                  <option key={i + 1} value={i + 1}>
                    {i + 1}
                  </option>
                ))}
              </select>
              <select
                name="birthDay"
                value={formData.birthDay}
                onChange={handleChange}
                disabled={isLoading}
                required
              >
                <option value="">일</option>
                {[...Array(31)].map((_, i) => (
                  <option key={i + 1} value={i + 1}>
                    {i + 1}
                  </option>
                ))}
              </select>
            </div>
            {errors.birth && <div className="error-text">{errors.birth}</div>}
          </div>

          {/* 지역 */}
          <div className="form-row remain">
            <label>지역</label>
            <select
              name="addressMain"
              value={formData.addressMain}
              onChange={handleChange}
              required
              disabled={isLoading}
              className={errors.addressMain ? "error" : ""}
            >
              <option value="">선택</option>
              {[
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
                "충청북도",
              ].map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>
            {errors.addressMain && (
              <div className="error-text">{errors.addressMain}</div>
            )}
          </div>

          {/* 성별 */}
          <div className="form-row remain">
            <label>성별</label>
            <div className="gender-group">
              <label>
                <input
                  type="radio"
                  name="gender"
                  value="MALE"
                  checked={formData.gender === "MALE"}
                  onChange={handleChange}
                  disabled={isLoading}
                />
                남
              </label>
              <label>
                <input
                  type="radio"
                  name="gender"
                  value="FEMALE"
                  checked={formData.gender === "FEMALE"}
                  onChange={handleChange}
                  disabled={isLoading}
                />
                여
              </label>
            </div>
            {errors.gender && (
              <div className="error-text">{errors.gender}</div>
            )}
          </div>

          <button type="submit" className="submit-btn" disabled={isLoading}>
            {isLoading ? "가입 중..." : "회원가입"}
          </button>
        </form>

        <button
          type="button"
          className="back-btn"
          onClick={handleBackToLogin}
          disabled={isLoading}
        >
          ← 로그인으로 돌아가기
        </button>
      </div>
    </div>
  );
};

export default Signup;
