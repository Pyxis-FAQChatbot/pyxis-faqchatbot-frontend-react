const endpoints = {
  auth: {
    signup: "/api/v1/signup",
    login: "/api/v1/login",
    logout: "/api/v1/logout",
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
    delete: (id) => `/api/v1/chatbot/${id}`,
  },
  comm: {
    create: "/api/v1/community",
    handle: (id) => `/api/v1/community/${id}`,
    list: "/api/v1/community/posts",    
  },
  comment: {
    create: (id) => `/api/v1/community/${id}/comment`,
    handle: (id,commentId) => `/api/v1/community/${id}/comment/${commentId}`,
  }
};

export default endpoints;