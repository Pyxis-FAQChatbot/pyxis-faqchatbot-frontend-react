import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { checkIdPath, checkNickPath, registerPath, myInfoPath } from "../api/authApi";
import { loginPath } from "../api/loginApi";
import Input from "../components/ui/Input";
import Button from "../components/ui/Button";
import { ChevronLeft } from "lucide-react";

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
  const [idCheckMessage, setIdCheckMessage] = useState("");
  const [idCheckStatus, setIdCheckStatus] = useState(""); // "success" | "error" | ""
  const [nicknameCheckMessage, setNicknameCheckMessage] = useState("");
  const [nicknameCheckStatus, setNicknameCheckStatus] = useState(""); // "success" | "error" | ""

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
      setIdCheckMessage("아이디를 입력해주세요.");
      setIdCheckStatus("error");
      return;
    }
    try {
      await checkIdPath(formData.userId);
      setIdCheckMessage("사용 가능한 아이디입니다!");
      setIdCheckStatus("success");
      setIdChecked(true);
    } catch (err) {
      if (err.response && err.response.status === 400) {
        setIdCheckMessage(err.response.data.message || "이미 사용 중인 아이디입니다.");
        setIdCheckStatus("error");
        setIdChecked(false);
      } else {
        setIdCheckMessage("아이디 중복확인 중 오류가 발생했습니다.");
        setIdCheckStatus("error");
        console.error(err);
      }
    }
  };

  const handleNicknameCheck = async () => {
    if (!formData.nickname.trim()) {
      setNicknameCheckMessage("닉네임을 입력해주세요.");
      setNicknameCheckStatus("error");
      return;
    }

    try {
      await checkNickPath(formData.nickname);
      setNicknameCheckMessage("사용 가능한 닉네임입니다!");
      setNicknameCheckStatus("success");
      setNicknameChecked(true);
    } catch (err) {
      if (err.response && err.response.status === 400) {
        setNicknameCheckMessage(err.response.data.message || "이미 사용 중인 닉네임입니다.");
        setNicknameCheckStatus("error");
        setNicknameChecked(false);
      } else {
        setNicknameCheckMessage("닉네임 중복확인 중 오류가 발생했습니다.");
        setNicknameCheckStatus("error");
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
      const loginRes = await loginPath({
        loginId: formData.userId,
        password: formData.password,
      }, { withCredentials: true });

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

  const selectClassName = "w-full px-4 py-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 text-slate-800 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-primary/50 dark:focus:ring-primary/40 transition-all duration-300 appearance-none dark:autofill:bg-slate-800 dark:autofill:text-slate-100";

  return (
    <div className="flex flex-col min-h-full px-6 py-6 bg-white dark:bg-slate-950 transition-colors duration-300">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <button
          onClick={handleBackToLogin}
          className="p-2 -ml-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
        >
          <ChevronLeft className="text-slate-800 dark:text-slate-200" />
        </button>
        <h2 className="text-xl font-bold text-slate-900 dark:text-white">회원가입</h2>
      </div>

      <form className="space-y-4 pb-8" onSubmit={handleSubmit}>
        {errors.general && (
          <div className="p-2.5 rounded-xl bg-red-50 dark:bg-red-900/30 border border-red-100 dark:border-red-800/50 text-red-500 dark:text-red-400 text-xs text-center font-medium transition-colors">
            {errors.general}
          </div>
        )}

        {/* 아이디 */}
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-slate-600 dark:text-slate-300 ml-1">아이디</label>
          <div className="flex gap-2">
            <div className="flex-1">
              <Input
                name="userId"
                value={formData.userId}
                onChange={(e) => {
                  handleChange(e);
                  setIdCheckMessage("");
                  setIdCheckStatus("");
                }}
                placeholder="아이디 입력"
                required
                disabled={isLoading}
                error={errors.userId}
                className="!mt-0"
              />
            </div>
            <Button
              type="button"
              variant="secondary"
              className="!w-auto whitespace-nowrap !py-3 text-xs"
              onClick={handleIdCheck}
              disabled={isLoading}
            >
              중복확인
            </Button>
          </div>
          {idCheckMessage && (
            <p className={`text-xs ml-1 mt-1 ${idCheckStatus === "success" ? "text-green-600 dark:text-green-400" : "text-red-500 dark:text-red-400"
              }`}>
              {idCheckMessage}
            </p>
          )}
        </div>

        {/* 비밀번호 */}
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-slate-600 dark:text-slate-300 ml-1">비밀번호</label>
          <Input
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            placeholder="비밀번호 입력"
            required
            disabled={isLoading}
            error={errors.password}
            className="!mt-0"
          />
        </div>

        {/* 비밀번호 확인 */}
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-slate-600 dark:text-slate-300 ml-1">비밀번호 확인</label>
          <Input
            type="password"
            name="checkPassword"
            value={formData.checkPassword}
            onChange={handleChange}
            placeholder="비밀번호 재입력"
            required
            disabled={isLoading}
            error={errors.checkPassword}
            className="!mt-0"
          />
        </div>

        {/* 닉네임 */}
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-slate-600 dark:text-slate-300 ml-1">닉네임</label>
          <div className="flex gap-2">
            <div className="flex-1">
              <Input
                name="nickname"
                value={formData.nickname}
                onChange={(e) => {
                  handleChange(e);
                  setNicknameCheckMessage("");
                  setNicknameCheckStatus("");
                }}
                placeholder="닉네임 입력"
                required
                disabled={isLoading}
                error={errors.nickname}
                className="!mt-0"
              />
            </div>
            <Button
              type="button"
              variant="secondary"
              className="!w-auto whitespace-nowrap !py-3 text-xs"
              onClick={handleNicknameCheck}
              disabled={isLoading}
            >
              중복확인
            </Button>
          </div>
          {nicknameCheckMessage && (
            <p className={`text-xs ml-1 mt-1 ${nicknameCheckStatus === "success" ? "text-green-600 dark:text-green-400" : "text-red-500 dark:text-red-400"
              }`}>
              {nicknameCheckMessage}
            </p>
          )}
        </div>

        {/* 생년월일 */}
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-slate-600 dark:text-slate-300 ml-1">생년월일</label>
          <div className="grid grid-cols-3 gap-2">
            <select
              name="birthYear"
              value={formData.birthYear}
              onChange={handleChange}
              disabled={isLoading}
              required
              className={selectClassName}
            >
              <option value="">년도</option>
              {[...Array(100)].map((_, i) => (
                <option key={2025 - i} value={2025 - i}>{2025 - i}</option>
              ))}
            </select>
            <select
              name="birthMonth"
              value={formData.birthMonth}
              onChange={handleChange}
              disabled={isLoading}
              required
              className={selectClassName}
            >
              <option value="">월</option>
              {[...Array(12)].map((_, i) => (
                <option key={i + 1} value={i + 1}>{i + 1}</option>
              ))}
            </select>
            <select
              name="birthDay"
              value={formData.birthDay}
              onChange={handleChange}
              disabled={isLoading}
              required
              className={selectClassName}
            >
              <option value="">일</option>
              {[...Array(31)].map((_, i) => (
                <option key={i + 1} value={i + 1}>{i + 1}</option>
              ))}
            </select>
          </div>
          {errors.birth && <p className="text-[10px] text-red-500 dark:text-red-400 ml-1 mt-0.5">{errors.birth}</p>}
        </div>

        {/* 지역 */}
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-slate-600 dark:text-slate-300 ml-1">지역</label>
          <select
            name="addressMain"
            value={formData.addressMain}
            onChange={handleChange}
            required
            disabled={isLoading}
            className={`${selectClassName} ${errors.addressMain ? 'ring-2 ring-red-500/50 dark:ring-red-400/50 bg-red-50/50 dark:bg-red-900/20' : ''}`}
          >
            <option value="">선택</option>
            {["서울", "부산", "대구", "인천", "광주", "대전", "울산", "세종", "제주", "경기도", "강원도", "경상남도", "경상북도", "전라남도", "전라북도", "충청남도", "충청북도"].map((r) => (
              <option key={r} value={r}>{r}</option>
            ))}
          </select>
          {errors.addressMain && <p className="text-[10px] text-red-500 dark:text-red-400 ml-1 mt-0.5">{errors.addressMain}</p>}
        </div>

        {/* 성별 */}
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-slate-600 dark:text-slate-300 ml-1">성별</label>
          <div className="grid grid-cols-2 gap-2">
            <label className={`
              cursor-pointer rounded-2xl border p-2.5 flex items-center justify-center gap-2 transition-all text-sm
              ${formData.gender === 'MALE'
                ? 'bg-primary/10 dark:bg-primary/30 border-primary text-primary font-semibold'
                : 'bg-slate-50 dark:bg-slate-800 border-slate-100 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'}
            `}>
              <input
                type="radio"
                name="gender"
                value="MALE"
                checked={formData.gender === "MALE"}
                onChange={handleChange}
                disabled={isLoading}
                className="hidden"
              />
              남성
            </label>
            <label className={`
              cursor-pointer rounded-2xl border p-2.5 flex items-center justify-center gap-2 transition-all text-sm
              ${formData.gender === 'FEMALE'
                ? 'bg-primary/10 dark:bg-primary/30 border-primary text-primary font-semibold'
                : 'bg-slate-50 dark:bg-slate-800 border-slate-100 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'}
            `}>
              <input
                type="radio"
                name="gender"
                value="FEMALE"
                checked={formData.gender === "FEMALE"}
                onChange={handleChange}
                disabled={isLoading}
                className="hidden"
              />
              여성
            </label>
          </div>
          {errors.gender && <p className="text-[10px] text-red-500 dark:text-red-400 ml-1 mt-0.5">{errors.gender}</p>}
        </div>

        <Button type="submit" disabled={isLoading} className="mt-6 shadow-lg shadow-primary/30">
          {isLoading ? "가입 중..." : "회원가입 완료"}
        </Button>

        <div className="text-center pt-2 pb-4">
          <button
            type="button"
            onClick={handleBackToLogin}
            className="text-xs text-slate-500 dark:text-slate-400 hover:text-primary transition-colors"
          >
            아이디가 존재하면 <span className="font-semibold text-primary">로그인</span>으로 이동
          </button>
        </div>
      </form>
    </div>
  );
};

export default Signup;
