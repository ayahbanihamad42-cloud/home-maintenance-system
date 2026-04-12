import React, { useEffect, useState } from "react";
import { useNavigation } from "@react-navigation/native";
import { getUser, getToken } from "../../services/auth.service";

function normalizeRole(role) {
  return role ? String(role).trim().toLowerCase() : "";
}

function ProtectedRoute({ allowedRoles, children }) {
  const navigation = useNavigation();
  const [ready, setReady] = useState(false);
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);

  useEffect(() => {
    const loadAuth = async () => {
      const storedUser = await getUser();
      const storedToken = await getToken();

      setUser(storedUser);
      setToken(storedToken);
      setReady(true);
    };

    loadAuth();
  }, []);

  useEffect(() => {
    if (!ready) return;

    if (!user || !token) {
      navigation.replace("Login");
      return;
    }

    const role = normalizeRole(user.role);
    const normalizedAllowedRoles = allowedRoles?.map(normalizeRole);

    if (normalizedAllowedRoles && !normalizedAllowedRoles.includes(role)) {
      if (role === "admin") {
        navigation.replace("AdminDashboard");
        return;
      }

      if (role === "technician") {
        navigation.replace("TechnicianDashboard");
        return;
      }

      navigation.replace("Home");
    }
  }, [ready, user, token, allowedRoles, navigation]);

  if (!ready) return null;

  return children;
}

export default ProtectedRoute;