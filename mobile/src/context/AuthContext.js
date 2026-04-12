import { createContext, useMemo, useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { logout as clearAuthStorage } from "../services/auth.service";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {

  const [user, setUser] = useState(null);

  // تحميل البيانات من AsyncStorage عند تشغيل التطبيق
  useEffect(() => {
    const loadUser = async () => {
      const raw = await AsyncStorage.getItem("user");
      if (raw) {
        setUser(JSON.parse(raw));
      }
    };
    loadUser();
  }, []);

  const login = async (data) => {
    if (!data?.token || !data?.user) return;

    const safeUser = {
      id: data.user.id,
      name: data.user.name,
      email: data.user.email,
      role: data.user.role,
      phone: data.user.phone || null,
      city: data.user.city || null
    };

    await AsyncStorage.setItem("token", data.token);
    await AsyncStorage.setItem("user", JSON.stringify(safeUser));
    setUser(safeUser);
  };

  const logout = async () => {
    clearAuthStorage();
    await AsyncStorage.removeItem("token");
    await AsyncStorage.removeItem("user");
    setUser(null);
  };

  const value = useMemo(() => ({ user, login, logout }), [user]);

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};