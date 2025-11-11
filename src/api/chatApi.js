import axiosInstance from "./axiosInstance";
import endpoints from "./endpoints";

// 봇채팅 조회
export const botRoomPath = async (pageNum, sizeNum) => {
  const response = await axiosInstance.get(endpoints.bot.rooms, {
    params: { page: pageNum, size: sizeNum },
  });
  return response.data;
};

// 봇채팅 생성
const botCreatePath = async (data) => {
  const response = await axiosInstance.post(endpoints.bot.create, data);
  return response.data;
};

// 챗봇 메시지 생성

const botMsgPath = async (id, data) =>{
  const response = await axiosInstance.post(endpoints.bot.msg(id), data);
  return response.data;
};

const botMsgLog = async (id, pageNum, sizeNum) => {
  const response = await axiosInstance.get(endpoints.bot.msg(id), {
    params: { page: pageNum, size: sizeNum },
  });
  console.log("botMsgLog response:", response.data);
  return response.data; 
};
export const chatApi = {
    botCreatePath,
    botMsgPath,
    botMsgLog
};
