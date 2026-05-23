import API from "./api";

export const getUserProfile = (id) =>
  API.get(`/users/${id}`).then((res) => res.data);

export const updateUserProfile = (id, data) =>
  API.patch(`/users/${id}`, {
    email: data.email,
    phone: data.phone,
    city: data.city,
    dob: data.dob,
  }).then((res) => res.data);

export const updateUserPassword = (id, data) =>
  API.patch(`/users/${id}/password`, data).then((res) => res.data);

export const updateUserPhoto = (id, profile_image) =>
  API.patch(`/users/${id}/photo`, { profile_image }).then((res) => res.data);