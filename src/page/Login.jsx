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
    <div className="flex flex-col items-center justify-center min-h-[80%] px-6">
      <div className="w-full max-w-xs flex flex-col items-center gap-7">
        {/* Logo Section */}
        <div className="flex flex-col items-center gap-3 animate-float">
          <div className="w-28 h-28 rounded-full bg-gradient-to-tr from-primary/20 to-secondary/20 flex items-center justify-center shadow-glow backdrop-blur-sm border border-white/50">
            <img src={logo} alt="pyxisLogo" className="w-16 h-16 object-contain drop-shadow-lg" />
          </div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            Pyxis
          </h1>
        </div>

        {/* Form Section */}
        <form className="w-full space-y-4" onSubmit={handleLogin}>
          {errors.general && (
            <div className="p-2.5 rounded-xl bg-red-50 border border-red-100 text-red-500 text-xs text-center font-medium">
              {errors.general}
            </div>
          )}

          <div className="space-y-3">
            <Input
              name="loginId"
              placeholder="아이디"
              value={formData.loginId}
              onChange={handleInputChange}
              disabled={isLoading}
              error={errors.loginId}
            />

            <Input
              type="password"
              name="password"
              placeholder="패스워드"
              value={formData.password}
              onChange={handleInputChange}
              disabled={isLoading}
              error={errors.password}
            />
          </div>

          <div className="space-y-2 pt-2">
            <Button type="submit" disabled={isLoading} className="shadow-lg shadow-primary/30">
              {isLoading ? "로그인 중..." : "로그인"}
            </Button>

            <div className="text-center pt-1">
              <button
                type="button"
                onClick={handleSignup}
                className="text-xs text-slate-500 hover:text-primary transition-colors"
              >
                아이디가 없으면 <span className="font-semibold text-primary">회원가입</span>으로 이동
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login;