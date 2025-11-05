import {createI18n} from 'vue-i18n'

// import file language from @/locales
import {en} from '@/locales/en'
import {fr} from '@/locales/fr'
import {de} from '@/locales/de'
import {tr} from '@/locales/tr'

const loadLocaleMessages = {
  en,
  fr,
  de,
  tr
}
type MessageSchema = typeof en
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
