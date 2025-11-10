const endpoints = {
  auth: {
    signup: "/api/v1/signup",
    login: "/api/v1/login",
    chackid: "/api/v1/check-id",
    chacknick: "/api/v1/check-nickname",
    me: "/api/v1/me"
  },
  store: {
    create: "/api/v1/stores",
  },
  bot: {
    create: "/api/v1/chatbot",
    rooms: "/api/v1/chatbot/rooms",
    msg: (id) => `/api/v1/chatbot/${id}/message`,
  }
};

export default endpoints;