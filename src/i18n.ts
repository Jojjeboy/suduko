import { createI18n } from 'vue-i18n'
import sv from './locales/sv.json'
import en from './locales/en.json'

const i18n = createI18n({
  legacy: false,
  locale: 'sv', // default locale
  fallbackLocale: 'en',
  messages: {
    sv,
    en
  }
})

export default i18n
