/*
 * Global authentication state
 * Determines role-based rendering (user / technician)
 */

import { createContext, useState, useEffect } from "react";
import { getUser } from "../services/auth.service";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);

  useEffect(() => {
    setUser(getUser());
  }, []);

  return (
    <AuthContext.Provider value={{ user }}>
      {children}
    </AuthContext.Provider>
  );
};
