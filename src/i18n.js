import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import es from "./locales/es.json";
import en from "./locales/en.json";

// Detectar idioma guardado o usar español por defecto
const savedLang = localStorage.getItem("lang") || "es";

i18n
  .use(initReactI18next)
  .init({
    resources: {
      es: { translation: es },
      en: { translation: en },
    },
    lng: savedLang,
    fallbackLng: "es",
    interpolation: {
      escapeValue: false,
    },
  });

export default i18n;
