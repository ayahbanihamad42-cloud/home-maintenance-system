import API from "./api";

/* ================= TOKEN ================= */

export const setToken = (token) => {
  localStorage.setItem("token", token);
};

export const getToken = () => {
  return localStorage.getItem("token");
};

export const removeToken = () => {
  localStorage.removeItem("token");
};

/* ================= USER ================= */

export const setUser = (user) => {
  localStorage.setItem("user", JSON.stringify(user));
};

export const getUser = () => {
  const user = localStorage.getItem("user");
  return user ? JSON.parse(user) : null;
};

export const removeUser = () => {
  localStorage.removeItem("user");
};

/* ================= AUTH ================= */

// ✅ LOGIN
export const login = async (email, password) => {
  const res = await API.post("/auth/login", { email, password });

  setToken(res.data.token);
  setUser(res.data.user);

  return res.data.user;
};

// ✅ REGISTER  ←←← هذا الناقص
export const register = async (data) => {
  const res = await API.post("/auth/register", data);

  // إذا الباك برجع token مباشرة
  if (res.data.token) {
    setToken(res.data.token);
    setUser(res.data.user);
  }

  return res.data;
};

// ✅ LOGOUT
export const logout = () => {
  removeToken();
  removeUser();
};

// ✅ CURRENT USER (للأدمن)
export const fetchCurrentUser = async () => {
  const res = await API.get("/auth/me");
  setUser(res.data);
  return res.data;
};
