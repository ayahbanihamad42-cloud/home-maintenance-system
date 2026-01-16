// React library
import React from "react";

// Routing utilities
import { Navigate, useLocation } from "react-router-dom";

// Auth helper (read stored user)
import { getUser } from "../../services/auth.service.jsx";

// Normalize role text to avoid case/space issues
function normalizeRole(role) {
  return role ? String(role).trim().toLowerCase() : "";
}

// Admin redirect wrapper component
function AdminRedirect({ children }) {
  // Get current location
  const location = useLocation();

  // Get logged-in user from storage
  const user = getUser();

  // Extract normalized role
  const role = normalizeRole(user?.role);

  // Redirect admin users to admin dashboard (if they are not already there)
  if (role === "admin" && location.pathname !== "/admin") {
    return <Navigate to="/admin" replace />;
  }

  // Render the wrapped page normally for other roles
  return children;
}

// Export component
export default AdminRedirect;
