import axios from "./api"; // ملف api.js موجود عندك

// حفظ واسترجاع التوكن واليوزر
export const setToken = (token) => localStorage.setItem("token", token);
export const getToken = () => localStorage.getItem("token");
export const removeToken = () => localStorage.removeItem("token");

export const setUser = (user) => localStorage.setItem("user", JSON.stringify(user));
export const getUser = () => {
  const user = localStorage.getItem("user");
  return user ? JSON.parse(user) : null;
};
export const removeUser = () => localStorage.removeItem("user");

// LOGIN
export const login = async ({ email, password }) => {
  const res = await axios.post("/auth/login", { email, password });
  setToken(res.data.token);
  setUser(res.data.user);
  return res.data; // { user, token }
};

// REGISTER
export const register = async (data) => {
  const res = await axios.post("/auth/register", data);
  if (res.data.token) {
    setToken(res.data.token);
    setUser(res.data.user);
  }
  return res.data;
};


// LOGOUT
export const logout = () => {
  removeToken();
  removeUser();
};
