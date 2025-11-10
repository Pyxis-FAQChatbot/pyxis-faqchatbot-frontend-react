import axiosInstance from "./axiosInstance";
import endpoints from "./endpoints";

// 로그인처리
export const storePath = async (data) => {
  const response = await axiosInstance.post(endpoints.store.create, data);
  return response.data;
};