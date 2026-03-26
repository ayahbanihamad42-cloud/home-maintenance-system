import React, { useEffect } from "react";
import { getUser } from "../../services/auth.service.jsx";

function normalizeRole(role) {
  return role ? String(role).trim().toLowerCase() : "";
}

function AdminRedirect({ children, navigation, routeName }) {

  const user = getUser();
  const role = normalizeRole(user?.role);

  useEffect(() => {
    if (role === "admin" && routeName !== "Admin") {
      navigation.replace("Admin");
    }
  }, [role]);

  return children;
}

export default AdminRedirect;