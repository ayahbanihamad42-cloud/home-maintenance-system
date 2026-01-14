   // React library
import React from "react";

  // Routing utilities
import { Navigate, useLocation } from "react-router-dom";

  // Protected route component 
function ProtectedRoute({ allowedRoles, children }) {

  // Get current location
  const location = useLocation();

  // Get logged-in user from localStorage
  const user = JSON.parse(localStorage.getItem("user"));

    // Redirect to login if user is not authenticated
  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

     // Check user role authorization
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/home" replace />;
  }
 // Render protected content
  return children;
}
  // Export component
export default ProtectedRoute;
 