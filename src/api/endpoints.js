const endpoints = {
  auth: {
    signup: "/v1/signup",
    login: "/v1/login",
    logout: "/v1/logout",
    chackid: "/v1/check-id",
    chacknick: "/v1/check-nickname",
  },
  my: {
    me: "/v1/me",
    post: '/v1/mypage/posts',
    comment: "/v1/mypage/comments"
  },
  store: {
    create: "/v1/stores",
  },
  bot: {
    create: "/v1/chatbot",
    rooms: "/v1/chatbot/rooms",
    msg: (id) => `/v1/chatbot/${id}/message`,
    delete: (id) => `/v1/chatbot/${id}`,
  },
  comm: {
    create: "/v1/community",
    handle: (id) => `/v1/community/${id}`,
    list: "/v1/community/posts",    
  },
  comment: {
    create: (id) => `/v1/community/${id}/comment`,
    handle: (id,commentId) => `/v1/community/${id}/comment/${commentId}`,
  }
};

export default endpoints;