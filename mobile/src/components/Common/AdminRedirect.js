import React, { useEffect, useState } from "react";
import { useNavigation, useRoute } from "@react-navigation/native";
import { getUser, getToken } from "../../services/auth.service";

function normalizeRole(role) {
  return role ? String(role).trim().toLowerCase() : "";
}

function AdminRedirect({ children }) {
  const navigation = useNavigation();
  const route = useRoute();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const checkAdmin = async () => {
      const user = await getUser();
      const token = await getToken();
      const role = normalizeRole(user?.role);

      if (user && token && role === "admin" && route.name !== "AdminDashboard") {
        navigation.replace("AdminDashboard");
        return;
      }

      setReady(true);
    };

    checkAdmin();
  }, [navigation, route.name]);

  if (!ready) return null;

  return children;
}

export default AdminRedirect;