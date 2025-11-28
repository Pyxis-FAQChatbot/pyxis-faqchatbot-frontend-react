import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { loginPath } from "../api/loginApi";
import { myInfoPath } from "../api/authApi";
import logo from "../assets/pyxis_logo.png";
import Input from "../components/ui/Input";
import Button from "../components/ui/Button";

const Login = () => {
  const navigate = useNavigate();

  // 상태 정의
  const [formData, setFormData] = useState({
    loginId: "",
    password: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});

  // 입력값 변경 핸들러
  const handleInputChange = (e) => {
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
    if (!formData.loginId.trim()) newErrors.loginId = "아이디를 입력해주세요.";
    if (!formData.password.trim()) newErrors.password = "비밀번호를 입력해주세요.";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // 로그인 처리
  const handleLogin = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    setIsLoading(true);

    try {
      //로그인 요청
      await loginPath(formData);
      const profile = await myInfoPath();

      // 프론트세션에 저장
      sessionStorage.setItem(
        "userInfo",
        JSON.stringify({
          userId: profile.id,
          loginId: profile.loginId,
          nickname: profile.nickname,
          role: profile.role,
        })
      );

      navigate("/main");
    } catch (err) {
      if (err.error === "USER_NOT_FOUND") {
        setErrors({
          general: "존재하지 않는 아이디입니다."
        });
      } else if (err.error === "PASSWORD_NOT_MATCH") {
        setErrors({
          general: "로그인에 실패했습니다. 아이디와 비밀번호를 확인해주세요.",
        });
      } else {
        console.log('에러 : ', err)
        setErrors({
          general: "알 수 없는 오류가 발생했습니다.",
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignup = () => {
    navigate("/signup");
  };

  return (
    <div className="flex flex-col items-center justify-center h-full w-full bg-white dark:bg-slate-950 transition-colors duration-300 overflow-hidden">
      <div className="mt-[40px] w-full max-w-[320px] flex flex-col items-center gap-4 sm:gap-6 scale-90 sm:scale-100 origin-center">
        {/* Logo Section */}
        <div className="flex flex-col items-center gap-2 animate-float">
          <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-gradient-to-tr from-primary/20 to-secondary/20 dark:from-primary/30 dark:to-secondary/30 flex items-center justify-center shadow-glow backdrop-blur-sm border border-white/50 dark:border-slate-700/50 transition-colors">
            <img src={logo} alt="pyxisLogo" className="w-10 h-10 sm:w-12 sm:h-12 object-contain drop-shadow-lg" />
          </div>
          <h1 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            Pyxis
          </h1>
        </div>

        {/* Form Section */}
        <form className="w-full space-y-3 sm:space-y-4" onSubmit={handleLogin}>
          <div className="min-h-[20px] flex items-center justify-center">
            {errors.general && (
              <div className="w-full p-2 rounded-xl bg-red-50 dark:bg-red-900/30 border border-red-100 dark:border-red-800/50 text-red-500 dark:text-red-400 text-xs text-center font-medium animate-fade-in transition-colors">

                {errors.general}
              </div>
            )}
          </div>

          <div className="space-y-2 sm:space-y-3">
            <Input
              name="loginId"
              placeholder="아이디"
              value={formData.loginId}
              onChange={handleInputChange}
              disabled={isLoading}
              error={errors.loginId}
              className="py-3 text-sm"
            />

            <Input
              type="password"
              name="password"
              placeholder="패스워드"
              value={formData.password}
              onChange={handleInputChange}
              disabled={isLoading}
              error={errors.password}
              className="py-3 text-sm"
            />
          </div>

          <div className="space-y-2 pt-1 sm:pt-2">
            <Button type="submit" disabled={isLoading} className="shadow-lg shadow-primary/30 w-full py-3 text-sm">
              {isLoading ? "로그인 중..." : "로그인"}
            </Button>
          </div>
        </form>

        {/* Social Login Section */}
        <div className="w-full space-y-3 sm:space-y-4">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-200 dark:border-slate-700"></div>
            </div>
            <div className="relative flex justify-center text-xs sm:text-sm">
              <span className="px-2 bg-white dark:bg-slate-950 text-slate-500 dark:text-slate-400 transition-colors">SNS 계정으로 로그인</span>
            </div>
          </div>

          <div className="flex gap-6 justify-center">
            {/* Kakao */}
            <button
              className="w-12 h-12 rounded-xl bg-[#FEE500] hover:bg-[#FDD835] transition-colors flex items-center justify-center"
              onClick={() => {
                // 백엔드 base URL (로컬/배포 자동 대응)
                const backendUrl = import.meta.env.VITE_API_BASE_URL;
                window.location.href = `${backendUrl}/login/kakao`;
              }}
            >
              <svg
                width="32"
                height="32"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M12 3C7.58 3 4 5.79 4 9.24C4 11.22 5.28 12.98 7.26 14.07L6.46 17.03C6.4 17.26 6.67 17.46 6.87 17.32L10.37 15.01C10.9 15.09 11.44 15.13 12 15.13C16.42 15.13 20 12.34 20 8.89C20 5.45 16.42 3 12 3Z"
                  fill="#3C1E1E"
                />
              </svg>
            </button>

            {/* Naver */}
            <button className="w-12 h-12 rounded-xl bg-[#03C75A] hover:bg-[#02B150] transition-colors flex items-center justify-center">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M5 4H9.5L14.5 12.5V4H19V20H14.5L9.5 11.5V20H5V4Z" fill="white" />
              </svg>
            </button>

            {/* Google */}
            <button className="w-12 h-12 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 transition-colors flex items-center justify-center">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M22.56 12.25C22.56 11.47 22.49 10.72 22.35 10H12V14.12H17.92C17.66 15.52 16.88 16.71 15.71 17.5V20.31H19.27C21.35 18.39 22.56 15.57 22.56 12.25Z" fill="#4285F4" />
                <path d="M12 23C14.97 23 17.46 22.01 19.28 20.34L15.71 17.53C14.73 18.19 13.47 18.58 12 18.58C9.13 18.58 6.71 16.64 5.84 14.03H2.17V16.88C3.98 20.47 7.7 22.95 12 23Z" fill="#34A853" />
                <path d="M5.84 14.03C5.62 13.37 5.5 12.67 5.5 11.95C5.5 11.23 5.62 10.53 5.84 9.87V7.02H2.17C1.43 8.5 1 10.18 1 11.95C1 13.72 1.43 15.4 2.17 16.88L5.84 14.03Z" fill="#FBBC05" />
                <path d="M12 5.38C13.62 5.38 15.06 5.94 16.21 7.02L19.36 3.87C17.45 2.09 14.97 1 12 1C7.7 1 3.98 3.47 2.17 7.02L5.84 9.87C6.71 7.26 9.13 5.38 12 5.38Z" fill="#EA4335" />
              </svg>
            </button>
          </div>
        </div>

        <div className="text-center pt-1">
          <button
            type="button"
            onClick={handleSignup}
            className="text-xs text-slate-500 dark:text-slate-400 hover:text-primary transition-colors"
          >
            아이디가 없으면 <span className="font-semibold text-primary">회원가입</span>으로 이동
          </button>
        </div>
      </div>
    </div>
  );
};

export default Login;