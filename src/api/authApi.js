import axiosInstance from "./axiosInstance";
import endpoints from "./endpoints";

// 아이디 중복확인
export const checkIdPath = async (loginId) => {
  const response = await axiosInstance.get(endpoints.auth.chackid, {
    params: { loginId }, // axios의 params 옵션 사용
  });
  return response;
};

// 닉네임 중복확인
export const checkNickPath = async (nickname) => {
  const response = await axiosInstance.get(endpoints.auth.chacknick, {
    params: { nickname },
  });
  return response;
};

// 회원가입 요청

export const registerPath = async (data) => {
  const response = await axiosInstance.post(endpoints.auth.signup, data);
  return response.data;
};

// 회원정보 불러오기

export const myInfoPath = async () => {
  const response = await axiosInstance.get(endpoints.my.me);
  return response.data;
};

// 내 게시글 조회
export const myPostPath = async (pageNum, sizeNum) => {
  const response = await axiosInstance.get(endpoints.my.post, {
    params: { page: pageNum, size: sizeNum}
  });
  return response.data;
};
// 내 댓글 조회
export const myCommentPath = async (pageNum, sizeNum) => {
  const response = await axiosInstance.get(endpoints.my.comment, {
    params: { page: pageNum, size: sizeNum}
  });
  return response.data;
};

