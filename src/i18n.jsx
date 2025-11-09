// Function Name : Language Config
// Created date :  22/7/24             by :  NgVinh
// Updated date :                      by :

import i18n from "i18next";
import detector from "i18next-browser-languagedetector";
import { initReactI18next } from "react-i18next";

import translationVI from "./locales/vi/translation.json";
import translationMA from "./locales/ma/translation.json";
import translationIN from "./locales/in/translation.json";
import translationEN from "./locales/en/translation.json";
import Cookies from "js-cookie";
// the translations
const resources = {
  en: {
    translation: translationEN,
  },
  vi: {
    translation: translationVI,
  },
  ma: {
    translation: translationMA,
  },
  in: {
    translation: translationIN,
  },
};

const language = Cookies.get("I18N_LANGUAGE");
if (!language) {
  Cookies.set("I18N_LANGUAGE", "vi");
}

i18n
  .use(detector)
  .use(initReactI18next) // passes i18n down to react-i18next
  .init({
    resources,
    lng: Cookies.get("I18N_LANGUAGE") || "vi",
    fallbackLng: "vi", // use vi if detected lng is not available

    keySeparator: false, // we do not use keys in form messages.welcome

    interpolation: {
      escapeValue: false, // react already safes from xss
    },
  });

export default i18n;
