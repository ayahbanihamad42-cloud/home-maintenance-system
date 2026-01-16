// React library
import React from "react";

// Routing utilities
import { Navigate, useLocation } from "react-router-dom";

// Auth helpers (user/token from localStorage)
import { getUser, getToken } from "../../services/auth.service.jsx";

// Normalize role text to avoid case/space issues
function normalizeRole(role) {
  return role ? String(role).trim().toLowerCase() : "";
}

// Protected route component
function ProtectedRoute({ allowedRoles, children }) {

  // Get current location
  const location = useLocation();

  // Get stored auth data
  const user = getUser();
  const token = getToken();

  // Redirect to login if user is not authenticated
  // (Require both token and user to be available)
  if (!user || !token) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Get normalized role
  const role = normalizeRole(user.role);

  // Check user role authorization
  if (allowedRoles && !allowedRoles.includes(role)) {

    // Redirect user based on their role
    if (role === "admin") {
      return <Navigate to="/admin" replace />;
    }

    if (role === "technician") {
      return <Navigate to="/technician/dashboard" replace />;
    }

    // Default fallback for normal users
    return <Navigate to="/home" replace />;
  }

  // Render protected content
  return children;
}

// Export component
export default ProtectedRoute;
