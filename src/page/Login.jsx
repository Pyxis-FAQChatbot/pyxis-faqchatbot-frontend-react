import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { loginPath } from "../api/loginApi";
import { myInfoPath } from "../api/authApi";
import axios from "axios";
import logo from "../assets/pyxis_logo.png";
import "../styles/Login.css";

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
      await loginPath( formData );
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
      } else if (err.error === "PASSWORD_NOT_MATCH"){
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
    <div className="page-wrapper">
      <div className="viewport">
        <div className="logo-box">
          <img src={logo} alt="pyxisLogo" />
        </div>
        <h1 className="title">Pyxis</h1>

        <form className="login-form" onSubmit={handleLogin}>
          {errors.general && (
            <div className="error-text text-center">{errors.general}</div>
          )}

          <input
            type="text"
            name="loginId"
            placeholder="아이디"
            value={formData.loginId}
            onChange={handleInputChange}
            disabled={isLoading}
            className={errors.loginId ? "error" : ""}
            required
          />
          {errors.loginId && (
            <div className="error-text">{errors.loginId}</div>
          )}

          <input
            type="password"
            name="password"
            placeholder="패스워드"
            value={formData.password}
            onChange={handleInputChange}
            disabled={isLoading}
            className={errors.password ? "error" : ""}
            required
          />
          {errors.password && <div className="error-text">{errors.password}</div>}

          <button type="submit" className="btn login-btn" disabled={isLoading}>
            {isLoading ? "로그인 중..." : "로그인"}
          </button>
        </form>

        <button className="btn signup-btn" onClick={handleSignup} type="button">
          회원가입
        </button>
      </div>
    </div>
  );
};

export default Login;