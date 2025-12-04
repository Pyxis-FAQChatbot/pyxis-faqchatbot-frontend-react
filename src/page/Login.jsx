import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { loginPath } from "../api/loginApi";
import { myInfoPath } from "../api/authApi";
import logo from "../assets/pyxis_logo.png";
import Input from "../components/ui/Input";
import Button from "../components/ui/Button";
import KakaoIcon from "../assets/icons/KakaoIcon";
import NaverIcon from "../assets/icons/NaverIcon";
import GoogleIcon from "../assets/icons/GoogleIcon";

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
                window.location.href = `/login/kakao`;
              }}
            >
              <KakaoIcon width={32} height={32} />
            </button>

            {/* Naver */}
            <button
              className="w-12 h-12 rounded-xl bg-[#03C75A] hover:bg-[#02B150] transition-colors flex items-center justify-center"
              onClick={() => {
                window.location.href = `/login/naver`;
              }}
            >
              <NaverIcon width={32} height={32} />
            </button>

            {/* Google */}
            <button className="w-12 h-12 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 transition-colors flex items-center justify-center">
              <GoogleIcon width={32} height={32} />
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