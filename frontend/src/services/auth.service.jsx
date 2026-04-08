import api from "./api";

export const setToken = (token) => localStorage.setItem("token", token);
export const getToken = () => localStorage.getItem("token");
export const removeToken = () => localStorage.removeItem("token");

export const setUser = (user) => {
  if (!user) return;

  const safeUser = {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    phone: user.phone || null,
    city: user.city || null
  };

  localStorage.setItem("user", JSON.stringify(safeUser));
};

export const getUser = () => {
  const raw = localStorage.getItem("user");
  return raw ? JSON.parse(raw) : null;
};

export const removeUser = () => localStorage.removeItem("user");

export const login = async (credentials) => {
  if (!credentials?.email || !credentials?.password) {
    throw new Error("Missing email or password");
  }

  const res = await api.post("/auth/login", {
    email: credentials.email,
    password: credentials.password
  });

  setToken(res.data.token);
  setUser(res.data.user);

  return res.data;
};

export const register = async (data) => {
  const payload = {
    name: data.name,
    email: data.email,
    phone: data.phone || "",
    dob: data.dob || "",
    city: data.city || "",
    password: data.password
  };

  const res = await api.post("/auth/register", payload);
  return res.data;
};

export const logout = () => {
  removeToken();
  removeUser();
};
