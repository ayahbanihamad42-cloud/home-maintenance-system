import React from "react";
import { Navigate, useLocation } from "react-router-dom";

function ProtectedRoute({ allowedRoles, children }) {
  const location = useLocation();
  const user = JSON.parse(localStorage.getItem("user"));

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/home" replace />;
  }

  return children;
}

export default ProtectedRoute;
