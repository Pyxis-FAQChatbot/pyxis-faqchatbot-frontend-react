import axiosInstance from "./axiosInstance";
import endpoints from "./endpoints";

// 아이디 중복확인
export const checkIdPath = async (loginId) => {
  const response = await axiosInstance.get(endpoints.auth.checkId, {
    params: { loginId }, // axios의 params 옵션 사용
  });
  return response.data;
};

// 닉네임 중복확인
export const checkNickPath = async (nickname) => {
  const response = await axiosInstance.get(endpoints.auth.checkNickname, {
    params: { nickname },
  });
  return response.data;
};

// 회원가입 요청

export const registerPath = async (data) => {
  const response = await axiosInstance.post(endpoints.auth.signup, data);
  return response.data;
};
