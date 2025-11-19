import axiosInstance from "./axiosInstance";
import endpoints from "./endpoints";

// 게시글 생성
const postCreatePath = async (data) => {
  const response = await axiosInstance.post(endpoints.comm.create, data);
  return response.data;
};

// 게시글 삭제

const postDeletePath = async (id) => {
  const response = await axiosInstance.delete(endpoints.comm.handle(id));
  return response.data;
};
// 게시글 조회
const postViewPath = async (id) => {
  const response = await axiosInstance.get(endpoints.comm.handle(id));
  return response.data;
};

// 게시글 페이지 조회
const postListPath = async (pageNum, sizeNum, boardtype) => {
  const response = await axiosInstance.get(endpoints.comm.list, {
    params: { page: pageNum, size: sizeNum, type: boardtype},
  });
  return response.data;
};

// 게시글 수정
const postEditPath = async (id) => {
  const response = await axiosInstance.put(endpoints.comm.handle(id), data);
  return response.data;
};

// 댓글 생성
const cmtCreatePath = async (id, data) => {
  const response = await axiosInstance.post(endpoints.comment.create(id), data);
  return response.data;
}; 

// 댓글 수정
const cmtEditPath = async (id, commentId) => {
  const response = await axiosInstance.patch(endpoints.comment.handle(id, commentId), data);
  return response.data;
};

// 댓글 삭제
const cmtDeletePath = async (id, commentId) => {
  const response = await axiosInstance.delete(endpoints.comment.handle(id, commentId));
  return response.data;
};

// 댓글 조회
const cmtViewPath = async (id, pageNum, sizeNum) => {
  const response = await axiosInstance.get(endpoints.comment.create(id),{
    params: { page: pageNum, size: sizeNum },
  });
  return response.data;
};
// 대댓글 조회
const replyViewPath = async (id, parent,pageNum, sizeNum) => {
  const response = await axiosInstance.get(endpoints.comment.create(id),{
    params: { parentId: parent, page: pageNum, size: sizeNum },
  });
  return response.data;
};

export const communityApi = {
    postCreatePath,
    postDeletePath,
    postViewPath,
    postListPath,
    postEditPath,
    cmtCreatePath,
    cmtEditPath,
    cmtDeletePath,
    cmtViewPath,
    replyViewPath
};
