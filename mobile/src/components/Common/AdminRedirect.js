import { useEffect } from "react";
import { useNavigation } from "@react-navigation/native";
import { getUser, getToken } from "../services/auth.service";

function normalizeRole(role) {
  return role ? String(role).trim().toLowerCase() : "";
}

export default function AdminRedirect() {
  const navigation = useNavigation();

  useEffect(() => {
    const user = getUser();
    const token = getToken();
    const role = normalizeRole(user?.role);

    if (user && token && role === "admin") {
      navigation.replace("Admin"); // اسم شاشة الأدمن
    }
  }, []);

  return null;
}
