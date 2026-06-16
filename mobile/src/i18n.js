import '@formatjs/intl-pluralrules/polyfill';
import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import AsyncStorage from "@react-native-async-storage/async-storage";
import en from "./locales/en.json";
import ar from "./locales/ar.json";

const languageDetector = {
  type: "languageDetector",
  async: true,
  detect: async (callback) => {
    const stored = await AsyncStorage.getItem("language");
    callback(stored || "en");
  },
  init: () => {},
  cacheUserLanguage: async (lang) => {
    await AsyncStorage.setItem("language", lang);
  },
};

i18n
  .use(languageDetector)
  .use(initReactI18next)
  .init({
    resources: { en: { translation: en }, ar: { translation: ar } },
    fallbackLng: "en",
    interpolation: { escapeValue: false },
    react: { useSuspense: false },
  });

export default i18n;
