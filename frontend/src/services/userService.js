import API from "./api";

export const loginUser = async (data) => {
  const res = await API.post("/users/login", data);
  return res.data;
};

export const registerUser = async (data) => {
  const res = await API.post("/users/register", data);
  return res.data;
};

export const getUserProfile = async (id) => {
  const res = await API.get(`/users/${id}`);
  return res.data;
};


export const getUsers = async () => {
  const res = await API.get("/users");
  return res.data;
};
