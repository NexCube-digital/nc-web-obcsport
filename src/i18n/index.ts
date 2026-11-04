import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import LanguageDetector from 'i18next-browser-languagedetector'
import en from './locales/en.json'
import id from './locales/id.json'

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      id: { translation: id },
      en: { translation: en },
    },
    supportedLngs: ['id', 'en'],
    fallbackLng: 'id',
    load: 'languageOnly',
    interpolation: { escapeValue: false },
    detection: {
      order: ['localStorage', 'navigator'],
      lookupLocalStorage: 'lang',
      caches: ['localStorage'],
    },
  })

i18n.on('languageChanged', (language) => {
  document.documentElement.lang = language
})

document.documentElement.lang = i18n.resolvedLanguage ?? i18n.language

export default i18n