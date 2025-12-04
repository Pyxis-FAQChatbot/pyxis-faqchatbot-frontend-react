import axios from "axios";

const fastApiInstance = axios.create({
  baseURL: import.meta.env.VITE_FASTAPI_URL || "/fastapi/", // 환경변수 사용, 없으면 프록시, // 프록시로 로드
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

// 요청 인터셉터
fastApiInstance.interceptors.request.use((config) => {
  const fullUrl = config.baseURL + config.url;
  console.log("[FastAPI 요청]", config.method.toUpperCase(), fullUrl, {
    params: config.params,
    data: config.data,
  });
  return config;
});

// 요청/응답 공통 처리 
fastApiInstance.interceptors.response.use(
  (response) => {
    const fullUrl = response.config.baseURL + response.config.url;
    console.log("[FastAPI 응답]", fullUrl, response.status, response.data);
    return response;
  },
  (error) => {
    const fullUrl = error.config?.baseURL + error.config?.url;
    console.error("[FastAPI 에러]", fullUrl, error.response?.status, error.response?.data || error.message);
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
