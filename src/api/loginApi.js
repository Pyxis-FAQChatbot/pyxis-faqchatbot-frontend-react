import axiosInstance from "./axiosInstance";
import endpoints from "./endpoints";

// 로그인처리
export const loginPath = async (data) => {
  const response = await axiosInstance.post(endpoints.auth.login, data, {
    withCredentials: true });
  return response;
};

export const logoutPath = async (data) => {
  const response = await axiosInstance.post(endpoints.auth.logout, data);
  return response;
};

