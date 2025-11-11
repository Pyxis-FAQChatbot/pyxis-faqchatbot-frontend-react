import axios from "axios";

const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL, // .env에서 자동 로드됨
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
  
});

// 요청/응답 공통 처리 
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error("API 오류 발생:", error.response || error.message);
    return Promise.reject(error);
  }
);

export default axiosInstance;