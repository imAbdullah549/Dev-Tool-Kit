// src/i18n.ts
import i18n from "i18next";
import { initReactI18next } from "react-i18next";

const resources = {
  en: {
    translation: {
      "Developer Toolkit Platform": "Developer Toolkit Platform",
      Tools: "Tools",
      "JSON Formatter and Validator": "JSON Formatter and Validator",
      "Format and validate your JSON data quickly and easily.":
        "Format and validate your JSON data quickly and easily.",
      "Enter JSON": "Enter JSON",
      "Format JSON": "Format JSON",
      Result: "Result",
      "Invalid JSON": "Invalid JSON",
    },
  },
  es: {
    translation: {
      "Developer Toolkit Platform":
        "Plataforma de Herramientas para Desarrolladores",
      Tools: "Herramientas",
      "JSON Formatter and Validator": "Formateador y Validador de JSON",
      "Format and validate your JSON data quickly and easily.":
        "Formatea y valida tus datos JSON de manera rápida y sencilla.",
      "Enter JSON": "Ingrese JSON",
      "Format JSON": "Formatear JSON",
      Result: "Resultado",
      "Invalid JSON": "JSON Inválido",
    },
  },
};

i18n.use(initReactI18next).init({
  resources,
  lng: "en", // initial language
  fallbackLng: "en",
  interpolation: {
    escapeValue: false,
  },
});

export default i18n;
