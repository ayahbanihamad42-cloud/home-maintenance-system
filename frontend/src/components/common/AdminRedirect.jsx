import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { getUser, getToken } from "../../services/auth.service";

function normalizeRole(role) {
  return role ? String(role).trim().toLowerCase() : "";
}

function AdminRedirect({ children }) {
  const location = useLocation();
  const user = getUser();
  const token = getToken();
  const role = normalizeRole(user?.role);

  if (!user || !token) {
    return children;
  }

  if (role === "admin" && location.pathname !== "/admin") {
    return <Navigate to="/admin" replace />;
  }

  return children;
}

export default AdminRedirect;
