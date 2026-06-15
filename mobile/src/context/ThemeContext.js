import { createContext, useContext, useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

const lightColors = {
  primary: "#7C3AED",
  primaryDark: "#5B21B6",
  primarySoft: "#F3E8FF",
  accent: "#EC4899",
  bg: "#FBFAFF",
  card: "#FFFFFF",
  text: "#1F1633",
  muted: "#7C6F92",
  border: "#EADCFB",
  danger: "#DC2626",
  success: "#16A34A",
  warning: "#B45309",
  inputBg: "#FFFFFF",
  headerBg: "#FFFFFF",
  menuBg: "#FFFFFF",
  menuItemBg: "#FBFAFF",
  overlay: "rgba(31,22,51,0.38)",
  successBoxBg: "#F0FDF4",
  successBoxBorder: "#BBF7D0",
  errorBoxBg: "#FEF2F2",
  errorBoxBorder: "#FECACA",
  warningBoxBg: "#FFF7ED",
  warningBoxBorder: "#FED7AA",
};

const darkColors = {
  primary: "#7C3AED",
  primaryDark: "#5B21B6",
  primarySoft: "#1E1535",
  accent: "#EC4899",
  bg: "#0F0D1A",
  card: "#1A1726",
  text: "#E8E0F0",
  muted: "#9B8FB5",
  border: "#2D2640",
  danger: "#F87171",
  success: "#4ADE80",
  warning: "#FBBF24",
  inputBg: "#1E1A2E",
  headerBg: "#1A1726",
  menuBg: "#1A1726",
  menuItemBg: "#241F35",
  overlay: "rgba(0,0,0,0.6)",
  successBoxBg: "#052E16",
  successBoxBorder: "#14532D",
  errorBoxBg: "#2D0A0A",
  errorBoxBorder: "#7F1D1D",
  warningBoxBg: "#451A03",
  warningBoxBorder: "#78350F",
};

const ThemeContext = createContext();

export const useTheme = () => useContext(ThemeContext);

export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState("light");
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem("theme").then((stored) => {
      if (stored) setTheme(stored);
      setLoaded(true);
    });
  }, []);

  const toggleTheme = () => {
    const next = theme === "light" ? "dark" : "light";
    setTheme(next);
    AsyncStorage.setItem("theme", next);
  };

  const c = theme === "dark" ? darkColors : lightColors;

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, c, loaded }}>
      {children}
    </ThemeContext.Provider>
  );
};
