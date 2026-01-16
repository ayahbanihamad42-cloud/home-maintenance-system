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
export const login = async (credentials) => {
  if (!credentials || !credentials.email || !credentials.password) {
    throw new Error("Missing email or password");
  }

  const { email, password } = credentials;

  const res = await axios.post("/auth/login", { email, password });
  setToken(res.data.token);
  setUser(res.data.user);
  return res.data;
};

// REGISTER
export const register = async (data) => {
  const res = await axios.post("/auth/register", data);
  return res.data;
};


// LOGOUT
export const logout = () => {
  removeToken();
  removeUser();
};