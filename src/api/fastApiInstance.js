import axios from "axios";

const fastApiInstance = axios.create({
  baseURL: "/fastapi/", // 프록시로 로드
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

// 요청 인터셉터
fastApiInstance.interceptors.request.use((config) => {
  console.log("[FastAPI 요청]", config.method.toUpperCase(), config.url, {
    params: config.params,
    data: config.data,
  });
  return config;
});

// 요청/응답 공통 처리 
fastApiInstance.interceptors.response.use(
  (response) => {
    console.log("[FastAPI 응답]", response.config.url, response.status, response.data);
    return response;
  },
  (error) => {
    console.error("[FastAPI 에러]", error.config?.url, error.response?.status, error.response?.data || error.message);
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

export default fastApiInstance;
