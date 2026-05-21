import API from "./api";

export const getUserProfile = (id) =>
  API.get(`/users/${id}`).then((res) => res.data);

export const updateUserProfile = (id, data) =>
  API.patch(`/users/${id}`, data).then((res) => res.data);

export const updateUserPassword = (id, data) =>
  API.patch(`/users/${id}/password`, data).then((res) => res.data);