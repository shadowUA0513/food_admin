import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import en from "./locales/en.json";
import ru from "./locales/ru.json";
import uz from "./locales/uz.json";

const LANGUAGE_STORAGE_KEY = "food-admin-language";
export const APP_LANGUAGES = ["ru", "uz", "en"] as const;
export type AppLanguage = (typeof APP_LANGUAGES)[number];

export const isAppLanguage = (value: string | null): value is AppLanguage =>
  value !== null && APP_LANGUAGES.includes(value as AppLanguage);

const savedLanguage = window.localStorage.getItem(LANGUAGE_STORAGE_KEY);
const fallbackLanguage = isAppLanguage(savedLanguage) ? savedLanguage : "ru";

void i18n.use(initReactI18next).init({
  resources: {
    en: {
      translation: en,
    },
    ru: {
      translation: ru,
    },
    uz: {
      translation: uz,
    },
  },
  lng: fallbackLanguage,
  fallbackLng: "ru",
  interpolation: {
    escapeValue: false,
  },
});

i18n.on("languageChanged", (language) => {
  window.localStorage.setItem(LANGUAGE_STORAGE_KEY, language);
});

export default i18n;
