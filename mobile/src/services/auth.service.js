
import AsyncStorage from "@react-native-async-storage/async-storage";
import api from "./api";

export const setToken = async (token) => {
  await AsyncStorage.setItem("token", token);
};

export const getToken = async () => {
  return await AsyncStorage.getItem("token");
};

export const removeToken = async () => {
  await AsyncStorage.removeItem("token");
};

export const setUser = async (user) => {
  if (!user) return;

  const safeUser = {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    phone: user.phone || null,
    city: user.city || null
  };

  await AsyncStorage.setItem("user", JSON.stringify(safeUser));
};

export const getUser = async () => {
  const raw = await AsyncStorage.getItem("user");
  return raw ? JSON.parse(raw) : null;
};

export const removeUser = async () => {
  await AsyncStorage.removeItem("user");
};


export const login = async (data) => {
  const res = await api.post("/auth/login", data);
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

export const logout = async () => {
  await removeToken();
  await removeUser();
};



