// src/i18n/index.ts
// Localization bootstrap. English ships first; additional locales are a
// JSON file + one line here (see docs/REQUIREMENTS.md, Localization).

import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import en from './locales/en.json';

i18n.use(initReactI18next).init({
  resources: { en },
  lng: 'en',
  fallbackLng: 'en',
  interpolation: {
    // React already escapes rendered strings
    escapeValue: false,
  },
});

export default i18n;
