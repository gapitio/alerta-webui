/**
 * plugins/index.ts
 *
 * Automatically included in `./src/main.ts`
 */

// Plugins
import vuetify from './vuetify'
import router, {registerBefore} from './router'
import i18n from './i18n'
import store from './store'
import VueAxios from 'vue-axios'
import axios from 'axios'
import {makeStore} from '@/plugins/store/modules/auth.store'
import {registerVueAuth} from '@/services/auth'

// Types
import type {App} from 'vue'
import type {VueAuthenticateFix} from './store/modules/auth.store'
import {makeInterceptors} from '@/services/interceptors'

export function registerPlugins(app: App) {
  app.use(vuetify).use(router).use(i18n).use(store).use(VueAxios, axios)
  const config = app.config.globalProperties.$config
  registerVueAuth(app)
  axios.defaults.baseURL = config.endpoint
  const interceptors = makeInterceptors(router, store)
  axios.interceptors.request.use(interceptors.requestIdHeader)
  axios.interceptors.response.use(undefined, interceptors.interceptErrors)
  axios.interceptors.response.use(undefined, interceptors.redirectToLogin)
  store.dispatch('updateConfig', config)
  store.dispatch('alerts/setFilter', config.filter)
  store.registerModule('auth', makeStore(app.config.globalProperties.$auth as VueAuthenticateFix))
}
registerBefore(store)
