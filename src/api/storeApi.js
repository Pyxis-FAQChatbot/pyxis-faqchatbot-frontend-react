import axiosInstance from "./axiosInstance";
import endpoints from "./endpoints";

// 사업장 등록
export const CreatePath = async (data) => {
  const response = await axiosInstance.post(endpoints.store.create, data);
  return response.data;
};

// 사업장 수정
export const EditPath = async (data) => {
  const response = await axiosInstance.patch(endpoints.store.edit, data);
  return response.data;
};

// 사업장 조회

export const ViewPath = async () => {
  const response = await axiosInstance.get(endpoints.store.edit);
  return response.data;
};
export const storeApi = {
  CreatePath,
  EditPath,
  ViewPath,
}