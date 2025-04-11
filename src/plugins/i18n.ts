import {createI18n} from 'vue-i18n'

// import file language from @/locales
import {en} from '@/locales/en'

const loadLocaleMessages = {
  en,
}
type MessageSchema = typeof en;
// variable navigator language
let language = (navigator.languages && navigator.languages[0]) || navigator.language

if (language.length > 2) {
  language = language.split('-')[0]
  language = language.split('_')[0]
}

// variable i18n for translation
const i18n = createI18n<[MessageSchema], 'en'>({
  legacy: false,
  locale: language,
  fallbackLocale: 'en',
  globalInjection: true,
  messages: loadLocaleMessages
})

export default i18n
