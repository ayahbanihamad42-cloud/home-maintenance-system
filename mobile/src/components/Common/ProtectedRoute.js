import React, { useEffect, useState } from "react";
import { getUser, getToken } from "../../services/auth.service.jsx";

function normalizeRole(role) {
  return role ? String(role).trim().toLowerCase() : "";
}

function ProtectedRoute({ allowedRoles, children, navigation }) {

  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);

  useEffect(() => {
    setUser(getUser());
    setToken(getToken());
  }, []);

  useEffect(() => {
    if (!user || !token) {
      navigation.replace("Login");
      return;
    }

    const role = normalizeRole(user.role);

    if (allowedRoles && !allowedRoles.includes(role)) {

      if (role === "admin") {
        navigation.replace("Admin");
        return;
      }

      if (role === "technician") {
        navigation.replace("TechnicianDashboard");
        return;
      }

      navigation.replace("Home");
    }
  }, [user, token]);

  return children;
}

export default ProtectedRoute;