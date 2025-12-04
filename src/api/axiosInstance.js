import axios from "axios";

const axiosInstance = axios.create({
  baseURL: "/api/", // 프록시로 로드
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
  
});

// 요청/응답 공통 처리 
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    // 서버에서 응답 객체가 내려온 경우
    if (error.response && error.response.data) {
      return Promise.reject(error.response.data); 
      // <-- 여기에서 data만 던지면 catch에서 바로 사용 가능
    }

    // 서버 응답이 아예 없거나 CORS 등 네트워크 오류
    return Promise.reject({
      error: "NETWORK_ERROR",
      message: "서버와 연결할 수 없습니다.",
    });
  }
);

export default axiosInstance;