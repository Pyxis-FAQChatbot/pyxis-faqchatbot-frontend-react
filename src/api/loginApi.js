import axiosInstance from "./axiosInstance";
import endpoints from "./endpoints";

// 로그인처리
export const loginPath = async (data) => {
  const response = await axiosInstance.post(endpoints.auth.login, data);
  return response.data;
};
